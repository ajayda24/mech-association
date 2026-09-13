"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";

type Props = {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up when it scrolls into view — the metric roll used on every stat in
 * the reference. Writes straight to the DOM node so React never re-renders
 * mid-tween.
 */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGsapContext(
    () => {
      const node = ref.current;
      if (!node) return;
      const value = { n: from };

      gsap.to(value, {
        n: to,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          node.textContent =
            prefix +
            value.n.toLocaleString("en-IN", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }) +
            suffix;
        },
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
      });
    },
    ref,
    [to, from, decimals, prefix, suffix, duration],
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {from.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
