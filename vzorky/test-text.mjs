/* test-text.mjs — dôkaz, že \uXXXX escapy sa za behu dekódujú na správnu
 * slovenskú diakritiku v renderovanom DOM (žiadne mojibake). */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(ROOT, "dist", "vzorky-shoptet.html"), "utf8");
const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`, { runScripts: "dangerously", pretendToBeVisual: true });
await new Promise((r) => setTimeout(r, 600));
const txt = dom.window.document.getElementById("lcd-vzorky-root").textContent;

const probes = [
  "Vzorka 2. vrstvy",
  "Tvoja objednávka vzoriek",
  "Vratná záloha",
  "Pridať do košíka",
  "Prečo Dragonskin",
  "prešívan", // "prešívan"
];
let fail = false;
for (const p of probes) {
  const ok = txt.includes(p);
  if (!ok) fail = true;
  console.log((ok ? "✓" : "✗") + " obsahuje: " + p);
}
// typické mojibake artefakty (UTF-8 čítané ako Latin-1)
const bad = ["Ã", "â¬", "Â", "preÅ¡Ã"];
const found = bad.filter((b) => txt.includes(b));
if (found.length) { fail = true; console.log("✗ MOJIBAKE: " + found.join(",")); }
else console.log("✓ ziadne mojibake artefakty v renderovanom texte");

console.log(fail ? "\nVYSLEDOK: FAIL" : "\nVYSLEDOK: OK");
process.exitCode = fail ? 1 : 0;
