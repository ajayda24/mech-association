"use client";

import { ScrollWords } from "@/components/ui/ScrollWords";
import { Parallax } from "@/components/motion/Parallax";
import { Float } from "@/components/motion/Float";
import { HexBolt, Washer } from "@/components/visuals/Hardware";
import { statement } from "@/content/statement";

/** The big scrubbed paragraph — the reference's full-width statement block. */
export function Statement() {
  return (
    <div className="shell-gutter relative py-20 sm:py-28 lg:py-[clamp(7rem,18vh,13rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Parallax y={-60} className="absolute top-[12%] right-[8%]">
          <Float amplitude={18} spin={12} duration={7}>
            <Washer className="h-14 w-14 opacity-30 md:h-20 md:w-20" gold />
          </Float>
        </Parallax>
        <Parallax y={-34} className="absolute bottom-[14%] left-[7%]">
          <Float amplitude={12} spin={18} duration={8.5} delay={0.6}>
            <HexBolt className="h-12 w-12 opacity-30 md:h-16 md:w-16" />
          </Float>
        </Parallax>
      </div>

      <ScrollWords
        text={statement.text}
        highlight={statement.highlight}
        className="text-display text-ink relative mx-auto max-w-[18ch] text-center text-[clamp(1.75rem,7vw,4.2rem)] leading-[1.14] sm:max-w-[22ch] md:max-w-[26ch]"
      />
    </div>
  );
}
