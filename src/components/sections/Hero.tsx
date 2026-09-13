"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { Parallax } from "@/components/motion/Parallax";
import { Float } from "@/components/motion/Float";
import { Marquee } from "@/components/motion/Marquee";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { StickyStage } from "@/components/layout/StickyStage";
import { MechanismPlate } from "@/components/visuals/MechanismPlate";
import { Cog, HexBolt, Washer } from "@/components/visuals/Hardware";
import { hero } from "@/content/hero";

export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      /**
       * Copy recedes as the stage takes over the viewport.
       *
       * The trigger is anchored to the hero's TOP against the viewport top,
       * not to the copy's bottom. Anchoring to the bottom meant the start
       * point depended on how tall the copy happened to be: on a phone the
       * copy is short enough that its bottom already sits above 90% of the
       * viewport at load, so the fade-out was already past its start before
       * the page had been scrolled at all — the hero rendered pre-blurred.
       * "top top" is scroll position zero by definition, so progress can only
       * ever begin at 0.
       */
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          gsap.to(copy.current, {
            yPercent: -18,
            opacity: 0.25,
            // Blurring a full-width container every frame is expensive on
            // phones for an effect you barely register; desktop only.
            ...(desktop ? { filter: "blur(5px)" } : {}),
            ease: "none",
            scrollTrigger: {
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

  return (
    <div ref={root} className="relative">
      {/* ---------- copy ---------- */}
      <div
        ref={copy}
        className="shell-gutter relative z-10 pt-24 pb-9 text-center sm:pt-32 sm:pb-14 md:pt-40"
      >
        {/* Decoration is desktop-only: on a phone it crowds the headline and
            costs frames for something barely visible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
        >
          <Parallax y={-46} className="absolute top-[14%] left-[4%]">
            <Float amplitude={16} spin={10} duration={7} delay={0.4}>
              <Cog className="h-20 w-20 opacity-60" teeth={14} />
            </Float>
          </Parallax>
          <Parallax y={-74} className="absolute top-[8%] right-[7%]">
            <Float amplitude={22} spin={14} duration={5.5} delay={0.7}>
              <HexBolt className="h-14 w-14 opacity-75" gold />
            </Float>
          </Parallax>
          <Parallax y={-92} className="absolute top-[58%] right-[11%]">
            <Float amplitude={18} spin={8} duration={6.5} delay={0.55}>
              <Washer className="h-11 w-11 opacity-50" />
            </Float>
          </Parallax>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-gold-300 mx-auto mb-6 max-w-[34ch] text-[10px] font-medium tracking-[0.15em] uppercase sm:mb-7 sm:max-w-none sm:text-[11px] sm:tracking-[0.3em]"
        >
          {hero.eyebrow}
        </motion.p>

        <RevealText
          as="h1"
          lines={hero.headline}
          onView={false}
          delay={0.2}
          stagger={0.06}
          className="text-display text-chrome mx-auto max-w-[14ch] text-[clamp(2.5rem,12vw,6.5rem)]"
        />

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
          className="text-steel-400 mx-auto mt-5 max-w-[38ch] text-sm leading-relaxed text-balance sm:mt-7 sm:max-w-[46ch]"
        >
          {hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mx-auto mt-7 flex w-full max-w-[17rem] flex-col items-stretch gap-2.5 sm:mt-9 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        >
          <MagneticButton
            href={hero.primary.href}
            strength={0.18}
            className="from-gold-200 to-gold-500 hover:shadow-gold-500/35 rounded-full bg-gradient-to-b px-6 py-3 text-sm font-semibold text-black transition-shadow duration-500 hover:shadow-[0_0_50px_-8px] sm:px-7 sm:py-3.5"
          >
            {hero.primary.label}
          </MagneticButton>
          <MagneticButton
            href={hero.secondary.href}
            strength={0.14}
            className="border-line-strong text-ink hover:border-steel-500 hover:bg-surface rounded-full border px-6 py-3 text-sm font-medium transition-colors duration-300 sm:px-7 sm:py-3.5"
          >
            {hero.secondary.label}
          </MagneticButton>
        </motion.div>
      </div>

      {/*
        Pulled up under the hero on phones. The stage centres the gear in a
        full viewport height, which leaves ~170px of empty ground above it
        before you scroll; the plate's ground is masked transparent across
        exactly that band, so overlapping it costs nothing visually and closes
        the gap between the copy and the drawing.
      */}
      <StickyStage length={2.4} className="z-0 -mt-[14svh] sm:mt-0">
        <MechanismPlate />
        <ScrollHint />
      </StickyStage>

      {/* ---------- velocity-reactive ticker ---------- */}
      <div className="border-line relative z-10 border-y py-4 sm:py-5">
        <Marquee items={hero.ticker} speed={55} />
      </div>
    </div>
  );
}

/** Nudge so it reads as interactive rather than decorative. */
function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 1 }}
      className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2"
    >
      <span className="text-ink-faint text-[10px] tracking-[0.26em] uppercase">
        Scroll to disassemble
      </span>
      <motion.span
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        className="from-gold-400 block h-7 w-px bg-gradient-to-b to-transparent"
      />
    </motion.div>
  );
}
