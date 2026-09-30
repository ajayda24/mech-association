/**
 * The pinned "at work" section. PLACEHOLDER copy.
 *
 * Each entry is one step of the pinned scroll: the heading holds still while
 * the left panel swaps and the right panel's metrics re-count.
 */
export const about = {
  heading: ["The Association", "At Work"],
  intro:
    "Led by Students, United by Purpose, Built to Leave a Lasting Legacy",
  steps: [
    {
      key: "study",
      label: "Study Zone",
      blurb:
        "Syllabus, Notes, previous question papers and peer study sessions for every semester. Seniors who've cleared the subject walk juniors through it.",
      bullets: [
        "Subject wise syllabus",
        "Module wise notes",
        "Previous year question papers",
      ],
      metrics: [
        { label: "Subjects covered", value: 40, suffix: "+" },
        { label: "Notes", value: "100+", suffix: "" },
      ],
    },
    {
      key: "help",
      label: "Support Hub",
      blurb:
        "One place to ask — academics, registrations, scholarships or hostel queries. A student volunteer gets back to you, or finds someone who can.",
      bullets: [
        "Academics & Exams",
        "Sports & Arts",
        "GATE & Placements",
      ],
      metrics: [
        { label: "Coordinators", value: "10", suffix: "+" },
        { label: "Avg. response time", value: 24, suffix: "h" },
      ],
    },
    {
      key: "alumni",
      label: "Alumni Relations",
      blurb:
        "Keeping every batch connected — mentorship pairings, referral pipelines and the annual homecoming.",
      bullets: [
        "Mentor matching across all four years",
        "Placement and referral network",
        "Alumni homecoming and talks",
      ],
      metrics: [
        { label: "Alumni on the network", value: 1450, suffix: "+" },
        { label: "Startups", value: 35, suffix: "+" },
      ],
    },
  ],
} as const;
