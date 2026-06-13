"use client";

import { useEffect, useRef, useState } from "react";

export function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setReducedMotion(true);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [reducedMotion]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-50" : "opacity-0"
        }`}
        src="/videos/hero-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        onCanPlayThrough={() => setVideoLoaded(true)}
      />

      {/* CSS fallback (shows while video loads, or if no video) */}
      {!videoLoaded && !reducedMotion && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#5F9468] opacity-[0.07] blur-[120px] animate-light-pulse" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#D4C5A9] opacity-[0.05] blur-[100px] animate-light-drift" />
          <div
            className="absolute top-2/3 right-1/4 w-[350px] h-[350px] rounded-full bg-[#5F9468] opacity-[0.04] blur-[100px] animate-light-drift"
            style={{ animationDelay: "-6s" }}
          />
          <div className="absolute inset-0 animate-light-sweep">
            <div className="absolute top-0 left-0 w-[200px] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12" />
          </div>
        </>
      )}

      {/* Radial vignette — always present to blend edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#FAFAF8_85%)]" />
    </div>
  );
}
