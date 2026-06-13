#!/usr/bin/env npx tsx
/**
 * Batch-save column + topic + posts to Neon Postgres
 *
 * Usage: echo '<json>' | npx tsx scripts/content-creator/save-content.ts
 *
 * Input JSON schema:
 * {
 *   column: { title, slug, description },
 *   topic: { title, slug, description, image_url?, author?, published_date? },
 *   posts: [{ platform, title, excerpt }]
 * }
 *
 * Output: JSON { success, columnId, topicId, postIds }
 */

import { neon } from "@neondatabase/serverless";

interface InputColumn {
  title: string;
  slug: string;
  description?: string;
}

interface InputTopic {
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  author?: string;
  published_date?: string;
}

interface InputPost {
  platform: string;
  title: string;
  excerpt?: string;
}

interface Input {
  column: InputColumn;
  topic: InputTopic;
  posts: InputPost[];
}

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

  if (!input.column?.slug || !input.topic?.slug) {
    console.error("Error: column.slug and topic.slug are required");
    process.exit(1);
  }

  const sql = neon(connectionString);

  // Find-or-create column by slug
  let columnId: string;
  const existingColumn = (
    await sql`SELECT id FROM columns WHERE slug = ${input.column.slug} LIMIT 1`
  )[0];

  if (existingColumn) {
    columnId = existingColumn.id;
  } else {
    const [newColumn] = await sql`
      INSERT INTO columns (title, slug, description)
      VALUES (${input.column.title}, ${input.column.slug}, ${input.column.description || null})
      RETURNING id
    `;
    if (!newColumn) {
      console.error("Error creating column");
      process.exit(1);
    }
    columnId = newColumn.id;
  }

  // Create topic
  const [newTopic] = await sql`
    INSERT INTO topics (column_id, title, slug, description, image_url, author, published_date)
    VALUES (
      ${columnId},
      ${input.topic.title},
      ${input.topic.slug},
      ${input.topic.description || null},
      ${input.topic.image_url || null},
      ${input.topic.author || "Lighten AI"},
      ${input.topic.published_date || null}
    )
    RETURNING id
  `;

  if (!newTopic) {
    console.error("Error creating topic");
    process.exit(1);
  }

  // Create posts
  const postIds: string[] = [];
  for (const post of input.posts || []) {
    try {
      const [newPost] = await sql`
        INSERT INTO posts (topic_id, platform, title, excerpt, status)
        VALUES (${newTopic.id}, ${post.platform}, ${post.title}, ${post.excerpt || null}, 'draft')
        RETURNING id
      `;
      if (newPost) postIds.push(newPost.id);
    } catch (postErr) {
      console.error(`Error creating ${post.platform} post:`, postErr);
      continue;
    }
  }

  const output = {
    success: true,
    columnId,
    topicId: newTopic.id,
    postIds,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error("Save content error:", err);
  process.exit(1);
});
