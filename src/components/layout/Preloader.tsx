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

/**
 * Stacked on two lines. Cinzel is a wide capitals face — set on one line,
 * "ROYAL MECH" either overflows a phone or has to shrink to the point that the
 * carved detail in the letterforms is lost. Stacked, it reads like an
 * inscription, which is the whole reason for choosing this face.
 */
const WORDMARK_LINES = ["Royal", "Mech"] as const;

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
   * ...but only re-measure once they have finished.
   *
   * ScrollTrigger.refresh() walks every trigger on the page and forces layout.
   * Running it while two full-viewport panels are mid-animation was dropping
   * frames on mobile — that was the hitch on the hand-off to the hero. Nothing
   * can be scrolled during the ~1s door animation anyway, so the measurement
   * loses nothing by waiting.
   */
  useEffect(() => {
    if (phase !== "done") return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [phase]);

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

                <Wordmark play={fontsReady} />

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
const GOLD_EXTRUSION = [
  "0 -2px 0 rgba(255,250,228,0.9)",
  "0 -1px 0 #ffe9a3",
  "0 1px 0 #e8c04d",
  "0 2px 0 #d3a93c",
  "0 3px 0 #bf9432",
  "0 4px 0 #a97f28",
  "0 5px 0 #926a1f",
  "0 6px 0 #7b5717",
  "0 7px 0 #654511",
  "0 8px 0 #4f350c",
  "0 9px 0 #3a2607",
  "0 10px 12px rgba(0,0,0,0.45)",
  "0 18px 30px rgba(0,0,0,0.45)",
  // warm rim light spilling off the metal
  "0 0 26px rgba(247,201,86,0.32)",
].join(", ");

const STEEL_EXTRUSION = [
  "0 -2px 0 rgba(255,255,255,0.85)",
  "0 -1px 0 #ffffff",
  "0 1px 0 #cfd4da",
  "0 2px 0 #b6bcc4",
  "0 3px 0 #9ea5ad",
  "0 4px 0 #868d96",
  "0 5px 0 #6f767f",
  "0 6px 0 #5a616a",
  "0 7px 0 #474d55",
  "0 8px 0 #363b42",
  "0 9px 0 #262a30",
  "0 10px 12px rgba(0,0,0,0.4)",
  "0 18px 30px rgba(0,0,0,0.42)",
  // the reference throws gold light onto the steel line too
  "0 0 26px rgba(247,201,86,0.22)",
].join(", ");

/** Face colour and extrusion per line. */
const LINE_STYLE = {
  Royal: { color: "#f6cb52", shadow: GOLD_EXTRUSION, offset: "" },
  // Negative top margin so the steel line tucks under the gold one, the way
  // the two words interlock in the reference rather than sitting as a stack.
  Mech: { color: "#eef1f5", shadow: STEEL_EXTRUSION, offset: "-mt-[0.12em]" },
} as const;

function Wordmark({ play }: { play: boolean }) {
  // Runs across both lines so the stagger reads as one continuous cut.
  let index = 0;

  const line = (word: (typeof WORDMARK_LINES)[number], mirrored: boolean) => (
    // pl compensates for the trailing letter-space, which would otherwise
    // push each line half a tracking-unit left of centre.
    <span
      key={word}
      className={`flex pl-[0.08em] ${LINE_STYLE[word].offset}`}
      style={{
        color: LINE_STYLE[word].color,
        textShadow: LINE_STYLE[word].shadow,
      }}
    >
      {[...word].map((ch, ci) => {
        const i = mirrored ? -1 : index++;
        const crowned = !mirrored && word === "Royal" && ci === 0;
        return (
          <span
            key={ci}
            className={crowned ? "relative inline-block" : "inline-block"}
          >
            {/*
              Two nested spans for the crowned letter: the OUTER one is the
              positioning context and must not clip, the INNER one is the
              reveal mask. Putting the crown inside the mask would clip it;
              anchoring it here means it centres on the actual R rather than
              on a hand-measured offset.
            */}
            <span className="inline-block [clip-path:inset(-0.5em_-0.08em_0_-0.08em)] pb-[0.1em]">
              {mirrored ? (
                <span className="inline-block">{ch}</span>
              ) : (
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%", rotate: 5, opacity: 0 }}
                  animate={play ? { y: "0%", rotate: 0, opacity: 1 } : {}}
                  transition={{
                    duration: 0.62,
                    delay: i * 0.032,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {ch}
                </motion.span>
              )}
            </span>
            {crowned && <Crown play={play} />}
          </span>
        );
      })}
    </span>
  );

  return (
    <div className="relative">
      {/* warm pool under the lockup, so the extrusion has something to sit on */}
      <span
        aria-hidden
        className="glow-gold absolute -inset-x-10 -inset-y-6 opacity-70"
      />

      <h1
        // pt makes room for the crown, which overhangs the top of the R.
        className="text-brand relative flex flex-col items-center pt-[0.36em] text-center text-[clamp(2.5rem,15vw,5.5rem)]"
      >
        {WORDMARK_LINES.map((word) => line(word, false))}
      </h1>

      {/*
        Floor reflection. A mirrored copy faded out downwards, which is what
        gives the lockup a surface to stand on rather than floating in space.
        Static — the letters have already landed by the time it fades in.
      */}
      <motion.div
        aria-hidden
        className="text-brand pointer-events-none absolute inset-x-0 top-full flex flex-col items-center text-center text-[clamp(2.5rem,15vw,5.5rem)]"
        style={{
          /*
           * Mirrored in place. Flipping about the TOP edge maps the content
           * ABOVE the element, which laid the reflection back over the
           * wordmark; about the centre it stays inside its own box, directly
           * under the lockup where a reflection belongs.
           */
          transform: "scaleY(-1)",
          transformOrigin: "center",
          /*
           * The mask is applied before the flip, so `to top` fades from the
           * element's bottom — which the flip puts nearest the letters.
           */
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 42%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 42%)",
        }}
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 0.22 } : {}}
        transition={{ duration: 0.9, delay: 0.95 }}
      >
        {WORDMARK_LINES.map((word) => line(word, true))}
      </motion.div>

      {/* specular sweep — if restored, Wordmark needs its `exiting` prop
          back so the sweep stops before the doors part. */}
      {/* <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 mix-blend-overlay"
        style={{
          background:
            "linear-gradient(100deg, transparent, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.95) 55%, transparent)",
        }}
        initial={{ x: "-140%" }}
        animate={play && !exiting ? { x: ["-140%", "340%"] } : {}}
        transition={{
          duration: 2.4,
          delay: 0.5,
          repeat: Infinity,
          repeatDelay: 0.6,
          ease: "easeInOut",
        }}
      /> */}
    </div>
  );
}

