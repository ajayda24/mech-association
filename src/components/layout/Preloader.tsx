"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ScrollTrigger } from "@/lib/gsap";
import { AppReadyContext } from "@/components/providers/AppReady";
import { site } from "@/content/site";

/**
 * How long the counter takes to sweep 0 -> 100, and therefore how long the
 * screen is up. One continuous linear tween: the earlier version climbed to 92
 * and held there waiting on assets, which made the number visibly stall and
 * then jump.
 */
const COUNT_MS = 2600;

/**
 * Floor on how long the wordmark gets after its font lands. Normally the sweep
 * above is the binding constraint; this only matters if the font is slow, so
 * the reveal is never cut off mid-way.
 */
const WORDMARK_MIN_MS = 750;

/** Shop-floor flavour for the status line, stepped as the bar fills. */
const STATUS = ["Calibrating", "Aligning", "Torquing", "Ready"] as const;

type Phase = "loading" | "opening" | "done";

/**
 * Loading screen: the wordmark is machined in letter by letter over a pair of
 * counter-rotating index rings, a specular sheen sweeps across it, then the
 * panel splits and the halves draw apart like machine doors.
 *
 * TEXT RENDERING — the wordmark is deliberately a SOLID colour with an
 * overlaid blend-mode sheen, not `background-clip: text`. Clipped-gradient
 * text turns transparent and flickers whenever an ancestor carries a `filter`
 * or its own compositing layer, which is exactly what an animated overlay
 * does. The sheen gets the metallic look without that fragility.
 *
 * Gated on `document.fonts.ready` as well as a minimum duration: the site is
 * set in General Sans from a CDN, and without waiting the page would appear in
 * a fallback face and visibly reflow a moment later.
 */
