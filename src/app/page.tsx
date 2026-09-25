import { Section } from "@/components/layout/Section";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Domains } from "@/components/sections/Domains";
import { Years } from "@/components/sections/Years";
import { Statement } from "@/components/sections/Statement";
import { Committee } from "@/components/sections/Committee";
import { Impact } from "@/components/sections/Impact";

/**
 * Single-page site. Tones alternate down the page — gunmetal, black, silver —
 * so the material changes as you scroll instead of one flat ground.
 */
export default function Home() {
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

      <Section id="domains" tone="silver">
        <Domains />
        {/* <Years /> */}
      </Section>


      <Section id="committee" tone="silver">
        <Committee />
      </Section>

      {/* <Section id="impact" tone="pitch">
        <Impact />
      </Section> */}

      {/* --- still to build --- */}
      {[
        { id: "events", label: "Events (Google Sheet driven)" },
        { id: "alumni", label: "Alumni" },
        { id: "join", label: "Join / CTA" },
      ].map((s, i) => (
        <Section key={s.id} id={s.id} tone={i % 2 === 0 ? "steel" : "pitch"}>
          <div className="shell-gutter grid min-h-[50vh] place-items-center">
            <p className="text-ink-faint text-sm tracking-[0.2em] uppercase">
              {s.label}
            </p>
          </div>
        </Section>
      ))}
    </>
  );
}