/**
 * Crown above the R — built as an actual ring in 3D space.
 *
 * The previous version extruded a flat silhouette along Z. That gives it
 * thickness, but a crown is barely thicker than a coin relative to its width,
 * so turning it still read as a 2D card flipping over.
 *
 * This one is a cylinder. The band is BAND_SEGMENTS quads arranged radially —
 * each rotated to its own angle and pushed out to the radius — and the points
 * sit on that same circle. So the far side genuinely travels behind the near
 * side as it turns, and at every angle you are looking at a round object.
 *
 * Shading is baked per segment from its angle, brightest at the front, so the
 * highlights sweep around the band as it rotates the way they do on chrome.
 *
 * Still no WebGL: this is a loading screen, and pulling in a 3D library to
 * draw one crown would add weight to the very thing meant to hide waiting.
 */
const BAND_SEGMENTS = 22;
/**
 * Ten points, alternating tall and short. The alternation is what makes a ring
 * of spikes read as a CROWN rather than a cog or a gear — real crowns
 * alternate fleurs with pearls, and the eye recognises that rhythm long before
 * it reads any detail.
 */
const CROWN_POINTS = 10;
const CROWN_R = 0.25; // em
const BAND_H = 0.11; // em
const POINT_TALL = 0.25; // em
const POINT_SHORT = 0.155; // em
const BAND_Y = 0.145; // em, below centre
const RIM_T = 0.009; // em
/** Points lean outward from the axis, the way a real crown flares. */
const FLARE_DEG = 13;
/**
 * A spike: straight shoulders that taper to a point. A plain triangle reads as
 * a sawtooth; the shoulders are what make it a crown point.
 */
