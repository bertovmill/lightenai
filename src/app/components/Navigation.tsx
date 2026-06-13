"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeatherLogo } from "./Logo";
import { AuthButton } from "./AuthButton";

const NAV_LINKS = [
  { href: "/offer", label: "OFFER" },
  { href: "/about", label: "ABOUT" },
  { href: "/learn", label: "LEARN" },
  { href: "/agents", label: "AGENTS" },
  { href: "/blog", label: "BLOG" },
  { href: "/#reviews", label: "LEAVE A REVIEW" },
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* E2B for Startups partner banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1C1C1C]">
        <a
          href="https://e2b.dev/startups"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 py-1.5 hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/e2b-black-logo.png" alt="E2B" className="h-4 invert" />
          <span className="text-[11px] text-white/70 font-medium tracking-wide">
            Proud partner of the E2B for Startups program
          </span>
        </a>
      </div>
      <nav className="fixed top-[32px] left-0 right-0 z-50 px-4 md:px-6 pt-4">
        <div
          className={`max-w-5xl mx-auto px-6 flex items-center justify-between rounded-full border transition-all duration-300 ease-in-out ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl border-[#E8E6E1]/60 py-2.5"
              : "bg-white/40 backdrop-blur-xl border-white/40 py-3"
          }`}
        >
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {FeatherLogo}
            <span className="font-semibold tracking-tight text-[#1C1C1C] text-lg">
              Lighten AI
            </span>
          </Link>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.15em] transition-colors duration-200 cursor-pointer ${
                  link.label === "LEAVE A REVIEW"
                    ? "font-semibold text-[#5F9468] hover:text-[#4F8357]"
                    : `font-medium ${
                        pathname === link.href
                          ? "text-[#1C1C1C]"
                          : "text-[#888] hover:text-[#1C1C1C]"
                      }`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth + CTA */}
          <div className="hidden md:flex items-center gap-5">
            <Suspense fallback={<div className="w-8" />}>
              <AuthButton />
            </Suspense>
            <Link
              href="#contact"
              className="border border-[#1C1C1C] text-[#1C1C1C] text-xs font-semibold tracking-[0.1em] uppercase px-5 py-2.5 rounded-full hover:bg-[#1C1C1C] hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              GET STARTED
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 -mr-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-5 h-5 text-[#1C1C1C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMobile}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl border-l border-[#E8E6E1] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end p-4">
          <button
            className="flex items-center justify-center w-10 h-10"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col px-6 pb-8 gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={`text-xs tracking-[0.15em] py-3 px-4 rounded-lg transition-colors duration-200 ${
                link.label === "LEAVE A REVIEW"
                  ? "font-semibold text-[#5F9468] hover:text-[#4F8357] hover:bg-[#F5F4F1]"
                  : `font-medium ${
                      pathname === link.href
                        ? "text-[#1C1C1C] bg-[#F5F4F1]"
                        : "text-[#888] hover:text-[#1C1C1C] hover:bg-[#F5F4F1]"
                    }`
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={closeMobile}
            className="mt-4 border border-[#1C1C1C] text-[#1C1C1C] text-xs font-semibold tracking-[0.1em] uppercase px-5 py-3 rounded-full text-center hover:bg-[#1C1C1C] hover:text-white transition-colors duration-200"
          >
            GET STARTED
          </Link>
          <div className="mt-4 pt-4 border-t border-[#E8E6E1]">
            <Suspense fallback={<div className="h-10" />}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Spacer (32px banner + nav height) */}
      <div className="h-[104px] md:h-[116px]" />
    </>
  );
}
