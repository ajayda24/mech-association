/**
 * Support Hub — one card per help category, each listing the coordinators
 * students should call (two or three per card). Swap the values, not the
 * shape. `role` is optional and
 * shows as a small tag after the name. `phone` is dialled with spaces
 * stripped, so keep it in +91 form.
 */
export const supportHub = {
  heading: ["Support Hub,", "One Call Away"],
  items: [
    {
      no: "01",
      kicker: "Academics & Exams",
      title: "Classes, Marks, Exams",
      body: "Timetables, internals, attendance shortfalls, revaluation and exam registration — the first call for anything on the academic side.",
      contacts: [
        { name: "Naeem Abdul Azeez", role: "Faculty", phone: "+91 95267 45953" },
        { name: "Krishnapriya", phone: "+91 94005 09909" },
        { name: "Muhammed Shanif V", phone: "+91 96568 54013" },
      ],
      tone: "steel",
    },
    {
      no: "02",
      kicker: "Sports & Arts",
      title: "Play, Perform, Represent",
      body: "Team trials, university meets, arts fest entries and duty leave for events. Reach out before the deadline, not after.",
      contacts: [
        { name: "Gokul Vijay V", role: "Faculty", phone: "+91 95392 08465" },
        { name: "Arun Mannanchery", phone: "+91 90729 03770" },
        { name: "Fathima Sana", phone: "+91 97461 38236" },
      ],
      tone: "gilt",
    },
    {
      no: "03",
      kicker: "GATE & Placements",
      title: "Prepare, Apply, Land",
      body: "GATE guidance, study material, placement drives, resumes and mock interviews — help for whatever comes after the degree.",
      contacts: [
        { name: "Harikrishnan", role: "Faculty", phone: "+91 94005 95723" },
        { name: "Rifa Fathima", phone: "+91 94001 17713" },
        { name: "Madhujith KM", phone: "+91 82817 40916" },
      ],
      tone: "pitch",
    },
  ],
} as const;
