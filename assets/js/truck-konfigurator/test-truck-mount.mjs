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

async function mountWith(isPhone) {
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
  return window;
}

await mountWith(false); // desktop
await mountWith(true);  // phone

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
