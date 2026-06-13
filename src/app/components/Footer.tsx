import Link from "next/link";
import { FeatherLogoSmall } from "./Logo";
import FeedbackWidget from "./FeedbackWidget";
import { ReviewForm } from "./ReviewForm";

const FOOTER_LINKS = {
  Product: [
    { href: "/agents", label: "AI Agents" },
    { href: "/offer", label: "Our Offer" },
    { href: "/content", label: "Content" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/learn", label: "Learn" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-[#E8E6E1] pt-16 pb-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            {FeatherLogoSmall}
            <span className="font-semibold text-[#1C1C1C] text-base">Lighten AI</span>
          </div>
          <p className="text-sm text-[#888] leading-relaxed max-w-xs">
            AI systems built for $10M&ndash;$100M businesses. Scale content, support, and operations without adding headcount.
          </p>
          <ReviewForm />
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([category, links]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-[0.15em] mb-4">{category}</p>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#666] hover:text-[#1C1C1C] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E8E6E1]">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="text-xs text-[#999]">&copy; {new Date().getFullYear()} Lighten AI. All rights reserved.</span>
          <span className="text-xs text-[#999]">1001508680 ONTARIO INC.</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#999]">
          <span className="hover:text-[#666] transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-[#666] transition-colors cursor-pointer">Terms</span>
        </div>
      </div>
      <FeedbackWidget />
    </footer>
  );
}
