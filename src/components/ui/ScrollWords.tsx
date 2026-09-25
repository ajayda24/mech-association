"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";

type Props = {
  text: string;
  className?: string;
  /**
   * Words or phrases that get the gold treatment. A multi-word phrase only
   * lights up where the whole run appears in order. Case- and
   * punctuation-insensitive.
   */
  highlight?: readonly string[];
};

const clean = (w: string) => w.replace(/[^a-z0-9]/gi, "").toLowerCase();

/** Indices of the words covered by any highlight phrase. */
function hotIndices(words: string[], highlight: readonly string[]) {
  const cleaned = words.map(clean);
  const hot = new Set<number>();
  for (const phrase of highlight) {
    const parts = phrase.split(/\s+/).map(clean).filter(Boolean);
    if (!parts.length) continue;
    for (let i = 0; i + parts.length <= cleaned.length; i++) {
      if (parts.every((p, j) => cleaned[i + j] === p)) {
        parts.forEach((_, j) => hot.add(i + j));
      }
    }
  }
  return hot;
}

/**
 * Each word lights up as the paragraph passes through the viewport — the
 * scrubbed statement block from the reference. Driven by scroll position, not
 * a timer, so it tracks the scroll exactly.
 */
export function ScrollWords({ text, className = "", highlight = [] }: Props) {
  const root = useRef<HTMLParagraphElement>(null);
  // A "\n" in the text starts a new line; "\n" tokens render as <br />.
  const words = text
    .trim()
    .split(/( *\n *| +)/)
    .filter((t) => t.trim() !== "" || t.includes("\n"))
    .map((t) => (t.includes("\n") ? "\n" : t));
  const hot = hotIndices(words, highlight);

  useGsapContext(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(
        "[data-word]",
        root.current,
      );
      gsap.fromTo(
        words,
        { opacity: 0.32, filter: "blur(2px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.6,
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            end: "bottom 58%",
            scrub: 0.5,
          },
        },
      );
    },
    root,
    [text],
  );

  return (
    <p ref={root} className={className}>
      {words.map((w, i) => {
        if (w === "\n") return <br key={i} />;
        const isHot = hot.has(i);
        return (
          <span
            key={i}
            data-word
            data-progressive
            className={`inline-block ${isHot ? "text-gilt" : ""}`}
          >
            {w}
            <span className="inline-block w-[0.26em]" />
          </span>
        );
      })}
    </p>
  );
}
