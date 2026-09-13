"use client";

import { Stagger, StaggerItem } from "@/components/motion/ScrollReveal";
import { years } from "@/content/site";

/**
 * The four undergraduate years the association spans. Deliberately plain —
 * it's a rhythm break between the heavier sections.
 */
export function Years() {
  return (
    <div className="shell-gutter py-14 sm:py-20 lg:py-[clamp(3.5rem,9vh,6rem)]">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-gold-300 mb-8 text-[11px] font-semibold tracking-[0.24em] uppercase">
          Four years, one association
        </p>

        <Stagger
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 lg:grid-cols-4"
          stagger={0.09}
        >
          {years.map((y) => (
            <StaggerItem key={y.year} className="group">
              <div className="border-line relative h-full border-t pt-6 transition-colors duration-500 hover:border-[color:var(--color-gold-400)]">
                <span className="text-display text-chrome block text-5xl leading-none transition-transform duration-700 group-hover:-translate-y-1">
                  {y.year}
                </span>
                <h3 className="text-ink mt-4 text-sm font-semibold tracking-[0.12em] uppercase">
                  {y.label}
                </h3>
                <p className="text-steel-400 mt-2 text-sm leading-relaxed">
                  {y.note}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
