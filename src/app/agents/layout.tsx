"use client";

import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C] relative overflow-x-hidden">
      {/* Soft background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#5F9468] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4E5D7] opacity-[0.15] blur-[120px] rounded-full pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-8 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
