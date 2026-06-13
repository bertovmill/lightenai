import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { getPublishedContent, getAllContent } from "@/lib/content";
import { getAuthUser, isAdminEmail } from "@/lib/auth";
import { PLATFORMS, PLATFORM_ORDER } from "./platforms";
import { ContentPageClient } from "./ContentPageClient";

export const metadata: Metadata = {
  title: "Content | Lighten AI",
  description:
    "Follow Lighten AI on X, Medium, LinkedIn, and Instagram for insights on AI automation for businesses.",
};

export default async function ContentPage() {
  const user = await getAuthUser();
  const isAdminUser = isAdminEmail(user?.email);

  const publishedColumns = await getPublishedContent();
  const allColumns = isAdminUser ? await getAllContent() : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Soft background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">
              Content
            </span>
            <h1 className="text-4xl md:text-5xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6 text-[#1C1C1C]">
              Insights to help you work{" "}
              <span className="text-[#5F9468]">smarter.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#555] leading-relaxed">
              Guides, ideas, and resources on how AI can lighten the load for
              your business. Follow us where you hang out.
            </p>
          </div>
        </section>

        {/* Channel bar */}
        <section className="pb-12 border-b border-[#E8E6E1]">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-[#999] uppercase tracking-wide mr-2">
              Find us on
            </span>
            {PLATFORM_ORDER.map((key) => {
              const p = PLATFORMS[key];
              return (
                <a
                  key={key}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${p.name} — ${p.handle}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E8E6E1] text-[#555] hover:border-[#5F9468]/40 hover:text-[#5F9468] transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={p.iconPath} />
                  </svg>
                  <span className="text-sm font-medium hidden sm:inline">
                    {p.name}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Content with admin/client toggle */}
        <ContentPageClient
          publishedColumns={publishedColumns}
          allColumns={allColumns}
          isAdminUser={isAdminUser}
        />

        {/* CTA */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <div className="bg-[#5F9468] rounded-[2rem] p-10 lg:p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Want to stay in the loop?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Reach out and we&apos;ll keep you updated when new content drops.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-white text-[#5F9468] font-semibold rounded-2xl hover:bg-white/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              Get in touch
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
