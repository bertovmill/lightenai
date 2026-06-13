import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { RFPSection } from "./components/RFPSection";
import { ExplainerVideo } from "./components/ExplainerVideo";
import { ParallaxReviews } from "@/components/ui/parallax-reviews";
import type { Review } from "@/components/ui/parallax-reviews";
import { AnimateIn } from "./components/AnimateIn";
import { CountUp } from "./components/CountUp";
import { HeroBackground } from "./components/HeroBackground";
import { GrainTexture } from "./components/GrainTexture";
import { FAQ } from "./components/FAQ";
import { ExpandableCard } from "./components/ExpandableCard";
import { AssessmentFramework } from "./components/AssessmentFramework";
import Link from "next/link";
import { DropContentIdeas } from "./components/DropContentIdeas";
import { ShareButton } from "./components/ShareButton";
import { ReviewForm } from "./components/ReviewForm";

const FEATURE_ICONS: Record<string, string> = {
  SALES: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  MARKETING: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  OPERATIONS: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
  "CUSTOMER EXPERIENCE": "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
};

const AI_SYSTEMS = [
  { name: "Blog & Article Agents", description: "AI agents that research, draft, and polish long-form content. Blog posts, thought leadership, and SEO articles, all in your brand voice.", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" },
  { name: "Social Media Agents", description: "Agents that create platform-native content for LinkedIn, X, Instagram, and more. Consistent posting without the burnout.", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  { name: "Video & Script Agents", description: "From YouTube scripts to short-form video outlines and captions. AI agents that turn ideas into production-ready content.", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
  { name: "Email & Newsletter Agents", description: "AI agents that craft email sequences, newsletters, and drip campaigns. Personalized messaging at scale.", icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" },
] as const;

const METRICS = [
  { end: 50, suffix: "+", label: "AI agents deployed" },
  { end: 10, suffix: "x", label: "Content output" },
  { end: 70, suffix: "%", label: "Less production time" },
  { end: 5, suffix: "x", label: "Faster time to publish" },
] as const;

const FEATURES = [
  {
    label: "SALES",
    title: "Close faster, lose fewer leads.",
    description: "AI agents that follow up instantly, qualify leads around the clock, and keep your pipeline moving. No more cold opportunities slipping through the cracks.",
  },
  {
    label: "MARKETING",
    title: "Campaigns that run on data, not guesswork.",
    description: "From content creation to audience targeting, AI agents execute your marketing strategy with precision. Consistent output across every channel without burning out your team.",
  },
  {
    label: "OPERATIONS",
    title: "Cut the manual work in half.",
    description: "AI agents handle the repetitive admin, reporting, and coordination that bogs your team down. Approvals, data entry, scheduling — automated so your people focus on decisions, not busywork.",
  },
  {
    label: "CUSTOMER EXPERIENCE",
    title: "Support that scales without headcount.",
    description: "AI agents resolve common questions instantly, route complex issues to the right people, and keep customers happy 24/7. Faster response times, lower costs, better satisfaction.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Content audit",
    description: "We map your content workflows, identify bottlenecks, and find where AI agents create the biggest impact.",
  },
  {
    step: 2,
    title: "Custom agent build",
    description: "Agents trained on your brand voice, tone, and audience. Not generic templates.",
  },
  {
    step: 3,
    title: "Launch & scale",
    description: "Your agents start producing. We monitor quality, refine outputs, and expand your content system monthly.",
  },
] as const;

const REVIEWS: Review[] = [
  {
    name: "Qazi F.",
    role: "Vouched for Berto",
    company: "January 2026",
    quote: "Berto gave very clear, practical, and thoughtful advice on career development, and he genuinely cared about the problems I was trying to solve. He took the time to understand my background and goals before offering guidance, which made his advice feel relevant and personal. He shared excellent insights on the importance of joining hackathons and explained how they help build real-world problem-solving skills, strengthen teamwork, and increase visibility within the tech and AI community. He also took the time to review and praise the projects I have built so far, which was very encouraging and motivating. His advice was realistic, actionable, and delivered with genuine enthusiasm.",
    initials: "QF",
    linkedin: "https://www.linkedin.com/in/qazifabiahoq/",
  },
  {
    name: "David M.",
    role: "Vouched for Berto",
    company: "January 2026",
    quote: "Berto is my go-to whenever I have an AI question. He\u2019s a lifelong learner who genuinely cares about understanding the problem you\u2019re trying to solve before jumping into tools or solutions. He listens intently, asks the right questions, and breaks things down in a way that actually makes sense. He\u2019s an incredibly clear teacher with a rare ability to make complex tools and platforms feel approachable and genuinely usable in a traditional business context. He taught me how to build my first app, helped me vibe-code my own website, and most importantly, gave me the confidence to build things myself despite not having a technical background.",
    initials: "DM",
    linkedin: "https://www.linkedin.com/in/david-mill-b07811181/",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      <Navigation />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[70vh] flex items-center justify-center">
        <HeroBackground />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 lg:py-24 text-center relative z-10">
          <AnimateIn animation="fade-up">
            <h1 className="font-display font-semibold text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-6">
              Go farther with <span className="text-[#6B8F71]">agents.</span>
            </h1>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={50}>
            <p className="text-lg md:text-xl text-[#555] leading-relaxed mb-10 max-w-2xl mx-auto">
              We help businesses offload tasks to agents, so you can focus on what you do best.
            </p>
          </AnimateIn>

          {/* ─── GET STARTED CTA ─── */}
          <AnimateIn animation="fade-up" delay={200}>
            <div className="flex justify-center mb-10">
              <Link
                href="#contact"
                className="bg-[#1C1C1C] text-white text-sm font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-full hover:bg-[#333] transition-colors duration-200 flex items-center gap-2"
              >
                GET STARTED
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── OUR VALUES ─── */}
      <section className="bg-[#FAFAF8] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">OUR VALUES</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                What we stand for.
              </h2>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimateIn animation="fade-up" delay={0}>
              <div className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#6B8F71]/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#6B8F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="font-sans font-semibold text-xl mb-3">Trust</h3>
                <p className="text-[#666] leading-relaxed">
                  Trust is the foundation of every relationship we build. Our clients and vendors rely on us to be transparent, dependable, and to always act in their best interest.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={100}>
              <div className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#6B8F71]/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#6B8F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <h3 className="font-sans font-semibold text-xl mb-3">Client Success</h3>
                <p className="text-[#666] leading-relaxed">
                  If our clients aren&apos;t succeeding, we&apos;re not succeeding. We measure our impact by the real results our clients achieve—their growth is our growth.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={200}>
              <div className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#6B8F71]/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#6B8F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="font-sans font-semibold text-xl mb-3">Innovation</h3>
                <p className="text-[#666] leading-relaxed">
                  We relentlessly innovate and improve ourselves every day. The AI landscape moves fast, and we make sure our clients are always ahead of the curve.
                </p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section id="reviews" className="bg-[#F5F4F1]/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-10 md:pb-16">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">REVIEWS</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                What our clients say.
              </h2>
            </div>
          </AnimateIn>
        </div>
        <div className="pb-10 md:pb-14">
          <ParallaxReviews reviews={REVIEWS} />
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-20 md:pb-28 flex justify-center">
          <ReviewForm />
        </div>
      </section>

      {/* ─── PROBLEMS WE SOLVE ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <AnimateIn animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">SOUND FAMILIAR?</p>
            <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">Problems we solve.</h2>
          </div>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {[
            { title: "Sales bleeding leads", description: "Your pipeline is leaking because nobody follows up fast enough. Opportunities go cold while your team juggles too many priorities." },
            { title: "Support drowning in tickets", description: "Your customer support team spends hours on repetitive questions that could be resolved instantly with the right system." },
            { title: "Marketing running on guesswork", description: "Your marketing team is guessing instead of using data. Campaigns launch without clear insight into what actually drives results." },
            { title: "Admin buried in manual work", description: "Your admin team is stuck in spreadsheets, copy-pasting, and chasing approvals. Hours lost to work that should run itself." },
          ].map((problem, i) => (
            <AnimateIn key={problem.title} animation="fade-up" delay={i * 100}>
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-7 h-full">
                <div className="w-10 h-10 rounded-full bg-[#FDF2F2] flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-[#C45C5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{problem.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ─── WHAT WE DO ─── */}
      <section className="bg-[#1C1C1C] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">WHAT WE DO</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                We expose the gaps. Then we close them.
              </h2>
            </div>
          </AnimateIn>

          {/* Explainer video with clickable CTA */}
          <AnimateIn animation="fade-up" delay={50}>
            <ExplainerVideo />
          </AnimateIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Find the gaps", description: "We audit your operations and surface the inefficiencies hiding in your sales, support, marketing, and admin workflows.", expandedText: "The AI profit gap is the space between the messy, inefficient way businesses are doing things right now and the faster, more profitable way they could be doing it with AI." },
              { step: "02", title: "Put a dollar sign on it", description: "Every gap gets a cost. You see exactly how much wasted time, lost revenue, and missed opportunity is on the table." },
              { step: "03", title: "Show what it\u2019s worth to close it", description: "We map the ROI of closing each gap with AI. You see the before, the after, and the path to get there." },
            ].map((item, i) => (
              <AnimateIn key={item.step} animation="fade-up" delay={i * 120}>
                <ExpandableCard
                  step={item.step}
                  title={item.title}
                  description={item.description}
                  expandedText={'expandedText' in item ? item.expandedText : undefined}
                />
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DARK METRICS BAR ─── */}
      <section className="grain-green bg-[#6B8F71]">
        <GrainTexture density={0.2} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((metric, i) => (
              <AnimateIn key={metric.label} animation="fade-up" delay={i * 100}>
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-display font-semibold text-white">
                    <CountUp end={metric.end} suffix={metric.suffix} />
                  </p>
                  <p className="text-xs text-white/50 uppercase tracking-[0.15em] mt-2">{metric.label}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE SECTIONS (split layout) ─── */}
      {FEATURES.map((feature, i) => {
        const isReversed = i % 2 === 1;
        const iconPath = FEATURE_ICONS[feature.label];
        return (
          <section key={feature.label} className={isReversed ? "bg-[#F5F4F1]/50" : ""}>
            <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <AnimateIn animation={isReversed ? "slide-left" : "slide-right"} className={isReversed ? "lg:order-2" : ""}>
                  <div>
                    <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">{feature.label}</p>
                    <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">{feature.title}</h2>
                    <p className="text-[#555] text-lg leading-relaxed mb-8">{feature.description}</p>
                    <Link
                      href="/offer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1C1C1C] uppercase tracking-[0.1em] hover:text-[#6B8F71] transition-colors duration-200"
                    >
                      LEARN MORE
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </AnimateIn>
                <AnimateIn animation={isReversed ? "slide-right" : "slide-left"} delay={100} className={isReversed ? "lg:order-1" : ""}>
                  <div className="flex items-center justify-center">
                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-[#6B8F71]/10 flex items-center justify-center">
                      <svg className="w-24 h-24 md:w-28 md:h-28 text-[#6B8F71]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    </div>
                  </div>
                </AnimateIn>
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── DARK SECTION: WHAT WE BUILD ─── */}
      <section className="grain-green bg-[#6B8F71] text-white">
        <GrainTexture density={0.45} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-[0.15em] mb-4">WHAT WE BUILD</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                AI agents built<br className="hidden md:block" /> for your content.
              </h2>
            </div>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 gap-6">
            {AI_SYSTEMS.map((system, i) => (
              <AnimateIn key={system.name} animation="fade-up" delay={i * 100}>
                <div className="group border border-white/15 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 hover:bg-white/5">
                  <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={system.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{system.name}</h3>
                  <p className="text-white/60 leading-relaxed">{system.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <AnimateIn animation="fade-up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">PROCESS</p>
            <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">Three steps to lighter content.</h2>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-[#E8E6E1]" aria-hidden="true" />

          {HOW_IT_WORKS.map((item, i) => (
            <AnimateIn key={item.step} animation="fade-up" delay={i * 150}>
              <div className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-[#6B8F71] text-white flex items-center justify-center mx-auto mb-6 text-lg font-display font-semibold relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-[#666] leading-relaxed">{item.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-[#1C1C1C] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="mb-12">
              <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-4">FAQ</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight">
                Frequently asked questions.
              </h2>
            </div>
          </AnimateIn>
          <FAQ />
        </div>
      </section>

      {/* ─── CONTACT + CALENDLY ─── */}
      <section id="contact" className="bg-[#F5F4F1]/50">
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-6">
              <p className="text-xs font-semibold text-[#6B8F71] uppercase tracking-[0.15em] mb-3">GET IN TOUCH</p>
              <h2 className="font-display font-semibold text-3xl md:text-4xl leading-[1.1] tracking-tight mb-3">
                Let&apos;s start with an AI growth<br className="hidden md:block" /> and profit assessment.
              </h2>
              <p className="text-base text-[#555] max-w-xl mx-auto">
                30 minutes. We&apos;ll show you exactly where AI can save time, cut costs, and grow revenue in your business.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={50}>
            <AssessmentFramework />
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={100}>
            <RFPSection />
          </AnimateIn>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="grain-green bg-[#6B8F71] text-white">
        <GrainTexture density={0.3} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <AnimateIn animation="fade-up">
            <h2 className="font-display font-semibold text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
              Ready to create more<br className="hidden md:block" /> <span className="italic text-white/90">with less effort?</span>
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Join the brands using AI agents to 10x content output and grow without hiring a full content team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="bg-white text-[#6B8F71] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-full hover:bg-white/90 transition-colors duration-200"
              >
                START A CONVERSATION
              </a>
              <a
                href="/lighten-ai-one-pager.pdf"
                download
                className="border border-white/30 text-white text-sm font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-full hover:border-white/60 transition-colors duration-200"
              >
                DOWNLOAD ONE-PAGER
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6">
        <Footer />
      </div>

      {/* Floating share button */}
      <ShareButton />

      {/* Floating content idea button — only for bertmill19@gmail.com */}
      <DropContentIdeas />
    </div>
  );
}
