/**
 * ALUMNI DIRECTORY — the one file to edit when the Google Form changes.
 *
 * ---------------------------------------------------------------------------
 * HOW THE DATA GETS HERE
 * ---------------------------------------------------------------------------
 * 1. An alumnus fills the Google Form.
 * 2. Responses land in the linked Google Sheet.
 * 3. You tick the APPROVED column on the rows you want public.
 * 4. The sheet is published to the web as CSV, and this site fetches that CSV.
 *
 * To publish: in the Sheet, File -> Share -> Publish to web -> pick the
 * responses tab -> Comma-separated values (.csv) -> Publish. Copy the URL into
 * `ALUMNI_SHEET_CSV_URL` in `.env.local`.
 *
 * ---------------------------------------------------------------------------
 * WHEN THE FORM CHANGES
 * ---------------------------------------------------------------------------
 * Columns are matched to fields by the HEADER TEXT of the sheet, which is the
 * full question text from the form. Matching is case- and punctuation-
 * insensitive, and any alias in the list below will do — so re-wording a
 * question usually needs nothing at all, and at worst one new string added to
 * the relevant `aliases` array.
 *
 * Nothing here is positional. Adding, removing or re-ordering form questions
 * cannot shift the mapping, because no field is ever read by column index.
 */

/** How long a fetched copy of the sheet is reused before re-fetching, in seconds. */
export const ALUMNI_REVALIDATE_SECONDS = 2 * 60 * 60; // 2 hours

/**
 * Sheet header -> field mapping.
 *
 * `aliases` are matched after normalising both sides (lowercased, punctuation
 * collapsed to single spaces). An exact match is preferred; failing that, a
 * header that STARTS WITH an alias wins, which is what catches Google Forms'
 * habit of appending help text to a question.
 */
export const alumniColumns = {
  name: {
    required: true,
    aliases: ["name", "full name", "your name", "student name"],
  },
  year: {
    required: true,
    aliases: [
      "passed out year",
      "year of passing",
      "passing year",
      "batch",
      "batch year",
      "graduation year",
      "year of graduation",
    ],
  },
  company: {
    required: false,
    aliases: [
      "company",
      "company name",
      "current company",
      "organisation",
      "organization",
      "employer",
      "where do you work",
    ],
  },
  role: {
    required: false,
    aliases: [
      "role",
      "job title",
      "designation",
      "current role",
      "position",
      "what is your role",
    ],
  },
  experience: {
    required: false,
    aliases: [
      "experience",
      "years of experience",
      "total experience",
      "work experience",
    ],
  },
  linkedin: {
    required: false,
    aliases: ["linkedin", "linkedin profile", "linkedin url", "linkedin link"],
  },
  approved: {
    required: false,
    aliases: ["approved", "approve", "publish", "published", "show", "visible"],
  },
} as const;

export type AlumniField = keyof typeof alumniColumns;

/**
 * Cell values in the APPROVED column that mean "yes, show this one".
 * Anything else — blank included — keeps the row off the site.
 */
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
 * Set false to publish every row and ignore the APPROVED column entirely.
 *
 * Leave it true. The form is public, so without a gate anything anyone types
 * appears on the department's site the moment they press submit.
 */
export const REQUIRE_APPROVAL = true;

/**
 * Hosts a profile link is allowed to point at.
 *
 * The link arrives from a public form, so it is untrusted input that the site
 * would otherwise render as a clickable outbound link. Restricting the host
 * means a pasted spam URL cannot ride along even if a row gets approved by
 * mistake. Empty the array to allow any https link.
 */
export const ALLOWED_PROFILE_HOSTS = ["linkedin.com", "www.linkedin.com"];

/** Copy for the directory page and the teaser on the landing page. */
export const alumniCopy = {
  /** Landing-page one-liner. */
  teaser:
    "Our alumni are across the industry — design, manufacturing, energy, automotive and beyond. Find where the batches before you ended up.",
  teaserCta: "Browse the alumni",
  heading: ["Where the", "Batches Went"],
  intro:
    "Alumni of the Mechanical Engineering department, listed by the year they passed out. Search by name, company or role, or narrow it to a single batch.",
  /** Shown on the form CTA at the top of the directory. */
  addYourself: "Are you an alumnus? Add yourself",
  /** Public Google Form link. Leave empty to hide the button. */
  formUrl: "",
  searchPlaceholder: "Search name, company or role",
  allYearsLabel: "All batches",
  emptyFiltered: "No alumni match that search yet.",
  emptyNoData:
    "The alumni directory isn't connected yet. Once the response sheet is published, entries appear here automatically.",
} as const;
