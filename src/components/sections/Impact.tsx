"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { Counter } from "@/components/motion/Counter";
import { Cog, HexBolt, Washer, Wrench } from "@/components/visuals/Hardware";
import { impact } from "@/content/impact";

const parts = {
  cog: Cog,
  washer: Washer,
  bolt: HexBolt,
  wrench: Wrench,
} as const;

/**
 * Oversized metric rows — the +270K / 6X block from the reference, rebuilt in
 * steel. Each row wipes in, its gold tag springs in rotated, and the numeral
 * counts up on arrival.
 */
export function Impact() {
  const root = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-impact-row]").forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 60, clipPath: "inset(0 0 100% 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            duration: 1.15,
            ease: "expo.out",
            scrollTrigger: { trigger: row, start: "top 86%" },
          },
        );

        // The numeral slides laterally across its own row as you scroll past,
        // which is what gives the reference's stat block its restlessness.
        gsap.fromTo(
          row.querySelector("[data-impact-figure]"),
          { xPercent: -4 },
          {
            xPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          },
        );
      });
    },
    root,
    [],
  );

  return (
    <div
      ref={root}
      className="shell-gutter relative py-16 sm:py-24 lg:py-[clamp(5rem,12vh,9rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        <RevealText
          as="h2"
          lines={impact.heading}
          className="text-display text-chrome mb-10 text-[clamp(2rem,8vw,4.6rem)] sm:mb-[clamp(3rem,8vh,5rem)]"
        />

        {impact.rows.map((row, i) => {
          const Part = parts[row.part];
          return (
            <div key={row.tag} data-impact-row>
              <div className="grid items-center gap-5 py-8 sm:gap-6 sm:py-[clamp(1.75rem,4vh,3rem)] md:grid-cols-[140px_1fr_minmax(0,260px)] md:gap-10">
                {/* machined thumbnail */}
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  className="surface-pitch grid h-[86px] w-[86px] shrink-0 place-items-center sm:h-[110px] sm:w-[110px] md:h-[140px] md:w-[140px]"
                >
                  <Part
                    className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
                    gold={i % 2 === 1}
                  />
                </motion.div>

                {/* figure + tag */}
                <div className="relative">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: -7 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 16,
                      delay: 0.25,
                    }}
                    className="surface-gilt absolute -top-2 left-2 z-10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase md:left-6"
                  >
                    {row.tag}
                  </motion.span>

                  <span
                    data-impact-figure
                    className="text-display text-chrome block text-[clamp(3.5rem,17vw,9.5rem)] leading-[0.85]"
                  >
                    <Counter
                      to={row.value}
                      prefix={row.prefix}
                      suffix={row.suffix}
                      duration={2.2}
                    />
                  </span>
                </div>

                <p className="text-steel-400 text-sm leading-relaxed">
                  {row.body}
                </p>
              </div>

              {i < impact.rows.length - 1 && <div className="rule-fade" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
