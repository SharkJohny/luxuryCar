/* test-truck-cart.mjs — E2E test toku "vyplň konfigurátor → Pridať do košíka".
 *
 * Používa REÁLNE Shoptet selecty stiahnuté zo živej truck stránky (vrátane
 * required atribútov a BUNDLE textov — overuje aj balík/bundle toleranciu
 * syncu). Klikaním prejde kroky 1–4, krok 5 nechá PRÁZDNY (klient bod 7),
 * klikne na košík a asssertuje:
 *   1. žiadny required select neostal bez hodnoty (inak by prehliadač
 *      submit ticho zablokoval),
 *   2. natívne Shoptet tlačidlo dostalo click,
 *   3. vo vyrenderovanom DOM nie je validačná hláška.
 *
 * Selecty: /tmp/truck-selects.html (extrakt zo živej stránky; ak chýba,
 * test spadne s pokynom na regeneráciu).
 * Spustenie: node assets/js/truck-konfigurator/test-truck-cart.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import * as esbuild from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const fail = (m) => { console.error("✗ " + m); process.exitCode = 1; };
const ok = (m) => console.log("✓ " + m);

const SELECTS = readFileSync("/tmp/truck-selects.html", "utf-8");

const built = await esbuild.build({
  entryPoints: [join(ROOT, "index.jsx")],
  bundle: true, format: "iife", globalName: "__TK__",
  loader: { ".jsx": "jsx" }, write: false,
});
const code = built.outputFiles[0].text;

const vc = new VirtualConsole();
const consoleLines = [];
vc.on("error", (...a) => consoleLines.push(a.join(" ")));
vc.on("log", (...a) => consoleLines.push(a.join(" ")));

const dom = new JSDOM(
  `<!DOCTYPE html><html><body>
     <div class="p-info-wrapper">
       <form action="/action/Cart/addCartItem/">
         ${SELECTS}
         <meta itemprop="price" content="199">
         <div class="add-to-cart">
           <button type="submit" class="btn btn-lg btn-conversion add-to-cart-button" data-testid="buttonAddToCart">Pridať do košíka</button>
         </div>
       </form>
       <div id="tk-mount"></div>
     </div>
   </body></html>`,
  { url: "https://www.luxurycardesign.sk/luxusne-autokoberce-truck---test-konfigurator/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc },
);
const { window: win } = dom;
const doc = win.document;
win.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
// jsdom nemá scrollIntoView/scrollTo
win.HTMLElement.prototype.scrollIntoView = function () {};
win.scrollTo = () => {};

let nativeClicked = 0;
const nativeBtn = doc.querySelector('[data-testid="buttonAddToCart"]');
nativeBtn.addEventListener("click", (e) => { nativeClicked++; e.preventDefault(); });

new win.Function(code + "\nwindow.__TK__ = __TK__;").call(win);
win.__TK__.renderTruckConfigurator(doc.getElementById("tk-mount"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(120);

const click = (el) => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
const allEls = () => Array.from(doc.getElementById("tk-mount").querySelectorAll("*"));
/** Najkonkrétnejší (najkratší full-text) element matchujúci re; pri zhode
 *  najhlbší v dokumente. Zvláda aj kompozitné elementy (číslo + titulok). */
function byText(re) {
  const matches = allEls().filter((el) => re.test(el.textContent.trim()));
  if (!matches.length) return null;
  matches.sort((a, b) => a.textContent.length - b.textContent.length);
  const min = matches[0].textContent.length;
  const best = matches.filter((el) => el.textContent.length === min);
  return best[best.length - 1];
}
function mustClick(re, what) {
  const el = byText(re);
  if (!el) { fail(`nenašiel som na kliknutie: ${what} (${re})`); throw new Error("stop"); }
  click(el);
  return el;
}
/** Otvor dropdown (placeholder text) a vyber PRVÚ option. */
async function pickFirstDropdownOption(placeholderRe) {
  const trigger = byText(placeholderRe);
  if (!trigger) return false;
  click(trigger);
  await sleep(60);
  const list = allEls().find((el) => el.style && el.style.maxHeight === "300px");
  if (!list || !list.children.length) { fail(`dropdown ${placeholderRe} sa neotvoril / bez options`); throw new Error("stop"); }
  const first = list.children[0];
  const label = first.textContent.trim();
  click(first);
  await sleep(60);
  console.log(`  · dropdown ${placeholderRe} → "${label}"`);
  return true;
}

