import "server-only";

import {
  ALLOWED_PROFILE_HOSTS,
  ALUMNI_REVALIDATE_SECONDS,
  APPROVAL_MODE,
  APPROVED_VALUES,
  REJECTED_VALUES,
  alumniColumns,
  type AlumniField,
} from "@/content/alumni";
import {
  cellReader,
  fetchSheetRows,
  isRowVisible,
  mapHeaders,
  parseLinkUrl,
  type SheetStatus,
} from "@/lib/sheet";

export type Alum = {
  id: string;
  name: string;
  /** Four-digit passing year, or null when the cell could not be read. */
  year: number | null;
  /** "Studying" / "Working" — whichever the form offered. */
  pursuing: string;
  company: string;
  companyLocation: string;
  role: string;
  institution: string;
  institutionLocation: string;
  specialisation: string;
  /** Not in the current form; empty until those questions are added. */
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
  const found = [...raw.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) =>
    Number(m[0]),
  );
  if (found.length === 0) return null;
  // A range like "2022-2026" is joining year to passing year, so the LAST
  // year is the one to group by. Taking the first would file everyone four
  // years early and mislabel every filter chip.
  const y = Math.max(...found);
  // Far-future years are typos, but a near-future one is legitimate: current
  // students enter the year they will graduate.
  return y >= 1950 && y <= new Date().getFullYear() + 6 ? y : null;
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

    // In "deny" mode a missing APPROVED column simply means nothing has been
    // hidden, so every row publishes — which is the point. `at()` returns ""
    // for an unmapped column, and "" is not a rejected value.
    if (
      !isRowVisible(
        at(row, "approved"),
        APPROVAL_MODE,
        APPROVED_VALUES,
        REJECTED_VALUES,
      )
    )
      continue;

    alumni.push({
      id: `${r}-${name}`,
      name,
      year: parseYear(at(row, "year")),
      pursuing: at(row, "pursuing"),
      company: at(row, "company"),
      companyLocation: at(row, "companyLocation"),
      role: at(row, "role"),
      institution: at(row, "institution"),
      institutionLocation: at(row, "institutionLocation"),
      specialisation: at(row, "specialisation"),
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
