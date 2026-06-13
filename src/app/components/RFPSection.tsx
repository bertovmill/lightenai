"use client";

import { ContactForm } from "./ContactForm";

export function RFPSection() {
  return (
    <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
      {/* RFP Form (direct, no intermediate step) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E8E6E1]">
        <ContactForm />
      </div>

      {/* Book a Call Card */}
      <a
        href="https://calendar.app.google/CoDZu7ugAzvBJLqDA"
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-white rounded-2xl border border-[#E8E6E1] p-7 flex flex-col items-center text-center hover:border-[#5F9468]/30 hover:shadow-lg hover:shadow-[#5F9468]/5 transition-all duration-300 h-full"
      >
        <div className="w-12 h-12 rounded-full bg-[#5F9468]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#1C1C1C] mb-1.5">Book an intro call</h3>
        <p className="text-sm text-[#888] mb-5 leading-relaxed">
          Pick a time that works. 30 minutes, no commitment.
        </p>
        <span className="mt-auto w-full py-2.5 bg-[#5F9468] text-white text-sm font-semibold tracking-[0.1em] uppercase rounded-full group-hover:bg-[#4F8357] transition-colors duration-200 text-center">
          Schedule a Call
        </span>
      </a>
    </div>
  );
}
