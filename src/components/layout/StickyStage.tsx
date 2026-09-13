import type { ReactNode } from "react";

/**
 * A viewport-height stage that stays fixed while you scroll past it, with the
 * scroll distance defined by the outer track.
 *
 * Uses CSS `position: sticky` rather than GSAP's `pin`. GSAP pinning clones
 * layout into a pin-spacer and recalculates on every resize, which on mobile
 * fires constantly as the browser toolbar shows and hides — that was a real
 * source of the uneven scroll. Sticky is handled by the compositor, needs no
 * measurement, and behaves identically on desktop and touch.
 *
 * `svh` (small viewport height) is used deliberately: `vh` on mobile refers to
 * the *largest* viewport, so a 100vh stage is taller than what you can see
 * while the toolbar is visible.
 *
 * Child ScrollTriggers should target `[data-stage-track]` with
 * `start: "top top"` / `end: "bottom bottom"` to scrub across the full pass.
 */
export function StickyStage({
  children,
  /** Scroll distance as a multiple of the viewport height. */
  length = 2.6,
  className = "",
}: {
  children: ReactNode;
  length?: number;
  className?: string;
}) {
  return (
    <div
      data-stage-track
      className={`relative ${className}`}
      style={{ height: `${length * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">{children}</div>
    </div>
  );
}
