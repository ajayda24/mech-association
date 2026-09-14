"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";

type Props = {
  text: string;
  className?: string;
  /** Words matching these get the gold treatment. Case-insensitive. */
  highlight?: readonly string[];
};

/**
 * Each word lights up as the paragraph passes through the viewport — the
 * scrubbed statement block from the reference. Driven by scroll position, not
 * a timer, so it tracks the scroll exactly.
 */
export function ScrollWords({ text, className = "", highlight = [] }: Props) {
  const root = useRef<HTMLParagraphElement>(null);
  const lower = highlight.map((h) => h.toLowerCase());

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
      {text.split(" ").map((w, i) => {
        const clean = w.replace(/[^a-z0-9]/gi, "").toLowerCase();
        const isHot = lower.includes(clean);
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
