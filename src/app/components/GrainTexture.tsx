"use client";

import { useEffect, useRef } from "react";

// Brand greens: #5F9468 (main) and #4F8357 (darker hover)
const BASE = { r: 107, g: 143, b: 113 }; // #5F9468
const DARK = { r: 90, g: 125, b: 96 };   // #4F8357

/**
 * density: 0–1, fraction of pixels that become the darker speckle.
 * Most pixels stay the base green; only `density` % become the darker accent.
 */
function generateGreenNoise(
  width: number,
  height: number,
  density: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const speckle = Math.random() < density;
    const c = speckle ? DARK : BASE;
    data[i] = c.r;
    data[i + 1] = c.g;
    data[i + 2] = c.b;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function GrainTexture({ density = 0.3 }: { density?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const noiseUrl = generateGreenNoise(200, 200, density);
    el.style.backgroundImage = `url(${noiseUrl})`;
  }, [density]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}
