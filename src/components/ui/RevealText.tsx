"use client";

import { motion, type Variants } from "motion/react";
import type { ElementType } from "react";

type Props = {
  /** Each string is one visual line. Lines break exactly where you put them. */
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  /** Seconds between successive words. */
  stagger?: number;
  delay?: number;
  /** Animate once when scrolled into view instead of immediately on mount. */
  onView?: boolean;
  /**
   * Only meaningful when `onView` is false: hold in the hidden state until
   * this flips true. Used to stop the hero playing out behind the loading
   * screen.
   */
  play?: boolean;
};

/*
 * Each letter rises out of a mask. The mask clips only its BOTTOM edge — see
 * the class on the wrapper span — because a full `overflow: hidden` also cuts
 * the tops of tall glyphs when line-height is 1.
 */
const word: Variants = {
  hidden: { y: "110%", rotate: 3 },
  show: {
    y: "0%",
    rotate: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Masked word-by-word reveal — each word rises out of its own clipping box.
 * Used for the display headlines that unfurl line by line in the reference.
 */
export function RevealText({
  lines,
  as: Tag = "h2",
  className = "",
  stagger = 0.045,
  delay = 0,
  onView = true,
  play = true,
}: Props) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const animateProps = onView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } }
    : { animate: play ? ("show" as const) : ("hidden" as const) };

  return (
    <Tag className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        {...animateProps}
        className="block"
      >
        {lines.map((line, li) => {
          const words = line.split(" ");
          return (
            <span key={li} className="block">
              {words.map((w, wi) => (
                <span
                  key={wi}
                  className={`inline-block [clip-path:inset(-0.5em_-0.08em_0_-0.08em)] pb-[0.14em] align-bottom ${
                    wi < words.length - 1 ? "mr-[0.26em]" : ""
                  }`}
                >
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
