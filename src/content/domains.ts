/** The 01 / 02 / 03 focus cards. PLACEHOLDER copy. */
export const domains = {
  heading: ["Three Domains,", "One Discipline"],
  items: [
    {
      no: "01",
      kicker: "Design & Analysis",
      title: "Model, Simulate, Validate",
      body: "CAD to CAE — machine elements, linkages and load paths, taken from sketch to FEA before a single part is cut.",
      tone: "steel",
    },
    {
      no: "02",
      kicker: "Thermal & Fluids",
      title: "Burn, Flow, Exchange",
      body: "IC engines, heat exchangers, refrigeration and CFD. The energy side of the department, from combustion to cooling towers.",
      tone: "gilt",
    },
    {
      no: "03",
      kicker: "Manufacturing",
      title: "Cut, Join, Finish",
      body: "Lathe and mill to CNC, welding, casting and additive. Where the drawing finally becomes a part you can hold.",
      tone: "pitch",
    },
  ],
} as const;
