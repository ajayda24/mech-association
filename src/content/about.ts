/**
 * The pinned "at work" section. PLACEHOLDER copy.
 *
 * Each entry is one step of the pinned scroll: the heading holds still while
 * the left panel swaps and the right panel's metrics re-count.
 */
export const about = {
  heading: ["The Association", "At Work"],
  intro:
    "Three wings, four years, one department. Every wing is run by students and handed over to the next batch each year.",
  steps: [
    {
      key: "technical",
      label: "Technical Wing",
      blurb:
        "Build teams, the open workshop and the competition squads. Runs the semester project cycle from proposal to demo day.",
      bullets: [
        "Go-kart and Baja build teams",
        "CNC, welding and casting shop hours",
        "CAD / CAE certification drives",
      ],
      metrics: [
        { label: "Active build teams", value: 12, suffix: "" },
        { label: "Workshop hours / week", value: 58, suffix: "h" },
      ],
    },
    {
      key: "events",
      label: "Events Wing",
      blurb:
        "The annual symposium, hands-on workshops, industry talks and plant visits. Everything with a date on it lands here.",
      bullets: [
        "Annual technical symposium",
        "Industry and plant visits",
        "Guest lectures and paper contests",
      ],
      metrics: [
        { label: "Events per year", value: 26, suffix: "" },
        { label: "Student footfall", value: 2200, suffix: "+" },
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
        { label: "Mentor pairings", value: 88, suffix: "" },
      ],
    },
  ],
} as const;
