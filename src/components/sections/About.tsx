"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { about } from "@/content/about";

const STEPS = about.steps.length;

/**
 * Held-in-place section: the heading stays put while the panel steps through
 * the three wings and the metrics re-count.
 *
 * Uses CSS `position: sticky` for the hold, not GSAP's `pin`. Pinning rebuilds
 * layout into a pin-spacer and re-measures on every resize — which mobile
 * browsers fire constantly as their toolbar slides in and out. ScrollTrigger
 * here only *reads* progress; it never moves the layout.
 */
export function About() {
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  /** Mirrors `step` so the scroll handler can compare without re-subscribing. */
  const stepRef = useRef(0);

  useGsapContext(
    () => {
      const st = gsap.timeline({
        scrollTrigger: {
          trigger: track.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const next = Math.min(
              STEPS - 1,
              Math.floor(self.progress * STEPS * 0.999),
            );
            // onUpdate fires every scroll frame; only touch React state on an
            // actual step change.
            if (next === stepRef.current) return;
            setDir(next > stepRef.current ? 1 : -1);
            stepRef.current = next;
            setStep(next);
          },
        },
      });
      return () => st.kill();
    },
    track,
    [],
  );

  const current = about.steps[step];

  return (
    <div
      ref={track}
      className="relative"
      style={{ height: `${STEPS * 95}svh` }}
    >
      <div className="shell-gutter sticky top-0 flex min-h-[100svh] flex-col justify-center py-24 sm:py-28">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mb-8 text-center sm:mb-12">
            <RevealText
              as="h2"
              lines={about.heading}
              className="text-display text-chrome text-[clamp(2rem,8vw,4.6rem)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-steel-400 mx-auto mt-4 max-w-[52ch] text-sm text-balance sm:mt-6 sm:text-base"
            >
              {about.intro}
            </motion.p>
          </div>

          {/* step rail — dots on phones, labelled on wider screens */}
          <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8 sm:gap-3">
            {about.steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`hidden text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-500 sm:inline ${
                    i === step ? "text-gold-300" : "text-ink-faint"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 sm:hidden ${
                    i === step ? "bg-gold-400" : "bg-line-strong"
                  }`}
                />
                {i < STEPS - 1 && (
                  <span className="bg-line-strong relative h-px w-6 overflow-hidden sm:w-16">
                    <motion.span
                      className="bg-gold-400 absolute inset-0 origin-left"
                      animate={{ scaleX: i < step ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.15fr_1fr]">
            {/* ---- swapping panel ---- */}
            <div className="surface-steel relative min-h-[280px] overflow-hidden p-6 sm:min-h-[340px] sm:p-9">
              <span className="text-ink-faint absolute top-5 right-6 text-[10px] tracking-[0.2em] sm:top-6 sm:right-7 sm:text-[11px]">
                0{step + 1} / 0{STEPS}
              </span>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={current.key}
                  custom={dir}
                  initial={{ opacity: 0, y: 30 * dir, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30 * dir, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="text-display text-ink pr-16 text-2xl sm:text-4xl">
                    {current.label}
                  </h3>
                  <p className="text-steel-400 mt-3 max-w-[46ch] text-sm leading-relaxed sm:mt-4 sm:text-base">
                    {current.blurb}
                  </p>
                  <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                    {current.bullets.map((b, i) => (
                      <motion.li
                        key={b}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.14 + i * 0.08,
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="text-steel-300 flex items-center gap-3 text-[13px] sm:text-sm"
                      >
                        <span className="bg-gold-400 h-1 w-1 shrink-0 rounded-full" />
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ---- metrics ---- */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-1">
              {current.metrics.map((m, i) => (
                <div
                  key={i}
                  className={`${
                    i === 0 ? "surface-gilt" : "surface-pitch"
                  } relative flex min-h-[120px] flex-col justify-between overflow-hidden p-5 sm:min-h-[158px] sm:p-7`}
                >
                  <span
                    className={`text-[10px] font-medium tracking-[0.16em] uppercase sm:text-[11px] sm:tracking-[0.18em] ${
                      i === 0 ? "text-black/60" : "text-steel-500"
                    }`}
                  >
                    {m.label}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${current.key}-${i}`}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -22 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className={`text-display mt-4 text-3xl sm:text-6xl ${
                        i === 0 ? "text-black" : "text-chrome"
                      }`}
                    >
                      {m.value.toLocaleString("en-IN")}
                      {m.suffix}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
