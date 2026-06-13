#!/usr/bin/env npx tsx
/**
 * Manage agent style preferences in Neon Postgres
 *
 * Usage: echo '<json>' | npx tsx scripts/content-creator/save-preferences.ts
 *
 * Input JSON schema:
 * { action: "add" | "remove" | "list", rule?: string, userId: string }
 *
 * Output: JSON { success, rules }
 */

import { neon } from "@neondatabase/serverless";

interface Input {
  action: "add" | "remove" | "list";
  rule?: string;
  userId: string;
}

const AGENT_ID = "content-creator";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("Error: DATABASE_URL is required");
    process.exit(1);
  }

  // Read JSON from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const rawInput = Buffer.concat(chunks).toString("utf-8").trim();

  let input: Input;
  try {
    input = JSON.parse(rawInput);
  } catch {
    console.error("Error: Invalid JSON on stdin");
    process.exit(1);
  }

  if (!input.userId) {
    console.error("Error: userId is required");
    process.exit(1);
  }

  if (!input.action) {
    console.error("Error: action (add | remove | list) is required");
    process.exit(1);
  }

  const sql = neon(connectionString);

  // Fetch current preferences
  const existing = (
    await sql`
      SELECT id, custom_rules
      FROM agent_preferences
      WHERE user_id = ${input.userId} AND agent_id = ${AGENT_ID}
      LIMIT 1
    `
  )[0];

  const currentRules: string[] = (existing?.custom_rules as string[]) || [];

  if (input.action === "list") {
    console.log(JSON.stringify({ success: true, rules: currentRules }));
    return;
  }

  if (input.action === "add") {
    if (!input.rule) {
      console.error("Error: rule is required for add action");
      process.exit(1);
    }

    // Avoid duplicates
    if (currentRules.includes(input.rule)) {
      console.log(
        JSON.stringify({
          success: true,
          rules: currentRules,
          message: "Rule already exists",
        })
      );
      return;
    }

    const updatedRules = [...currentRules, input.rule];

    if (existing) {
      await sql`
        UPDATE agent_preferences
        SET custom_rules = ${JSON.stringify(updatedRules)}::jsonb, updated_at = ${new Date().toISOString()}
        WHERE id = ${existing.id}
      `;
    } else {
      await sql`
        INSERT INTO agent_preferences (user_id, agent_id, custom_rules)
        VALUES (${input.userId}, ${AGENT_ID}, ${JSON.stringify(updatedRules)}::jsonb)
      `;
    }

    console.log(JSON.stringify({ success: true, rules: updatedRules }));
    return;
  }

  if (input.action === "remove") {
    if (!input.rule) {
      console.error("Error: rule is required for remove action");
      process.exit(1);
    }

    const updatedRules = currentRules.filter(
      (r) => r.toLowerCase() !== input.rule!.toLowerCase()
    );

    if (existing) {
      await sql`
        UPDATE agent_preferences
        SET custom_rules = ${JSON.stringify(updatedRules)}::jsonb, updated_at = ${new Date().toISOString()}
        WHERE id = ${existing.id}
      `;
    }

    console.log(JSON.stringify({ success: true, rules: updatedRules }));
    return;
  }

  console.error("Error: Unknown action. Use add, remove, or list.");
  process.exit(1);
}

main().catch((err) => {
  console.error("Save preferences error:", err);
  process.exit(1);
});
