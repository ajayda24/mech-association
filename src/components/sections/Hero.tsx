"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { Marquee } from "@/components/motion/Marquee";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { StickyStage } from "@/components/layout/StickyStage";
import { MechanismPlate } from "@/components/visuals/MechanismPlate";
import { BlueprintFrame, EdgeRail } from "@/components/visuals/BlueprintFrame";
import { Cog } from "@/components/visuals/Hardware";
import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { useAppReady } from "@/components/providers/AppReady";
import { Section } from "../layout/Section";
import { Statement } from "./Statement";

/**
 * Hero, composed as a technical drawing rather than a centred landing stack.
 *
 *   1. The headline is ASYMMETRIC and mixes faces — "We Build" set light in
 *      General Sans, "What Moves" struck in Cinzel caps behind a gold datum
 *      rule. The two halves of one phrase are deliberately different voices.
 *   2. Supporting copy is a SPEC TABLE, not a paragraph — a ruled grid of
 *      figures, which is what the department's own drawings would carry.
 *   3. The two calls to action are deliberately UNEQUAL: one solid, one a
 *      text link. Two identical pills give the eye no order to read them in.
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  // Entrance waits for the loading screen, or it plays to completion behind it
  // and the user arrives at an already-finished hero.
  const ready = useAppReady();

  useGsapContext(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          gsap.to(copy.current, {
            yPercent: -16,
            /**
             * Only down to 0.55. At 0.25 the intro paragraph was effectively
             * gone the moment you nudged the page — mid-grey body copy loses
             * more than half its contrast at that opacity, while the near-white
             * headline still reads, which is why only the paragraph looked
             * broken.
             */
            opacity: 0.55,
            // Blurring a full-width container every frame is expensive on
            // phones for an effect you barely register; desktop only.
            ...(desktop ? { filter: "blur(2px)" } : {}),
            ease: "none",
            scrollTrigger: {
              // Anchored to the hero's top against the viewport top — scroll
              // position zero by definition, so progress always starts at 0.
              trigger: root.current,
              start: "top top",
              end: "+=70%",
              scrub: 0.5,
            },
          });
        },
      );
      return () => mm.revert();
    },
    root,
    [],
  );

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div ref={root} className="relative">
      <BlueprintFrame />
      <EdgeRail side="left">
        {site.name} — {site.college}
      </EdgeRail>
      <EdgeRail side="right">Scroll to disassemble</EdgeRail>

      <div
        ref={copy}
        className="shell-gutter relative z-10 pt-24 pb-10 sm:pt-28 sm:pb-14 md:pt-36"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* ---------- datum strip ----------
              One line at every width. The old version tried to carry three
              pieces of text and wrapped each of them on a phone. */}
          <motion.div
            {...fade(0.05)}
            className="text-ink-faint flex items-start gap-3 text-[9px] leading-[1.6] font-medium tracking-[0.24em] whitespace-nowrap uppercase sm:gap-5 sm:text-[10px]"
          >
            {/* Rules sit on the first line, so the college name hangs
                beneath the department name rather than centring the strip. */}
            <span className="text-gold-300">{hero.index}</span>
            <span className="bg-line-strong mt-[0.8em] h-px w-6 shrink-0 sm:w-12" />
            <span className="flex flex-col gap-1.5">
              <span>{hero.eyebrow}</span>
              <span className="text-silver-300">{site.collegeShort}</span>
            </span>
            <span className="bg-line-strong mt-[0.8em] ml-auto hidden h-px flex-1 lg:block" />
          </motion.div>

          {/* ---------- headline ---------- */}
          <div className="relative mt-7 sm:mt-11 md:mt-14">
            <RevealText
              as="span"
              lines={["We Build"]}
              onView={false}
              play={ready}
              delay={0.18}
              stagger={0.05}
              className="text-display text-chrome block text-[clamp(2.9rem,15vw,9rem)] font-extralight"
            />

            {/* Gold datum rule leads into the brand face. The rule scales with
                the breakpoint, so the indent reads as intentional at any width
                instead of pushing the line off the right edge. */}
            <div className="mt-2 flex items-center gap-3 sm:mt-3 sm:gap-5">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={ready ? { scaleX: 1 } : {}}
                transition={{
                  duration: 1,
                  delay: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="via-gold-400 to-gold-500 h-px w-10 shrink-0 origin-left bg-gradient-to-r from-transparent sm:w-24 md:w-40 lg:w-56"
              />

              <RevealText
                as="span"
                lines={["What Moves"]}
                onView={false}
                play={ready}
                delay={0.34}
                stagger={0.05}
                className="text-brand text-chrome block text-[clamp(1.85rem,8.8vw,6rem)]"
              />

              <motion.span
                initial={{ opacity: 0, rotate: -90 }}
                animate={ready ? { opacity: 1, rotate: 0 } : {}}
                transition={{
                  duration: 1,
                  delay: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="hidden shrink-0 md:block"
              >
                <Cog
                  className="h-7 w-7 animate-[spin_16s_linear_infinite] lg:h-10 lg:w-10"
                  teeth={12}
                  gold
                />
              </motion.span>
            </div>

            <motion.p
              {...fade(0.62)}
              className="text-steel-400 mt-5 max-w-[34ch] text-sm leading-relaxed sm:mt-7 sm:max-w-[44ch] sm:text-base"
            >
              {site.tagline} {site.description}
            </motion.p>

            {/* "The 'OG' Department" tag. Absolute at every width so it takes
                no space; small enough to sit in the gap right of "We Build". */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                duration: 1.1,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pointer-events-none absolute top-0 right-0 w-[clamp(4.5rem,12vw,10rem)] sm:top-2"
            >
              <Image
                src="/og-department.webp"
                alt="The 'OG' Department"
                width={1400}
                height={809}
                sizes="(min-width: 1024px) 160px, 120px"
                priority
                className="h-auto w-full animate-[float-drift_7s_ease-in-out_infinite] drop-shadow-[0_8px_18px_rgba(0,0,0,0.6)]"
              />
            </motion.div>
          </div>

          {/* ---------- spec table ---------- */}
          <motion.dl
            {...fade(0.72)}
            className="border-line mt-10 grid max-w-3xl grid-cols-2 border-t sm:mt-14 sm:grid-cols-4"
          >
            {hero.meta.map((m, i) => (
              <div
                key={m.k}
                className={`border-line py-4 sm:py-5 ${
                  i % 2 === 1 ? "border-l pl-4" : ""
                } ${i >= 2 ? "border-t" : ""} sm:border-t-0 sm:border-l sm:pl-5 sm:first:border-l-0 sm:first:pl-0`}
              >
                <dt className="text-ink-faint text-[9px] font-medium tracking-[0.2em] uppercase">
                  {m.k}
                </dt>
                <dd className="text-display text-chrome mt-2 text-2xl sm:text-3xl">
                  {m.v}
                </dd>
              </div>
            ))}
          </motion.dl>

          {/* ---------- actions ----------
              Unequal on purpose: one solid target, one quiet link. */}
          <motion.div
            {...fade(0.84)}
            className="mt-9 flex flex-col items-start gap-5 sm:mt-11 sm:flex-row sm:items-center sm:gap-8"
          >
            <MagneticButton
              href={hero.primary.href}
              strength={0.18}
              labelClassName="w-full"
              className="btn-gold group w-full rounded-full py-1.5 pr-1.5 pl-6 transition-shadow duration-500 hover:shadow-[0_0_60px_-10px_rgba(217,175,78,0.55)] sm:w-auto"
            >
              <span className="flex w-full items-center justify-between gap-4">
                <span className="text-sm font-semibold whitespace-nowrap">
                  {hero.primary.label}
                </span>
                <span className="text-gold-200 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-xs transition-transform duration-500 group-hover:rotate-45">
                  ↗
                </span>
              </span>
            </MagneticButton>

            <a
              href={hero.secondary.href}
              className="text-ink hover:text-gold-200 group inline-flex items-center gap-2.5 text-sm font-medium transition-colors duration-300"
            >
              <span className="relative">
                {hero.secondary.label}
                <span className="bg-gold-400 absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </span>
              <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      <Section tone="steel">
        <Statement />
      </Section>

      {/* The assembly holds the viewport while scroll drives it apart. */}
      <StickyStage length={2.4} className="z-0 -mt-[10svh] sm:mt-0">
        <MechanismPlate />
      </StickyStage>

      {/* ---------- velocity-reactive ticker ---------- */}
      <div className="border-line relative z-10 border-y py-4 sm:py-5">
        <Marquee items={hero.ticker} speed={55} />
      </div>
    </div>
  );
}
