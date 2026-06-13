"use client";

import { useEffect, useState } from "react";

interface Feather {
  id: number;
  x: number; // % from left
  size: number; // px
  delay: number; // s
  duration: number; // s
  drift: number; // px horizontal sway
  opacity: number;
  rotation: number; // starting rotation
}

function generateFeathers(count: number): Feather[] {
  // Deterministic seed-based generation to avoid hydration mismatch
  const feathers: Feather[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508; // golden angle for distribution
    feathers.push({
      id: i,
      x: ((seed * 7) % 100),
      size: 16 + ((seed * 3) % 20),
      delay: (seed * 0.5) % 12,
      duration: 12 + ((seed * 2) % 10),
      drift: 20 + ((seed * 1.5) % 40),
      opacity: 0.04 + ((seed * 0.3) % 0.08),
      rotation: (seed * 5) % 360,
    });
  }
  return feathers;
}

const FeatherSVG = ({ size, opacity }: { size: number; opacity: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
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
);

const FEATHERS = generateFeathers(8);

export function FloatingFeathers() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setVisible(false);
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {FEATHERS.map((f) => (
        <div
          key={f.id}
          className="absolute animate-feather-float"
          style={{
            left: `${f.x}%`,
            top: "-5%",
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            ["--feather-drift" as string]: `${f.drift}px`,
            ["--feather-rotation" as string]: `${f.rotation}deg`,
          }}
        >
          <FeatherSVG size={f.size} opacity={f.opacity} />
        </div>
      ))}
    </div>
  );
}

/**
 * A smaller, more focused floating feather effect for section accents.
 * Place it inside a section with `position: relative`.
 */
export function FeatherAccent({
  position = "right",
  size = 40,
}: {
  position?: "left" | "right" | "center";
  size?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setVisible(false);
    const handler = (e: MediaQueryListEvent) => setVisible(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!visible) return null;

  const positionClass =
    position === "left"
      ? "left-4 lg:left-8"
      : position === "right"
        ? "right-4 lg:right-8"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute top-8 ${positionClass} pointer-events-none animate-feather-bob`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-[0.07]"
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
  );
}
