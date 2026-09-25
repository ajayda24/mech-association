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
      key: "study",
      label: "Study Hub",
      blurb:
        "Notes, question papers and peer study sessions for every semester. Seniors who've cleared the subject walk juniors through it.",
      bullets: [
        "Semester-wise notes and question banks",
        "Peer tutoring before every series exam",
        "Lab manuals and viva preparation",
      ],
      metrics: [
        { label: "Subjects covered", value: 40, suffix: "+" },
        { label: "Study sessions / sem", value: 30, suffix: "" },
      ],
    },
    {
      key: "help",
      label: "Help Desk",
      blurb:
        "One place to ask — academics, registrations, scholarships or hostel queries. A student volunteer gets back to you, or finds someone who can.",
      bullets: [
        "Registration and exam form guidance",
        "Scholarship and certificate help",
        "First-year onboarding support",
      ],
      metrics: [
        { label: "Queries resolved", value: 500, suffix: "+" },
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
        { label: "Mentor pairings", value: 88, suffix: "" },
      ],
    },
  ],
} as const;
