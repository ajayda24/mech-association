"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { useGsapContext } from "@/lib/useGsap";
import { RevealText } from "@/components/ui/RevealText";
import { Cog } from "@/components/visuals/Hardware";
import { supportHub } from "@/content/supportHub";

const toneClass: Record<string, string> = {
  steel: "surface-steel",
  gilt: "surface-gilt",
  pitch: "surface-pitch",
};

/**
 * The three Support Hub cards. Each column drifts at its own rate so the row keeps
 * reshuffling as you pass it — the staggered-height treatment in the reference.
 */
export function SupportHub() {
  const root = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-support-card]");

      cards.forEach((cardEl, i) => {
        // Entrance: rise + unrotate, cascading left to right.
        gsap.fromTo(
          cardEl,
          { yPercent: 26, opacity: 0, rotate: i % 2 === 0 ? -3 : 3 },
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.1,
            delay: i * 0.12,
            ease: "expo.out",
            scrollTrigger: { trigger: root.current, start: "top 72%" },
          },
        );

        // Then a slow differential drift — middle column leads. Halved on
        // small screens, where the columns stack and the offset just reads
        // as the page jittering.
        const drift = window.matchMedia("(min-width: 768px)").matches ? 1 : 0.4;
        gsap.to(cardEl, {
          yPercent: (i === 1 ? -16 : -6) * drift,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    },
    root,
    [],
  );

  return (
    <div
      ref={root}
      className="shell-gutter relative py-16 sm:py-24 lg:py-[clamp(6rem,14vh,10rem)]"
    >
      <div className="texture-knurl pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_40%,#000,transparent)]" />

      <div className="relative mx-auto max-w-[1400px]">
        <RevealText
          as="h2"
          lines={supportHub.heading}
          className="text-display text-chrome mb-10 text-center text-[clamp(2rem,8vw,4.6rem)] sm:mb-[clamp(3rem,8vh,6rem)]"
        />

        <div className="grid items-start gap-6 md:grid-cols-3">
          {supportHub.items.map((d, i) => (
            <div
              key={d.no}
              data-support-card
              className={`${i === 1 ? "md:-mt-14" : ""} ${
                i === 2 ? "md:mt-10" : ""
              }`}
            >
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`${toneClass[d.tone]} group relative overflow-hidden p-6 sm:p-8`}
              >
                {/* the numeral, oversized and half-bled off the corner */}
                <span
                  className={`text-display pointer-events-none absolute -top-6 text-[9rem] leading-none select-none ${
                    d.tone === "steel" ? "-right-2 text-black/[0.06]" : `-right-3 ${d.tone === "gilt" ? "text-black/10" : "text-white/[0.045]"}`
                  }`}
                >
                  {d.no}
                </span>

                <Cog
                  className={`mb-7 h-10 w-10 transition-transform duration-[1200ms] group-hover:rotate-180 ${
                    d.tone === "gilt" ? "opacity-40" : "opacity-80"
                  }`}
                  teeth={12}
                  gold={d.tone !== "gilt"}
                />

                <p
                  className={`text-[11px] font-medium tracking-[0.2em] uppercase ${
                    d.tone === "gilt" ? "text-black/55" : "text-gold-400"
                  }`}
                >
                  {d.kicker}
                </p>

                <h3
                  className={`text-display mt-3 text-2xl sm:text-[1.75rem] ${
                    d.tone === "gilt" ? "text-black" : "text-ink"
                  }`}
                >
                  {d.title}
                </h3>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    d.tone === "gilt" ? "text-black/70" : "text-steel-400"
                  }`}
                >
                  {d.body}
                </p>

                {/* the coordinators — each row dials its own number */}
                <div
                  className={`mt-8 border-t pt-5 ${
                    d.tone === "gilt" ? "border-black/15" : "border-line"
                  }`}
                >
                  <p
                    className={`text-[11px] font-medium tracking-[0.2em] uppercase ${
                      d.tone === "gilt" ? "text-black/55" : "text-steel-400"
                    }`}
                  >
                    Coordinators
                  </p>

                  <ul className="mt-2">
                    {d.contacts.map((c) => (
                      <li key={c.phone}>
                        <a
                          href={`tel:${c.phone.replace(/\s+/g, "")}`}
                          className="group/contact block py-2.5"
                        >
                          <span
                            className={`flex items-center gap-2 text-base font-medium ${
                              d.tone === "gilt" ? "text-black" : "text-ink"
                            }`}
                          >
                            {c.name}
                            {"role" in c && (
                              <span
                                className={`rounded-full border py-1 pr-2.5 pl-[calc(0.625rem+0.16em)] text-[10px] leading-none tracking-[0.16em] uppercase ${
                                  d.tone === "gilt"
                                    ? "border-black/20 text-black/60"
                                    : "border-line-strong text-steel-400"
                                }`}
                              >
                                {c.role}
                              </span>
                            )}
                          </span>
                          <span
                            className={`mt-1 flex items-center gap-2 text-xs font-medium tracking-[0.16em] ${
                              d.tone === "gilt" ? "text-black/70" : "text-gold-400"
                            }`}
                          >
                            {c.phone}
                            <span className="bg-current/30 h-px flex-1 origin-left scale-x-100 transition-transform duration-500 group-hover/contact:scale-x-[0.7]" />
                            <span className="transition-transform duration-500 group-hover/contact:translate-x-1.5">
                              →
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
