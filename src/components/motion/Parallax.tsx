"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";

type Props = {
  children: ReactNode;
  className?: string;
  /**
   * How far the element drifts over the scroll range, in percent of its own
   * height. Negative moves it up (faster than the page), positive down.
   */
  y?: number;
  x?: number;
  rotate?: number;
  scaleTo?: number;
  /** Higher = laggier, more weighted. */
  scrub?: number;
  start?: string;
  end?: string;
};

/**
 * Scroll-linked drift. Layer several of these at different `y` values to get
 * the depth-stacked movement the reference uses on nearly every section.
 */
export function Parallax({
  children,
  className = "",
  y = -18,
  x = 0,
  rotate = 0,
  scaleTo,
  scrub = 0.8,
  start = "top bottom",
  end = "bottom top",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      gsap.to(ref.current, {
        yPercent: y,
        xPercent: x,
        rotate,
        ...(scaleTo !== undefined ? { scale: scaleTo } : {}),
        ease: "none",
        scrollTrigger: { trigger: ref.current, start, end, scrub },
      });
    },
    ref,
    [y, x, rotate, scaleTo, scrub, start, end],
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
