/**
 * Captures what the page actually renders, for contrast measurement.
 *
 * Per scroll position it saves one screenshot plus, for every on-screen text
 * element, its box and its EFFECTIVE colour — the computed colour composited
 * through the cumulative opacity of its ancestors. That last part matters:
 * scroll-driven fades and entrance animations change what a person sees, and
 * a token-level audit cannot account for them.
 *
 * The background is measured from the screenshot pixels (see
 * scripts/visual-contrast.py), so gradients, card surfaces and images are all
 * handled. A single frame is used per position rather than an A/B pair,
 * because the marquee, the gear and the floating parts keep moving between two
 * captures and that motion registers as false text.
 *
 * Run: npm run check:contrast
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.URL ?? "http://localhost:3000/";
const OUT = process.env.OUT ?? "./.contrast";

const DEVICES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const manifest = [];

for (const device of DEVICES) {
  const page = await browser.newPage({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: 1,
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  // Let the loading screen run and the hero entrance settle.
  await page.waitForTimeout(7000);

  const docHeight = await page.evaluate(() => {
    window.scrollTo(0, 0);
    return document.documentElement.scrollHeight;
  });

  // Walk the page once so every scroll-triggered reveal fires; they are
  // `once: true`, so content stays visible afterwards.
  for (let y = 0; y < docHeight; y += device.height * 0.5) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(600);

  const step = Math.round(device.height * 0.8);
  const positions = [];
  for (let y = 0; y < docHeight - device.height * 0.4; y += step) {
    positions.push(Math.round(y));
  }

  for (const [i, y] of positions.entries()) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    // Long enough for the stepped panel swaps to settle; capturing mid-swap
    // measures a transitional opacity that nobody actually reads at.
    await page.waitForTimeout(1000);

    const boxes = await page.evaluate(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const out = [];

      /** Product of every ancestor's opacity, including the element's own. */
      const chainOpacity = (node) => {
        let o = 1;
        for (
          let n = node;
          n && n !== document.documentElement;
          n = n.parentElement
        ) {
          const v = parseFloat(getComputedStyle(n).opacity);
          if (!Number.isNaN(v)) o *= v;
        }
        return o;
      };

      // Every fixed overlay on the page, measured once per frame.
      const fixedRects = [];
      document.querySelectorAll("body *").forEach((n) => {
        if (getComputedStyle(n).position === "fixed") {
          const fr = n.getBoundingClientRect();
          if (fr.width > 0 && fr.height > 0) fixedRects.push(fr);
        }
      });
      /** True when the element is part of an overlay rather than under one. */
      const inFixed = (node) => {
        for (let n = node; n && n !== document.body; n = n.parentElement) {
          if (getComputedStyle(n).position === "fixed") return true;
        }
        return false;
      };

      const walk = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
      );
      let el = walk.currentNode;
      while (el) {
        const ownText = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join(" ")
          .trim();

        if (ownText.length > 0) {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const onScreen =
            r.width > 6 &&
            r.height > 6 &&
            r.bottom > 0 &&
            r.top < vh &&
            r.right > 0 &&
            r.left < vw &&
            cs.visibility !== "hidden";

          if (onScreen) {
            /*
             * Clipped-gradient text sets `color: transparent` and paints
             * through background-image. Descendants INHERIT that transparent
             * colour without inheriting the clip, so the check has to look up
             * the tree or those spans measure as invisible.
             */
            let clipped = false;
            for (let n = el; n && n !== document.body; n = n.parentElement) {
              const p = getComputedStyle(n);
              if ((p.webkitBackgroundClip || p.backgroundClip) === "text") {
                clipped = true;
                break;
              }
            }
            out.push({
              x: Math.max(0, Math.round(r.left)),
              y: Math.max(0, Math.round(r.top)),
              w: Math.round(Math.min(r.width, vw - r.left)),
              h: Math.round(Math.min(r.height, vh - r.top)),
              tag: el.tagName.toLowerCase(),
              cls: (el.className?.baseVal ?? el.className ?? "")
                .toString()
                .slice(0, 120),
              text: ownText.replace(/\s+/g, " ").slice(0, 44),
              color: cs.color,
              opacity: chainOpacity(el),
              // Gradient-clipped text has no usable computed colour; its
              // appearance has to be read from the pixels instead.
              gradientText: clipped,
              // Pills and buttons paint their own surface; sampling past
              // their edge measures whatever they are sitting on instead.
              hasOwnBg:
                cs.backgroundImage !== "none" ||
                !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor),
              fontSize: parseFloat(cs.fontSize),
              fontWeight: cs.fontWeight,
              tone: el.closest("[data-tone]")?.getAttribute("data-tone") ?? "-",
              // Watermarks and drawing furniture are meant to sit at the edge
              // of perception; a text threshold says nothing about them.
              decorative:
                el.closest('[aria-hidden="true"]') !== null ||
                cs.userSelect === "none",
              // A scroll-driven reveal that is deliberately part-way through.
              progressive: el.closest("[data-progressive]") !== null,
              // Covered, wholly or partly, by a fixed overlay - in practice
              // the nav bar that content scrolls beneath. Any overlap makes
              // the sampled background the overlay's, not the page's.
              occluded:
                !inFixed(el) &&
                fixedRects.some((f) => {
                  const m = Math.min(40, r.height * 0.6);
                  return !(
                    r.right + m < f.left ||
                    r.left - m > f.right ||
                    r.bottom + m < f.top ||
                    r.top - m > f.bottom
                  );
                }),
            });
          }
        }
        el = walk.nextNode();
      }
      return out;
    });

    if (!boxes.length) continue;

    const tag = `${device.name}-${String(i).padStart(2, "0")}`;
    await page.screenshot({ path: join(OUT, `${tag}.png`) });
    writeFileSync(
      join(OUT, `${tag}.json`),
      JSON.stringify({ device: device.name, scrollY: y, boxes }, null, 0),
    );
    manifest.push(tag);
  }

  await page.close();
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 0));
await browser.close();
console.log(`captured ${manifest.length} frames -> ${OUT}`);
