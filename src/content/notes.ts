/**
 * NOTES LIBRARY — paste your Google Drive folder links here.
 *
 * The site holds no notes and no file listing of its own. Each card is a
 * signpost: it opens the Drive folder for that semester, and whatever the
 * committee puts in that folder is what students see. Nothing here needs
 * touching when files are added, renamed or removed — only when a folder
 * itself changes.
 *
 * TO ADD A LINK
 * 1. Open the semester's folder in Google Drive.
 * 2. Share -> General access -> "Anyone with the link" -> Viewer.
 *    Without this, students hit a request-access wall instead of the notes.
 * 3. Copy the folder URL and paste it as `driveUrl` below.
 *
 * A semester with an empty `driveUrl` renders as "link coming soon" rather
 * than a dead card, so this ships safely half-filled.
 */

export type Semester = {
  /** 1-8, as the university numbers them. */
  number: number;
  /** Optional one-liner shown under the semester name. */
  note?: string;
  /** Google Drive folder URL. Empty = not published yet. */
  driveUrl: string;
};

export type NotesYear = {
  /** 1-4. */
  year: number;
  label: string;
  /** Short tab label, for narrow screens. */
  short: string;
  semesters: Semester[];
};

export const notesYears: NotesYear[] = [
  {
    year: 1,
    label: "First Year",
    short: "1st",
    semesters: [
      { number: 1, driveUrl: "" },
      { number: 2, driveUrl: "" },
    ],
  },
  {
    year: 2,
    label: "Second Year",
    short: "2nd",
    semesters: [
      { number: 3, driveUrl: "" },
      { number: 4, driveUrl: "" },
    ],
  },
  {
    year: 3,
    label: "Third Year",
    short: "3rd",
    semesters: [
      { number: 5, driveUrl: "" },
      { number: 6, driveUrl: "" },
    ],
  },
  {
    year: 4,
    label: "Final Year",
    short: "4th",
    semesters: [
      { number: 7, driveUrl: "" },
      { number: 8, driveUrl: "" },
    ],
  },
];

/** Ordinal for a semester number: 1 -> "1st". */
export function ordinal(n: number) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const suffix = ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}

export const notesCopy = {
  /** Landing-page one-liner. */
  teaser:
    "Notes, question papers and reference material for all eight semesters — collected by the batch, kept on Drive, open to everyone.",
  teaserCta: "Open the notes library",
  heading: ["Notes", "& Papers"],
  intro:
    "Pick your year, then the semester. Each one opens the shared Drive folder the committee keeps up to date.",
  /** Shown on a card whose Drive link hasn't been added yet. */
  comingSoon: "Link coming soon",
  openLabel: "Open in Drive",
  /** Small print under the grid. */
  footnote:
    "Folders are maintained by the association. Spotted something missing or out of date? Tell a committee member and it'll be added.",
} as const;
