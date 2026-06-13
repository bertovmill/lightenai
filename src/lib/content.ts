import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { columns as columnsTable, topics as topicsTable, posts as postsTable } from "@/db/schema";
import type { ColumnWithTopics, TopicWithPosts, Column, Post } from "@/lib/types/content";

// Assemble the columns → topics → posts tree. When `publishedOnly` is true,
// only published posts are included (public site); otherwise all posts (admin).
async function getContentTree(publishedOnly: boolean): Promise<ColumnWithTopics[]> {
  const [cols, tops, allPosts] = await Promise.all([
    db.select().from(columnsTable).orderBy(asc(columnsTable.sort_order)),
    db.select().from(topicsTable).orderBy(asc(topicsTable.sort_order)),
    db.select().from(postsTable).orderBy(asc(postsTable.created_at)),
  ]);

  const postsByTopic = new Map<string, Post[]>();
  for (const p of allPosts) {
    if (publishedOnly && p.status !== "published") continue;
    const list = postsByTopic.get(p.topic_id) ?? [];
    list.push(p as Post);
    postsByTopic.set(p.topic_id, list);
  }

  const topicsByColumn = new Map<string, TopicWithPosts[]>();
  for (const t of tops) {
    const list = topicsByColumn.get(t.column_id) ?? [];
    list.push({ ...(t as TopicWithPosts), posts: postsByTopic.get(t.id) ?? [] });
    topicsByColumn.set(t.column_id, list);
  }

  return cols.map((c) => ({
    ...(c as ColumnWithTopics),
    topics: topicsByColumn.get(c.id) ?? [],
  }));
}

export async function getPublishedContent(): Promise<ColumnWithTopics[]> {
  try {
    return await getContentTree(true);
  } catch (error) {
    console.error("Error fetching content:", error);
    return [];
  }
}

export async function getAllContent(): Promise<ColumnWithTopics[]> {
  try {
    return await getContentTree(false);
  } catch (error) {
    console.error("Error fetching all content:", error);
    return [];
  }
}

export async function getTopicBySlug(
  columnSlug: string,
  topicSlug: string
): Promise<{ column: Column; topic: TopicWithPosts } | null> {
  const [column] = await db
    .select()
    .from(columnsTable)
    .where(eq(columnsTable.slug, columnSlug))
    .limit(1);
  if (!column) return null;

  const [topic] = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.slug, topicSlug))
    .limit(1);
  if (!topic || topic.column_id !== column.id) return null;

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.topic_id, topic.id))
    .orderBy(asc(postsTable.created_at));

  return {
    column: column as Column,
    topic: { ...(topic as TopicWithPosts), posts: posts as Post[] },
  };
}
