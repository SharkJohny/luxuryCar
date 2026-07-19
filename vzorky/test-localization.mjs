import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import * as esbuild from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(ROOT, "..", "assets", "js", "vzorky-konfigurator", "index.js");
const built = await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  format: "iife",
  globalName: "__VZ__",
  write: false,
});

const ids = ["D-1", "S-1", "H-1", "LUX-10"];
const rows = ids.map((id, i) => `
  <tr class="surcharge-list"><th>${id}</th><td>
    <select class="surcharge-parameter" data-parameter-name="${id}" name="surchargeParameterValueId[${i + 1}]">
      <option value="">Vyberte příplatek</option>
      <option value="no-${id}" data-surcharge-final-price="0">Nechci +0 Kč</option>
      <option value="yes-${id}" data-surcharge-final-price="99">Chci – vratná záloha 99 Kč +99 Kč</option>
    </select>
  </td></tr>`).join("");

const dom = new JSDOM(`<!doctype html><html lang="cs"><body>
  <div class="p-info-wrapper"><form><input name="language" value="cs">
    <table><tbody>${rows}</tbody></table>
    <button type="submit">Přidat do košíku</button>
  </form></div>
</body></html>`, {
  url: "https://www.luxurycardesign.cz/vzorkovnik-dragonskin---objednavka-vzorku/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});

const script = dom.window.document.createElement("script");
script.textContent = built.outputFiles[0].text;
dom.window.document.body.appendChild(script);
dom.window.__VZ__.mountVzorkyConfigurator();
await new Promise((resolve) => setTimeout(resolve, 30));

const doc = dom.window.document;
const root = doc.getElementById("lcd-vzorky-root");
const fail = (message) => { console.error(`✗ ${message}`); process.exitCode = 1; };
const ok = (message) => console.log(`✓ ${message}`);

if (root && root.querySelectorAll(".lcd-vz-acc").length === 4) ok("český konfigurátor vykreslil 4 série");
else fail("český konfigurátor nevykreslil 4 série");

const initialText = root ? root.textContent : "";
if (initialText.includes("99 Kč") && initialText.includes("Pokračovat") && initialText.includes("Tvoje objednávka vzorků"))
  ok("české texty a cena 99 Kč jsou zobrazené");
else fail("chybí české texty nebo cena 99 Kč");
if (!initialText.includes("5 €") && !initialText.includes("Pokračovať") && !initialText.includes("Nechcem"))
  ok("česká verze neobsahuje slovenské/eurové texty");
else fail("česká verze stále obsahuje slovenské/eurové texty");

const d1 = root && root.querySelector('.lcd-vz-swatch[data-id="D-1"]');
if (d1 && d1.title.includes("Černá prošívaná červenou")) ok("název barvy je česky");
else fail("název barvy není česky");

d1.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await new Promise((resolve) => setTimeout(resolve, 20));
const select = doc.querySelector('select[data-parameter-name="D-1"]');
const count = root.querySelector(".lcd-vz-recap-count").textContent.trim();
const total = root.querySelector(".lcd-vz-recap-total").textContent.trim();
if (select.value === "yes-D-1" && count === "1 vzorek" && total === "99 Kč")
  ok("výběr používá český parametr a rekapitulace počítá 99 Kč");
else fail(`český výběr je chybný: value=${select.value}, count=${count}, total=${total}`);

console.log(process.exitCode ? "\nVÝSLEDEK: FAIL" : "\nVÝSLEDEK: OK");
