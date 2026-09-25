import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { AlumniDirectory } from "@/components/sections/AlumniDirectory";
import { alumniCopy } from "@/content/alumni";
import { getAlumni } from "@/lib/alumni";

export const metadata: Metadata = {
  title: "Alumni",
  description: alumniCopy.teaser,
};

/**
 * Alumni directory.
 *
 * A Server Component so the sheet is fetched on the server and the page ships
 * already populated — no spinner, and the list is indexable. Search and filter
 * then run in the browser against that payload.
 */
export default async function AlumniPage() {
  const data = await getAlumni();

  return (
    <Section id="alumni" tone="pitch">
      {/*
        Top padding clears the fixed nav. This page has no hero to sit under
        it, so without this the heading starts behind the bar.
      */}
      <div className="shell-gutter pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/#top"
            className="text-ink-faint hover:text-gold-300 mb-8 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase transition-colors"
          >
            ← Back to the association
          </Link>

          <div className="mb-[clamp(2.5rem,6vh,4rem)] max-w-[60ch]">
            <h1 className="text-display text-chrome text-[clamp(2rem,8vw,4.6rem)] leading-[1.05]">
              {alumniCopy.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-steel-400 mt-6 text-balance">
              {alumniCopy.intro}
            </p>

            {alumniCopy.formUrl && (
              <a
                href={alumniCopy.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-7 inline-block rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                {alumniCopy.addYourself}
              </a>
            )}
          </div>

          <AlumniDirectory data={data} />
        </div>
      </div>
    </Section>
  );
}
