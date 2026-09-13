"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 56 },
  down: { y: -56 },
  left: { x: 56 },
  right: { x: -56 },
  scale: { scale: 0.9 },
};

type Props = {
  children: ReactNode;
  className?: string;
  from?: Direction;
  delay?: number;
  duration?: number;
  /** Adds a de-focus on entry — the soft "materialise" in the reference. */
  blur?: boolean;
  amount?: number;
};

/** One-shot entrance when the element scrolls into view. */
export function ScrollReveal({
  children,
  className = "",
  from = "up",
  delay = 0,
  duration = 0.95,
  blur = true,
  amount = 0.25,
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offsets[from],
        filter: blur ? "blur(10px)" : undefined,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: blur ? "blur(0px)" : undefined,
      }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 64, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Staggered group. Wrap a list and give each child `<StaggerItem>` so they
 * cascade in rather than appearing together.
 */
export function Stagger({
  children,
  className = "",
  stagger = 0.11,
  delay = 0,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
