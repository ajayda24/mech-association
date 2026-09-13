"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useLenisRef } from "@/components/providers/SmoothScroll";
import { Logo } from "@/components/layout/Logo";
import { navCta, navLinks, navSecondary } from "@/content/site";

/** Height of the floating nav, used as the scroll-to offset. */
const NAV_OFFSET = -96;

export function Nav() {
  const lenisRef = useLenisRef();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  const go = useCallback(
    (href: string) => (event: React.MouseEvent) => {
      event.preventDefault();
      setOpen(false);
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
    [lenisRef],
  );

  // Highlight whichever section currently owns the upper third of the viewport.
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
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
        Two different navs in one. On phones it's a self-contained floating bar
        with its own surface, so it stays legible as content scrolls beneath —
        previously it was transparent and collided with whatever passed under
        it. From `lg` the bar dissolves and the centred pill group takes over.
        Top padding respects the safe-area inset so it clears notches and the
        status bar rather than hugging the screen edge.
      */}
      <header
        className="pointer-events-none shell-gutter fixed inset-x-0 top-0 z-50"
        style={{ paddingTop: "max(1.35rem, env(safe-area-inset-top))" }}
      >
        <nav className="border-line bg-surface/65 pointer-events-auto mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border py-2 pr-2 pl-3 backdrop-blur-xl lg:border-transparent lg:bg-transparent lg:p-0 lg:pt-3 lg:backdrop-blur-none">
          <Logo size={30} />

          {/* Centered pill group — the reference's signature nav treatment. */}
          <ul className="border-line bg-surface/70 absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border p-1.5 backdrop-blur-xl lg:flex">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href} className="relative">
                  <a
                    href={link.href}
                    onClick={go(link.href)}
                    className={`relative block rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-gold-200"
                        : "text-steel-400 hover:text-ink"
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
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={navSecondary.href}
              onClick={go(navSecondary.href)}
              className="text-steel-400 hover:text-ink hidden px-3 text-[13px] font-medium transition-colors duration-300 sm:block"
            >
              {navSecondary.label}
            </a>
            <a
              href={navCta.href}
              onClick={go(navCta.href)}
              className="from-gold-200 to-gold-500 hover:shadow-gold-500/25 rounded-full bg-gradient-to-b px-3.5 py-2 text-xs font-semibold text-black transition-shadow duration-300 hover:shadow-[0_0_30px_-4px] sm:px-4 sm:text-[13px]"
            >
              {/* full label needs room; phones get the short form */}
              <span className="hidden sm:inline">{navCta.label}</span>
              <span className="sm:hidden">Join</span>
            </a>
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
            transition={{ duration: 0.3 }}
            className="bg-void/95 fixed inset-0 z-40 backdrop-blur-2xl lg:hidden"
          >
            <ul className="shell-gutter flex h-full flex-col justify-center gap-1">
              {[...navLinks, navSecondary].map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 * i + 0.08,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <a
                    href={link.href}
                    onClick={go(link.href)}
                    className="text-display text-ink hover:text-gold-200 block py-2 text-[clamp(2.25rem,11vw,3.5rem)] transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
