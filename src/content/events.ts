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

/** Set false to publish every row and ignore the APPROVED column entirely. */
export const REQUIRE_APPROVAL = true;

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
  /** Shown when the sheet is connected but nothing is scheduled ahead. */
  emptyUpcoming:
    "Nothing on the calendar right now. New events are posted here as they're confirmed.",
  emptyNoData:
    "The events calendar isn't connected yet. Once the sheet is published, events appear here automatically.",
} as const;
