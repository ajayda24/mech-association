/**
 * EVENTS — the one file to edit when the events Google Form changes.
 *
 * Same pipeline as the alumni directory: Google Form -> responses Sheet ->
 * you tick APPROVED -> sheet published to web as CSV -> fetched here. See
 * `src/content/alumni.ts` for the publishing steps; put the resulting URL in
 * `EVENTS_SHEET_CSV_URL`.
 *
 * Columns are matched by HEADER TEXT, never by position, so adding, removing
 * or reordering form questions cannot break the mapping.
 */

import type { ApprovalMode } from "@/lib/sheet";

/** How long a fetched copy of the sheet is reused before re-fetching, in seconds. */
export const EVENTS_REVALIDATE_SECONDS = 20 * 60; // 20 minutes

/**
 * How to read a date written with slashes, e.g. 03/04/2026.
 *
 * "DMY" reads that as 3 April; "MDY" reads it as 4 March. There is no way to
 * tell them apart from the value alone, so it is a setting rather than a
 * guess — and a wrong guess silently moves events by months.
 *
 * Unambiguous values are still auto-corrected: if a part is greater than 12 it
 * can only be the day, whatever this says. Best avoided entirely by using a
 * Date question in the form, which exports as YYYY-MM-DD.
 */
export const DATE_ORDER: "DMY" | "MDY" = "DMY";

/** Sheet header -> field mapping. Title and date are the only required ones. */
export const eventColumns = {
  title: {
    required: true,
    aliases: ["title", "event", "event name", "event title", "name"],
  },
  date: {
    required: true,
    aliases: ["date", "event date", "date of event", "when", "day"],
  },
  time: {
    required: false,
    aliases: ["time", "event time", "start time", "timing", "timings"],
  },
  venue: {
    required: false,
    aliases: ["venue", "location", "place", "where", "hall"],
  },
  category: {
    required: false,
    aliases: ["category", "type", "event type", "kind"],
  },
  status: {
    required: false,
    aliases: [
      "status",
      "registration status",
      "registration",
      "seats",
      "availability",
    ],
  },
  description: {
    required: false,
    aliases: ["description", "details", "about", "summary", "what is it about"],
  },
  registerUrl: {
    required: false,
    aliases: [
      "register",
      "registration link",
      "register link",
      "registration url",
      "link",
      "sign up",
      "signup link",
      "form link",
    ],
  },
  approved: {
    required: false,
    aliases: ["approved", "approve", "publish", "published", "show", "visible"],
  },
} as const;

export type EventField = keyof typeof eventColumns;

/** Cell values in the APPROVED column that mean "yes, show this one". */
export const APPROVED_VALUES = [
  "yes",
  "y",
  "true",
  "1",
  "approved",
  "approve",
  "ok",
  "x",
  "✓",
  "✔",
  "checked",
  "done",
];

/**
 * Cell values in the APPROVED column that HIDE a row, in "deny" mode.
 * Matching ignores case and punctuation, so "No." and "NO" both count.
 */
export const REJECTED_VALUES = [
  "no",
  "n",
  "false",
  "0",
  "reject",
  "rejected",
  "hide",
  "hidden",
  "remove",
  "spam",
];

/**
 * How the APPROVED column gates rows.
 *
 * "deny"  — every row publishes unless its APPROVED cell says No. A blank
 *           cell publishes, and so does a sheet with no APPROVED column.
 * "allow" — nothing publishes until a row is explicitly ticked Yes.
 *
 * Set to "deny" so the committee only acts on rows they want REMOVED. The
 * trade-off: the form is public, so a submission is live until somebody marks
 * it No. Worth a periodic look at the sheet.
 */
export const APPROVAL_MODE: ApprovalMode = "deny";

/**
 * Hosts a registration link may point at. EMPTY MEANS ANY HTTPS URL.
 *
 * Left open on purpose: unlike a LinkedIn profile, a registration link
 * legitimately goes anywhere — a Google Form, the college site, a ticketing
 * page — so a tight allowlist would break ordinary use. `https` is still
 * enforced, so `javascript:` and `data:` URLs cannot get through. The real
 * control here is the APPROVED tick: a human sees every link before it
 * publishes. Add hosts below to lock it down further.
 */
export const ALLOWED_REGISTER_HOSTS: string[] = [];

/** How many events show before the "View all" button. */
export const EVENTS_VISIBLE = 6;

export const eventsCopy = {
  heading: ["What's", "Coming Up"],
  intro:
    "Workshops, talks, build sprints and the symposium — everything the association is running this term.",
  /** Public Google Form link for proposing an event. Leave empty to hide the button. */
  formUrl: "",
  addEvent: "Propose an event",
  viewAll: "View all events",
  viewFewer: "Show fewer",
  /*
   * Empty states. All of them are written for a VISITOR, not for whoever
   * maintains the sheet: "isn't connected yet" and "the sheet could not be
   * reached" describe our plumbing, which is nobody else's problem and reads
   * as broken. Whatever the underlying cause, the honest public message is
   * the same — there is nothing to show yet. The real reason is printed
   * underneath in development only.
   */
  /** Connected, but nothing is dated today or later. */
  emptyUpcomingTitle: "No events scheduled",
  emptyUpcomingBody:
    "Nothing on the calendar right now. New dates are posted here as soon as they're confirmed.",
  /** Not connected, unreachable, or columns unrecognised. */
  comingSoonTitle: "Events coming soon",
  comingSoonBody:
    "The calendar is being put together. Check back shortly — upcoming workshops, talks and the symposium will be listed here.",
} as const;
