/**
 * Site-wide copy and navigation.
 *
 * PLACEHOLDER CONTENT — every string here is a stand-in until the real
 * association copy arrives. Swap the values, not the shape.
 */

export const site = {
  /** TODO: replace with the real association name. */
  name: "ME Association",
  shortName: "MEA",
  longName: "Mechanical Engineering Association",
  /** TODO: replace with the real college / department name. */
  college: "Department of Mechanical Engineering",
  tagline: "Built by the batch, for the batch.",
  description:
    "The student association of the Mechanical Engineering department — four years of students running the workshops, the build teams, the symposium and the alumni network.",
  email: "mea@yourcollege.edu",
  social: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "YouTube", href: "#" },
  ],
} as const;

/** Single-page site: every nav item is an in-page anchor. */
export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Domains", href: "#domains" },
  { label: "Committee", href: "#committee" },
  { label: "Events", href: "#events" },
  { label: "Alumni", href: "#alumni" },
] as const;

export const navCta = { label: "Join the Association", href: "#join" } as const;
export const navSecondary = { label: "Impact", href: "#impact" } as const;

/** The four undergraduate years the association spans. */
export const years = [
  {
    year: "I",
    label: "First Year",
    note: "Induction, workshop basics, open lab access",
  },
  {
    year: "II",
    label: "Second Year",
    note: "Build teams, CAD certification, core subjects",
  },
  {
    year: "III",
    label: "Third Year",
    note: "Competitions, internships, industry visits",
  },
  {
    year: "IV",
    label: "Final Year",
    note: "Capstone projects, placements, handover",
  },
] as const;
