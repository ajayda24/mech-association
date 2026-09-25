import "server-only";

import {
  ALLOWED_REGISTER_HOSTS,
  APPROVED_VALUES,
  DATE_ORDER,
  EVENTS_REVALIDATE_SECONDS,
  REQUIRE_APPROVAL,
  eventColumns,
  type EventField,
} from "@/content/events";
import {
  cellReader,
  fetchSheetRows,
  isApproved,
  mapHeaders,
  parseLinkUrl,
  type SheetStatus,
} from "@/lib/sheet";

export type EventItem = {
  id: string;
  title: string;
  /** Midnight local time on the day of the event, as an ISO string. */
  date: string;
  /** Pre-formatted for display, so the client renders no locale-dependent dates. */
  day: string;
  month: string;
  weekday: string;
  time: string;
  venue: string;
  category: string;
  status: string;
  description: string;
  registerUrl: string;
};

export type EventsData = {
  events: EventItem[];
  status: SheetStatus;
  unmatchedHeaders: string[];
};

/**
 * Parse a date cell.
 *
 * Accepts ISO (what a Google Forms date question exports), slash/dash numeric
 * in the configured order, and textual forms like "14 March 2026". Returns
 * local midnight so that day-level comparisons are not thrown off by a time
 * component.
 */
export function parseEventDate(raw: string, order = DATE_ORDER): Date | null {
  const value = raw.trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const numeric = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (numeric) {
    const a = Number(numeric[1]);
    const b = Number(numeric[2]);
    const y = Number(numeric[3]);
    // A part above 12 can only be the day, whichever order is configured —
    // so an unambiguous value corrects itself even if the setting is wrong.
    let day: number, month: number;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      month = a;
      day = b;
    } else if (order === "DMY") {
      day = a;
      month = b;
    } else {
      month = a;
      day = b;
    }
    return makeDate(y < 100 ? 2000 + y : y, month, day);
  }

  // "14 March 2026", "March 14, 2026" and similar.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return makeDate(
      parsed.getFullYear(),
      parsed.getMonth() + 1,
      parsed.getDate(),
    );
  }
  return null;
}

function makeDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  // Rejects 31 February and friends, which JS would silently roll forward.
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

/** Local midnight today — an event happening today is still upcoming all day. */
function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export async function getEvents(): Promise<EventsData> {
  const { rows, status } = await fetchSheetRows(
    process.env.EVENTS_SHEET_CSV_URL,
    EVENTS_REVALIDATE_SECONDS,
  );
  if (status !== "ok") return { events: [], status, unmatchedHeaders: [] };
  if (rows.length < 2) return { events: [], status: "ok", unmatchedHeaders: [] };

  const { index, unmatched } = mapHeaders(rows[0], eventColumns);
  if (index.title === -1 || index.date === -1) {
    return { events: [], status: "no-columns", unmatchedHeaders: unmatched };
  }
  const at = cellReader<EventField>(index);
  const today = startOfToday();

  const events: EventItem[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const title = at(row, "title");
    if (!title) continue;

    if (REQUIRE_APPROVAL) {
      // No approved column at all means nothing is approved — failing closed,
      // so a sheet published before the column exists cannot leak every row.
      if (index.approved === -1 || !isApproved(at(row, "approved"), APPROVED_VALUES))
        continue;
    }

    const date = parseEventDate(at(row, "date"));
    // Undated rows are dropped rather than shown: this section is "what's
    // coming up", and a row with no date cannot answer that.
    if (!date || date < today) continue;

    events.push({
      id: `${r}-${title}`,
      title,
      date: date.toISOString(),
      day: String(date.getDate()).padStart(2, "0"),
      // Trimmed to three letters: en-GB renders September as "Sept", which
      // makes that one date plate a character wider than every other.
      month: date
        .toLocaleDateString("en-GB", { month: "short" })
        .slice(0, 3)
        .toUpperCase(),
      weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
      time: at(row, "time"),
      venue: at(row, "venue"),
      category: at(row, "category"),
      status: at(row, "status"),
      description: at(row, "description"),
      registerUrl: parseLinkUrl(at(row, "registerUrl"), ALLOWED_REGISTER_HOSTS),
    });
  }

  // Soonest first.
  events.sort((a, b) => a.date.localeCompare(b.date));

  return { events, status: "ok", unmatchedHeaders: unmatched };
}
