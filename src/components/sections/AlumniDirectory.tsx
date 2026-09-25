"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { alumniCopy } from "@/content/alumni";
import { initialsOf } from "@/lib/initials";
import type { Alum, AlumniData } from "@/lib/alumni";

/**
 * Searchable, batch-filterable alumni grid.
 *
 * Filtering happens here rather than on the server: the whole (small) list is
 * already in the payload, so every keystroke is instant and needs no round
 * trip. If the directory ever grows past a few hundred entries this is the
 * thing to revisit.
 */
export function AlumniDirectory({ data }: { data: AlumniData }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<number | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.alumni.filter((a) => {
      if (year !== "all" && a.year !== year) return false;
      if (!q) return true;
      // Match across the fields a reader would actually search by.
      return [a.name, a.company, a.role].some((v) =>
        v.toLowerCase().includes(q),
      );
    });
  }, [data.alumni, query, year]);

  if (data.status !== "ok" || data.alumni.length === 0) {
    return <EmptyState status={data.status} unmatched={data.unmatchedHeaders} />;
  }

  return (
    <div>
      {/* ---------- controls ---------- */}
      <div className="mb-8 flex flex-col gap-4 sm:mb-10">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={alumniCopy.searchPlaceholder}
            aria-label={alumniCopy.searchPlaceholder}
            className="border-line-strong bg-surface/60 text-ink placeholder:text-ink-faint focus:border-gold-400/70 focus:ring-gold-400/25 w-full rounded-full border px-5 py-3 text-sm outline-none transition-colors focus:ring-2 sm:text-base"
          />
        </div>

        {/*
          Batch chips scroll horizontally on a phone rather than wrapping into
          a wall of rows — there is one per year the directory knows about.
        */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            active={year === "all"}
            onClick={() => setYear("all")}
            label={alumniCopy.allYearsLabel}
          />
          {data.years.map((y) => (
            <Chip
              key={y}
              active={year === y}
              onClick={() => setYear(y)}
              label={String(y)}
            />
          ))}
        </div>

        <p className="text-ink-faint text-xs tracking-[0.14em] uppercase">
          {filtered.length} {filtered.length === 1 ? "alumnus" : "alumni"}
          {year !== "all" && ` · batch of ${year}`}
        </p>
      </div>

      {/* ---------- grid ---------- */}
      {filtered.length === 0 ? (
        <p className="text-steel-400 py-12 text-center text-sm">
          {alumniCopy.emptyFiltered}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => (
              <motion.li
                key={a.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <AlumCard alum={a} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium tracking-[0.08em] whitespace-nowrap transition-colors duration-300 ${
        active
          ? "surface-gilt border-transparent"
          : "border-line-strong text-steel-300 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function AlumCard({ alum }: { alum: Alum }) {
  const { name, year, company, role, experience, linkedin } = alum;

  /*
   * The whole card is a link when a profile URL survived validation, and a
   * plain article otherwise — rather than a nested anchor, which would put an
   * interactive element inside an interactive element.
   */
  const Wrapper = linkedin ? "a" : "article";
  const linkProps = linkedin
    ? {
        href: linkedin,
        target: "_blank" as const,
        rel: "noopener noreferrer nofollow" as const,
      }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="surface-steel group relative flex h-full flex-col gap-4 p-5 transition-colors duration-500"
    >
      <span className="bg-gold-400 absolute top-0 left-5 h-px w-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-[calc(100%-2.5rem)]" />

      <div className="flex items-start gap-3.5">
        {/* initials plate — the portrait stand-in, same idea as the committee grid */}
        <span
          aria-hidden
          className="surface-pitch text-chrome text-display grid h-12 w-12 shrink-0 place-items-center rounded-lg text-base tracking-tight"
        >
          {initialsOf(name)}
        </span>

        <div className="min-w-0">
          <h3 className="text-ink text-display truncate text-base leading-tight">
            {name}
          </h3>
          {(role || company) && (
            <p className="text-steel-400 mt-1 text-xs leading-snug sm:text-[13px]">
              {role && <span>{role}</span>}
              {role && company && <span className="text-ink-faint"> at </span>}
              {company && <span>{company}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {year !== null && (
          <span className="border-line-strong text-steel-300 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {year}
          </span>
        )}
        {experience && (
          <span className="border-line-strong text-steel-300 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {experience}
          </span>
        )}
        {linkedin && (
          <span className="text-gold-300 ml-auto text-[11px] font-semibold tracking-[0.1em] uppercase">
            in ↗
          </span>
        )}
      </div>
    </Wrapper>
  );
}

/** Shown when the sheet isn't connected, can't be read, or has no usable columns. */
function EmptyState({
  status,
  unmatched,
}: {
  status: AlumniData["status"];
  unmatched: string[];
}) {
  const message =
    status === "no-columns"
      ? "The sheet was read, but no Name and Passed-out-year columns were recognised."
      : status === "fetch-failed"
        ? "The alumni sheet could not be reached just now. It'll reappear on the next refresh."
        : alumniCopy.emptyNoData;

  return (
    <div className="border-line-strong grid place-items-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <p className="text-steel-400 max-w-[46ch] text-sm">{message}</p>
      {process.env.NODE_ENV === "development" && unmatched.length > 0 && (
        <p className="text-ink-faint mt-4 max-w-[60ch] font-mono text-[11px]">
          Unmatched sheet headers: {unmatched.join(" · ")}
        </p>
      )}
    </div>
  );
}
