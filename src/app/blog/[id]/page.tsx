import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navigation } from "@/app/components/Navigation";
import { Footer } from "@/app/components/Footer";
import { getBlogPost } from "@/lib/content";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) return { title: "Not Found | Lighten AI" };
  return {
    title: `${post.title} | Lighten AI`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) notFound();

  const date = formatDate(post.published_at ?? post.created_at);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Soft background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Breadcrumb */}
        <nav className="py-6 text-sm text-[#999] flex items-center gap-2 flex-wrap">
          <Link href="/blog" className="hover:text-[#5F9468] transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-[#666]">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="pb-8 border-b border-[#E8E6E1]">
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.15] mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-[#555] leading-relaxed mb-4">{post.excerpt}</p>
          )}
          {(post.author || date) && (
            <p className="text-sm text-[#999]">
              {post.author && <span>{post.author}</span>}
              {post.author && date && <span> · </span>}
              {date && <time>{date}</time>}
            </p>
          )}
        </header>

        {/* Article body */}
        {post.body ? (
          <article className="py-12 prose prose-lg max-w-none prose-headings:text-[#1C1C1C] prose-headings:font-bold prose-p:text-[#444] prose-p:leading-relaxed prose-a:text-[#5F9468] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#1C1C1C] prose-li:text-[#444] prose-th:text-[#1C1C1C] prose-td:text-[#444] prose-hr:border-[#E8E6E1]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </article>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[#999] text-lg">Full article coming soon.</p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-auto py-8 border-t border-[#E8E6E1]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#5F9468] font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        <Footer />
      </div>
    </div>
  );
}
