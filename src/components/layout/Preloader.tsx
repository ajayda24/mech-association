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
const COUNT_MS = 1600;

/**
 * Crown entrance, in seconds, relative to the moment the lockup starts playing.
 *
 * These live up here next to the other timings on purpose. The counter runs
 * from MOUNT while the lockup runs from FONTS-READY, which are two different
 * clocks — so a crown tuned against the counter gets cut off mid-descent on any
 * load where the font resolves late. WORDMARK_MIN_MS below is derived from
 * these numbers rather than written by hand, which is what keeps the doors from
 * opening on a crown still in the air.
 */
const CROWN_IN = { delay: 0.2, duration: 0.7 } as const;

/** The instant the crown touches the R — the overshoot keyframe. */
const CROWN_CONTACT_S = CROWN_IN.delay + CROWN_IN.duration * 0.62;

/**
 * Floor on how long the wordmark gets after its font lands: long enough for the
 * crown to land and be seen, plus a beat to read it. Normally the counter sweep
 * is the binding constraint and this never applies.
 */
const WORDMARK_MIN_MS = (CROWN_IN.delay + CROWN_IN.duration) * 1000 + 320;

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
 * The crown and the wordmark are now SEPARATE layers, because separate source
 * art was supplied for each. The previous build could not do this: the only
 * asset was a flat composite, and lifting the crown out of it left a smear
 * across the R underneath that no inpainting hid, so the whole lockup had to
 * animate as one object. With real cutouts the crown can fly.
 *
 * The two files are not registered to each other — each is trimmed to its own
 * bounding box — so the rest pose is expressed as percentages of the WORDMARK
 * box, which is the element both are positioned inside. Percentages rather
 * than pixels means the assembly holds at every width without a second set of
 * numbers for mobile.
 */

/** Crown rest pose, as percentages of the wordmark box it caps. */
const CROWN = { left: -5, top: -35, width: 42, angle: -24 } as const;

function Lockup({ play }: { play: boolean }) {
  const reduce = useReducedMotion();

  return (
    /*
     * The top margin is the crown's headroom. It reaches roughly 60% of the
     * wordmark's height ABOVE the wordmark, which without this runs straight
     * into the department label sitting above the lockup.
     */
    <div className="relative mt-[4.5rem] w-[86vw] sm:mt-24 md:w-[32rem]">
      {/* warm pool behind the metal, matching the render's own bloom */}
      <span
        aria-hidden
        className="glow-gold absolute -inset-x-10 -inset-y-6 opacity-55"
      />

      {/*
       * This box IS the wordmark's box, and it is what the crown is positioned
       * against. Sizing lives here rather than on the image so that the crown's
       * percentages have a stable reference.
       */}
      <div className="relative mx-auto w-full max-w-60 select-none sm:max-w-72">
        <motion.div
          initial={{ opacity: 0, scale: 1.04, y: 12 }}
          animate={play ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            /*
             * Trimmed to its own content and re-encoded: 164KB from a 1.7MB
             * PNG. This is the first byte a visitor waits on, so shipping the
             * raw PNG would make the loading screen the very thing it exists
             * to hide. width/height are the real post-trim intrinsics, so the
             * box Next reserves matches the art and nothing shifts on load.
             */
            src="/wordmark-v1.webp"
            alt="Royal Mech"
            width={1441}
            height={658}
            priority
            sizes="288px"
            className="h-auto w-full"
          />
        </motion.div>

        {/*
         * The crown falls from above the panel, swings past its resting angle
         * and settles onto the R — the overshoot in the keyframes is what
         * gives it weight, rather than gliding into place.
         */}
        <motion.div
          aria-hidden
          className="absolute"
          style={{
            left: `${CROWN.left}%`,
            top: `${CROWN.top}%`,
            width: `${CROWN.width}%`,
            transformOrigin: "52% 88%",
          }}
          initial={
            reduce
              ? { opacity: 0, rotate: CROWN.angle }
              : { opacity: 0, y: "-320%", rotate: -62, scale: 1.1 }
          }
          animate={
            play
              ? reduce
                ? { opacity: 1, rotate: CROWN.angle }
                : {
                    opacity: [0, 1, 1, 1],
                    y: ["-320%", "6%", "-2%", "0%"],
                    rotate: [-62, -17, -27, CROWN.angle],
                    scale: [1.1, 1, 1.01, 1],
                  }
              : {}
          }
          transition={
            reduce
              ? { duration: 0.4, delay: CROWN_IN.delay }
              : {
                  duration: CROWN_IN.duration,
                  delay: CROWN_IN.delay,
                  times: [0, 0.62, 0.82, 1],
                  ease: [0.3, 0.9, 0.3, 1],
                }
          }
        >
          <Image
            src="/crown-v1.webp"
            alt=""
            width={1442}
            height={946}
            priority
            sizes="130px"
            className="h-auto max-w-16 sm:max-w-20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
          />
        </motion.div>

        {/* gold bloom at the moment of contact */}
        {!reduce && (
          <motion.span
            aria-hidden
            className="glow-gold pointer-events-none absolute"
            style={{
              left: `${CROWN.left - 6}%`,
              top: `${CROWN.top + 20}%`,
              width: `${CROWN.width + 12}%`,
              aspectRatio: "1",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={play ? { opacity: [0, 0.75, 0], scale: [0.5, 1.25, 1.5] } : {}}
            transition={{
              duration: 0.7,
              delay: CROWN_CONTACT_S,
              ease: "easeOut",
            }}
          />
        )}
      </div>
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
