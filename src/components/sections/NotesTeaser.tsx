"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { notesCopy } from "@/content/notes";

/**
 * Landing-page notes band. Same shape as the alumni band: a sentence and a way
 * through. The library itself is a separate route.
 */
export function NotesTeaser() {
  return (
    <div className="shell-gutter py-16 sm:py-24 lg:py-[clamp(5rem,13vh,9rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="border-line-strong flex flex-col gap-8 border-t pt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[52ch]">
            <span className="text-gold-300 text-[11px] font-semibold tracking-[0.24em] uppercase">
              Notes &amp; Papers
            </span>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-ink mt-4 text-[clamp(1.15rem,3.2vw,1.75rem)] leading-snug text-balance"
            >
              {notesCopy.teaser}
            </motion.p>
          </div>

          <Link
            href="/notes"
            className="btn-gold group inline-flex shrink-0 items-center gap-3 self-start rounded-full py-2.5 pr-2.5 pl-6 text-sm font-semibold transition-shadow duration-300 hover:shadow-[0_0_30px_-4px_rgba(217,175,78,0.5)] lg:self-auto"
          >
            {notesCopy.teaserCta}
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-black/25 transition-transform duration-500 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
