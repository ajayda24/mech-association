import { Section } from "@/components/layout/Section";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { SupportHub } from "@/components/sections/SupportHub";
import { Years } from "@/components/sections/Years";
import { Statement } from "@/components/sections/Statement";
import { Committee } from "@/components/sections/Committee";
import { Impact } from "@/components/sections/Impact";
import { AlumniTeaser } from "@/components/sections/AlumniTeaser";
import { Events } from "@/components/sections/Events";
import { NotesTeaser } from "@/components/sections/NotesTeaser";
import { getEvents } from "@/lib/events";

/**
 * Single-page site. Tones alternate down the page — gunmetal, black, silver —
 * so the material changes as you scroll instead of one flat ground.
 */
// async: the events sheet is fetched here, which makes this route ISR with
// the interval set in src/content/events.ts.
export default async function Home() {
  const events = await getEvents();

  return (
    <>
      {/* clip={false}: the hero's sticky stage needs a non-clipping ancestor */}
      <Section tone="steel" clip={false}>
        <Hero />
      </Section>

      {/* <Section tone="steel">
        <Statement />
      </Section> */}
      {/* pinned: must not sit inside an overflow ancestor */}
      <Section id="about" tone="pitch" clip={false}>
        <About />
      </Section>

      <Section id="support" tone="silver">
        <SupportHub />
        {/* <Years /> */}
      </Section>


      <Section id="committee" tone="silver">
        <Committee />
      </Section>

      {/* <Section id="impact" tone="pitch">
        <Impact />
      </Section> */}

      <Section id="events" tone="steel">
        <Events data={events} />
      </Section>

      {/* One-liner + a way through; the library itself is its own route. */}
      <Section id="notes" tone="pitch">
        <NotesTeaser />
      </Section>

      {/* One-liner + a way through; the directory itself is its own route. */}
      <Section id="alumni" tone="silver">
        <AlumniTeaser />
      </Section>
    </>
  );
}
