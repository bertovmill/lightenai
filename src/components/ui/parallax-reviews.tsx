"use client";
import { useScroll, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface Review {
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
  linkedin?: string;
}

export function ParallaxReviews({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -30]);

  const transforms = [y1, y2, y1];
  const cols = reviews.length <= 2 ? 2 : 3;

  return (
    <div
      ref={sectionRef}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "grid grid-cols-1 max-w-4xl mx-auto gap-8 px-6",
          cols === 2 ? "md:grid-cols-2 max-w-3xl" : "md:grid-cols-3"
        )}
      >
        {reviews.map((review, idx) => (
          <motion.div
            key={idx}
            style={{ y: transforms[idx % transforms.length] }}
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white border border-[#E8E6E1] rounded-2xl p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-[#F5B731]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm font-semibold text-[#1C1C1C] ml-1">5.0</span>
      </div>
      <p className="text-[#555] text-sm leading-relaxed mb-5">&ldquo;{review.quote}&rdquo;</p>
      <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E1]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#5F9468]/15 flex items-center justify-center text-xs font-semibold text-[#5F9468]">
            {review.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C1C1C]">{review.name}</p>
            <p className="text-xs text-[#888]">{review.role} &middot; {review.company}</p>
          </div>
        </div>
        {review.linkedin && (
          <a
            href={review.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-[#0A66C2] transition-colors duration-200"
            aria-label={`${review.name} on LinkedIn`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
