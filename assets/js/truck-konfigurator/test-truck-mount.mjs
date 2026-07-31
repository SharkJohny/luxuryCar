/* test-truck-mount.mjs — smoke test truck konfigurátora (desktop + phone).
 *
 * Overuje, že:
 *   - index.jsx sa zbundluje (esbuild) bez chýb,
 *   - renderTruckConfigurator() namountuje DESKTOP verziu (široký viewport)
 *     aj PHONE verziu (matchMedia max-width:768px = true) BEZ runtime chýb,
 *   - obe verzie vyrenderujú DOM (mount element má potomkov),
 *   - syncToShoptet nezhodí render, keď sú prítomné Shoptet surcharge selecty.
 *
 * Spustenie: node assets/js/truck-konfigurator/test-truck-mount.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import * as esbuild from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(ROOT, "index.jsx");
const fail = (m) => { console.error("✗ " + m); process.exitCode = 1; };
const ok = (m) => console.log("✓ " + m);

const built = await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  format: "iife",
  globalName: "__TK__",
  loader: { ".jsx": "jsx" },
  write: false,
});
const code = built.outputFiles[0].text;
ok("index.jsx + obe konfigurátory zbundlené (esbuild)");

// Minimálny Shoptet surcharge select (pre syncToShoptet / readShoptetPrices)
const surcharge = `
  <select data-parameter-id="1" data-parameter-name="Materiál" class="surcharge-parameter">
    <option value="">Vyberte príplatok</option>
    <option value="10">Prémiová syntetická koža – prešívaná + 20 €</option>
  </select>
  <meta itemprop="price" content="199">
`;

async function mountWith(isPhone, vehicle) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  vc.on("error", (...a) => { const s = a.join(" "); if (/truck-konfig|Error|render/i.test(s)) errors.push(s); });

  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>
       <div class="p-info-wrapper">${surcharge}<div id="tk-mount"></div></div>
     </body></html>`,
    { url: "https://www.luxurycardesign.sk/test-truck/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc },
  );
  const { window } = dom;
  const { brand, model, prefill, expectsDoorUpholstery } = vehicle;
  window.sessionStorage.setItem("truckBrand", brand);
  window.sessionStorage.setItem("truckModel", model);
  window.sessionStorage.setItem("truckExtras", JSON.stringify(prefill));
  // matchMedia mock — phone keď width<=768
  window.matchMedia = (q) => ({ matches: isPhone && /max-width:\s*768px/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

  // eval bundle v okne
  const fn = new window.Function(code + "\nwindow.__TK__ = __TK__;");
  fn.call(window);

  const TK = window.__TK__;
  if (!TK || typeof TK.renderTruckConfigurator !== "function") { fail(`${isPhone ? "phone" : "desktop"}: export renderTruckConfigurator chýba`); return; }

  const el = window.document.getElementById("tk-mount");
  TK.renderTruckConfigurator(el);
  await new Promise((r) => setTimeout(r, 60)); // flush concurrent render

  const variant = isPhone ? "PHONE" : "DESKTOP";
  if (errors.length) fail(`${variant}: runtime chyby pri mounte: ${errors.slice(0, 3).join(" | ")}`);
  else ok(`${variant}: mount bez runtime chýb`);
  if (el.children.length > 0 || (el.textContent || "").length > 0) ok(`${variant}: konfigurátor vyrenderoval DOM`);
  else fail(`${variant}: mount element ostal prázdny`);
  const renderedText = el.textContent || "";
  if (
    renderedText.includes(brand) &&
    renderedText.includes(model) &&
    Object.values(prefill).every((value) => renderedText.includes(value))
  ) {
    ok(`${variant}: značka, model aj všetky extra voľby sa predvyplnili zo session`);
  } else {
    fail(`${variant}: nekompletný predvýber zo session`);
  }

  const doorStep = window.document.getElementById("konfig-step-5");
  if (expectsDoorUpholstery && doorStep) {
    ok(`${variant}: kamión ponúka krok Tapacír dverí`);
  } else if (!expectsDoorUpholstery && !doorStep) {
    ok(`${variant}: dodávka neponúka krok Tapacír dverí`);
  } else {
    fail(`${variant}: nesprávna dostupnosť kroku Tapacír dverí pre ${brand} (${doorStep ? doorStep.textContent.trim().slice(0, 80) : "krok chýba"})`);
  }

  const step1 = window.document.getElementById("konfig-step-1");
  const visibleOverflowWrappers = step1
    ? [...step1.querySelectorAll("div")].filter((node) => node.style.overflow === "visible")
    : [];
  if (step1 && step1.style.zIndex === "2" && visibleOverflowWrappers.length >= 2) {
    ok(`${variant}: otvorený akordeón dovolí dropdownu pretiecť cez spodnú hranu`);
  } else {
    fail(`${variant}: otvorený akordeón stále orezáva dropdown`);
  }

  const transmissionTrigger = prefill.prevodovka && step1
    ? [...step1.querySelectorAll("div")].find(
        (node) => node.textContent.trim() === prefill.prevodovka && node.style.cursor === "pointer",
      )
    : null;
  if (!prefill.prevodovka) {
    ok(`${variant}: vozidlo bez prevodovky nevyžaduje test dropdownu`);
  } else if (transmissionTrigger) {
    transmissionTrigger.click();
    await new Promise((r) => setTimeout(r, 60));
    const option = [...step1.querySelectorAll("div")].find((node) => node.textContent.trim() === "Automatická prevodovka");
    let clippedAncestor = null;
    for (let node = option && option.parentElement; node && node !== step1.parentElement; node = node.parentElement) {
      if (node.style.overflow === "hidden") {
        clippedAncestor = node;
        break;
      }
    }
    if (option && !clippedAncestor) ok(`${variant}: otvorený zoznam nemá orezávajúceho predka`);
    else fail(`${variant}: zoznam je stále pod overflow:hidden (${clippedAncestor ? clippedAncestor.getAttribute("style") : "možnosť nenájdená"})`);
  } else {
    fail(`${variant}: nenašiel sa trigger prevodovky pre test dropdownu`);
  }
  return window;
}

const truck = {
  brand: "MAN (TIR)",
  model: "TGX 2007-2017",
  prefill: {
    prevodovka: "Manuálna prevodovka",
    zasuvky: "2 zásuvky (šuplíky)",
  },
  expectsDoorUpholstery: true,
};
const van = {
  brand: "Fiat (dodávka)",
  model: "Ducato 2007-2025",
  prefill: {},
  expectsDoorUpholstery: false,
};

await mountWith(false, truck); // desktop kamión
await mountWith(true, truck);  // phone kamión
await mountWith(false, van);   // desktop dodávka
await mountWith(true, van);    // phone dodávka

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