export function Preloader({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  /**
   * The wordmark is set in Clash Display, loaded from a CDN. Holding the
   * reveal until it lands avoids animating each letter in a fallback face and
   * then swapping faces mid-animation.
   */
  const [fontsReady, setFontsReady] = useState(false);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Reduced motion takes the same path with every duration collapsed to
    // zero, so there is one flow to reason about.
    const instant = reduce === true;

    // Browsers restore the previous scroll position on reload, which would
    // put us mid-page behind the loading screen.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";

    const value = { v: 0 };
    const write = () => {
      const n = Math.round(value.v);
      if (pctRef.current) {
        pctRef.current.textContent = String(n).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${n / 100})`;
      if (statusRef.current) {
        const label = STATUS[Math.min(STATUS.length - 1, Math.floor(n / 26))];
        if (statusRef.current.textContent !== label) {
          statusRef.current.textContent = label;
        }
      }
    };

    let cancelled = false;

    /*
     * One continuous linear sweep, driven by requestAnimationFrame against a
     * wall-clock start time.
     *
     * Deriving progress from elapsed time rather than from accumulated frames
     * means the bar always takes COUNT_MS regardless of frame rate, and it
     * keeps the loading screen independent of gsap.ticker, which the
     * smooth-scroll provider also owns and reconfigures.
     */
    let raf = 0;
    const counted = new Promise<void>((resolve) => {
      if (instant) {
        value.v = 100;
        write();
        resolve();
        return;
      }
      const startedAt = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - startedAt) / COUNT_MS);
        value.v = t * 100;
        write();
        if (t < 1) raf = requestAnimationFrame(frame);
        else resolve();
      };
      raf = requestAnimationFrame(frame);
    });

    // Reveal the wordmark as soon as its face is available.
    const revealed = (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      setFontsReady(true);
      return new Promise((r) => setTimeout(r, instant ? 0 : WORDMARK_MIN_MS));
    });

    Promise.all([counted, revealed]).then(() => {
      if (cancelled) return;
      setPhase("opening");
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, [reduce]);

  // Hand scrolling back as soon as the doors start moving...
  useEffect(() => {
    if (phase === "loading") return;
    document.documentElement.style.overflow = "";
  }, [phase]);

  /**
   * Re-measure WHILE the panel still covers the page.
   *
   * ScrollTrigger.refresh() walks every trigger and forces a full layout. Doing
   * that as the doors open — or just after, as the hero's own entrance starts —
   * put a long frame exactly at the hand-off, which is the lag you see. The
   * page behind is already laid out by the time the fonts resolve, so the
   * measurement is free there and done with well before anything moves.
   */
  useEffect(() => {
    if (!fontsReady) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [fontsReady]);

  const opening = phase === "opening";
  const door = { duration: 0.9, ease: [0.83, 0, 0.17, 1] as const };

  return (
    <AppReadyContext.Provider value={phase !== "loading"}>
      {children}

      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="preloader"
            className={`fixed inset-0 z-[100] ${
              opening ? "pointer-events-none" : "pointer-events-auto"
            }`}
            aria-hidden={opening}
            role="status"
            aria-live="polite"
          >
            {/* ---------- doors ---------- */}
            {/*
              Two halves carrying one continuous gradient: each paints a
              200%-tall background anchored to its own edge, so the seam is
              invisible until they part.
            */}
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[linear-gradient(180deg,#22262d_0%,#0a0c0f_100%)] bg-[length:100%_200%] bg-top"
              style={{ willChange: "transform" }}
              animate={opening ? { y: "-101%" } : { y: "0%" }}
              transition={door}
              onAnimationComplete={() => {
                if (opening) setPhase("done");
              }}
            >
              <Grain anchor="top" />
            </motion.div>
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[linear-gradient(180deg,#22262d_0%,#0a0c0f_100%)] bg-[length:100%_200%] bg-bottom"
              style={{ willChange: "transform" }}
              animate={opening ? { y: "101%" } : { y: "0%" }}
              transition={door}
            >
              <Grain anchor="bottom" />
            </motion.div>

            {/* gold parting line at the seam */}
            <motion.span
              className="via-gold-200 absolute inset-x-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                opening
                  ? { scaleX: 1, opacity: [0.9, 1, 0] }
                  : { scaleX: 0.25, opacity: 0 }
              }
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            />

            {/* ---------- content ----------
                Only opacity and transform animate here. No `filter`: a filter
                on this wrapper would give every descendant its own rendering
                context and break the sheen's blend mode. */}
            <motion.div
              className="absolute inset-0 grid place-items-center px-6"
              // Pushes toward the viewer as the doors part, so the hand-off
              // reads as moving through the panel rather than it vanishing.
              animate={
                opening
                  ? { opacity: 0, scale: 1.12, y: -18 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            >
              <div className="relative flex w-full max-w-lg flex-col items-center">
                <IndexRings exiting={opening} />

                {/* The monogram leads, then the wordmark it belongs to. */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.86 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mb-6 sm:mb-7"
                >
                  <span
                    aria-hidden
                    className="glow-gold absolute -inset-8 opacity-70"
                  />
                  <motion.div
                    animate={reduce ? undefined : { y: [-3, 3, -3] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative h-36 w-36 sm:h-48 sm:w-48"
                  >
                    <Image
                      src="/logo/mech-logo.png"
                      alt=""
                      fill
                      sizes="212px"
                      priority
                      className="object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
                    />
                  </motion.div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="text-gold-300 relative mb-1 text-[9px] font-medium tracking-[0.42em] uppercase sm:text-[10px]"
                >
                  {site.sub}
                </motion.p>

                <Lockup play={fontsReady} />

                {/* ---------- progress ---------- */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="relative mt-20 w-full sm:mt-24"
                >
                  <div className="mb-3 flex items-baseline justify-between">
                    <span
                      ref={statusRef}
                      className="text-steel-400 text-[10px] tracking-[0.28em] uppercase"
                    >
                      {STATUS[0]}
                    </span>
                    <span className="font-display text-steel-300 text-xs tracking-[0.1em]">
                      <span ref={pctRef}>000</span>
                      <span className="text-ink-faint ml-0.5">%</span>
                    </span>
                  </div>

                  <span className="bg-line-strong relative block h-px w-full overflow-hidden">
                    <span
                      ref={barRef}
                      className="from-gold-600 via-gold-300 to-gold-100 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r"
                    />
                  </span>

                  {/* machinist tick marks under the track */}
                  <span className="mt-2 flex justify-between" aria-hidden>
                    {Array.from({ length: 21 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-px ${
                          i % 5 === 0
                            ? "bg-steel-600 h-1.5"
                            : "bg-steel-800 h-1"
                        }`}
                      />
                    ))}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppReadyContext.Provider>
  );
}

/**
 * Extruded-metal wordmark.
 *
 * The 3D comes from a stacked `text-shadow` ramp rather than a 3D typeface or
 * clipped gradient: each layer steps 1px further down in a darkening steel
 * ramp, ending on a warm gold edge, which reads as a solid billet the letters
 * are cut from. Deliberately NOT `background-clip: text` — that goes
 * transparent the moment an ancestor gets a filter or its own compositing
 * layer, which is what broke this wordmark earlier. A text-shadow ramp is
 * immune to all of that and inherits cleanly to every animated letter.
 */
