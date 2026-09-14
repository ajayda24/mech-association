"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { TiltCard } from "@/components/motion/TiltCard";
import { Cog } from "@/components/visuals/Hardware";
import { committee, initialsOf, type Member } from "@/content/committee";

/**
 * Committee showcase. Cards rise and un-skew on scroll, tilt in 3D under the
 * cursor with a specular highlight that tracks it, and lift their details on
 * hover. Portraits are optional — until they arrive each card renders a
 * machined initials plate so the grid always looks finished.
 */
export function Committee() {
  const root = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-member]").forEach((cardEl) => {
        gsap.fromTo(
          cardEl,
          { y: 70, opacity: 0, rotateZ: -2.5, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            scale: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: cardEl, start: "top 92%" },
          },
        );
      });
    },
    root,
    [],
  );

  return (
    <div
      ref={root}
      className="shell-gutter py-16 sm:py-24 lg:py-[clamp(5rem,13vh,9rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-[clamp(3rem,7vh,5rem)] max-w-[60ch]">
          <RevealText
            as="h2"
            lines={committee.heading}
            className="text-display text-chrome text-[clamp(2rem,8vw,4.6rem)]"
          />
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-steel-400 mt-6 text-balance"
          >
            {committee.intro}
          </motion.p>
        </div>

        {committee.groups.map((group) => (
          <div key={group.key} className="mb-[clamp(3rem,7vh,5rem)] last:mb-0">
            <div className="mb-7 flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h3 className="text-gold-300 text-[11px] font-semibold tracking-[0.24em] uppercase">
                {group.label}
              </h3>
              <span className="text-ink-faint text-xs">{group.note}</span>
              <span className="bg-line-strong ml-auto hidden h-px flex-1 sm:block" />
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {group.members.map((m, i) => (
                <li key={`${group.key}-${i}`} data-member>
                  <MemberCard member={m} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <TiltCard max={9} className="h-full">
      <article className="surface-steel group relative h-full overflow-hidden">
        {/* specular highlight that follows the cursor */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.14), transparent 62%)",
          }}
        />

        {/* portrait */}
        {/*
          3:4 for every card, because that is what the portraits actually are —
          8 of the 11 are exactly 0.75. The faculty cards used to be 16/10,
          which threw away about two thirds of a portrait's height and left the
          face blown up and cropped.
        */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-[50%_28%] grayscale-[0.55] contrast-[1.03] transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
            />
          ) : (
            <PlatePlaceholder name={member.name} />
          )}

          {/* year tag */}
          <span className="surface-gilt absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
            {member.year}
          </span>

          {/* base shade so the role always reads over a photo */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* details */}
        <div className="relative z-10 p-4 sm:p-5">
          <span className="bg-gold-400 absolute top-0 left-5 h-px w-0 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-[calc(100%-2.5rem)]" />
          <h4 className="text-ink text-display text-base leading-tight sm:text-lg">
            {member.name}
          </h4>
          <p className="text-steel-400 mt-1.5 text-[10px] tracking-[0.1em] uppercase sm:text-xs sm:tracking-[0.12em]">
            {member.role}
          </p>

          <div className="mt-4 flex items-center gap-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
            {[
              ["in", member.linkedin],
              ["ig", member.instagram],
              ["@", member.email && `mailto:${member.email}`],
            ].map(([label, href]) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  className="text-ink-faint hover:text-gold-300 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors"
                >
                  {label}
                </a>
              ) : null,
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

/** Machined plate stand-in shown until a portrait is supplied. */
function PlatePlaceholder({ name }: { name: string }) {
  return (
    /*
     * `surface-pitch` and `texture-knurl` both set `background-image`, so
     * putting them on one element meant the knurl grid replaced the dark fill
     * entirely and the plate rendered light — with light chrome initials on
     * it. Each background gets its own layer.
     */
    <div className="surface-pitch absolute inset-0 grid place-items-center rounded-none">
      <span aria-hidden className="texture-knurl absolute inset-0" />
      <div className="glow-gold absolute inset-0 opacity-40" />
      <Cog
        className="absolute -right-8 -bottom-8 h-40 w-40 opacity-[0.08]"
        teeth={16}
      />
      <span className="text-display text-chrome relative text-4xl tracking-tight sm:text-6xl">
        {initialsOf(name)}
      </span>
      <span className="ring-gold-600/30 absolute inset-6 rounded-xl ring-1" />
    </div>
  );
}
