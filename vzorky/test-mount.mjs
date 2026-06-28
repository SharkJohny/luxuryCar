/* test-mount.mjs — overí, že vygenerovaný blok sa namountuje v reálnom DOM
 * (jsdom) bez runtime chýb a vyrenderuje očakávaný obsah. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(ROOT, "dist", "vzorky-shoptet.html"), "utf8");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message + (e.detail ? " :: " + e.detail : "")));

const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
});

// React 18 createRoot plánuje cez microtask/rAF — počkaj na flush.
await new Promise((r) => setTimeout(r, 600));

const { window } = dom;
const doc = window.document;
const root = doc.getElementById("lcd-vzorky-root");

const fail = (m) => { console.error("✗ " + m); process.exitCode = 1; };
const ok = (m) => console.log("✓ " + m);

if (errors.length) fail("runtime chyby: " + errors.join(" | "));
else ok("žiadne runtime chyby pri mounte");

if (window.React && window.ReactDOM) ok("React + ReactDOM inline globály prítomné");
else fail("React/ReactDOM globály chýbajú");

if (root && root.children.length > 0) ok(`#lcd-vzorky-root namountovaný (${root.children.length} child)`);
else fail("#lcd-vzorky-root je prázdny — komponent sa nenamountoval");

// Swatche = tlačidlá s aria-label vnútri akordeónov
const swatches = root ? root.querySelectorAll('button[aria-pressed]') : [];
if (swatches.length >= 40) ok(`vyrenderovaných ${swatches.length} interaktívnych swatchov/tlačidiel`);
else fail(`málo swatchov: ${swatches.length} (čakal ≥40)`);

// Obrázky musia byť base64, nie relatívne cesty
const imgs = root ? [...root.querySelectorAll("img")] : [];
const nonData = imgs.filter((i) => i.getAttribute("src") && !i.getAttribute("src").startsWith("data:"));
if (imgs.length > 0 && nonData.length === 0) ok(`všetkých ${imgs.length} <img> má data: URI (0 externých)`);
else fail(`externé/relatívne obrázky: ${nonData.length}/${imgs.length}`);

// API pre logiku objednávky
const api = window.__LCD_API__;
if (api && typeof api.orderSummary === "function") {
  const sum = api.orderSummary(new Set(["D-1", "S-2", "LUX-10", "LUX-01"]));
  // D-1 + S-2 + LUX-10 objednávateľné (3), LUX-01 nie → 3 × 5 € = 15 €
  if (sum.count === 3 && sum.total === 15) ok(`orderSummary OK: ${sum.count} vzorky = ${sum.total} €`);
  else fail(`orderSummary zle: count=${sum.count} total=${sum.total} (čakal 3 / 15)`);
} else fail("window.__LCD_API__.orderSummary chýba");

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