const POINT_CLIP = "polygon(50% 0%, 100% 52%, 100% 100%, 0% 100%, 0% 52%)";

/**
 * Polished gold. `t` is 1 facing the viewer, 0 facing away; `mul` shades
 * within a single segment so each quad has its own vertical falloff.
 *
 * Channel ratios are taken from the site's gold-400 (#d9af4e) so the crown is
 * the same metal as every other accent. Gold desaturates toward white as it
 * approaches a specular highlight rather than simply getting brighter — a flat
 * scale of one hue reads as plastic — so a whitening term is folded in at the
 * top of the range.
 */
function gold(t: number, mul: number) {
  const base = 48 + 178 * Math.pow(t, 1.15);
  const v = Math.max(14, Math.min(255, base * mul));
  const white = Math.max(0, (v - 198) / 57) * 40;
  const ch = (x: number) => Math.round(Math.min(255, x));
  return `rgb(${ch(v + white * 0.1)},${ch(v * 0.806 + white)},${ch(
    v * 0.359 + white * 1.6,
  )})`;
}

/** Rounds a computed em value, so binary float noise stays out of the DOM. */
function em(n: number) {
  return `${Math.round(n * 10000) / 10000}em`;
}

function facing(angleDeg: number) {
  return (Math.cos((angleDeg * Math.PI) / 180) + 1) / 2;
}

function metalFace(angleDeg: number) {
  const t = facing(angleDeg);
  return `linear-gradient(180deg, ${gold(t, 1.35)} 0%, ${gold(t, 1.0)} 42%, ${gold(
    t,
    0.62,
  )} 100%)`;
}

/**
 * Seconds before the crown drops. The last letter lands at roughly 0.29s of
 * stagger plus 0.62s of travel, so this starts as the wordmark settles.
 */
const CROWN_DELAY = 0.85;

/** Resting tilt, in degrees — worn at an angle rather than set square. */
const CROWN_TILT = -11;

