import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { NotesLibrary } from "@/components/sections/NotesLibrary";
import { notesCopy } from "@/content/notes";

export const metadata: Metadata = {
  title: "Notes & Papers",
  description: notesCopy.teaser,
};

/**
 * Notes library.
 *
 * Fully static — the site keeps no files and no index of them. Every card
 * hands off to a Google Drive folder the committee maintains, so nothing here
 * needs rebuilding when notes are added or removed.
 */
export default function NotesPage() {
  return (
    <Section id="notes" tone="pitch">
      {/* Top padding clears the fixed nav; this page has no hero to sit under it. */}
      <div className="shell-gutter pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/#top"
            className="text-ink-faint hover:text-gold-300 mb-8 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase transition-colors"
          >
            ← Back to the association
          </Link>

          <div className="mb-[clamp(2.5rem,6vh,4rem)] max-w-[60ch]">
            <h1 className="text-display text-chrome text-[clamp(2rem,8vw,4.6rem)] leading-[1.05]">
              {notesCopy.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-steel-400 mt-6 text-balance">{notesCopy.intro}</p>
          </div>

          <NotesLibrary />
        </div>
      </div>
    </Section>
  );
}
