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
 * To publish: in the Sheet, File -> Share -> Publish to web -> pick the tab
 * -> Comma-separated values (.csv) -> Publish. Copy the URL into
 * `ALUMNI_SHEET_CSV_URL` in `.env.local`.
 *
 * PUBLISH A FILTERED TAB, NOT THE RAW RESPONSES. The form collects a mobile
 * number and an e-mail address, and anything published this way is readable by
 * anyone with the link, with no Google account. Put a tab beside the responses
 * holding only the safe columns, e.g.
 *
 *   =QUERY('Form Responses 1'!A:M, "select A,B,C,F,G,H,I,J,K,L,M", 1)
 *
 * and publish that one. The site never reads the contact columns, but not
 * reading them is not the same as not exposing them.
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

import type { ApprovalMode } from "@/lib/sheet";

/** How long a fetched copy of the sheet is reused before re-fetching, in seconds. */
export const ALUMNI_REVALIDATE_SECONDS = 60; // 2 hours

/**
 * Sheet header -> field mapping. Mirrors the live form, question for question:
 *
 *   Approved | Timestamp | Name | Mobile Number | E-mail ID | BATCH |
 *   Currently Pursuing | Company Name | Company location | Job Role |
 *   Institution Name | Institution location | Specialisation
 *
 * Mobile Number and E-mail ID ARE published, by decision — see SHOW_CONTACT
 * below, which is the single switch for turning either back off.
 *
 * ONE FIELD CLAIMS ONE COLUMN. That is why the company and institution
 * locations are separate fields rather than a single `location` carrying both
 * spellings: a shared field matched "Company location" and stopped, leaving
 * "Institution location" bound to nothing — which lost the location of every
 * alumnus in higher study, who are most of them.
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
  /** "BATCH" holds a range like 2022-2026; the LAST year is the passing year. */
  year: {
    required: true,
    aliases: [
      "batch",
      "batch year",
      "passed out year",
      "year of passing",
      "passing year",
      "graduation year",
      "year of graduation",
    ],
  },
  /** "Studying" / "Working" — decides which half of the card gets used. */
  pursuing: {
    required: false,
    aliases: ["currently pursuing", "current status", "pursuing", "status"],
  },

  // --- contact (published; gated by SHOW_CONTACT) ---
  email: {
    required: false,
    aliases: ["e mail id", "email id", "email", "e mail", "mail id"],
  },
  phone: {
    required: false,
    aliases: [
      "mobile number",
      "mobile",
      "phone number",
      "phone",
      "contact number",
      "whatsapp number",
    ],
  },

  // --- for alumni in work ---
  company: {
    required: false,
    aliases: [
      "company name",
      "company",
      "current company",
      "organisation",
      "organization",
      "employer",
    ],
  },
  companyLocation: {
    required: false,
    aliases: ["company location", "work location", "office location"],
  },
  role: {
    required: false,
    aliases: [
      "job role",
      "role",
      "job title",
      "designation",
      "current role",
      "position",
    ],
  },

  // --- for alumni in higher study ---
  institution: {
    required: false,
    aliases: ["institution name", "institution", "university", "college name"],
  },
  institutionLocation: {
    required: false,
    aliases: ["institution location", "college location", "campus location"],
  },
  specialisation: {
    required: false,
    aliases: ["specialisation", "specialization", "branch", "stream", "course"],
  },

  /*
   * NOT IN THE CURRENT FORM. Left mapped so that adding either question later
   * makes it appear with no code change; until then they never bind to a
   * column and render nothing.
   */
  experience: {
    required: false,
    aliases: [
      "years of experience",
      "experience",
      "total experience",
      "work experience",
    ],
  },
  linkedin: {
    required: false,
    aliases: ["linkedin profile", "linkedin", "linkedin url", "linkedin link"],
  },

  approved: {
    required: false,
    aliases: ["approved", "approve", "publish", "published", "show", "visible"],
  },
} as const;

export type AlumniField = keyof typeof alumniColumns;

/**
 * Which contact details appear on a card.
 *
 * Flip either to false and it stops being read from the sheet as well as
 * stops rendering — the value never reaches the browser at all, rather than
 * being hidden with CSS where "view source" would still show it.
 *
 * `phone: false` is the intended end state; it is true for now by request.
 *
 * Worth remembering what publishing these means: the page is public and so is
 * the CSV behind it, so both are readable by anyone and by scrapers. The
 * alumni gave these details to the association on a form, which is not
 * obviously the same as agreeing to put them on the open web — so it is worth
 * telling them, or asking on the form itself.
 */
export const SHOW_CONTACT = {
  email: true,
  phone: true,
} as const;

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
    "Our alumni are across the industry and in postgraduate programmes around the country. Find where the batches before you ended up.",
  teaserCta: "Browse the alumni",
  heading: ["Where the", "Batches Went"],
  intro:
    "Alumni of the Mechanical Engineering department, listed by the year they passed out. Search by name, company, course or institution, or narrow it to a single batch.",
  /** Shown on the form CTA at the top of the directory. */
  addYourself: "Are you an alumnus? Add yourself",
  /** Public Google Form link. Leave empty to hide the button. */
  formUrl: "",
  searchPlaceholder: "Search name, company, course or institution",
  allYearsLabel: "All batches",
  emptyFiltered: "No alumni match that search yet.",
  /*
   * Written for a VISITOR, not for whoever maintains the sheet. "Isn't
   * connected yet" describes our plumbing, which reads as broken to everyone
   * else. The real cause is printed underneath in development only.
   */
  comingSoonTitle: "Directory coming soon",
  comingSoonBody:
    "Alumni entries are being collected. Check back shortly — or add yourself if you have already graduated.",
} as const;
