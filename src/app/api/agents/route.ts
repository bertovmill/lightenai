import { NextRequest } from "next/server";
import { db } from "@/db";
import { deployedAgents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAllAgents } from "@/lib/agents/data";
import { AgentConfig } from "@/lib/agents/types";

export const runtime = "nodejs";

function dbRowToAgentConfig(row: Record<string, unknown>): AgentConfig {
  return {
    id: row.agent_id as string,
    name: row.name as string,
    tagline: (row.tagline as string) || "",
    description: (row.description as string) || "",
    status: (row.status as "active" | "coming-soon") || "active",
    iconPath: (row.icon_path as string) || "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    chatConfig: {
      apiEndpoint: `/api/agents/dynamic/${row.agent_id}`,
      storageKey: `${row.agent_id}-sessions`,
      placeholder: (row.placeholder as string) || "Send a message...",
      emptyStateTitle: (row.empty_state_title as string) || "Start a conversation",
      emptyStateDescription: (row.empty_state_description as string) || "",
      loadingText: (row.loading_text as string) || "Thinking...",
      starterPrompts: (row.starter_prompts as string[]) || [],
    },
    capabilities: (row.capabilities as AgentConfig["capabilities"]) || [],
    faq: (row.faq as AgentConfig["faq"]) || [],
    architecture: (row.architecture as AgentConfig["architecture"]) || undefined,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const staticAgents = getAllAgents();

  // If requesting a single agent by slug, check static first then DB
  if (slug) {
    const staticAgent = staticAgents.find((a) => a.id === slug);
    if (staticAgent) {
      return Response.json(staticAgent);
    }

    try {
      const [data] = await db
        .select()
        .from(deployedAgents)
        .where(eq(deployedAgents.agent_id, slug))
        .limit(1);

      if (data) {
        return Response.json(dbRowToAgentConfig(data));
      }
    } catch {
      // DB unavailable — fall through
    }

    return Response.json(null, { status: 404 });
  }

  // Return merged list: static agents + dynamic agents from DB
  let dynamicAgents: AgentConfig[] = [];
  try {
    const data = await db
      .select()
      .from(deployedAgents)
      .orderBy(desc(deployedAgents.created_at));

    if (data) {
      const staticIds = new Set(staticAgents.map((a) => a.id));
      dynamicAgents = data
        .filter((row) => !staticIds.has(row.agent_id))
        .map(dbRowToAgentConfig);
    }
  } catch {
    // DB unavailable — return static only
  }

  return Response.json([...staticAgents, ...dynamicAgents]);
}
