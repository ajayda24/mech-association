"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";

type Props = {
  items: readonly string[];
  /** Base pixels-per-second. */
  speed?: number;
  className?: string;
  separator?: string;
};

/**
 * Infinite ticker whose speed reacts to scroll velocity, so the page feels
 * like machinery running underneath it.
 *
 * PERFORMANCE NOTE: velocity comes from ScrollTrigger's own already-computed
 * `getVelocity()`, read once per GSAP tick — no second requestAnimationFrame
 * loop, and no tween created per frame. The earlier version did both, which
 * meant two rAF loops competing and a new tween allocated every frame; that
 * was a major contributor to the uneven scroll feel.
 */
export function Marquee({
  items,
  speed = 60,
  className = "",
  separator = "◆",
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      const track = root.current?.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      // Two copies sit side by side; shifting one full copy width loops
      // seamlessly because the second lands exactly where the first was.
      const loop = gsap.to(track, {
        xPercent: -50,
        duration: track.scrollWidth / 2 / speed,
        ease: "none",
        repeat: -1,
      });

      // One page-wide ScrollTrigger supplies velocity. getVelocity() is an
      // instance method, so this lightweight trigger exists purely to read it.
      let target = 1;
      const reader = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          // Map scroll velocity onto playback rate, clamped so it never blurs.
          target = gsap.utils.clamp(-3, 5, 1 + self.getVelocity() * 0.0016);
        },
      });

      let current = 1;
      const tick = () => {
        // Ease toward the target in place: no allocation, no competing tween,
        // and no second requestAnimationFrame loop.
        current += (target - current) * 0.08;
        loop.timeScale(current);
        // Decay back to base speed when scrolling stops, since onUpdate
        // stops firing and would otherwise leave it stuck at speed.
        target += (1 - target) * 0.04;
      };

      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        reader.kill();
        loop.kill();
      };
    },
    root,
    [speed],
  );

  const row = [...items, ...items];

  return (
    <div
      ref={root}
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div data-track className="flex w-max will-change-transform">
        {row.map((item, i) => (
          <span
            key={i}
            className="text-steel-500 flex shrink-0 items-center text-xs font-medium tracking-[0.16em] whitespace-nowrap uppercase sm:text-sm sm:tracking-[0.18em]"
          >
            {item}
            <span className="text-gold-600 mx-5 text-[10px] sm:mx-7">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
