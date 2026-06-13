"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Feathers that rise upward and fade out — visualising "weight being lifted".
 * Trigger: enters viewport via IntersectionObserver.
 * Each feather starts at the bottom, floats upward with gentle sway,
 * and fades to nothing — the lightening metaphor.
 */

interface RisingFeather {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  sway: number;
}

function generateRising(count: number): RisingFeather[] {
  const items: RisingFeather[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 97.3;
    items.push({
      id: i,
      x: 10 + ((seed * 3) % 80),
      size: 14 + ((seed * 2) % 16),
      delay: (seed * 0.4) % 4,
      duration: 4 + ((seed * 1.2) % 4),
      sway: 15 + ((seed * 0.8) % 30),
    });
  }
  return items;
}

const RISING = generateRising(5);

export function FeatherRise() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setMotionOk(false);
    const handler = (e: MediaQueryListEvent) => setMotionOk(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOk) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [motionOk]);

  if (!motionOk) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {triggered &&
        RISING.map((f) => (
          <div
            key={f.id}
            className="absolute bottom-0 animate-feather-rise"
            style={{
              left: `${f.x}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              ["--feather-sway" as string]: `${f.sway}px`,
            }}
          >
            <svg
              width={f.size}
              height={f.size}
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 3C17 3 13 7 10 12C7 17 6 21 6 25L8 23C9 20 11 16 14 12C17 8 20 6 23 6L21 3Z"
                fill="#5F9468"
              />
              <path
                d="M6 25C6 25 8 24 11 21C14 18 17 14 19 10C21 6 21 3 21 3"
                stroke="#5F9468"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 25L14 17"
                stroke="#5F9468"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
    </div>
  );
}
