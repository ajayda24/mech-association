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
      // Match across the fields a reader would actually search by — both
      // halves of the form, since most entries are in higher study rather
      // than employment and would otherwise be unsearchable.
      return [
        a.name,
        a.company,
        a.role,
        a.institution,
        a.specialisation,
        a.companyLocation,
        a.institutionLocation,
        a.email,
      ].some((v) => v.toLowerCase().includes(q));
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

/** 12px line icons, sized to sit on the text baseline beside a link. */
function MailIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0 opacity-60"
    >
      <rect x="1.75" y="3.75" width="12.5" height="8.5" rx="1.75" />
      <path d="m2.5 5 5.5 3.6L13.5 5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0 opacity-60"
    >
      <path d="M5.2 2.4 6.8 5 5.4 6.4a8.6 8.6 0 0 0 4.2 4.2L11 9.2l2.6 1.6-.6 1.9a1.4 1.4 0 0 1-1.6 1C7 13 3 9 2.4 4.6a1.4 1.4 0 0 1 1-1.6l1.8-.6Z" />
    </svg>
  );
}

function AlumCard({ alum }: { alum: Alum }) {
  const { name, year, company, role, experience, linkedin } = alum;

  /*
   * Alumni split into those working and those in higher study, and the form
   * asks about both — so a card describes whichever side was filled in.
   * Without this, everyone in a master's programme rendered as a bare name.
   */
  const working = Boolean(company);
  const place = working ? company : alum.institution;
  const what = working ? role : alum.specialisation;
  const where = working ? alum.companyLocation : alum.institutionLocation;
  /* Minor facts on one quiet line rather than three competing pills. */
  const meta = [where, experience].filter(Boolean);
  const hasContact = Boolean(alum.email || alum.phone || linkedin);

  /*
   * The card is always a plain article, never a link.
   *
   * It used to become an <a> whenever a LinkedIn URL existed, but now that
   * cards carry mailto: and tel: links, that would nest an anchor inside an
   * anchor — invalid HTML which browsers recover from unpredictably and which
   * leaves keyboard and screen-reader users unable to reach the inner links.
   * The profile sits in the contact row with the others instead.
   */
  return (
    <article className="surface-steel group ring-line/0 hover:ring-gold-400/25 relative flex h-full flex-col overflow-hidden p-5 ring-1 transition-all duration-500 hover:-translate-y-0.5">
      {/* hairline that draws itself across the top edge on hover */}
      <span className="bg-gold-400 absolute top-0 left-5 h-px w-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-[calc(100%-2.5rem)]" />

      {/* warm pool that fades up behind the monogram */}
      <span
        aria-hidden
        className="glow-gold pointer-events-none absolute -top-16 -left-16 h-40 w-40 opacity-0 transition-opacity duration-700 group-hover:opacity-50"
      />

      {/*
        Ghost numeral for the batch year — the same device the Study Zone
        semester cards use, so the two pages read as one system. Decorative
        only: the readable year lives in the meta line below.
      */}
      {year !== null && (
        <span
          aria-hidden
          className="text-display text-ink/[0.045] pointer-events-none absolute -top-2 -right-1 text-6xl leading-none tabular-nums select-none"
        >
          {year}
        </span>
      )}

      <div className="relative flex items-start gap-3.5">
        {/* monogram plate, ringed in gold */}
        <span
          aria-hidden
          className="surface-pitch text-chrome text-display ring-gold-400/20 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm tracking-tight ring-1"
        >
          {initialsOf(name)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-ink text-display truncate text-[15px] leading-tight sm:text-base">
            {name}
          </h3>

          {(what || place) && (
            <p className="text-steel-400 mt-1 text-xs leading-snug sm:text-[13px]">
              {what && <span>{what}</span>}
              {what && place && <span className="text-ink-faint"> at </span>}
              {place && <span>{place}</span>}
            </p>
          )}
        </div>
      </div>

      {/* status dot plus the quiet facts */}
      <div className="text-ink-faint relative mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        {alum.pursuing && (
          <span className="text-steel-300 inline-flex items-center gap-1.5 font-medium">
            <span
              aria-hidden
              className="bg-gold-400 h-1.5 w-1.5 shrink-0 rounded-full"
            />
            {alum.pursuing}
          </span>
        )}
        {year !== null && (
          <>
            {alum.pursuing && <span aria-hidden>·</span>}
            <span className="tabular-nums">Batch of {year}</span>
          </>
        )}
        {meta.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>{meta.join(" · ")}</span>
          </>
        )}
      </div>

      {/*
        Contact block, pinned to the bottom so it lines up across a row of
        cards of differing heights. `mt-auto` only bites once a taller
        neighbour stretches the card; `pt-5` guarantees room when it does not.
      */}
      {hasContact && (
        <div className="relative mt-auto pt-5">
          <div className="border-line flex items-end gap-3 border-t pt-3 text-[11px]">
            <div className="flex min-w-0 flex-col gap-1.5">
              {alum.email && (
                <a
                  href={`mailto:${alum.email}`}
                  /*
                   * `truncate`, not `break-all`. Addresses are long, and
                   * break-all chopped them mid-word across two ragged lines;
                   * an ellipsis reads as "there is more", and the full value
                   * stays on the link and in the tooltip.
                   */
                  title={alum.email}
                  className="text-steel-400 hover:text-gold-300 flex min-w-0 items-center gap-1.5 transition-colors"
                >
                  <MailIcon />
                  <span className="truncate">{alum.email}</span>
                </a>
              )}
              {alum.phone && (
                <a
                  /* Strip spacing so the dialled number is valid, while the
                     label keeps however the alumnus wrote it. */
                  href={`tel:${alum.phone.replace(/[^\d+]/g, "")}`}
                  className="text-steel-400 hover:text-gold-300 flex items-center gap-1.5 tabular-nums whitespace-nowrap transition-colors"
                >
                  <PhoneIcon />
                  {alum.phone}
                </a>
              )}
            </div>

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`${name} on LinkedIn`}
                className="border-line-strong text-gold-300 hover:border-gold-400/50 ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition-colors"
              >
                in
              </a>
            )}
          </div>
        </div>
      )}
    </article>
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
