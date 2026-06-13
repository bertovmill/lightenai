"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PLATFORMS, PLATFORM_ORDER } from "./platforms";
import type { ColumnWithTopics, TopicWithPosts, Post } from "@/lib/types/content";

const AgentChat = dynamic(() => import("@/app/components/agents/AgentChat"), {
  ssr: false,
});

function PlatformIcon({ platformKey }: { platformKey: string }) {
  const meta = PLATFORMS[platformKey];
  if (!meta) return null;
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d={meta.iconPath} />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#5F9468]/15 text-[#5F9468]">
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
      Draft
    </span>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function TopicCard({
  topic,
  columnSlug,
  isAdmin,
  updatingPostId,
  onToggleStatus,
}: {
  topic: TopicWithPosts;
  columnSlug: string;
  isAdmin: boolean;
  updatingPostId: string | null;
  onToggleStatus: (post: Post) => Promise<void>;
}) {
  const publishedByPlatform = new Map(
    topic.posts
      .filter((p) => p.status === "published")
      .map((p) => [p.platform, p])
  );

  const allByPlatform = new Map(topic.posts.map((p) => [p.platform, p]));

  const hasAnyPublished = publishedByPlatform.size > 0;

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-3xl overflow-hidden hover:border-[#5F9468]/40 transition-all duration-300">
      {topic.image_url && (
        <Link href={`/content/${columnSlug}/${topic.slug}`} className="block">
          <div className="relative w-full h-48 md:h-56">
            <Image
              src={topic.image_url}
              alt={topic.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Link>
      )}
      <div className="p-8">
        <Link
          href={`/content/${columnSlug}/${topic.slug}`}
          className="block mb-5"
        >
          <h3 className="text-xl font-semibold text-[#1C1C1C] mb-2">
            {topic.title}
          </h3>
          {topic.description && (
            <p className="text-[#666] leading-relaxed">{topic.description}</p>
          )}
          {(topic.author || topic.published_date) && (
            <p className="text-sm text-[#999] mt-3">
              {topic.author && <span>{topic.author}</span>}
              {topic.author && topic.published_date && <span> · </span>}
              {topic.published_date && (
                <time dateTime={topic.published_date}>
                  {new Date(
                    topic.published_date + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </p>
          )}
        </Link>

        <div className="flex flex-wrap gap-2">
          {PLATFORM_ORDER.map((key) => {
            const published = publishedByPlatform.get(key);
            const post = allByPlatform.get(key);

            if (published && (published.url || key === "website")) {
              const isWebsite = key === "website";
              const href = isWebsite
                ? `/content/${columnSlug}/${topic.slug}`
                : published.url!;

              return (
                <div key={key} className="inline-flex items-center gap-1">
                  {isWebsite ? (
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5F9468]/10 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/20 transition-colors"
                    >
                      <PlatformIcon platformKey={key} />
                      Read Article
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  ) : (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5F9468]/10 text-[#5F9468] text-sm font-medium hover:bg-[#5F9468]/20 transition-colors"
                    >
                      <PlatformIcon platformKey={key} />
                      {PLATFORMS[key].name}
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                        />
                      </svg>
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => onToggleStatus(published)}
                      disabled={updatingPostId === published.id}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-[#999] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Unpublish"
                    >
                      {updatingPostId === published.id ? (
                        <Spinner />
                      ) : (
                        <>
                          Unpublish
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            }

            // Admin view: show draft posts with status badge + publish button
            if (isAdmin && post) {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
                >
                  <PlatformIcon platformKey={key} />
                  {PLATFORMS[key].name}
                  <StatusBadge status={post.status} />
                  <button
                    onClick={() => onToggleStatus(post)}
                    disabled={updatingPostId === post.id}
                    className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded text-xs font-medium bg-[#5F9468] text-white hover:bg-[#4F8357] transition-colors disabled:opacity-50"
                  >
                    {updatingPostId === post.id ? (
                      <Spinner />
                    ) : (
                      <>Publish &rarr;</>
                    )}
                  </button>
                </span>
              );
            }

            // Client view: show "Coming soon" only when no posts are published
            if (!hasAnyPublished) {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F4F1] text-[#999] text-sm"
                >
                  <PlatformIcon platformKey={key} />
                  Coming soon
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* Publish All / Unpublish All — admin only */}
        {isAdmin && topic.posts.length > 0 && (
          <div className="flex gap-3 mt-4 pt-3 border-t border-[#E8E6E1]">
            {topic.posts.some((p) => p.status === "draft") && (
              <button
                onClick={async () => {
                  for (const p of topic.posts.filter((p) => p.status === "draft")) {
                    await onToggleStatus(p);
                  }
                }}
                disabled={updatingPostId !== null}
                className="text-xs font-medium text-[#5F9468] hover:text-[#4F8357] transition-colors disabled:opacity-50"
              >
                Publish All
              </button>
            )}
            {topic.posts.some((p) => p.status === "published") && (
              <button
                onClick={async () => {
                  for (const p of topic.posts.filter((p) => p.status === "published")) {
                    await onToggleStatus(p);
                  }
                }}
                disabled={updatingPostId !== null}
                className="text-xs font-medium text-[#999] hover:text-red-600 transition-colors disabled:opacity-50"
              >
                Unpublish All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnSection({
  column,
  isAdmin,
  updatingPostId,
  onToggleStatus,
}: {
  column: ColumnWithTopics;
  isAdmin: boolean;
  updatingPostId: string | null;
  onToggleStatus: (post: Post) => Promise<void>;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        {column.owner_avatar_url && (
          <Image
            src={column.owner_avatar_url}
            alt={column.owner_name ?? ""}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">
            {column.title}
          </h2>
          {column.owner_name && (
            <p className="text-sm text-[#999] mt-0.5">
              by {column.owner_name}
            </p>
          )}
        </div>
      </div>
      {column.description && (
        <p className="text-[#666] mb-6 leading-relaxed">
          {column.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {column.topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            columnSlug={column.slug}
            isAdmin={isAdmin}
            updatingPostId={updatingPostId}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}

export function ContentPageClient({
  publishedColumns,
  allColumns,
  isAdminUser,
}: {
  publishedColumns: ColumnWithTopics[];
  allColumns: ColumnWithTopics[] | null;
  isAdminUser: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = isAdminUser && searchParams.get("view") === "admin" ? "admin" : "client";
  const [showCreator, setShowCreator] = useState(false);
  const [updatingPostId, setUpdatingPostId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(576); // default ~xl (max-w-xl = 36rem = 576px)
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(400, Math.min(newWidth, window.innerWidth - 100)));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isAdmin = viewMode === "admin";
  const columns = isAdmin && allColumns ? allColumns : publishedColumns;

  async function togglePostStatus(post: Post) {
    const newStatus = post.status === "draft" ? "published" : "draft";
    setUpdatingPostId(post.id);
    try {
      const res = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          id: post.id,
          data: {
            status: newStatus,
            ...(newStatus === "draft" ? { published_at: null } : {}),
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to update post:", err.error);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error("Failed to update post:", err);
    } finally {
      setUpdatingPostId(null);
    }
  }

  return (
    <>
      {/* Admin view indicator */}
      {isAdminUser && isAdmin && (
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
            Admin View — Showing drafts
          </span>
        </div>
      )}

      {/* Column sections */}
      {columns.length > 0 ? (
        <section className="py-16 space-y-16">
          {columns.map((column) => (
            <ColumnSection key={column.id} column={column} isAdmin={isAdmin} updatingPostId={updatingPostId} onToggleStatus={togglePostStatus} />
          ))}
        </section>
      ) : (
        <section className="py-16 text-center">
          <p className="text-[#999] text-lg">
            Content is on the way — check back soon.
          </p>
        </section>
      )}

      {/* Create with AI — admin only */}
      {isAdminUser && isAdmin && (
        <>
          {/* Floating action button */}
          <button
            onClick={() => setShowCreator(true)}
            className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-[#5F9468] text-white shadow-lg hover:bg-[#4F8357] hover:shadow-xl transition-all flex items-center justify-center"
            title="Create with AI"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          {/* Slide-over panel */}
          {showCreator && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setShowCreator(false)}
              />
              {/* Panel */}
              <div
                className="fixed right-0 top-0 z-50 h-full bg-[#FAFAF8] border-l border-[#E8E6E1] shadow-2xl flex flex-col"
                style={{ width: panelWidth }}
              >
                {/* Drag handle */}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    isDragging.current = true;
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                  }}
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:bg-[#5F9468]/30 transition-colors" />
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#5F9468]/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-[#1C1C1C]">Create with AI</h2>
                  </div>
                  <button
                    onClick={() => setShowCreator(false)}
                    className="p-2 text-[#999] hover:text-[#1C1C1C] transition-colors rounded-xl hover:bg-[#E8E6E1]/50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden px-4 pb-4">
                  <AgentChat
                    agentId="content-creator"
                    apiEndpoint="/api/agents/content-creator"
                    storageKey="content-creator-sessions"
                    placeholder="What content would you like to create?"
                    emptyStateTitle="Create multi-platform content"
                    emptyStateDescription="Tell me a topic and I'll draft tailored content for X, Medium, LinkedIn, Instagram, and YouTube."
                    loadingText="Drafting..."
                    agentIcon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    agentName="Content Creator"
                    variant="embedded"
                    fileUpload={{
                      accept: "audio/*,video/*,image/*",
                      maxSizeMB: 100,
                      endpoint: "/api/upload",
                    }}
                    starterPrompts={[
                      "Create a post about AI agents for small businesses",
                      "Help me draft content from a recording I'll upload",
                      "What topics should I write about next?",
                    ]}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
