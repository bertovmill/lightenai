import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";

// Read-only data-analyst tools, backed by Neon Postgres via Drizzle's `sql`
// helper. Table/column names are dynamic, so we use sql.identifier() (safe
// quoting) for identifiers and bound parameters for values — never string
// concatenation. Tables are restricted to a fixed allowlist.
const ALLOWED_TABLES = [
  "columns",
  "topics",
  "posts",
  "inquiries",
  "reviews",
  "feedback",
  "content_ideas",
  "outreach_contacts",
  "social_leads",
  "social_connections",
  "generated_visuals",
  "agent_preferences",
  "daily_progress",
  "deployed_agents",
] as const;

const tableEnum = z.enum(ALLOWED_TABLES);

const FILTER_OPERATORS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
] as const;

const SQL_OP: Record<(typeof FILTER_OPERATORS)[number], string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  ilike: "ILIKE",
};

type Filter = {
  column: string;
  operator: (typeof FILTER_OPERATORS)[number];
  value: string | number | boolean;
};

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Normalize the driver's execute() result to an array of row objects. */
function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: Record<string, unknown>[] }).rows ?? [];
  }
  return [];
}

/** Build a parameterized `column <op> value AND ...` clause, or undefined. */
function buildWhere(filters?: Filter[]): SQL | undefined {
  if (!filters || filters.length === 0) return undefined;
  const conds = filters
    .filter((f) => IDENT.test(f.column))
    .map(
      (f) =>
        sql`${sql.identifier(f.column)} ${sql.raw(SQL_OP[f.operator])} ${f.value}`
    );
  if (conds.length === 0) return undefined;
  return sql.join(conds, sql` AND `);
}

/** Build a safe SELECT list from a comma-separated column string; "*" fallback. */
function buildSelect(select?: string): SQL {
  if (!select || select.trim() === "*") return sql.raw("*");
  const cols = select
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (cols.length === 0 || !cols.every((c) => IDENT.test(c))) return sql.raw("*");
  return sql.join(
    cols.map((c) => sql.identifier(c)),
    sql`, `
  );
}

// --- list_tables ---
export const listTables = tool(
  "list_tables",
  "Returns all queryable table names with approximate row counts. Use this first to understand what data is available.",
  {},
  async () => {
    const results: { table: string; count: number }[] = [];

    for (const table of ALLOWED_TABLES) {
      try {
        const res = await db.execute(
          sql`SELECT count(*)::int AS count FROM ${sql.identifier(table)}`
        );
        const count = Number(rowsOf(res)[0]?.count ?? 0);
        results.push({ table, count });
      } catch {
        results.push({ table, count: -1 });
      }
    }

    const text = results
      .map(
        (r) =>
          `- **${r.table}**: ${r.count === -1 ? "error reading" : `${r.count} rows`}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Available tables (${results.length}):\n\n${text}`,
        },
      ],
    };
  }
);

// --- describe_table ---
export const describeTable = tool(
  "describe_table",
  "Returns column names, types, and a sample row for a given table. Use this to understand a table's schema before querying.",
  {
    table: tableEnum.describe("The table to describe"),
  },
  async ({ table }) => {
    try {
      // Column names + types straight from the catalog (works on empty tables).
      const colRes = await db.execute(
        sql`SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ${table}
            ORDER BY ordinal_position`
      );
      const cols = rowsOf(colRes) as { column_name: string; data_type: string }[];

      if (cols.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Table "${table}" not found or has no columns.`,
            },
          ],
        };
      }

      // A sample row for example values (may be empty).
      const sampleRes = await db.execute(
        sql`SELECT * FROM ${sql.identifier(table)} LIMIT 1`
      );
      const sample = rowsOf(sampleRes)[0] ?? {};

      const schemaText = cols
        .map((c) => {
          const v = sample[c.column_name];
          const sampleText =
            v === undefined || v === null ? "null" : String(v).slice(0, 100);
          return `- **${c.column_name}** (${c.data_type}): \`${sampleText}\``;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `Schema for "${table}" (${cols.length} columns):\n\n${schemaText}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error describing table "${table}": ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }
);

// --- query_table ---
export const queryTable = tool(
  "query_table",
  "Query a table with optional column selection, filters, ordering, and limit. Returns up to 100 rows. Use this for reading and analyzing data.",
  {
    table: tableEnum.describe("The table to query"),
    select: z
      .string()
      .optional()
      .describe(
        'Columns to select (comma-separated, e.g. "id, title, created_at"). Defaults to "*".'
      ),
    filters: z
      .array(
        z.object({
          column: z.string().describe("Column name to filter on"),
          operator: z.enum(FILTER_OPERATORS).describe("Comparison operator"),
          value: z
            .union([z.string(), z.number(), z.boolean()])
            .describe("Value to compare against"),
        })
      )
      .optional()
      .describe("Optional array of filter conditions"),
    order_by: z.string().optional().describe("Column to order by"),
    ascending: z
      .boolean()
      .optional()
      .describe("Sort ascending (true) or descending (false). Defaults to true."),
    limit: z
      .number()
      .optional()
      .describe("Max rows to return (1-100). Defaults to 20."),
  },
  async ({ table, select, filters, order_by, ascending, limit }) => {
    const rowLimit = Math.min(Math.max(Math.floor(limit ?? 20), 1), 100);
    const where = buildWhere(filters);
    const orderClause =
      order_by && IDENT.test(order_by)
        ? sql` ORDER BY ${sql.identifier(order_by)} ${sql.raw(ascending === false ? "DESC" : "ASC")}`
        : sql``;

    try {
      const res = await db.execute(
        sql`SELECT ${buildSelect(select)} FROM ${sql.identifier(table)}${
          where ? sql` WHERE ${where}` : sql``
        }${orderClause} LIMIT ${rowLimit}`
      );
      const data = rowsOf(res);

      return {
        content: [
          {
            type: "text" as const,
            text:
              data.length === 0
                ? `No rows found in "${table}" matching your query.`
                : `Query returned ${data.length} row(s) from "${table}":\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error querying "${table}": ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }
);

// --- count_rows ---
export const countRows = tool(
  "count_rows",
  "Count rows in a table with optional filters. Useful for aggregations and summaries.",
  {
    table: tableEnum.describe("The table to count rows in"),
    filters: z
      .array(
        z.object({
          column: z.string().describe("Column name to filter on"),
          operator: z.enum(FILTER_OPERATORS).describe("Comparison operator"),
          value: z
            .union([z.string(), z.number(), z.boolean()])
            .describe("Value to compare against"),
        })
      )
      .optional()
      .describe("Optional array of filter conditions"),
  },
  async ({ table, filters }) => {
    const where = buildWhere(filters);

    try {
      const res = await db.execute(
        sql`SELECT count(*)::int AS count FROM ${sql.identifier(table)}${
          where ? sql` WHERE ${where}` : sql``
        }`
      );
      const count = Number(rowsOf(res)[0]?.count ?? 0);
      const filterDesc =
        filters && filters.length > 0
          ? ` (with ${filters.length} filter${filters.length > 1 ? "s" : ""})`
          : "";

      return {
        content: [
          {
            type: "text" as const,
            text: `"${table}"${filterDesc}: **${count}** rows`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error counting rows in "${table}": ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  }
);

export const allTools = [listTables, describeTable, queryTable, countRows];
