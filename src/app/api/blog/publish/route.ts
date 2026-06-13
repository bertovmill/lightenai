import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { columns, topics, posts } from "@/db/schema";

// The column every blog-writer article is filed under.
const BLOG_COLUMN_SLUG = "blog";
const BLOG_COLUMN_TITLE = "Blog";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  // Suffix keeps the slug unique across the unique() constraint on topics.slug.
  return `${base || "post"}-${Date.now().toString(36)}`;
}

async function getOrCreateBlogColumn(): Promise<string> {
  const [existing] = await db
    .select()
    .from(columns)
    .where(eq(columns.slug, BLOG_COLUMN_SLUG))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(columns)
    .values({
      title: BLOG_COLUMN_TITLE,
      slug: BLOG_COLUMN_SLUG,
      description: "Articles written in the blog writer.",
    })
    .returning();
  return created.id;
}

/**
 * POST /api/blog/publish
 * Save a blog-writer draft as a website post (status draft or published).
 * Creates a topic (holds cover + author) + post on first save; updates both
 * on subsequent saves when postId/topicId are supplied.
 *
 * Body: {
 *   postId?, topicId?,
 *   title, body, excerpt?, imageUrl?, author?,
 *   status: "draft" | "published"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postId,
      topicId,
      title,
      body: articleBody,
      excerpt,
      imageUrl,
      author,
      status,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (status !== "draft" && status !== "published") {
      return NextResponse.json(
        { error: "status must be 'draft' or 'published'" },
        { status: 400 },
      );
    }

    const published_at = status === "published" ? new Date().toISOString() : null;

    // ---- Update path: post already exists, update its topic + post ----
    if (postId && topicId) {
      await db
        .update(topics)
        .set({
          title,
          ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
          ...(author ? { author } : {}),
        })
        .where(eq(topics.id, topicId));

      const [updated] = await db
        .update(posts)
        .set({
          title,
          body: articleBody ?? null,
          excerpt: excerpt ?? null,
          status,
          published_at,
        })
        .where(eq(posts.id, postId))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json({
        postId: updated.id,
        topicId,
        status: updated.status,
        url: `/blog/${updated.id}`,
      });
    }

    // ---- Create path: new topic + new website post ----
    const columnId = await getOrCreateBlogColumn();

    const [topic] = await db
      .insert(topics)
      .values({
        column_id: columnId,
        title,
        slug: slugify(title),
        image_url: imageUrl ?? null,
        author: author ?? "Lighten AI",
      })
      .returning();

    const [post] = await db
      .insert(posts)
      .values({
        topic_id: topic.id,
        platform: "website",
        title,
        body: articleBody ?? null,
        excerpt: excerpt ?? null,
        status,
        published_at,
      })
      .returning();

    return NextResponse.json({
      postId: post.id,
      topicId: topic.id,
      status: post.status,
      url: `/blog/${post.id}`,
    });
  } catch (error) {
    console.error("Blog publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
