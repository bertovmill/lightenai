import { and, asc, eq } from "drizzle-orm";
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

// ============================================================
// BLOG — public-facing view of published "website" posts.
// A blog article is a published post on the "website" platform.
// Topic metadata (author, image) is folded in for display.
// ============================================================

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string | null;
  created_at: string;
  author: string | null;
  image_url: string | null;
  topic_title: string | null;
}

function toBlogPost(p: Post, topic: { title: string; author: string | null; image_url: string | null } | undefined): BlogPost {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    published_at: p.published_at,
    created_at: p.created_at,
    author: topic?.author ?? null,
    image_url: topic?.image_url ?? null,
    topic_title: topic?.title ?? null,
  };
}

// All published blog articles, newest first.
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const [websitePosts, tops] = await Promise.all([
      db
        .select()
        .from(postsTable)
        .where(and(eq(postsTable.platform, "website"), eq(postsTable.status, "published"))),
      db.select().from(topicsTable),
    ]);

    const topicById = new Map(tops.map((t) => [t.id, t]));

    return (websitePosts as Post[])
      .map((p) => toBlogPost(p, topicById.get(p.topic_id)))
      .sort((a, b) => {
        const da = a.published_at ?? a.created_at;
        const dbb = b.published_at ?? b.created_at;
        return da < dbb ? 1 : da > dbb ? -1 : 0;
      });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

// A single published blog article by id.
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const [p] = await db
      .select()
      .from(postsTable)
      .where(
        and(
          eq(postsTable.id, id),
          eq(postsTable.platform, "website"),
          eq(postsTable.status, "published")
        )
      )
      .limit(1);
    if (!p) return null;

    const [topic] = await db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.id, p.topic_id))
      .limit(1);

    return toBlogPost(p as Post, topic);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}
