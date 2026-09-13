/**
 * Committee / office bearers. PLACEHOLDER names and roles.
 *
 * PHOTOS: drop each portrait in `public/committee/` and set `photo` to the
 * path, e.g. `photo: "/committee/arun-k.jpg"`. Portraits look best at 3:4
 * (e.g. 900x1200). Leave `photo` as `null` and the card renders a machined
 * initials plate instead, so the grid never breaks while photos are pending.
 */

export type Member = {
  name: string;
  role: string;
  /** Shown as a small tag — year of study, or "Faculty". */
  year: string;
  photo: string | null;
  linkedin?: string;
  instagram?: string;
  email?: string;
};

export type CommitteeGroup = {
  key: string;
  label: string;
  note: string;
  members: Member[];
};

export const committee = {
  heading: ["The People", "Behind It"],
  intro:
    "Elected each year by the department and handed over at the end of every academic session. Faculty advise; students run it.",
  groups: [
    {
      key: "faculty",
      label: "Faculty Advisors",
      note: "Department staff who oversee the association",
      members: [
        {
          name: "Dr. Placeholder Name",
          role: "Head of Department",
          year: "Faculty",
          photo: null,
        },
        {
          name: "Prof. Placeholder Name",
          role: "Staff Advisor",
          year: "Faculty",
          photo: null,
        },
      ],
    },
    {
      key: "bearers",
      label: "Office Bearers",
      note: "The elected student committee for this session",
      members: [
        {
          name: "Placeholder Name",
          role: "President",
          year: "Final Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Vice President",
          year: "Third Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Secretary",
          year: "Third Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Treasurer",
          year: "Third Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Technical Head",
          year: "Final Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Events Head",
          year: "Third Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Alumni Relations Head",
          year: "Final Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Design & Media Head",
          year: "Second Year",
          photo: null,
        },
      ],
    },
    {
      key: "reps",
      label: "Year Representatives",
      note: "One voice from each of the four years",
      members: [
        {
          name: "Placeholder Name",
          role: "Class Representative",
          year: "First Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Class Representative",
          year: "Second Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Class Representative",
          year: "Third Year",
          photo: null,
        },
        {
          name: "Placeholder Name",
          role: "Class Representative",
          year: "Final Year",
          photo: null,
        },
      ],
    },
  ] satisfies CommitteeGroup[],
} as const;

/** Fallback plate initials when a photo hasn't been supplied yet. */
export function initialsOf(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
