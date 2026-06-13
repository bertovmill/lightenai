import { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { AnimateIn } from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "About Us | Lighten AI",
  description: "Learn about Lighten AI - we take work off your plate so you can focus on what you do best.",
};

// Hoisted static data
const VALUES = [
  {
    title: "Relationships-First",
    description: "The tech is important, but we care to deeply know our clients above all. Your success is personal to us.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    title: "Excellence Imperative",
    description: "We're in a hypercompetitive market, and we commit ourselves to excellence every day. Good enough isn't good enough.",
    icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  },
  {
    title: "Reliability",
    description: "We're always there for our customers, ready to respond and help. When you need us, we show up.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "Fun",
    description: "Our team has a blast making products, and we want using them to feel the same way. Work doesn't have to be a grind.",
    icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
  },
] as const;

const TEAM = [
  {
    name: "Berto Mill",
    role: "Founder & CEO",
    bio: "Saw firsthand how business owners spend more time on admin than on what they actually love doing. Started Lighten AI to change that.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Soft background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <AnimateIn animation="fade-up">
            <div className="max-w-3xl">
              <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">About Us</span>
              <h1 className="text-4xl md:text-5xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6 text-[#1C1C1C]">
                So you can focus on what you do{" "}
                <span className="text-[#5F9468]">best.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#555] leading-relaxed">
                Our mission is simple: take as much work off your plate as possible, so you can focus on what you do best — and making your business better.
              </p>
            </div>
          </AnimateIn>
        </section>

        {/* Our Story */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <AnimateIn animation="fade-up">
              <div>
                <span className="inline-block text-xs font-semibold text-[#999] uppercase tracking-[0.15em] mb-4">Why We Started</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1C1C1C]">
                  Running a business is hard enough
                </h2>
              </div>
            </AnimateIn>
            <div className="space-y-6 text-[#555] leading-relaxed">
              <AnimateIn animation="fade-up" delay={100}>
                <p>
                  Running a business is difficult. We saw it over and over again: talented people — experts in their craft — spending most of their time on work that has nothing to do with why they started their business in the first place.
                </p>
              </AnimateIn>
              <AnimateIn animation="fade-up" delay={200}>
                <p>
                  You started your business because you have something valuable to offer. A skill. A service. A perspective that nobody else has. That&apos;s your core value — the thing that makes your business worth running.
                </p>
              </AnimateIn>
              <AnimateIn animation="fade-up" delay={300}>
                <p>
                  But instead of doing that work, you&apos;re buried in admin. Data entry. Follow-ups. Compliance paperwork. The stuff that keeps the lights on but doesn&apos;t move the needle.
                </p>
              </AnimateIn>
              <AnimateIn animation="fade-up" delay={400}>
                <p className="text-[#1C1C1C] font-semibold">
                  We started Lighten AI to change that. Our mission is to take as much of that work off your plate as possible — so you can get back to doing what you do best, and making your business better.
                </p>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <AnimateIn animation="fade-up">
            <div className="relative rounded-[2rem] p-10 lg:p-14 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(107,143,113,0.08) 0%, rgba(107,143,113,0.04) 100%)" }}>
              {/* Decorative quote mark */}
              <span className="absolute top-6 left-8 text-[#5F9468]/15 text-[8rem] font-serif leading-none select-none pointer-events-none">&ldquo;</span>
              <div className="max-w-3xl mx-auto text-center relative z-10">
                <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">Our Mission</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1C1C1C] leading-relaxed">
                  &ldquo;Take as much work off your plate as possible, so you can focus on what you do best — and making your business better.&rdquo;
                </h2>
                {/* Green accent line */}
                <div className="w-16 h-1 bg-[#5F9468] rounded-full mx-auto" />
              </div>
            </div>
          </AnimateIn>
        </section>

        {/* Our Values */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <AnimateIn animation="fade-up">
            <div className="mb-12">
              <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C]">
                What we stand for
              </h2>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <AnimateIn key={value.title} animation="fade-up" delay={i * 100}>
                <div
                  className="bg-white border border-[#E8E6E1] rounded-3xl p-8 hover:border-[#5F9468]/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#5F9468]/10 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={value.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#1C1C1C]">{value.title}</h3>
                  <p className="text-[#666] leading-relaxed">{value.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <AnimateIn animation="fade-up">
            <div className="mb-12">
              <span className="inline-block text-xs font-semibold text-[#5F9468] uppercase tracking-[0.15em] mb-4">Our Team</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C]">
                The people behind Lighten AI
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="bg-white border border-[#E8E6E1] rounded-3xl p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-[#5F9468]/10 flex items-center justify-center mb-5">
                    <svg className="w-8 h-8 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#1C1C1C]">{member.name}</h3>
                  <p className="text-[#5F9468] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-[#666] leading-relaxed text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-[#E8E6E1]">
          <AnimateIn animation="fade-up">
            <div className="bg-[#5F9468] rounded-[2rem] p-10 lg:p-14 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to lighten your load?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Let&apos;s talk about how we can help you get back to doing what you do best.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-white text-[#5F9468] font-semibold rounded-2xl hover:bg-white/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Get in touch
              </Link>
            </div>
          </AnimateIn>
        </section>

        <Footer />
      </div>
    </div>
  );
}
