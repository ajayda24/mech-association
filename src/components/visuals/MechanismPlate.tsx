"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { LANDSCAPE, useMediaQuery } from "@/lib/useMediaQuery";
import {
  LANDSCAPE_PLATE,
  PORTRAIT_PLATE,
} from "@/components/visuals/plate-config";

/**
 * Hero visual: a gear assembly that pulls itself apart into an exploded
 * engineering view, scrubbed by scroll while the stage is stuck to the
 * viewport.
 *
 * FRAMING — the drawing must be fully contained at EVERY scroll position, in
 * both orientations. Two things guarantee that:
 *   1. Assembly and callouts live in one `[data-stage]` group that scales DOWN
 *      as the layers separate, so the exploded stack occupies the frame the
 *      assembled ring did.
 *   2. Portrait and landscape get genuinely different geometry — not one
 *      layout squeezed. Portrait has vertical room and little horizontal room,
 *      so it travels further and abbreviates labels; landscape is the reverse.
 *
 * The numbers live in `plate-config.ts` and are checked by
 * `npm run verify:plate`, which walks the full scroll range in both
 * orientations and fails if anything leaves the viewBox.
 *
 * TODO: swap for department photography or a 3D render when assets arrive.
 */
export function MechanismPlate() {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const landscape = useMediaQuery(LANDSCAPE);
  const cfg = landscape ? LANDSCAPE_PLATE : PORTRAIT_PLATE;

  useGsapContext(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          // The sticky stage's outer track defines the scroll range.
          trigger: root.current?.closest("[data-stage-track]") ?? root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.fromTo(
        "[data-stage]",
        {
          scaleX: cfg.assembled,
          scaleY: cfg.assembled,
          y: 0,
          svgOrigin: "0 0",
        },
        {
          scaleX: cfg.explodedX,
          scaleY: cfg.explodedY,
          y: cfg.drift,
          svgOrigin: "0 0",
          ease: "none",
        },
        0,
      );

      (Object.keys(cfg.travel) as (keyof typeof cfg.travel)[]).forEach((k) => {
        tl.to(`[data-layer='${k}']`, { y: cfg.travel[k], ease: "none" }, 0);
      });
      tl.to("[data-layer='hub']", { scale: 1.3, ease: "none" }, 0);

      // Held back until the stage has pulled in far enough that the labels
      // clear the edge of the viewBox.
      tl.fromTo(
        "[data-exploded]",
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.25 },
        cfg.calloutFrom,
      );
      tl.to("[data-assembled]", { opacity: 0, ease: "none", duration: 0.3 }, 0);
    },
    root,
    [cfg],
  );

  const callouts = [
    { y: cfg.travel.ring, label: cfg.labels[0] },
    { y: cfg.travel.index, label: cfg.labels[1] },
    { y: cfg.travel.gear, label: cfg.labels[2] },
    { y: cfg.travel.hub, label: cfg.labels[3] },
  ];

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      {/*
        Ground layers are masked soft at top and bottom. Without this the
        plate's lighter gradient meets the section's tone as a hard horizontal
        line, which reads as an unintended gap above the drawing.
      */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 16%, #000 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 16%, #000 86%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_18%,#3a414a_0%,#252a31_45%,#14171b_100%)]" />

        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4a515a 1px, transparent 1px), linear-gradient(to bottom, #4a515a 1px, transparent 1px)",
            backgroundSize: "clamp(36px, 8vw, 64px) clamp(36px, 8vw, 64px)",
            maskImage:
              "radial-gradient(70% 62% at 50% 45%, #000 18%, transparent 78%)",
          }}
        />
        <div className="glow-gold absolute inset-0 opacity-50" />
      </div>

      {/* `meet` guarantees the whole viewBox is always visible. */}
      <svg
        key={cfg.viewBox}
        viewBox={cfg.viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="mp-chrome" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#9ba1a9" />
            <stop offset="40%" stopColor="#e4e6ea" />
            <stop offset="58%" stopColor="#5f666e" />
            <stop offset="76%" stopColor="#d4d7dc" />
            <stop offset="100%" stopColor="#2c3036" />
          </linearGradient>
          <linearGradient id="mp-gold" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#f9ecc8" />
            <stop offset="35%" stopColor="#d9af4e" />
            <stop offset="62%" stopColor="#85641f" />
            <stop offset="100%" stopColor="#f0d18a" />
          </linearGradient>
          <radialGradient id="mp-core" cx="42%" cy="34%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#b6bbc2" />
            <stop offset="100%" stopColor="#2c3036" />
          </radialGradient>
        </defs>

        <g data-stage>
          <g data-exploded opacity="0">
            <line
              x1="0"
              y1={cfg.travel.ring - 80}
              x2="0"
              y2={cfg.travel.hub + 80}
              stroke="#d9af4e"
              strokeWidth="1.5"
              strokeDasharray="16 8 4 8"
              opacity="0.6"
            />
          </g>

          {/* ---------- outer toothed ring ---------- */}
          <g data-layer="ring">
            <motion.g
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 190, repeat: Infinity, ease: "linear" }}
            >
              {Array.from({ length: 28 }).map((_, i) => (
                <rect
                  key={i}
                  x={-7}
                  y={-186}
                  width={14}
                  height={26}
                  rx={3}
                  fill="url(#mp-chrome)"
                  transform={`rotate(${(360 / 28) * i})`}
                />
              ))}
              <circle
                r={162}
                fill="none"
                stroke="url(#mp-chrome)"
                strokeWidth={22}
              />
              <circle r={150} fill="none" stroke="#0c0d0f" strokeWidth={2} />
            </motion.g>
          </g>

          {/* ---------- gold index ring ---------- */}
          <g data-layer="index">
            <circle
              r={126}
              fill="none"
              stroke="url(#mp-gold)"
              strokeWidth={3}
            />
            {Array.from({ length: 60 }).map((_, i) => (
              <rect
                key={i}
                x={-0.6}
                y={-126}
                width={1.2}
                height={i % 5 === 0 ? 11 : 6}
                fill="#d9af4e"
                opacity={i % 5 === 0 ? 0.9 : 0.45}
                transform={`rotate(${6 * i})`}
              />
            ))}
          </g>

          {/* ---------- inner gear, counter-rotating ---------- */}
          <g data-layer="gear">
            <motion.g
              animate={reduce ? undefined : { rotate: -360 }}
              transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <rect
                  key={i}
                  x={-6}
                  y={-104}
                  width={12}
                  height={20}
                  rx={2.5}
                  fill="url(#mp-chrome)"
                  transform={`rotate(${(360 / 18) * i})`}
                />
              ))}
              <circle r={88} fill="url(#mp-chrome)" />
              <circle r={72} fill="#171b20" />
              {Array.from({ length: 6 }).map((_, i) => (
                <rect
                  key={i}
                  x={-9}
                  y={-74}
                  width={18}
                  height={52}
                  rx={9}
                  fill="url(#mp-chrome)"
                  transform={`rotate(${60 * i})`}
                />
              ))}
            </motion.g>
          </g>

          {/* ---------- hub ---------- */}
          <g data-layer="hub">
            <circle r={30} fill="url(#mp-core)" />
            <circle r={14} fill="#0a0b0d" />
            <circle r={14} fill="none" stroke="url(#mp-gold)" strokeWidth={2} />
            {Array.from({ length: 6 }).map((_, i) => (
              <circle
                key={i}
                cx={0}
                cy={-22}
                r={3}
                fill="#0a0b0d"
                transform={`rotate(${60 * i})`}
              />
            ))}
          </g>

          {/* ---------- technical callouts ---------- */}
          <g
            data-exploded
            opacity="0"
            fontFamily="var(--font-display)"
            fontSize={cfg.fontSize}
            letterSpacing="3"
          >
            {callouts.map((c) => (
              <g key={c.label}>
                <line
                  x1="0"
                  y1={c.y}
                  x2={cfg.leader}
                  y2={c.y}
                  stroke="#d9af4e"
                  strokeWidth="1.2"
                  strokeDasharray="6 6"
                  opacity="0.45"
                />
                <circle cx="0" cy={c.y} r="4" fill="#d9af4e" />
                <text
                  x={cfg.labelX}
                  y={c.y + cfg.fontSize * 0.34}
                  fill="#e4c06a"
                  opacity="0.95"
                >
                  {c.label}
                </text>
              </g>
            ))}
          </g>

          <g data-assembled>
            <line
              x1="-26"
              y1="0"
              x2="26"
              y2="0"
              stroke="#d9af4e"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <line
              x1="0"
              y1="-26"
              x2="0"
              y2="26"
              stroke="#d9af4e"
              strokeWidth="1.5"
              opacity="0.5"
            />
          </g>
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    </div>
  );
}
