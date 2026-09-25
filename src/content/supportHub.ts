/**
 * Support Hub — one card per help category, each with the coordinator
 * students should call. PLACEHOLDER names and numbers; swap the values,
 * not the shape. `phone` is dialled as-is, so keep it in +91 form.
 */
export const supportHub = {
  heading: ["Support Hub,", "One Call Away"],
  items: [
    {
      no: "01",
      kicker: "Academics & Exams",
      title: "Classes, Marks, Exams",
      body: "Timetables, internals, attendance shortfalls, revaluation and exam registration — the first call for anything on the academic side.",
      coordinator: { name: "Coordinator Name", phone: "+91 98765 43210" },
      tone: "steel",
    },
    {
      no: "02",
      kicker: "Sports & Arts",
      title: "Play, Perform, Represent",
      body: "Team trials, university meets, arts fest entries and duty leave for events. Reach out before the deadline, not after.",
      coordinator: { name: "Coordinator Name", phone: "+91 98765 43211" },
      tone: "gilt",
    },
    {
      no: "03",
      kicker: "GATE & Placements",
      title: "Prepare, Apply, Land",
      body: "GATE guidance, study material, placement drives, resumes and mock interviews — help for whatever comes after the degree.",
      coordinator: { name: "Coordinator Name", phone: "+91 98765 43212" },
      tone: "pitch",
    },
  ],
} as const;
