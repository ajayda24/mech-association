"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Runs `setup` inside a scoped `gsap.context` and reverts it on unmount, so
 * every tween and ScrollTrigger a component creates is torn down with it.
 * Skips entirely when the visitor prefers reduced motion.
 */
export function useGsapContext(
  setup: (ctx: gsap.Context) => void,
  scope: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(setup, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
