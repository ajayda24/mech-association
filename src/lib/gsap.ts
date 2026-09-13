"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single place where GSAP plugins get registered. Importing `gsap` from here
 * instead of the package guarantees ScrollTrigger exists before any component
 * builds a timeline.
 */
// registerPlugin is idempotent, so a bare call at module scope is safe even
// though several components import from here.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
