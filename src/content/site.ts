/**
 * Site-wide copy and navigation.
 *
 * PLACEHOLDER CONTENT — every string here is a stand-in until the real
 * association copy arrives. Swap the values, not the shape.
 */

export const site = {
  name: "Royal Mech",
  shortName: "Royal Mech",
  longName: "Royal Mech — Mechanical Engineering Association",
  /** Sits under the wordmark in the nav and on the loading screen. */
  sub: "Mechanical Engineering",
  /** Full college name — footer, edge rail and anywhere else it's spelled out. */
  college: "Institute of Engineering & Technology, Calicut University",
  /** Short form, used only under the department name in the hero. */
  collegeShort: "IET Calicut University",
  tagline: "Built by the students, shaped by their ideas",
  description:
    "and driven by a shared vision. We create opportunities to learn, lead, innovate, and grow — together building a stronger Mechanical Engineering community.",
  /** Production origin; absolute URLs in share previews resolve against it. */
  url: "https://mechiniet.vercel.app",
  email: "mea@yourcollege.edu",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/mech.iet?stkn=MWhwa3hncHVub2FqMQ==" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/same-iet-085152404?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
  ],
} as const;

/**
 * Nav items. `#foo` scrolls within the landing page; anything starting with
 * `/` is a real route and is navigated to instead. Nav reads the shape of the
 * href to decide, so adding a page here needs no change there.
 */
export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Execom", href: "#committee" },
  { label: "Events", href: "#events" },
  { label: "Study Zone", href: "/notes" },
  { label: "Alumni", href: "/alumni" },
] as const;

export const navCta = { label: "Support Hub", href: "#support" } as const;

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
