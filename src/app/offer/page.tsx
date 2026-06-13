import { Metadata } from "next";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { AnimateIn } from "../components/AnimateIn";
import { HeroBackground } from "../components/HeroBackground";
import { GrainTexture } from "../components/GrainTexture";

export const metadata: Metadata = {
  title: "Our Offer | Lighten AI",
  description: "Lighten AI identifies the processes draining your time and builds AI agents to automate them — from audit to launch and beyond.",
};

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Process Audit",
    description: "We map your workflows end-to-end — where time is being wasted, where bottlenecks live, and where AI agents will have the biggest impact on your bottom line.",
    details: [
      "Full audit of your current workflows and operations",
      "Time and cost analysis on repetitive tasks",
      "Bottleneck mapping across departments",
      "Identify the highest-ROI automation opportunities",
    ],
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
  {
    step: "02",
    title: "Custom Agent Build",
    description: "We build AI agents tailored to your business — not generic templates. Sales agents, ops agents, support agents, whatever your workflows need.",
    details: [
      "Agents trained on your specific business processes",
      "Custom integrations with your existing tools",
      "Review and approval workflows built for your team",
      "Designed to fit how your people already work",
    ],
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    step: "03",
    title: "Launch & Scale",
    description: "Your agents go live and start handling real work. We monitor performance, refine outputs, and expand automation across your business as you grow.",
    details: [
      "Agents deployed into your live workflows",
      "Ongoing monitoring and performance refinement",
      "Monthly expansion into new processes",
      "ROI tracking so you always see the impact",
    ],
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  },
] as const;

