import Link from "next/link";
import { navLinks, navSecondary, site } from "@/content/site";

/**
 * The footer renders on every route, so its in-page anchors have to be
 * root-relative: a bare "#about" points at nothing on /alumni. "/#about" is a
 * plain fragment scroll when already on the landing page and a navigation
 * from anywhere else, so one form covers both.
 */
const footerHref = (href: string) => (href.startsWith("#") ? `/${href}` : href);

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
              <Link
                href={footerHref(link.href)}
                className="text-steel-400 hover:text-ink text-sm transition-colors duration-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap items-center gap-6">
          {site.social.map((s) => {
            const Icon = socialIcons[s.label];
            return (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-steel-400 hover:text-gold-300 inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.18em] uppercase transition-colors duration-300"
                >
                  <Icon className="size-[18px] shrink-0" />
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-ink-faint mx-auto mt-10 max-w-[1400px] text-xs">
        © {new Date().getFullYear()} {site.longName}. {site.college}.
      </p>
    </footer>
  );
}

type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const socialIcons: Record<
  (typeof site.social)[number]["label"],
  (props: IconProps) => React.JSX.Element
> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
};
