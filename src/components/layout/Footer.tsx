import { navLinks, navSecondary, site } from "@/content/site";

/*
 * The bottom padding is deliberately larger than the top: the fixed developer
 * credit floats over the bottom-right of the viewport, and at the end of the
 * scroll that is exactly where the copyright line sits. The gap keeps them off
 * each other.
 */
export function Footer() {
  return (
    <footer className="tone-pitch shell-gutter relative border-line border-t pt-10 pb-24 md:pb-20">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {[...navLinks, navSecondary].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-steel-400 hover:text-ink text-sm transition-colors duration-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap items-center gap-5">
          {site.social.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                aria-label={s.label}
                className="text-steel-400 hover:text-gold-300 text-xs font-medium tracking-[0.18em] uppercase transition-colors duration-300"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-ink-faint mx-auto mt-10 max-w-[1400px] text-xs">
        © {new Date().getFullYear()} {site.longName}. {site.college}.
      </p>
    </footer>
  );
}
