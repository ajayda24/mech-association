"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLenisRef } from "@/components/providers/SmoothScroll";
import { Logo } from "@/components/layout/Logo";
import { navCta, navLinks, site } from "@/content/site";

/** Height of the floating nav, used as the scroll-to offset. */
const NAV_OFFSET = -96;

/** `#section` scrolls within the landing page; anything else is a route. */
const isAnchor = (href: string) => href.startsWith("#");

/**
 * One nav item. Renders a Next `Link` for anything that navigates so route
 * changes stay client-side, and a plain anchor for same-page scrolling, which
 * Lenis handles itself.
 */
function NavItem({
  href,
  onClick,
  className,
  children,
  ...rest
}: {
  href: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
} & React.AriaAttributes) {
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function Nav() {
  const lenisRef = useLenisRef();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  /**
   * The nav is fixed, so it floats over sections of every tone while its own
   * colours stay put — on a silver section the chrome wordmark was rendering
   * light-on-light and disappearing. This tracks whichever section is under
   * the bar and swaps the nav's text context to match.
   */
  const [onLight, setOnLight] = useState(false);

  /**
   * Where an item actually points FROM THE CURRENT PAGE.
   *
   * `#about` is a scroll target on the landing page, but from /alumni there is
   * no such element to scroll to — it has to become a real navigation to
   * `/#about` instead, or the click does nothing at all.
   */
  const resolve = useCallback(
    (href: string) => (isAnchor(href) && !isHome ? `/${href}` : href),
    [isHome],
  );

  const go = useCallback(
    (href: string) => (event: React.MouseEvent) => {
      setOpen(false);
      // Routes, and anchors pointing at another page, are left to Next's
      // router: intercepting them would cancel the navigation.
      if (!isAnchor(href) || !isHome) return;

      event.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, {
          offset: NAV_OFFSET,
          duration: 1.4,
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenisRef, isHome],
  );

  // Highlight whichever section currently owns the upper third of the viewport.
  useEffect(() => {
    // Anchors only. A route link like "/alumni" has no section on this page,
    // and slicing it would look for an element with id "alumni" on every page.
    const ids = navLinks
      .filter((l) => isAnchor(l.href))
      .map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Sample the tone of whatever section sits under the bar.
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tone]"),
    );
    if (!sections.length) return;

    /** Vertical line, in px from the top, that the nav occupies. */
    const SAMPLE_Y = 44;
    let raf = 0;

    const sample = () => {
      raf = 0;
      const hit = sections.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= SAMPLE_Y && r.bottom > SAMPLE_Y;
      });
      const light = hit?.dataset.tone === "silver";
      setOnLight((prev) => (prev === light ? prev : light));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Lock Lenis while the mobile sheet is open.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenisRef]);

  return (
    <>
      {/*
        The bar keeps its own surface at EVERY breakpoint. It used to go
        transparent from `lg`, which left it sitting directly on whatever
        scrolled under it — and since it colours itself from the section's
        tone, a dark photo inside a light section gave dark text on dark.
        Its own background removes the dependency entirely.
        Top padding respects the safe-area inset so it clears notches and the
        status bar rather than hugging the screen edge.
      */}
      <header
        className="pointer-events-none shell-gutter fixed inset-x-0 top-0 z-50"
        style={{ paddingTop: "max(1.35rem, env(safe-area-inset-top))" }}
      >
        <nav
          className={`border-line pointer-events-auto mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border py-2 pr-2 pl-3 backdrop-blur-xl transition-colors duration-500 ${
            onLight ? "ctx-on-light bg-white/70" : "ctx-on-dark bg-surface/65"
          }`}
        >
          <Logo size={30} />

          {/* Centered pill group — the reference's signature nav treatment. */}
          {/* Keeps its own dark surface at every tone, so it keeps the dark
              context too — inheriting the nav's light context here would put
              dark link text on a dark pill. */}
          <ul className="border-line bg-surface/92 ctx-on-dark absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl lg:flex">
            {navLinks.map((link) => {
              const isActive = isAnchor(link.href)
                ? isHome && active === link.href
                : pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <NavItem
                    href={resolve(link.href)}
                    onClick={go(link.href)}
                    className={`relative block rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-gold-200"
                        : "text-steel-300 hover:text-ink"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 34,
                        }}
                        className="bg-surface-2 ring-line-strong absolute inset-0 -z-10 rounded-full ring-1"
                      />
                    )}
                    {link.label}
                  </NavItem>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            {/* <NavItem
              href={resolve(navSecondary.href)}
              onClick={go(navSecondary.href)}
              className="text-steel-400 hover:text-ink hidden px-3 text-[13px] font-medium transition-colors duration-300 sm:block"
            >
              {navSecondary.label}
            </NavItem> */}
            <NavItem
              href={resolve(navCta.href)}
              onClick={go(navCta.href)}
              className="btn-gold rounded-full px-3.5 py-2 text-xs font-semibold transition-shadow duration-300 hover:shadow-[0_0_30px_-4px_rgba(217,175,78,0.5)] sm:px-4 sm:text-[13px]"
            >
              {/* full label needs room; phones get the short form */}
              <span className="hidden sm:inline">{navCta.label}</span>
              <span className="sm:hidden">{navCta.label}</span>
            </NavItem>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="border-line-strong text-ink grid h-9 w-9 shrink-0 place-items-center rounded-full border lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`bg-ink absolute left-0 h-px w-full transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0.5"
                  }`}
                />
                <span
                  className={`bg-ink absolute left-0 h-px w-full transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-2.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            // Lenis is stopped while this is open; let the sheet scroll itself
            // on short phones.
            data-lenis-prevent
            className="ctx-on-dark bg-void/96 fixed inset-0 z-40 overflow-y-auto backdrop-blur-2xl lg:hidden"
          >
            {/* warm bloom in the corner + a faint machined grid */}
            <div className="glow-gold pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] opacity-70" />
            <div className="texture-knurl pointer-events-none absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
            {/* gold hairline down the left edge, drawn in on open */}
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute top-0 bottom-0 left-[clamp(0.6rem,2.5vw,2.5rem)] w-px origin-top bg-gradient-to-b from-transparent via-gold-400/60 to-transparent"
            />

            <div
              className="shell-gutter relative flex min-h-full flex-col pb-[calc(max(1.75rem,env(safe-area-inset-bottom))+4rem)]"
              style={{ paddingTop: "calc(max(1.35rem, env(safe-area-inset-top)) + 5.5rem)" }}
            >
              <motion.p
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="text-gold-400 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] uppercase"
              >
                <span className="bg-gold-400 h-px w-8" />
                Menu
              </motion.p>

              <ul className="mt-6 flex-1">
                {[...navLinks].map((link, i) => {
                  const isActive = isAnchor(link.href)
                    ? isHome && active === link.href
                    : pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.06 * i + 0.1,
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="border-line border-b"
                    >
                      <NavItem
                        href={resolve(link.href)}
                        onClick={go(link.href)}
                        aria-current={isActive ? "location" : undefined}
                        className="group flex items-baseline gap-4 py-3"
                      >
                        <span className="text-gold-500 w-6 shrink-0 text-[11px] font-medium tracking-[0.16em] tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`text-display flex-1 text-[clamp(2rem,9.5vw,3.25rem)] transition-colors duration-300 ${
                            isActive
                              ? "text-gilt"
                              : "text-ink group-hover:text-gold-200"
                          }`}
                        >
                          {link.label}
                        </span>
                        <span
                          className={`self-center text-lg transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 ${
                            isActive
                              ? "text-gold-300 translate-x-0 opacity-100"
                              : "text-gold-300 -translate-x-2 opacity-40"
                          }`}
                        >
                          →
                        </span>
                      </NavItem>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <NavItem
                  href={resolve(navCta.href)}
                  onClick={go(navCta.href)}
                  className="btn-gold flex items-center justify-between rounded-full py-3.5 pr-2 pl-6 text-sm font-semibold shadow-[0_18px_40px_-18px_rgba(217,175,78,0.7)]"
                >
                  {navCta.label}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black/85 text-gold-200">
                    →
                  </span>
                </NavItem>

                {/* <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-ink-faint text-[10px] tracking-[0.24em] uppercase">
                      Write to us
                    </p>
                    <a
                      href={`mailto:${site.email}`}
                      className="text-ink hover:text-gold-200 mt-1.5 block text-sm transition-colors duration-300"
                    >
                      {site.email}
                    </a>
                  </div>
                  <ul className="flex gap-4">
                    {site.social.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          className="text-steel-400 hover:text-gold-300 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors duration-300"
                        >
                          {s.label.slice(0, 2)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div> */}

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
