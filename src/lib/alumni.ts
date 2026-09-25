import "server-only";

import {
  ALLOWED_PROFILE_HOSTS,
  ALUMNI_REVALIDATE_SECONDS,
  APPROVED_VALUES,
  REQUIRE_APPROVAL,
  alumniColumns,
  type AlumniField,
} from "@/content/alumni";
import {
  cellReader,
  fetchSheetRows,
  isApproved,
  mapHeaders,
  parseLinkUrl,
  type SheetStatus,
} from "@/lib/sheet";

export type Alum = {
  id: string;
  name: string;
  /** Four-digit passing year, or null when the cell could not be read. */
  year: number | null;
  company: string;
  role: string;
  experience: string;
  linkedin: string;
};

export type AlumniData = {
  alumni: Alum[];
  /** Descending list of the years actually present, for the filter. */
  years: number[];
  /**
   * Why the list is empty, when it is. Surfaced in the UI so an unconfigured
   * or mis-published sheet reads as a setup step rather than "no alumni".
   */
  status: SheetStatus;
  /** Headers the sheet had that matched nothing — shown in dev to aid mapping. */
  unmatchedHeaders: string[];
};

/** Pull a four-digit year out of whatever the cell says: "2019", "2019 batch", "May 2019". */
function parseYear(raw: string): number | null {
  const m = raw.match(/\b(19|20)\d{2}\b/);
  if (!m) return null;
  const y = Number(m[0]);
  // A year beyond next summer is a typo, not a batch.
  return y >= 1950 && y <= new Date().getFullYear() + 1 ? y : null;
}

export async function getAlumni(): Promise<AlumniData> {
  const { rows, status } = await fetchSheetRows(
    process.env.ALUMNI_SHEET_CSV_URL,
    ALUMNI_REVALIDATE_SECONDS,
  );
  if (status !== "ok")
    return { alumni: [], years: [], status, unmatchedHeaders: [] };
  if (rows.length < 2)
    return { alumni: [], years: [], status: "ok", unmatchedHeaders: [] };

  const { index, unmatched } = mapHeaders(rows[0], alumniColumns);
  if (index.name === -1 || index.year === -1) {
    return {
      alumni: [],
      years: [],
      status: "no-columns",
      unmatchedHeaders: unmatched,
    };
  }
  const at = cellReader<AlumniField>(index);

  const alumni: Alum[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = at(row, "name");
    if (!name) continue;

    if (REQUIRE_APPROVAL) {
      // No approved column at all means nothing is approved — failing closed,
      // so a sheet published before the column exists cannot leak every row.
      if (
        index.approved === -1 ||
        !isApproved(at(row, "approved"), APPROVED_VALUES)
      )
        continue;
    }

    alumni.push({
      id: `${r}-${name}`,
      name,
      year: parseYear(at(row, "year")),
      company: at(row, "company"),
      role: at(row, "role"),
      experience: at(row, "experience"),
      linkedin: parseLinkUrl(at(row, "linkedin"), ALLOWED_PROFILE_HOSTS),
    });
  }

  // Newest batch first, then alphabetical inside a batch. Unknown years last.
  alumni.sort((a, b) => {
    if (a.year !== b.year) {
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return b.year - a.year;
    }
    return a.name.localeCompare(b.name);
  });

  const years = [
    ...new Set(alumni.map((a) => a.year).filter((y): y is number => y !== null)),
  ].sort((a, b) => b - a);

  return { alumni, years, status: "ok", unmatchedHeaders: unmatched };
}
