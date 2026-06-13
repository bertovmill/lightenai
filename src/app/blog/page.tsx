import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/app/components/Navigation";
import { Footer } from "@/app/components/Footer";
import { getBlogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog | Lighten AI",
  description: "Insights on AI agents, automation, and running a leaner business.",
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Soft background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5F9468] mb-4">
            The Blog
          </p>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            Ideas on AI agents & leaner business.
          </h1>
          <p className="text-lg text-[#555] leading-relaxed max-w-2xl">
            Notes from the field on automation, agents, and helping small teams
            do more with less.
          </p>
        </header>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="py-16 text-center border-t border-[#E8E6E1]">
            <p className="text-[#999] text-lg">No blog posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 border-t border-[#E8E6E1] pt-12">
            {posts.map((post) => {
              const date = formatDate(post.published_at ?? post.created_at);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug ?? post.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E6E1] bg-white/60 transition-colors hover:border-[#5F9468]"
                >
                  {post.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl md:text-2xl font-bold leading-snug tracking-tight mb-3 group-hover:text-[#5F9468] transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-[#555] leading-relaxed mb-5 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-2 text-sm text-[#999]">
                    {post.author && <span>{post.author}</span>}
                    {post.author && date && <span>·</span>}
                    {date && <time>{date}</time>}
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-auto" />
        <Footer />
      </div>
    </div>
  );
}
