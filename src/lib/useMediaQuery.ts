"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query subscription. Returns `false` on the server and on the
 * first client render, then settles — so render a mobile-first default and let
 * this upgrade it, never the other way around.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setMatches(e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the viewport is wider than it is tall. */
export const LANDSCAPE = "(min-aspect-ratio: 1/1)";
