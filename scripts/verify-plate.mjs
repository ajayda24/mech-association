/**
 * Checks that the exploded gear plate never leaves its viewBox, at any scroll
 * position, in either orientation.
 *
 * Imports the same config the component renders from, so this can't drift.
 * Run: npm run verify:plate
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../src/components/visuals/plate-config.ts");

// Transpile the TS config module in-memory, then evaluate it.
const js = ts.transpileModule(readFileSync(src, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

const mod = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);

const { LANDSCAPE_PLATE, PORTRAIT_PLATE, frameExtents, viewBoxHalfExtents } = mod;

const STEPS = 60;
let failures = 0;

for (const [name, cfg] of [
  ["landscape", LANDSCAPE_PLATE],
  ["portrait", PORTRAIT_PLATE],
]) {
  const limit = viewBoxHalfExtents(cfg.viewBox);
  let worstTop = 0;
  let worstBottom = 0;
  let worstRight = 0;
  const bad = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const { top, bottom, right } = frameExtents(cfg, t);
    worstTop = Math.min(worstTop, top);
    worstBottom = Math.max(worstBottom, bottom);
    worstRight = Math.max(worstRight, right);
    if (top < -limit.y || bottom > limit.y || right > limit.x) {
      bad.push({ t, top, bottom, right });
    }
  }

  const ok = bad.length === 0;
  if (!ok) failures++;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name.padEnd(10)} ` +
      `viewBox +/-${limit.x} x +/-${limit.y}  |  ` +
      `worst top ${worstTop.toFixed(0)}, bottom ${worstBottom.toFixed(0)}, right ${worstRight.toFixed(0)}`,
  );

  for (const b of bad.slice(0, 5)) {
    console.log(
      `        clipped at t=${b.t.toFixed(2)}: ` +
        `top ${b.top.toFixed(0)} bottom ${b.bottom.toFixed(0)} right ${b.right.toFixed(0)}`,
    );
  }
}

if (failures) {
  console.error(`\n${failures} orientation(s) clip. Adjust plate-config.ts.`);
  process.exit(1);
}
console.log("\nAll orientations stay inside the frame across the full scroll.");
