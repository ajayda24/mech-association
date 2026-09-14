import type { ReactNode } from "react";

export type Tone = "steel" | "silver" | "pitch";

type Props = {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  className?: string;
  /**
   * Clips decoration that bleeds past the edges. Turn OFF for any section that
   * pins with ScrollTrigger — an overflow ancestor fights position:fixed.
   */
  clip?: boolean;
};

/**
 * Section shell. `tone` re-points the semantic colour variables for everything
 * inside, so the same utilities render correctly on gunmetal, black or silver.
 * Alternating tones down the page is what gives the site its rhythm.
 */
export function Section({
  children,
  id,
  tone = "steel",
  className = "",
  clip = true,
}: Props) {
  return (
    <section
      id={id}
      // Read by the fixed nav, which has to re-colour itself against whatever
      // it happens to be floating over.
      data-tone={tone}
      className={`tone-${tone} relative ${clip ? "overflow-hidden" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