function Crown({ play }: { play: boolean }) {
  const segW = (2 * Math.PI * CROWN_R) / BAND_SEGMENTS + 0.012;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
      /*
       * Seated ON the letter rather than hovering above it: the band is pulled
       * down past the top of the box so it overlaps the R's shoulder, and the
       * width is tuned just inside the glyph so it reads as a fitted cap. The
       * drop shadow is what sells it as resting on the letter.
       */
      style={{
        width: "0.66em",
        height: "0.46em",
        bottom: "calc(100% - 0.25em)",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.55))",
      }}
    >
      <motion.div
        className="h-full w-full"
        // Perspective in em keeps foreshortening consistent at every type size.
        style={{ perspective: "2.6em" }}
        /*
         * Drops in from above and settles onto the letter with some weight,
         * arriving once the wordmark has finished assembling. The spring's
         * overshoot is what makes it read as landing rather than fading in.
         */
        initial={{ opacity: 0, y: "-260%", rotate: -32, scale: 1.2 }}
        animate={
          play ? { opacity: 1, y: "0%", rotate: CROWN_TILT, scale: 1 } : {}
        }
        transition={{
          type: "spring",
          stiffness: 290,
          damping: 16,
          mass: 0.8,
          delay: CROWN_DELAY,
        }}
      >
        {/* Fixed tilt so we look slightly down onto the ring and read its
            roundness as a band rather than a flat arc. */}
        <div
          className="h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(-18deg)",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ---- band: a cylinder of flat quads ---- */}
            {Array.from({ length: BAND_SEGMENTS }).map((_, i) => {
              const a = (360 / BAND_SEGMENTS) * i;
              return (
                <span
                  key={`b${i}`}
                  className="absolute top-1/2 left-1/2 block"
                  style={{
                    width: em(segW),
                    height: em(BAND_H),
                    marginLeft: em(-segW / 2),
                    marginTop: em(-BAND_H / 2),
                    background: metalFace(a),
                    transform: `translateY(${em(BAND_Y)}) rotateY(${a}deg) translateZ(${em(CROWN_R)})`,
                  }}
                />
              );
            })}

            {/* ---- points: alternating tall and short, flared outward ---- */}
            {Array.from({ length: CROWN_POINTS }).map((_, i) => {
              const a = (360 / CROWN_POINTS) * i;
              const tall = i % 2 === 0;
              const h = tall ? POINT_TALL : POINT_SHORT;
              const w = tall ? 0.108 : 0.083;
              const y = BAND_Y - BAND_H / 2 - h / 2 + 0.015;
              return (
                <span
                  key={`p${i}`}
                  className="absolute top-1/2 left-1/2 block"
                  style={{
                    width: em(w),
                    height: em(h),
                    marginLeft: em(-w / 2),
                    marginTop: em(-h / 2),
                    background: metalFace(a),
                    clipPath: POINT_CLIP,
                    transform: `translateY(${em(y)}) rotateY(${a}deg) translateZ(${em(CROWN_R)}) rotateX(${-FLARE_DEG}deg)`,
                  }}
                />
              );
            })}

            {/* ---- a pearl on every point tip ---- */}
            {Array.from({ length: CROWN_POINTS }).map((_, i) => {
              const a = (360 / CROWN_POINTS) * i;
              const tall = i % 2 === 0;
              const h = tall ? POINT_TALL : POINT_SHORT;
              const d = tall ? 0.045 : 0.033;
              const y = BAND_Y - BAND_H / 2 - h - d * 0.18;
              return (
                <span
                  key={`j${i}`}
                  className="absolute top-1/2 left-1/2 block rounded-full"
                  style={{
                    width: em(d),
                    height: em(d),
                    marginLeft: em(-d / 2),
                    marginTop: em(-d / 2),
                    background: `radial-gradient(circle at 34% 28%, #ffffff, ${gold(
                      facing(a),
                      0.8,
                    )})`,
                    transform: `translateY(${em(y)}) rotateY(${a}deg) translateZ(${em(CROWN_R)})`,
                  }}
                />
              );
            })}

            {/* ---- jewels set into the band, under the tall points ---- */}
            {Array.from({ length: CROWN_POINTS / 2 }).map((_, i) => {
              const a = (360 / (CROWN_POINTS / 2)) * i;
              const d = 0.036;
              return (
                <span
                  key={`s${i}`}
                  className="absolute top-1/2 left-1/2 block rounded-full"
                  style={{
                    width: em(d),
                    height: em(d),
                    marginLeft: em(-d / 2),
                    marginTop: em(-d / 2),
                    background: `radial-gradient(circle at 36% 30%, #ffffff, ${gold(
                      facing(a),
                      0.7,
                    )})`,
                    transform: `translateY(${em(BAND_Y)}) rotateY(${a}deg) translateZ(${em(CROWN_R + 0.006)})`,
                  }}
                />
              );
            })}

            {/* ---- rims close the cylinder top and bottom ---- */}
            {[BAND_Y - BAND_H / 2, BAND_Y + BAND_H / 2].map((y, i) => (
              <span
                key={`r${i}`}
                className="absolute top-1/2 left-1/2 block rounded-full"
                style={{
                  width: em(CROWN_R * 2),
                  height: em(CROWN_R * 2),
                  marginLeft: em(-CROWN_R),
                  marginTop: em(-CROWN_R),
                  border: `${em(RIM_T)} solid ${gold(0.9, 1.15)}`,
                  transform: `translateY(${em(y)}) rotateX(90deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Two counter-rotating index rings sitting behind the wordmark. */
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
