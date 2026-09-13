/**
 * Hero copy. PLACEHOLDER — swap for the real association wording.
 * `headline` is an array because each entry is one rendered line; the reveal
 * animation staggers word-by-word within each line.
 */
export const hero = {
  eyebrow: "Department of Mechanical Engineering",
  headline: ["We Build", "What Moves"],
  sub: "The student association of the ME department. Four years, one workshop floor — running the build teams, the symposium, the industry visits and the alumni network that outlasts every batch.",
  primary: { label: "Join the Association", href: "#join" },
  secondary: { label: "See Upcoming Events", href: "#events" },
  /** Runs in the ticker under the hero. */
  ticker: [
    "Thermal Engineering",
    "Machine Design",
    "Manufacturing",
    "Fluid Mechanics",
    "CAD / CAM / CAE",
    "Automobile Engineering",
    "Strength of Materials",
    "Robotics & Automation",
  ],
} as const;
