"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the corners. */
  max?: number;
  /** Lifts the card toward the viewer on hover. */
  lift?: number;
};

/**
 * Mouse-tracked 3D tilt with a spring. Also publishes the pointer position as
 * `--mx` / `--my` custom properties, so children can position a specular
 * highlight that follows the cursor across the card face.
 */
export function TiltCard({
  children,
  className = "",
  max = 9,
  lift = 14,
}: Props) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const z = useSpring(0, spring);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);
    e.currentTarget.style.setProperty("--mx", `${nx * 100}%`);
    e.currentTarget.style.setProperty("--my", `${ny * 100}%`);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseEnter={() => z.set(lift)}
      onMouseLeave={() => {
        px.set(0.5);
        py.set(0.5);
        z.set(0);
      }}
      style={{
        rotateX,
        rotateY,
        z,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
