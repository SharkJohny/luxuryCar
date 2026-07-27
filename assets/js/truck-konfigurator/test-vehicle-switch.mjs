/* test-vehicle-switch.mjs — hlavný prepínač osobné vozidlá ↔ kamióny.
 *
 * Overuje initVehicleKindSwitch() z main.js (bez celého Shoptet bootstrapu):
 *   - prepínač sa vykreslí NAD riadok selectov,
 *   - default = osobáky (truck wrap skrytý),
 *   - klik na „Kamióny" prepne viditeľnosť a naplní značky z TRUCK_BRANDS,
 *   - výber značky naplní modely,
 *   - CTA bez výberu NEredirectuje (validácia), s výberom uloží session
 *     a pošle na TRUCK_PRODUCT_URL.
 *
 * Spustenie: node assets/js/truck-konfigurator/test-vehicle-switch.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import * as esbuild from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROOT, "..", "..", "..");
const fail = (m) => { console.error("✗ " + m); process.exitCode = 1; };
const ok = (m) => console.log("✓ " + m);

// Vytiahni len initVehicleKindSwitch + jeho import (main.js ako celok ťahá
// celý Shoptet bootstrap, ktorý v jsdom nedáva zmysel).
const mainSrc = readFileSync(join(REPO, "assets", "js", "main.js"), "utf8");
const start = mainSrc.indexOf("function initVehicleKindSwitch");
if (start < 0) { fail("initVehicleKindSwitch nenájdený v main.js"); process.exit(1); }
const end = mainSrc.indexOf("\nfunction saveModel", start);
const fnSrc = mainSrc.slice(start, end);

const entry = `
import { TRUCK_BRANDS, TRUCK_PRODUCT_URLS } from "${join(REPO, "assets/js/truck-konfigurator/truck-brands.js")}";
${fnSrc}
window.__initVehicleKindSwitch = initVehicleKindSwitch;
window.__TRUCK_BRANDS = TRUCK_BRANDS;
window.__TRUCK_URL = TRUCK_PRODUCT_URLS.sk;
`;

const built = await esbuild.build({
  stdin: { contents: entry, resolveDir: REPO, loader: "js" },
  bundle: true, format: "iife", write: false,
});

// jsdom nevie navigovať — pokus o navigáciu hlási ako jsdomError. To nám
// slúži ako dôkaz, že CTA naozaj redirectuje (a pri nevalidnom výbere nie).
const navAttempts = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => { if (/navigation/i.test(e.message)) navAttempts.push(e.message); });

const dom = new JSDOM(
  `<!DOCTYPE html><html lang="sk"><body class="in-index">
     <section id="model-selector"><div class="model-selector container">
       <div class="modl-selector-wrap"><div class="btn choice-Model">Zvoliť model</div></div>
     </div></section>
   </body></html>`,
  { url: "https://www.luxurycardesign.sk/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc },
);
const { window: win } = dom;
const doc = win.document;

// jQuery (bundle ho očakáva ako global $)
const jqSrc = readFileSync(join(REPO, "node_modules", "jquery", "dist", "jquery.js"), "utf8");
new win.Function("window", "document", jqSrc + "\nwindow.jQuery = window.$ = jQuery;").call(win, win, doc);
if (typeof win.$ !== "function") { fail("jQuery sa nenačítalo"); process.exit(1); }



new win.Function(built.outputFiles[0].text).call(win);

const container = win.$(".model-selector.container");
const choiceWrap = win.$(".modl-selector-wrap");
win.__initVehicleKindSwitch(container, choiceWrap);

const sw = doc.querySelector(".lcd-vehicle-switch");
if (!sw) { fail("prepínač sa nevykreslil"); process.exit(1); }
ok("prepínač vykreslený");

if (sw.nextElementSibling === choiceWrap[0]) ok("prepínač je NAD riadkom selectov");
else fail("prepínač nie je hneď pred .modl-selector-wrap");

const [btnCars, btnTrucks] = sw.querySelectorAll(".lcd-vehicle-switch__tab");
if (btnCars && btnCars.querySelector("svg") && btnTrucks.querySelector("svg")) ok("taby majú piktogramy (SVG)");
else fail("chýbajú SVG piktogramy v taboch");
const truckWrap = doc.querySelector(".lcd-truck-wrap");
if (!truckWrap) { fail("truck wrap nevykreslený"); process.exit(1); }

if (truckWrap.hidden && !choiceWrap[0].hidden) ok("default = osobáky (truck skrytý)");
else fail(`default zlý: truckHidden=${truckWrap.hidden} carsHidden=${choiceWrap[0].hidden}`);

const brandSel = truckWrap.querySelector(".truck-brands select");
const modelSel = truckWrap.querySelector(".truck-models select");
if (brandSel && modelSel) ok("kamiónové selecty v markup-e osobákov (surcharge-list dm-selector)");
else { fail("chýbajú native selecty"); process.exit(1); }

const brandCount = brandSel.querySelectorAll("option:not(.notselect)").length;
const expectBrands = Object.keys(win.__TRUCK_BRANDS).length;
if (brandCount === expectBrands) ok(`značky naplnené (${brandCount})`);
else fail(`značiek ${brandCount}, čakané ${expectBrands}`);

const click = (el) => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
click(btnTrucks);
if (!truckWrap.hidden && choiceWrap[0].hidden) ok("prepnutie na kamióny funguje");
else fail("prepnutie na kamióny neprepne viditeľnosť");
if (btnTrucks.classList.contains("is-active") && !btnCars.classList.contains("is-active")) ok("aktívny tab sa prepol (podčiarknutie)");
else fail("is-active tried nesedí");

click(btnCars);
if (truckWrap.hidden && !choiceWrap[0].hidden) ok("prepnutie späť na osobáky funguje");
else fail("prepnutie späť zlyhalo");
click(btnTrucks);

// CTA bez výberu → validácia (errorToCart), žiadny redirect
const cta = truckWrap.querySelector(".lcd-truck-go");
click(cta);
if (navAttempts.length === 0) ok("CTA bez výberu NEredirectuje (validácia)");
else fail("CTA redirectlo aj bez výberu");
if (truckWrap.querySelector(".truck-brands").classList.contains("errorToCart")) ok("validácia označí prázdnu značku (errorToCart)");
else fail("errorToCart sa nepridal");

// saveModel interferencia: simuluj neskorší globálny binding a over,
// že change na truck selecte ho NEspustí (stopImmediatePropagation).
let saveModelCalls = 0;
win.$(".surcharge-list select").on("change", function () { saveModelCalls++; });

// Výber značky → modely
const firstBrand = Object.keys(win.__TRUCK_BRANDS)[0];
win.$(brandSel).val(firstBrand).trigger("change");
if (saveModelCalls === 0) ok("truck change NEspúšťa globálny saveModel binding");
else fail("truck change pretiekol do saveModel bindingu");

const models = modelSel.querySelectorAll("option:not(.notselect)").length;
if (models === win.__TRUCK_BRANDS[firstBrand].length) ok(`modely pre "${firstBrand}" naplnené (${models})`);
else fail(`modelov ${models}, čakané ${win.__TRUCK_BRANDS[firstBrand].length}`);

// Kompletný výber → redirect + session
const firstModel = win.__TRUCK_BRANDS[firstBrand][0];
win.$(modelSel).val(firstModel);
click(cta);
if (navAttempts.length === 1) ok("CTA s výberom spustí redirect na truck konfigurátor");
else fail(`redirect zlyhal (pokusov: ${navAttempts.length})`);
if (win.sessionStorage.getItem("truckBrand") === firstBrand && win.sessionStorage.getItem("truckModel") === firstModel) {
  ok("značka+model uložené do sessionStorage (predvyplní konfigurátor)");
} else fail("sessionStorage nesedí");

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
