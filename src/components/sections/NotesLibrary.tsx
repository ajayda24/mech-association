"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  notesCopy,
  notesYears,
  ordinal,
  type NotesYear,
  type Semester,
} from "@/content/notes";

/**
 * Notes library: pick a year, get that year's two semesters.
 *
 * Built as a real tab widget — roving focus, arrow keys, proper roles —
 * because it is one. A row of buttons that merely looks like tabs leaves
 * keyboard users tabbing through every year to reach the panel.
 */
export function NotesLibrary() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = notesYears.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const year = notesYears[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Year"
        onKeyDown={onKeyDown}
        className="border-line-strong mx-auto mb-8 flex gap-1 overflow-x-auto rounded-full border p-1.5 [scrollbar-width:none] sm:mb-10 sm:w-fit [&::-webkit-scrollbar]:hidden"
      >
        {notesYears.map((y, i) => {
          const selected = i === active;
          return (
            <button
              key={y.year}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`notes-tab-${y.year}`}
              aria-selected={selected}
              aria-controls={`notes-panel-${y.year}`}
              // Roving tabindex: one stop for the whole group.
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              /*
               * `ctx-on-gold` re-points the text tokens for the gold pill, so
               * `text-ink` resolves to the dark ink that belongs on gold —
               * the same treatment the gilt badges use.
               */
              className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-300 sm:px-5 ${
                selected ? "ctx-on-gold text-ink" : "text-steel-300 hover:text-ink"
              }`}
            >
              {selected && (
                /*
                 * No negative z-index here. A `-z-10` pill only stays behind
                 * its own label if an ancestor creates a stacking context;
                 * without one it is painted behind the SECTION background and
                 * disappears entirely, taking the dark-on-dark label with it.
                 * Ordering the label after the pill achieves the same layering
                 * with no such dependency.
                 */
                <motion.span
                  aria-hidden
                  layoutId="notes-tab"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 34 }
                  }
                  className="btn-gold absolute inset-0 rounded-full"
                />
              )}
              <span className="relative sm:hidden">{y.short}</span>
              <span className="relative hidden sm:inline">{y.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`notes-panel-${year.year}`}
        aria-labelledby={`notes-tab-${year.year}`}
        tabIndex={0}
        className="outline-none"
      >
        <YearPanel year={year} key={year.year} />
      </div>

      <p className="text-ink-faint mt-10 max-w-[60ch] text-xs leading-relaxed">
        {notesCopy.footnote}
      </p>
    </div>
  );
}

function YearPanel({ year }: { year: NotesYear }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {year.semesters.map((s, i) => (
        <motion.li
          key={s.number}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: reduce ? 0 : i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <SemesterCard semester={s} />
        </motion.li>
      ))}
    </ul>
  );
}

function SemesterCard({ semester }: { semester: Semester }) {
  const { number, note, driveUrl } = semester;
  const published = Boolean(driveUrl);

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-gold-300 text-[11px] font-semibold tracking-[0.24em] uppercase">
            Semester {number}
          </span>
          <h3 className="text-ink text-display mt-2 text-xl leading-tight sm:text-2xl">
            {ordinal(number)} Semester
          </h3>
          {note && (
            <p className="text-steel-400 mt-2 text-[13px] leading-relaxed">
              {note}
            </p>
          )}
        </div>

        {/* big ghost numeral, the same device the year cards use */}
        <span
          aria-hidden
          className="text-display text-ink/5 shrink-0 text-5xl leading-none sm:text-6xl"
        >
          {String(number).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {published ? (
          <span className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
            {notesCopy.openLabel}
            <span
              aria-hidden
              className="transition-transform duration-500 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </span>
        ) : (
          <span className="border-line-strong text-ink-faint rounded-full border border-dashed px-4 py-2 text-xs font-medium">
            {notesCopy.comingSoon}
          </span>
        )}
      </div>
    </>
  );

  const shell =
    "surface-steel group relative flex h-full flex-col p-5 sm:p-6 transition-colors duration-500";

  if (!published) {
    // Not a link: an anchor with no destination is announced as a link and
    // focusable, which is a dead end for a keyboard or screen-reader user.
    return (
      <div className={`${shell} opacity-70`} aria-disabled>
        {body}
      </div>
    );
  }

  return (
    <a
      href={driveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={shell}
      aria-label={`${ordinal(number)} semester notes — opens Google Drive in a new tab`}
    >
      <span className="bg-gold-400 absolute top-0 left-5 h-px w-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-[calc(100%-2.5rem)]" />
      {body}
    </a>
  );
}
