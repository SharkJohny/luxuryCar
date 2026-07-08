/* test-voucher-mount.mjs — smoke test konfigurátora darčekovej poukážky.
 *
 * Overuje, že:
 *   - index.jsx sa zbundluje (esbuild) bez chýb,
 *   - isVoucherPage() rozpozná stránku podľa slugu,
 *   - mountVoucherConfigurator() namountuje konfigurátor do .p-info-wrapper
 *     BEZ runtime chýb a vyrenderuje DOM (hodnota, mince, CTA).
 *
 * Spustenie: node assets/js/voucher-konfigurator/test-voucher-mount.mjs
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
  globalName: "__VK__",
  loader: { ".jsx": "jsx" },
  write: false,
});
const code = built.outputFiles[0].text;
ok("index.jsx zbundlený (esbuild)");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));
vc.on("error", (...a) => { const s = a.join(" "); if (/voucher-konfig|Error|render/i.test(s)) errors.push(s); });

const dom = new JSDOM(
  `<!DOCTYPE html><html><body><h1>Darčeková poukážka</h1><div class="p-info-wrapper"></div></body></html>`,
  { url: "https://www.luxurycardesign.sk/darcekova-poukazka/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc },
);
const { window } = dom;
window.matchMedia = () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });

const fn = new window.Function(code + "\nwindow.__VK__ = __VK__;");
fn.call(window);

const VK = window.__VK__;
if (!VK || typeof VK.mountVoucherConfigurator !== "function" || typeof VK.isVoucherPage !== "function") {
  fail("export mountVoucherConfigurator/isVoucherPage chýba");
} else {
  ok("exporty isVoucherPage/mountVoucherConfigurator prítomné");

  if (VK.isVoucherPage()) ok("isVoucherPage() rozpozná /darcekova-poukazka/ podľa slugu");
  else fail("isVoucherPage() nerozpoznala testovaciu URL");

  VK.mountVoucherConfigurator();
  await new Promise((r) => setTimeout(r, 100)); // flush concurrent render + retry interval

  const el = window.document.getElementById("lcd-voucher-root");
  if (!el) fail("mount element #lcd-voucher-root sa nevytvoril");
  else if (el.children.length === 0) fail("konfigurátor ostal prázdny (žiadny render)");
  else ok("konfigurátor vyrenderoval DOM");

  if (errors.length) fail("runtime chyby pri mounte: " + errors.slice(0, 3).join(" | "));
  else ok("mount bez runtime chýb");

  const html = el ? el.innerHTML : "";
  if (/300\s*€/.test(html)) ok("predvolená hodnota 300 € viditeľná");
  else fail("predvolená hodnota 300 € sa v DOM nenašla");

  const cta = el && el.querySelector(".vch-cta");
  if (cta) ok("CTA tlačidlo 'Pridať do košíka' vyrenderované");
  else fail("CTA tlačidlo sa nenašlo");
}

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
