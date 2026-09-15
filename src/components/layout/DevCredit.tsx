import Image from "next/image";

/**
 * Developer credit, pinned to the bottom of the viewport for the life of the
 * page.
 *
 * Deliberately NOT part of `Footer`: the footer only exists at the very end of
 * a long scroll, and the credit is meant to stay reachable from anywhere on
 * the page, including after scrolling back up.
 *
 * Positioning notes:
 * - `fixed` is safe here because Lenis drives native scroll rather than
 *   transforming a wrapper — the same reason `Nav` can be fixed.
 * - z-40 keeps it under the nav (z-50) and under the loading screen (z-100),
 *   so neither has to know about it.
 * - The outer strip is `pointer-events-none` so it never swallows clicks on
 *   whatever scrolls beneath it; only the pill itself takes the pointer.
 */
export function DevCredit() {
  return (
    <div
      className="pointer-events-none shell-gutter fixed inset-x-0 bottom-0 z-40 flex justify-end"
      style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="https://ajaydanieltrevor.com"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Developed by Ajay Daniel Trevor — visit portfolio"
        className="border-line bg-surface/65 ctx-on-dark group pointer-events-auto flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 backdrop-blur-xl transition-colors duration-300 hover:bg-surface/85"
      >
        <span className="flex flex-col leading-tight">
          {/*
            The name is the part that can go: on a phone the link alone still
            carries the credit, and a full second line would crowd the bar.
          */}
          <span className="text-steel-400 hidden text-[9px] tracking-[0.28em] uppercase sm:block">
            Developed by Ajay Daniel Trevor
          </span>
          <span className="text-gold-300 group-hover:text-gold-100 text-[10px] tracking-[0.18em] transition-colors duration-300 sm:text-[11px]">
            ajaydanieltrevor.com
          </span>
        </span>

        <span className="ring-gold-300/40 relative h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1">
          <Image
            src="/developer.webp"
            alt=""
            fill
            sizes="28px"
            className="object-cover"
          />
        </span>
      </a>
    </div>
  );
}