try {
  // ---- KROK 1: značka, model, extras (kým existuje "Vyberte ..." dropdown)
  let guard = 0;
  while ((byText(/^Vyberte /) != null) && guard++ < 12) {
    await pickFirstDropdownOption(/^Vyberte /);
  }
  ok("krok 1: všetky dropdowny vyplnené");

  // ---- do kroku 2
  mustClick(/^Pokračovať/i, "tlačidlo Pokračovať (krok 1→2)");
  await sleep(500);

  // ---- KROK 2: materiál + farba
  mustClick(/^Prémiová syntetická koža – jednofarebná$/, "materiál");
  await sleep(120);
  const swatch = allEls().find((el) => el.style && el.style.width === "110px" && el.style.cursor === "pointer");
  if (!swatch) { fail("farba: swatch karta nenájdená"); throw new Error("stop"); }
  click(swatch);
  await sleep(120);
  ok("krok 2: materiál + farba vybraté");

  // Pomocník: otvor sekciu klikom na hlavičku a vráť NOVÉ pointer elementy
  // (karty), ktoré sa otvorením objavili. Hlavičky začínajú číslom sekcie.
  const pointerEls = () => allEls().filter((el) => el.style && el.style.cursor === "pointer");
  async function openSectionAndGetCards(headerRe, what) {
    const before = new Set(pointerEls());
    mustClick(headerRe, what);
    await sleep(500);
    // vyluč len HLAVIČKY sekcií ("3Lemovanie" — číslica + veľké písmeno);
    // karty typu "01. Čierna + Béžová" (číslice + bodka) ostávajú
    return pointerEls().filter((el) => !before.has(el) && !/^\d+\p{Lu}/u.test(el.textContent.trim()));
  }

  // ---- KROK 3: otvor sekciu, klikni prvú kartu lemovania
  const lemCards = await openSectionAndGetCards(/^3Lemovanie$/, "hlavička kroku 3");
  const lemCard = lemCards.find((el) => el.textContent.trim().length > 0 && el.textContent.length < 120);
  if (!lemCard) { fail("krok 3: lemovanie karta nenájdená"); throw new Error("stop"); }
  click(lemCard);
  await sleep(200);
  ok(`krok 3: lemovanie vybraté ("${lemCard.textContent.trim().slice(0, 40)}")`);

  // ---- KROK 4: variant A "Šofér + spolujazdec + stred" — reprodukuje chybu
  // z konzoly klienta (required select Nášivky ostal prázdny, lebo option
  // "…(BUNDLE) +€95" sa nedala namatchovať na "…(BALÍK)").
  await openSectionAndGetCards(/^4Nášivky \/ Výšivky$/, "hlavička kroku 4");
  const beforeA = new Set(pointerEls());
  mustClick(/^Šofér \+ spolujazdec \+ stred/, "placement A (boky+stred)");
  await sleep(700); // auto-otvorenie 4/B
  // 4/B: prvá nášivka = nová pointer karta s krátkym textom.
  // Vyluč sub-hlavičky ("4/B…", "4/C…") a "Pokračovať" tlačidlá.
  const isCard = (el) =>
    el.textContent.trim().length > 0 &&
    el.textContent.length < 40 &&
    !/^4\//.test(el.textContent.trim()) &&
    !/Pokračovať|Rovnak/i.test(el.textContent);
  const nasCards = pointerEls().filter((el) => !beforeA.has(el) && isCard(el));
  if (!nasCards.length) { fail("4/B: nášivka karta nenájdená"); throw new Error("stop"); }
  click(nasCards[0]);
  await sleep(400);
  console.log(`  · 4/B nášivka: "${nasCards[0].textContent.trim().slice(0, 30)}"`);
  // 4/B: farba nite — položka, ktorá sa objavila až PO výbere nášivky
  const afterNas = new Set(pointerEls());
  const nitItems = pointerEls().filter((el) => !beforeA.has(el) && isCard(el) && el !== nasCards[0]);
  const beforeSet = new Set(nasCards);
  const freshNit = nitItems.filter((el) => !beforeSet.has(el));
  const nitPick = (freshNit.length ? freshNit : nitItems)[0];
  if (!nitPick) { fail("4/B: farba nite nenájdená"); throw new Error("stop"); }
  click(nitPick);
  await sleep(400);
  console.log(`  · 4/B niť: "${nitPick.textContent.trim().slice(0, 30)}"`);
  // 4/B hotové → "Pokračovať" otvorí 4/C (stredová nášivka)
  const cont4b = byText(/^Pokračovať/i);
  if (cont4b) { click(cont4b); await sleep(500); }
  // 4/C: same-as toggly ("Rovnaká ako šofér + spolujazdec") preberú bočnú
  // nášivku aj niť; klikáme kým nejaký existuje
  for (let i = 0; i < 4; i++) {
    const same = byText(/Rovnak/);
    if (!same) break;
    click(same);
    await sleep(350);
    console.log("  · 4/C same-as klik");
  }
  await sleep(500);
  ok("krok 4: variant A (boky+stred) + nášivka + niť");

  // ---- KROK 5: NECHÁVAME PRÁZDNY (klient bod 7)

  // ---- PRIDAŤ DO KOŠÍKA (naše zelené tlačidlo s 🛒)
  mustClick(/🛒/, "🛒 Pridať do košíka");
  await sleep(400); // handler má 100ms setTimeout na native click

  // ---- ASSERTY
  const unfilled = Array.from(doc.querySelectorAll("select[data-parameter-id]"))
    .filter((s) => s.hasAttribute("required") && !s.value)
    .map((s) => s.dataset.parameterName);
  if (unfilled.length) fail("POVINNÉ selecty bez hodnoty: " + unfilled.join(", "));
  else ok("všetky povinné selecty majú hodnotu");

  const valMsg = byText(/Prosím, (dokončite|vyberte|rozhodnite)/);
  if (valMsg) fail("validačná hláška blokuje košík: " + valMsg.textContent.trim());
  else ok("žiadna validačná hláška");

  if (nativeClicked > 0) ok(`natívne Shoptet tlačidlo kliknuté (${nativeClicked}×)`);
  else fail("natívne Shoptet tlačidlo NEDOSTALO click");

  // Rozpis: čo sync nastavil (kontrola balík/bundle tolerancie)
  console.log("\n— Nastavené selecty:");
  doc.querySelectorAll("select[data-parameter-id]").forEach((s) => {
    const opt = s.selectedOptions[0];
    console.log(`  ${s.dataset.parameterName}${s.hasAttribute("required") ? " (REQ)" : ""}: ${opt && opt.value ? opt.textContent.trim() : "—"}`);
  });
} catch (e) {
  if (e.message !== "stop") { fail("výnimka: " + e.message); }
  console.log("\n[debug] viditeľné klikateľné texty:");
  allEls()
    .filter((el) => el.style && el.style.cursor === "pointer")
    .slice(0, 25)
    .forEach((el) => console.log("  ·", el.textContent.trim().slice(0, 60)));
}

const relevant = consoleLines.filter((l) => /truck-konfig|POVINNÉ/.test(l));
if (relevant.length) { console.log("\n— Konzola konfigurátora:"); relevant.forEach((l) => console.log("  ", l.slice(0, 160))); }

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