/**
 * Two metals, following the reference: ROYAL struck in gold, MECH in steel.
 *
 * Both are hard-edged offset stacks — no blur in the body of the extrusion, so
 * the faces stay crisp. Only the last two layers are soft, and they are kept
 * tight so they read as contact shadow rather than haze.
 */
/**
 * ── The lockup ───────────────────────────────────────────────────────────────
 *
 * The supplied render (`/preloader-reference.png`), used directly so the
 * artwork is exactly the reference rather than an approximation of it.
 *
 * The crown is NOT a separate layer. It overlaps the R in the render, and
 * lifting it out leaves a smear across the letter underneath that no amount of
 * inpainting hides — so the whole lockup animates as one object instead.
 *
 * The asset is the background-removed export, trimmed to its own content and
 * carrying a real alpha channel. That replaces the screen-blend-plus-mask
 * workaround the opaque version needed: with true transparency the metal sits
 * on the panel directly, and the rings behind it show through the gaps in the
 * letterforms rather than through an approximation of them.
 */
function Lockup({ play }: { play: boolean }) {
  return (
    <div className="relative w-[86vw] md:w-[32rem]">
      {/* warm pool behind the metal, matching the render's own bloom */}
      <span
        aria-hidden
        className="glow-gold absolute -inset-x-10 -inset-y-6 opacity-55"
      />

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 1.06, y: 14 }}
        animate={play ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          /*
           * 1400px WebP with alpha, trimmed to the artwork: 218KB against the
           * 2.1MB source. This is the first byte a visitor waits on, so
           * shipping the full-size PNG would make the loading screen the very
           * thing it exists to hide.
           *
           * The `-alpha` suffix is deliberate. Next's image optimiser caches
           * by URL, so re-exporting this file under its previous name kept
           * serving the earlier opaque build and the transparency never
           * appeared. A new filename is also what prevents a CDN doing the
           * same thing in production.
           */
          src="/preloader-lockup-alpha.webp"
          alt="Royal Mech"
          width={1400}
          height={919}
          priority
          sizes="(max-width: 768px) 86vw, 32rem"
          className="h-auto w-full select-none"
        />
      </motion.div>
    </div>
  );
}

function IndexRings({ exiting }: { exiting: boolean }) {
  const reduce = useReducedMotion();
  const spin = (duration: number, dir: 1 | -1) =>
    reduce || exiting
      ? undefined
      : {
          animate: { rotate: 360 * dir },
          transition: { duration, repeat: Infinity, ease: "linear" as const },
        };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 h-[clamp(15rem,82vw,26rem)] w-[clamp(15rem,82vw,26rem)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="glow-gold absolute inset-0 opacity-60" />

      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0"
        {...spin(46, 1)}
      >
        <circle
          r="92"
          fill="none"
          stroke="#4a515a"
          strokeWidth="0.6"
          strokeDasharray="2 6"
        />
        {Array.from({ length: 48 }).map((_, i) => (
          <rect
            key={i}
            x={-0.35}
            y={-84}
            width={0.7}
            height={i % 4 === 0 ? 7 : 4}
            fill="#d9af4e"
            opacity={i % 4 === 0 ? 0.55 : 0.22}
            transform={`rotate(${7.5 * i})`}
          />
        ))}
      </motion.svg>

      <motion.svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0"
        {...spin(30, -1)}
      >
        <circle
          r="66"
          fill="none"
          stroke="#5f666e"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <circle
            key={i}
            cx={0}
            cy={-66}
            r={1.8}
            fill="#d9af4e"
            opacity="0.7"
            transform={`rotate(${120 * i})`}
          />
        ))}
      </motion.svg>
    </div>
  );
}

/**
 * Fine machinist grid, masked to a soft pool behind the lockup.
 *
 * Sized to twice its door's height and anchored to the outer edge, so the grid
 * AND its radial mask stay continuous across the seam — each half renders its
 * own window onto the same full-viewport pattern.
 */
function Grain({ anchor }: { anchor: "top" | "bottom" }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-0 h-[200%] opacity-[0.22] ${
        anchor === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(to right, #4a515a 1px, transparent 1px), linear-gradient(to bottom, #4a515a 1px, transparent 1px)",
        backgroundSize: "clamp(34px, 7vw, 58px) clamp(34px, 7vw, 58px)",
        maskImage:
          "radial-gradient(60% 80% at 50% 50%, #000 10%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(60% 80% at 50% 50%, #000 10%, transparent 80%)",
      }}
    />
  );
}
