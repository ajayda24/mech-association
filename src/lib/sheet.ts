import "server-only";

import { parseCsv } from "@/lib/csv";

/**
 * Shared plumbing for the published-Google-Sheet sources (alumni, events).
 *
 * Both follow the same shape: fetch a published CSV, match columns by header
 * text rather than position, honour an APPROVED gate, and validate any URL
 * that came out of a public form. Keeping it in one place means a fix to the
 * matching rules applies to every sheet-backed section at once.
 */

export type ColumnSpec = Readonly<
  Record<string, { readonly required: boolean; readonly aliases: readonly string[] }>
>;

export type SheetStatus = "ok" | "not-configured" | "fetch-failed" | "no-columns";

/**
 * Lowercase, strip punctuation, collapse whitespace. Applied to both the sheet
 * header and the configured aliases so "Passed-out year?" and "passed out
 * year" are the same key.
 */
export function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Work out which column index holds which field.
 *
 * Exact alias matches are resolved for every field FIRST, and only then are
 * prefix matches considered. Doing it in one pass let a loose prefix claim a
 * column that a later field matched exactly — "experience" would swallow the
 * "Years of experience" column before that field was reached. Each column can
 * only be claimed once.
 */
export function mapHeaders<C extends ColumnSpec>(headers: string[], columns: C) {
  const norm = headers.map(normalise);
  const taken = new Set<number>();
  const fields = Object.keys(columns) as (keyof C & string)[];
  const index = {} as Record<keyof C & string, number>;

  for (const field of fields) index[field] = -1;

  for (const pass of ["exact", "prefix"] as const) {
    for (const field of fields) {
      if (index[field] !== -1) continue;
      const aliases = columns[field].aliases.map(normalise);
      for (let i = 0; i < norm.length; i++) {
        if (taken.has(i)) continue;
        const hit = aliases.some((a) =>
          pass === "exact" ? norm[i] === a : norm[i].startsWith(a),
        );
        if (hit) {
          index[field] = i;
          taken.add(i);
          break;
        }
      }
    }
  }

  const unmatched = headers.filter((h, i) => !taken.has(i) && h.trim());
  return { index, unmatched };
}

/** Reader for one cell, given a resolved header map. */
export function cellReader<F extends string>(index: Record<F, number>) {
  return (row: string[], field: F) => {
    const i = index[field];
    return i === -1 ? "" : (row[i] ?? "").trim();
  };
}

export function isApproved(raw: string, approvedValues: readonly string[]) {
  return approvedValues.includes(normalise(raw));
}

/**
 * Accept a link only if it resolves to https and, when an allowlist is given,
 * points at one of those hosts.
 *
 * Everything here came from a public form, so an unchecked value would be an
 * open redirect painted in the site's own styling. An empty allowlist still
 * enforces https, which is what keeps `javascript:` and `data:` out.
 */
export function parseLinkUrl(raw: string, allowedHosts: readonly string[]) {
  const value = raw.trim();
  if (!value) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : `https://${value}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return "";
  }
  // http is upgraded rather than dropped: sheets routinely carry http links
  // that are fine over TLS, and shipping a mixed-content link is not.
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return "";

  if (allowedHosts.length === 0) return url.toString();
  const host = url.hostname.toLowerCase();
  const ok = allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
  return ok ? url.toString() : "";
}

/**
 * Fetch a published sheet as rows.
 *
 * Revalidation rather than a request-time fetch: the page is pre-rendered and
 * quietly refreshed in the background, so visitors never wait on Google and
 * search engines see a populated page.
 */
export async function fetchSheetRows(
  url: string | undefined,
  revalidate: number,
): Promise<{ rows: string[][]; status: SheetStatus }> {
  if (!url) return { rows: [], status: "not-configured" };
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return { rows: [], status: "fetch-failed" };
    return { rows: parseCsv(await res.text()), status: "ok" };
  } catch {
    // A section that fails to load must not take the whole page down.
    return { rows: [], status: "fetch-failed" };
  }
}
