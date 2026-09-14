"""
Computes rendered text contrast from the frames captured by
scripts/visual-contrast.mjs.

Background comes from the SCREENSHOT — the most common colour inside the
element's box, which is the surface behind the glyphs whatever produced it:
gradient, card, image, or an ancestor's blur. Foreground comes from the
COMPUTED colour, composited through the element's cumulative ancestor opacity.

Mixing the two sources is deliberate. Reading the foreground from pixels means
measuring anti-aliased edges, which understates contrast badly at 10-12px and
produces failures that are not real. Reading the background from CSS cannot see
gradients at all. Each value is taken from the source that actually knows it.

Requires: pip install opencv-python numpy
Usage:    python scripts/visual-contrast.py [.contrast]
"""

import json
import os
import re
import sys

import cv2
import numpy as np

# Windows consoles default to cp1252 and the page uses arrows and dashes.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

OUT = sys.argv[1] if len(sys.argv) > 1 else ".contrast"


def srgb_lum(rgb):
    c = np.array(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return float(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])


def ratio(fg, bg):
    a, b = srgb_lum(fg), srgb_lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def parse_css_color(value):
    m = re.match(r"rgba?\(([^)]+)\)", value or "")
    if not m:
        return None, 1.0
    parts = [p.strip() for p in m.group(1).replace("/", " ").split(",")]
    if len(parts) == 1:
        parts = m.group(1).split()
    nums = []
    for p in parts[:4]:
        p = p.strip()
        nums.append(float(p[:-1]) / 100 if p.endswith("%") else float(p))
    if len(nums) < 3:
        return None, 1.0
    alpha = nums[3] if len(nums) > 3 else 1.0
    return (nums[0], nums[1], nums[2]), alpha


def dominant_color(region):
    """
    The surface the glyphs sit on.

    Median, not mode. A gradient surface spreads its pixels across many
    quantisation bins while a small uniform patch — the dark corners outside a
    rounded pill, say — forms a single bin and wins the vote, which reported
    gold badges as black. Text is a minority of any box, so the median lands on
    the surface either way.
    """
    return np.median(region.reshape(-1, 3), axis=0)


def extreme_color(region, bg_bgr):
    """
    For gradient-clipped text, where there is no usable computed colour.

    Glyph pixels are split into those darker than the background and those
    lighter, and the larger group wins. Simply taking the pixels furthest from
    the background latched onto the brushed-metal highlights on the silver
    ground rather than the letterforms.
    """
    flat = region.reshape(-1, 3).astype(np.float64)
    d = np.abs(flat - bg_bgr).max(axis=1)
    if d.max() < 12:
        return None
    glyph = flat[d >= max(18, d.max() * 0.45)]
    if len(glyph) < 8:
        return None
    bg_l = bg_bgr.mean()
    darker = glyph[glyph.mean(axis=1) < bg_l]
    lighter = glyph[glyph.mean(axis=1) >= bg_l]
    pick = darker if len(darker) >= len(lighter) else lighter
    return np.median(pick, axis=0) if len(pick) else None


def required(font_size, weight):
    """WCAG: large text is >=24px, or >=18.66px when bold."""
    try:
        w = int(weight)
    except (TypeError, ValueError):
        w = 700 if weight in ("bold", "bolder") else 400
    large = font_size >= 24 or (font_size >= 18.66 and w >= 700)
    return 3.0 if large else 4.5


manifest = json.load(open(os.path.join(OUT, "manifest.json"), encoding="utf-8"))
rows, checked, skipped = [], 0, 0

for tag in manifest:
    meta = json.load(open(os.path.join(OUT, f"{tag}.json"), encoding="utf-8"))
    img = cv2.imread(os.path.join(OUT, f"{tag}.png"))
    if img is None:
        continue

    for box in meta["boxes"]:
        if box.get("decorative") or box.get("progressive") or box.get("occluded"):
            continue
        # Mid-animation or not yet revealed. Contrast against a surface you
        # cannot see is not a defect, and measuring it buries the real ones.
        if float(box.get("opacity", 1.0)) < 0.12:
            skipped += 1
            continue
        x, y, w, h = box["x"], box["y"], box["w"], box["h"]
        y2, x2 = min(y + h, img.shape[0]), min(x + w, img.shape[1])
        if y2 - y < 6 or x2 - x < 6:
            continue

        region = img[y:y2, x:x2]
        # Background is sampled from a PADDED box. In a tight box around a
        # small dense glyph (a bullet, a separator) the glyph itself is the
        # most common colour, and the background estimate collapses onto it.
        pad = 0 if box.get("hasOwnBg") else max(6, int((y2 - y) * 0.6))
        py1, py2 = max(0, y - pad), min(img.shape[0], y2 + pad)
        px1, px2 = max(0, x - pad), min(img.shape[1], x2 + pad)
        bg_bgr = dominant_color(img[py1:py2, px1:px2])
        bg_rgb = (bg_bgr[2], bg_bgr[1], bg_bgr[0])

        if box.get("gradientText"):
            fg_bgr = extreme_color(region, bg_bgr)
            if fg_bgr is None:
                skipped += 1
                continue
            fg_rgb = (fg_bgr[2], fg_bgr[1], fg_bgr[0])
        else:
            rgb, alpha = parse_css_color(box.get("color"))
            if rgb is None or alpha < 0.05:
                # Fully transparent colour with no gradient behind it: nothing
                # is being painted here.
                skipped += 1
                continue
            # Composite the text over its measured background using both the
            # colour's own alpha and every ancestor opacity above it.
            a = max(0.0, min(1.0, alpha * float(box.get("opacity", 1.0))))
            fg_rgb = tuple(rgb[i] * a + bg_rgb[i] * (1 - a) for i in range(3))

        r = ratio(fg_rgb, bg_rgb)
        need = required(box["fontSize"], box["fontWeight"])
        checked += 1
        if r < need:
            rows.append(
                {
                    "device": meta["device"],
                    "tone": box["tone"],
                    "text": box["text"],
                    "cls": box["cls"],
                    "size": box["fontSize"],
                    "opacity": round(float(box.get("opacity", 1)), 2),
                    "ratio": round(r, 2),
                    "need": need,
                    "fg": "#%02x%02x%02x" % tuple(int(v) for v in fg_rgb),
                    "bg": "#%02x%02x%02x" % tuple(int(v) for v in bg_rgb),
                    "frame": tag,
                }
            )

print(f"measured {checked} rendered text elements ({skipped} skipped)\n")
if not rows:
    print("PASS - every rendered text element meets its WCAG threshold")
    sys.exit(0)

seen, uniq = set(), []
for r in sorted(rows, key=lambda r: r["ratio"]):
    key = (r["device"], r["text"][:26], r["cls"][:46])
    if key in seen:
        continue
    seen.add(key)
    uniq.append(r)

print(f"{len(uniq)} distinct failing elements\n")
print(
    f"{'dev':<8}{'ratio':>6}{'need':>5}{'op':>6}  {'fg':<9}{'bg':<9}"
    f"{'tone':<8}{'px':>4}  text"
)
for r in uniq:
    print(
        f"{r['device']:<8}{r['ratio']:>6}{r['need']:>5}{r['opacity']:>6}  "
        f"{r['fg']:<9}{r['bg']:<9}{r['tone']:<8}{int(r['size']):>4}  {r['text'][:38]}"
    )
    print(f"{'':<8}{r['frame']}  .{r['cls'][:76]}")
sys.exit(1)
