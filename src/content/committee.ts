/**
 * Committee / office bearers.
 *
 * PHOTOS live in `public/committee/` and are referenced from the site root —
 * `/committee/x.jpeg`, NOT `/public/committee/x.jpeg`. Nearly all of them are
 * 3:4, which is what the card is shaped to, so they display with little or no
 * cropping.
 *
 * NAMES are the one thing still to fill in: only the faculty president was
 * supplied. Set `photo` to null for anyone without a portrait and the card
 * renders a machined initials plate instead, so the grid never breaks.
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
          name: "Anil Jacob",
          role: "President",
          year: "Faculty",
          photo: "/committee/president.jpeg",
        },
        {
          /** TODO: real name. */
          name: "Christo Jose",
          role: "Staff Advisor",
          year: "Faculty",
          photo: "/committee/staffAdvisor.jpeg",
        },
      ],
    },
    {
      key: "bearers",
      label: "Office Bearers",
      note: "The elected student committee for this session",
      members: [
        {
          name: "Rifa Fathima",
          role: "Department Secretary",
          year: "Student",
          photo: "/committee/deptSecreatry.jpeg",
        },
        {
          name: "Muhammed Shanif V",
          role: "Joint Secretary",
          year: "Student",
          photo: "/committee/joinSecretary.jpeg",
        },
        {
          name: "Krishnapriya P M",
          role: "Tech Lead",
          year: "Student",
          photo: "/committee/techLead.jpeg",
        },
        {
          name: "Madhujith K M",
          role: "Program Facilitator",
          year: "Student",
          photo: "/committee/programFacilitator.jpeg",
        },
        {
          name: "Hadi Muhammed K",
          role: "Media Head",
          year: "Student",
          photo: "/committee/mediaHead.jpeg",
        },
      ],
    },
    {
      key: "reps",
      label: "Year Representatives",
      note: "One voice from each of the four years",
      members: [
        {
          name: "Gautham Krishna B",
          role: "Class Representative",
          year: "First Year",
          photo: "/committee/1stYearRep.jpeg",
        },
        {
          name: "Gautham Krishna M S",
          role: "Class Representative",
          year: "Second Year",
          photo: "/committee/2ndYearRep.jpeg",
        },
        {
          name: "Adithya P",
          role: "Class Representative",
          year: "Third Year",
          photo: "/committee/3rdYearRep.jpeg",
        },
        {
          name: "Arun Mannanchery",
          role: "Class Representative",
          year: "Final Year",
          photo: "/committee/4thYearRep.jpeg",
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
