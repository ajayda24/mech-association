"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px. */
  amplitude?: number;
  /** Degrees of idle sway. */
  spin?: number;
  duration?: number;
  delay?: number;
  /** Pop-in on mount before the idle loop takes over. */
  entrance?: boolean;
};

/**
 * Idle bob + sway. Layered under <Parallax> so decoration keeps breathing even
 * when the page is still — the floating props in the reference never rest.
 */
export function Float({
  children,
  className = "",
  amplitude = 12,
  spin = 6,
  duration = 6,
  delay = 0,
  entrance = true,
}: Props) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={entrance ? { opacity: 0, scale: 0.4, rotate: -25 } : false}
      whileInView={entrance ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 1.1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        animate={{
          y: [-amplitude, amplitude, -amplitude],
          rotate: [-spin, spin, -spin],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
