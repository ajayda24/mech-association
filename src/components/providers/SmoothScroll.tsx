"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type LenisRef = RefObject<Lenis | null>;

const LenisContext = createContext<LenisRef | null>(null);

/**
 * Returns a ref holding the live Lenis instance (`null` until the provider's
 * effect runs, and on touch devices where we deliberately don't run it).
 * A ref rather than state: consumers only read it in handlers and effects.
 */
export function useLenisRef(): LenisRef {
  const ctx = useContext(LenisContext);
  const fallback = useRef<Lenis | null>(null);
  return ctx ?? fallback;
}

/**
 * Smooth scrolling, with one hard rule: exactly one requestAnimationFrame
 * loop on the page. GSAP's ticker owns it and drives Lenis from there, so
 * ScrollTrigger updates and scroll position can never disagree by a frame —
 * which is what produced the inconsistent, sometimes-fast-sometimes-slow feel.
 *
 * TOUCH: Lenis is not started on touch devices. Hijacking touch scrolling
 * fights the platform's own momentum physics and is the single biggest source
 * of stutter on phones. Native scrolling there is smoother and more
 * predictable, and every ScrollTrigger works identically against it.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Keep pin/scrub measurements stable when mobile browsers show and hide
    // their URL bar — otherwise every toolbar change re-measures and jumps.
    ScrollTrigger.config({ ignoreMobileResize: true });

    let cleanupLenis: (() => void) | undefined;

    if (!reduce && !coarse) {
      const instance = new Lenis({
        /**
         * Pure lerp mode — no duration/easing. Each frame eases a fixed
         * fraction toward the target, which reads as continuous flow rather
         * than a series of eased hops. 0.09 glides without feeling detached
         * from the wheel.
         */
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        // Leave touch to the platform.
        syncTouch: false,
      });

      instance.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      lenisRef.current = instance;

      cleanupLenis = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        instance.destroy();
        lenisRef.current = null;
      };
    }

    // Web fonts land after first paint and change every text height, so
    // anything measured before they load is measured wrong.
    let raf = 0;
    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    document.fonts?.ready.then(refresh).catch(() => {});

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 180);
    };
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("orientationchange", onResize);
      cleanupLenis?.();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}
