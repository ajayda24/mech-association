"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EVENTS_VISIBLE, eventsCopy } from "@/content/events";
import type { EventItem, EventsData } from "@/lib/events";

/**
 * Upcoming events, on the landing page.
 *
 * The list is filtered and sorted on the server, so this only decides how much
 * of it to show. Everything past today has already been dropped upstream —
 * the section is "what's coming up", not an archive.
 */
export function Events({ data }: { data: EventsData }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const hasMore = data.events.length > EVENTS_VISIBLE;
  const shown =
    expanded || !hasMore ? data.events : data.events.slice(0, EVENTS_VISIBLE);

  return (
    <div className="shell-gutter py-16 sm:py-24 lg:py-[clamp(5rem,13vh,9rem)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-[clamp(2.5rem,6vh,4rem)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[52ch]">
            <h2 className="text-display text-chrome text-[clamp(2rem,8vw,4.6rem)] leading-[1.05]">
              {eventsCopy.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="text-steel-400 mt-6 text-balance">
              {eventsCopy.intro}
            </p>
          </div>

          {eventsCopy.formUrl && (
            <a
              href={eventsCopy.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-line-strong text-steel-300 hover:text-ink shrink-0 self-start rounded-full border px-5 py-2.5 text-sm font-medium transition-colors lg:self-auto"
            >
              {eventsCopy.addEvent}
            </a>
          )}
        </div>

        {data.status !== "ok" || data.events.length === 0 ? (
          <EmptyState status={data.status} unmatched={data.unmatchedHeaders} />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {shown.map((e, i) => (
                  <motion.li
                    key={e.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.4,
                      // Only the newly revealed rows stagger; the first screen
                      // is already in place by then.
                      delay: reduce ? 0 : Math.max(0, i - EVENTS_VISIBLE) * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <EventCard event={e} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="border-line-strong text-steel-300 hover:text-ink rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  {expanded
                    ? eventsCopy.viewFewer
                    : `${eventsCopy.viewAll} (${data.events.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const { title, day, month, weekday, time, venue, category, status } = event;

  return (
    <article className="surface-steel group relative flex h-full flex-col gap-4 p-5">
      <span className="bg-gold-400 absolute top-0 left-5 h-px w-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-[calc(100%-2.5rem)]" />

      <div className="flex items-start gap-4">
        {/* date plate */}
        <div
          aria-hidden
          className="surface-pitch grid h-14 w-14 shrink-0 place-items-center rounded-lg leading-none"
        >
          <span className="text-chrome text-display text-lg">{day}</span>
          <span className="text-gold-300 mt-0.5 text-[9px] font-semibold tracking-[0.16em]">
            {month}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-ink text-display text-base leading-tight text-balance">
            {title}
          </h3>
          <p className="text-steel-400 mt-1.5 text-xs sm:text-[13px]">
            {/* The date plate is aria-hidden, so the readable date lives here. */}
            <span>
              {weekday} {day} {month}
            </span>
            {time && <span> · {time}</span>}
            {venue && <span> · {venue}</span>}
          </p>
        </div>
      </div>

      {event.description && (
        <p className="text-steel-400 line-clamp-3 text-[13px] leading-relaxed">
          {event.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {category && (
          <span className="border-line-strong text-steel-300 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {category}
          </span>
        )}
        {status && (
          <span className="surface-gilt rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {status}
          </span>
        )}
        {event.registerUrl && (
          <a
            href={event.registerUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-gold ml-auto rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
          >
            Register ↗
          </a>
        )}
      </div>
    </article>
  );
}

function EmptyState({
  status,
  unmatched,
}: {
  status: EventsData["status"];
  unmatched: string[];
}) {
  const message =
    status === "no-columns"
      ? "The sheet was read, but no Title and Date columns were recognised."
      : status === "fetch-failed"
        ? "The events sheet could not be reached just now. It'll reappear on the next refresh."
        : status === "not-configured"
          ? eventsCopy.emptyNoData
          : eventsCopy.emptyUpcoming;

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
