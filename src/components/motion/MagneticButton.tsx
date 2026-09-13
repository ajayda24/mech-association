"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  href?: string;
  className?: string;
  /** Pull radius as a fraction of the element's half-size. */
  strength?: number;
  onClick?: (e: React.MouseEvent) => void;
};

/**
 * The button leans toward the cursor and springs back on exit. Small touch,
 * but it's what makes the CTAs feel alive rather than static rectangles.
 */
export function MagneticButton({
  children,
  href = "#",
  className = "",
  strength = 0.32,
  onClick,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, {
      x: dx * strength,
      y: dy * strength,
      duration: 0.6,
      ease: "power3.out",
    });
    // Label trails slightly further for a touch of parallax inside the button.
    gsap.to(label.current, {
      x: dx * strength * 0.35,
      y: dy * strength * 0.35,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  const reset = () => {
    gsap.to([ref.current, label.current], {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span ref={label} className="inline-block">
        {children}
      </span>
    </a>
  );
}