const GAP_EXAMPLES = [
  {
    area: "Hours lost to manual work",
    cost: "Your team spends half their day on repetitive tasks — data entry, follow-ups, approvals — that should run themselves.",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    area: "Leads slipping through the cracks",
    cost: "Nobody follows up fast enough. Opportunities go cold while your team juggles too many priorities.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
  {
    area: "Decisions based on gut, not data",
    cost: "You're guessing instead of knowing. Without clear visibility into your operations, you can't optimize what you can't measure.",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
  },
  {
    area: "Scaling means hiring more people",
    cost: "Every time you want to do more, you need more headcount. AI agents let a lean team operate like one ten times its size.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.128V17a6.003 6.003 0 018.18-5.697M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
] as const;

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      <Navigation />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] flex items-center justify-center">
        <HeroBackground />
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 lg:py-32 text-center relative z-10">
          <AnimateIn animation="fade-up">
            <h1 className="font-display font-semibold text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-6">
              Agentic AI <span className="text-[#5F9468]">Engineers.</span>
            </h1>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={50}>
            <p className="text-lg md:text-xl text-[#555] leading-relaxed mb-10 max-w-2xl mx-auto">
              We help you identify the processes in your company that are taking the most time — then we lighten that workload with AI agents built around your business.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ─── THE PROFIT GAP (green grain section) ─── */}
      <section className="grain-green bg-[#5F9468] text-white">
        <GrainTexture density={0.45} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="max-w-3xl mb-16">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-[0.15em] mb-4">THE PROFIT GAP</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">
                Great businesses, weighed down by manual work.
              </h2>
              <p className="text-white/60 leading-relaxed text-lg">
                Every hour your team spends on repetitive tasks is an hour not spent on growth. The gap between where you are and where you could be — that&apos;s where AI agents come in.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6">
            {GAP_EXAMPLES.map((gap, i) => (
              <AnimateIn key={gap.area} animation="fade-up" delay={i * 100}>
                <div className="border border-white/15 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 hover:bg-white/5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={gap.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{gap.area}</h3>
                      <p className="text-white/60 leading-relaxed">{gap.cost}</p>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn animation="fade-up" delay={400}>
            <div className="mt-12 border border-white/15 rounded-2xl p-8 lg:p-10">
              <p className="text-xl font-display font-semibold mb-2">
                The real question isn&apos;t &ldquo;Should we use AI?&rdquo;
              </p>
              <p className="text-white/60 leading-relaxed">
                It&apos;s &ldquo;How much is it costing us not to?&rdquo; We put a dollar sign on every inefficiency so the decision makes itself.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── PROCESS STEPS ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <AnimateIn animation="fade-up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">OUR PROCESS</p>
            <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">
              Three steps to a lighter workload.
            </h2>
            <p className="text-[#555] text-lg leading-relaxed">
              No generic templates. No cookie-cutter AI. Custom agents built around your business, your workflows, and your goals.
            </p>
          </div>
        </AnimateIn>

        <div className="space-y-8">
          {PROCESS_STEPS.map((step, i) => (
            <AnimateIn key={step.step} animation={i % 2 === 0 ? "slide-right" : "slide-left"} delay={i * 100}>
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 lg:p-10 hover:border-[#5F9468]/40 transition-all duration-300">
                <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 items-start">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#5F9468] text-white flex items-center justify-center font-display font-semibold text-lg">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-2xl md:text-3xl mb-3">{step.title}</h3>
                    <p className="text-[#555] leading-relaxed">{step.description}</p>
                  </div>
                  <div className="bg-[#FAFAF8] rounded-xl p-6">
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-[0.15em] mb-4">What this includes</p>
                    <ul className="space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#5F9468] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-[#555] text-sm leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ─── ROI FRAMING (green grain section) ─── */}
      <section className="grain-green bg-[#5F9468] text-white">
        <GrainTexture density={0.3} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-[0.15em] mb-4">THE MATH</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">
                Do more without hiring more.
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                When you add up the hours lost to manual work, slow follow-ups, and repetitive admin — the case for AI agents makes itself.
              </p>
              <div className="w-16 h-px bg-white/30 mx-auto" />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── WHO THIS IS FOR ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <AnimateIn animation="fade-up">
            <div>
              <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">IS THIS FOR YOU?</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-6">
                For businesses ready to work smarter.
              </h2>
              <p className="text-[#555] text-lg leading-relaxed">
                We work best with companies that know they&apos;re leaving time and money on the table — and want AI agents that actually fit how their team works.
              </p>
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={100}>
            <div className="space-y-4">
              {[
                "Your team spends more time on admin than on high-value work",
                "You're growing but can't keep hiring to match the workload",
                "You've tried AI tools but they don't fit your actual workflows",
                "You want to automate processes, not just individual tasks",
                "You're ready for a system that scales with your business",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-white border border-[#E8E6E1] rounded-xl p-4">
                  <svg className="w-5 h-5 text-[#5F9468] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[#555] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── CTA + CALENDLY ─── */}
      <section className="bg-[#F5F4F1]/50">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <AnimateIn animation="fade-up">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">NEXT STEP</p>
              <h2 className="font-display font-semibold text-3xl md:text-5xl leading-[1.1] tracking-tight mb-4">Start with a process audit.</h2>
              <p className="text-lg text-[#555] max-w-xl mx-auto mb-6">
                Book a call and we&apos;ll show you exactly where AI agents can save time, cut costs, and lighten your workload.
              </p>
              <a
                href="/lighten-ai-one-pager.pdf"
                download
                className="inline-flex items-center gap-2 text-sm text-[#5F9468] hover:text-[#4F8357] font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Or download our one-pager (PDF)
              </a>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={100}>
            <div className="flex justify-center">
              <a
                href="https://calendar.app.google/3QaSYTFnMAvXwHTJ7"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1C1C1C] text-white text-sm font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-full hover:bg-[#333] transition-colors duration-200 inline-flex items-center gap-2"
              >
                BOOK A CALL
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="grain-green bg-[#5F9468] text-white">
        <GrainTexture density={0.3} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <AnimateIn animation="fade-up">
            <h2 className="font-display font-semibold text-3xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
              Ready to lighten<br className="hidden md:block" /> <span className="italic text-white/90">your workload?</span>
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Join the businesses using AI agents to automate processes and grow without growing headcount.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="bg-white text-[#5F9468] text-sm font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-full hover:bg-white/90 transition-colors duration-200"
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
    </div>
  );
}
