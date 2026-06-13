#!/usr/bin/env npx tsx
/**
 * List existing columns and topics from Neon Postgres
 *
 * Usage: npx tsx scripts/content-creator/list-content.ts
 * Output: JSON array of columns with their topics
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("Error: DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(connectionString);

  const columns = await sql`
    SELECT id, title, slug, description, sort_order
    FROM columns
    ORDER BY sort_order
  `;

  const result = [];
  for (const col of columns) {
    const topics = await sql`
      SELECT id, title, slug, description, author, published_date, sort_order
      FROM topics
      WHERE column_id = ${col.id}
      ORDER BY sort_order
    `;

    result.push({
      ...col,
      topics,
    });
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("List content error:", err);
  process.exit(1);
});
