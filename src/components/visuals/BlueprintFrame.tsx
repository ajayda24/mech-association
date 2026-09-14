"use client";

import { motion } from "motion/react";

/**
 * Technical-drawing furniture for the hero: a machinist grid, registration
 * crosses at the corners, and tick rails down the edges.
 *
 * This is the part that stops the hero reading like every other landing page.
 * A mechanical department's own drawings are covered in datums, tolerances and
 * registration marks, so the page borrows that language instead of decorating
 * with generic gradients and blobs.
 */
export function BlueprintFrame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="texture-knurl absolute inset-0 opacity-70 [mask-image:radial-gradient(90%_70%_at_50%_35%,#000_10%,transparent_85%)]" />

      {/* registration crosses */}
      {[
        "top-5 left-4 sm:top-8 sm:left-8",
        "top-5 right-4 sm:top-8 sm:right-8",
        "bottom-5 left-4 sm:bottom-8 sm:left-8",
        "bottom-5 right-4 sm:bottom-8 sm:right-8",
      ].map((pos, i) => (
        <motion.span
          key={pos}
          className={`absolute ${pos} block h-4 w-4 sm:h-5 sm:w-5`}
          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.07, duration: 0.7 }}
        >
          <span className="bg-gold-600/60 absolute top-1/2 left-0 h-px w-full" />
          <span className="bg-gold-600/60 absolute top-0 left-1/2 h-full w-px" />
          <span className="border-gold-600/40 absolute inset-[3px] rounded-full border" />
        </motion.span>
      ))}

      {/* edge tick rails */}
      {(["top", "bottom"] as const).map((edge) => (
        <div
          key={edge}
          className={`absolute inset-x-10 flex justify-between sm:inset-x-16 ${
            edge === "top" ? "top-6 sm:top-9" : "bottom-6 sm:bottom-9"
          }`}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={`bg-steel-700 w-px ${i % 4 === 0 ? "h-2" : "h-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Rotated micro-type down the page edges. Desktop only — it needs the room. */
export function EdgeRail({
  side,
  children,
}: {
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:block ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <span
        className="text-ink-faint flex items-center gap-3 text-[10px] font-medium tracking-[0.3em] whitespace-nowrap uppercase"
        style={{
          writingMode: "vertical-rl",
          transform: side === "left" ? "rotate(180deg)" : undefined,
        }}
      >
        <span className="via-gold-600/50 h-16 w-px bg-gradient-to-b from-transparent to-transparent" />
        {children}
        <span className="via-gold-600/50 h-16 w-px bg-gradient-to-b from-transparent to-transparent" />
      </span>
    </div>
  );
}
