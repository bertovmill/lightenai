"use client";

import { useRef, useState } from "react";

export function ExplainerVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCTA, setShowCTA] = useState(false);

  return (
    <div className="max-w-3xl mx-auto mb-14">
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <video
          ref={videoRef}
          src="/videos/profit-gap-explainer.mp4"
          controls
          playsInline
          preload="metadata"
          poster="/videos/profit-gap-explainer-poster.jpg"
          className="w-full aspect-video"
          onTimeUpdate={() => {
            if (!videoRef.current) return;
            const remaining = videoRef.current.duration - videoRef.current.currentTime;
            setShowCTA(remaining < 3.5);
          }}
          onEnded={() => setShowCTA(true)}
          onSeeked={() => {
            if (!videoRef.current) return;
            const remaining = videoRef.current.duration - videoRef.current.currentTime;
            setShowCTA(remaining < 3.5);
          }}
        />

        {/* Clickable CTA overlay — appears during outro */}
        {showCTA && (
          <a
            href="#contact"
            className="absolute inset-0 flex items-end justify-center pb-[12%] z-10 cursor-pointer"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }}
          >
            <span className="bg-[#5F9468] hover:bg-[#4F8357] text-white text-sm font-semibold tracking-[0.1em] uppercase px-10 py-4 rounded-full transition-colors">
              Book a Free Assessment
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
