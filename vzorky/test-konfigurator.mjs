/* test-konfigurator.mjs — integračný test JS výnimky vzorkovníka.
 *
 * Postaví simulovanú Shoptet produktovú stránku so 45 surcharge <select>-mi
 * (KAŽDÁ VZORKA = jeden yes/no parameter, rovnako ako reálny import) a overí, že:
 *   - výnimka sa aktivuje na slug-u,
 *   - 4 série dlaždíc sa vyrenderujú POD SEBA (45 swatchov),
 *   - natívne riadky (45) sa skryjú,
 *   - klik na dlaždicu prepne podkladový <select> na "Chcem" + dispatchne 'change',
 *   - MULTI-SELECT: viac vzoriek v tej istej sérii sa dá vybrať naraz,
 *   - opätovný klik výber zruší (→ "Nechcem"),
 *   - súhrn ráta vratnú zálohu (N × 5 €).
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import * as esbuild from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(ROOT, "..", "assets", "js", "vzorky-konfigurator", "index.js");

const fail = (m) => { console.error("✗ " + m); process.exitCode = 1; };
const ok = (m) => console.log("✓ " + m);

// --- zbundluj modul ako IIFE -> window.__VZ__ -------------------------------
const built = await esbuild.build({
  entryPoints: [ENTRY],
  bundle: true,
  format: "iife",
  globalName: "__VZ__",
  write: false,
});
const code = built.outputFiles[0].text;

// --- simulovaná Shoptet stránka ---------------------------------------------
// Reálna Shoptet štruktúra: KAŽDÁ vzorka = vlastný surcharge param v <tr
// class="surcharge-list">; select.surcharge-parameter + data-parameter-name
// obsahuje ID v zátvorke "(S-1)". Hodnoty: Nechcem (0 €) / Chcem (+5 €).
// Stránka má SELECT iba pre OBJEDNÁVATEĽNÉ vzorky: 1. vrstva celá + 2. vrstva
// iba LUX-10. Ostatné Lux Color sú náhľady (bez selectu) → konfigurátor ich
// vyrenderuje z manifestu ako neobjednávateľné dlaždice.
const SERIES = [
  { line: "Stripe", ids: Array.from({ length: 8 }, (_, i) => `S-${i + 1}`) },
  { line: "Hexa", ids: Array.from({ length: 3 }, (_, i) => `H-${i + 1}`) },
  { line: "Diamond", ids: Array.from({ length: 18 }, (_, i) => `D-${i + 1}`) },
  // LUX-10 je objednávateľná. LUX-01 SEM pridávame zámerne, hoci je to
  // NEOBJEDNÁVATEĽNÝ náhľad — simulujeme stav, keď Shoptet vystaví <select> aj
  // pre náhľad. Konfigurátor sa MUSÍ riadiť manifestom (orderable:false) a NESMIE
  // ho dať vybrať (regresný test na „vyberateľné aj to, čo nemá ísť vybrať").
  { line: "2. vrstva", ids: ["LUX-10", "LUX-01"] },
];
const SELECTS_IN_DOM = SERIES.reduce((n, s) => n + s.ids.length, 0); // 31 (8+3+18+2)
const ORDERABLE = 30; // skutočne objednávateľné: 1. vrstva (29) + LUX-10
const TOTAL_SWATCHES = 45; // manifest: 8+3+18+16 (z toho 15 náhľadov)
const PREVIEW = TOTAL_SWATCHES - ORDERABLE; // 15 (vrátane LUX-01, hoci má <select>)

let pid = 200;
let vid = 900;
const rows = SERIES.flatMap((s) =>
  s.ids.map((id) => {
    const myPid = pid++;
    const opts = [
      `<option value="" data-choose="true">Vyberte príplatok</option>`,
      `<option value="${vid++}" data-surcharge-final-price="0">Nechcem +€0</option>`,
      `<option value="${vid++}" data-surcharge-final-price="5">Chcem – vratná záloha 5 € +€5</option>`,
    ].join("");
    const pname = `Vzorka ${s.line} – Farba ${id} (${id})`;
    return `<tr class="surcharge-list"><th>${pname} <span class="show-tooltip">?</span></th><td><select name="surchargeParameterValueId[${myPid}]" class="parameter-id-${myPid} surcharge-parameter" data-parameter-id="${myPid}" data-parameter-name="${pname}">${opts}</select></td></tr>`;
  }),
).join("");

const html = `<!DOCTYPE html><html><body>
  <div class="p-detail">
    <div class="row">
      <div class="col-xs-12 col-lg-6 p-info-wrapper">
        <h1>Vzorkovník Dragonskin – objednávka vzoriek</h1>
        <span class="price-final"><strong class="calculated-price">€0,01</strong></span>
        <form id="product-detail-form">
          <table class="surcharge-parameters"><tbody>${rows}</tbody></table>
          <div class="p-quantity-box"><input type="number" value="1"></div>
          <button class="add-to-cart-button" type="submit">Pridať do košíka</button>
        </form>
      </div>
    </div>
  </div>
</body></html>`;

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));

const dom = new JSDOM(html, {
  url: "https://www.luxurycardesign.sk/vzorkovnik-dragonskin---objednavka-vzoriek/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;
const doc = window.document;

// počítadlo 'change' eventov na selectoch
const changeCounts = new Map();
doc.querySelectorAll("select").forEach((sel) => {
  changeCounts.set(sel, 0);
  sel.addEventListener("change", () => changeCounts.set(sel, changeCounts.get(sel) + 1));
});

// inject + spusti modul
const script = doc.createElement("script");
script.textContent = code;
doc.body.appendChild(script);

if (errors.length) fail("runtime chyby pri evale modulu: " + errors.join(" | "));
else ok("modul sa načítal bez chýb");

const VZ = window.__VZ__;
if (VZ && typeof VZ.mountVzorkyConfigurator === "function") ok("export mountVzorkyConfigurator prítomný");
else { fail("export chýba"); console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : ""); process.exit(); }

// detekcia stránky
if (VZ.isVzorkyConfiguratorPage()) ok("isVzorkyConfiguratorPage() = true na správnom slug-u");
else fail("isVzorkyConfiguratorPage() = false (malo byť true)");

// mount
VZ.mountVzorkyConfigurator();
await new Promise((r) => setTimeout(r, 50));

const root = doc.getElementById("lcd-vzorky-root");
if (root) ok("#lcd-vzorky-root vytvorený");
else { fail("#lcd-vzorky-root chýba"); console.log("\nVÝSLEDOK: FAIL"); process.exit(); }

const series = root.querySelectorAll(".lcd-vz-acc");
if (series.length === 4) ok("4 série ako akordeony (vzhľad konfigurátora)");
else fail(`akordeonov ${series.length} (čakal 4)`);

// prvý akordeon otvorený (ako krok 1 konfigurátora), zvyšok zatvorený
if (series[0].classList.contains("is-open") && !series[1].classList.contains("is-open"))
  ok("1. akordeon otvorený, ostatné zatvorené (single-open)");
else fail("default open/close stav akordeonov je zlý");

// klik na hlavičku 2. akordeonu → otvorí ho a zatvorí 1. (single-open)
series[1].querySelector(".lcd-vz-acc-head").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 10));
if (series[1].classList.contains("is-open") && !series[0].classList.contains("is-open"))
  ok("klik na hlavičku prepol akordeon (single-open ako konfigurátor)");
else fail("toggle akordeonu zlyhal");
// vráť 1. otvorený pre ďalšie testy klikania nie je nutné (klik v jsdom ide aj na skryté)

const swatches = root.querySelectorAll(".lcd-vz-swatch");
if (swatches.length === TOTAL_SWATCHES) ok(`${swatches.length} dlaždíc (8+3+18+16, vrátane náhľadov)`);
else fail(`dlaždíc ${swatches.length} (čakal ${TOTAL_SWATCHES})`);

// neobjednávateľné náhľady: 15 dlaždíc s "Neposiela sa", nejdú vybrať
const previews = root.querySelectorAll(".lcd-vz-swatch--preview");
if (previews.length === PREVIEW) ok(`${previews.length} náhľadových (neobjednávateľných) dlaždíc`);
else fail(`náhľadov ${previews.length} (čakal ${PREVIEW})`);
const previewHasTag = [...previews].every((p) => /neposiela sa/i.test(p.textContent));
if (previewHasTag) ok("náhľady majú štítok „Neposiela sa“");
else fail("náhľadu chýba štítok „Neposiela sa“");
const previewNoPress = [...previews].every((p) => !p.hasAttribute("aria-pressed"));
if (previewNoPress) ok("náhľady nie sú vybrateľné (bez aria-pressed)");
else fail("náhľad má aria-pressed (nemal by byť vybrateľný)");

// --- dlaždica „Nechcem" (skip) ako PRVÁ v každej sérii ----------------------
const skips = root.querySelectorAll(".lcd-vz-skip");
if (skips.length === 4) ok("4 dlaždice „Nechcem“ (jedna na sériu)");
else fail(`skip dlaždíc ${skips.length} (čakal 4)`);
// každá skip dlaždica je PRVÉ dieťa svojej mriežky
const skipFirst = [...root.querySelectorAll(".lcd-vz-grid")].every(
  (g) => g.firstElementChild && g.firstElementChild.classList.contains("lcd-vz-skip"),
);
if (skipFirst) ok("skip dlaždica je prvá v každej mriežke (pred vzorkami)");
else fail("skip dlaždica nie je prvá v mriežke");
// na začiatku (0 vybraných) sú všetky skip dlaždice aktívne (aria-pressed=true)
if ([...skips].every((s) => s.getAttribute("aria-pressed") === "true"))
  ok("na začiatku sú všetky skip dlaždice aktívne (nič nevybrané)");
else fail("skip dlaždice nie sú na začiatku aktívne");

// LUX-10 = jediná objednávateľná v 2. vrstve → zvýraznená "Posielame", klikateľná
const lux10 = root.querySelector('.lcd-vz-swatch[data-id="LUX-10"]');
if (lux10 && !lux10.classList.contains("lcd-vz-swatch--preview") && lux10.classList.contains("lcd-vz-swatch--send"))
  ok("LUX-10 je objednávateľná a zvýraznená („Posielame“)");
else fail("LUX-10 nie je správne označená ako objednávateľná");

// natívne riadky skryté (každý nájdený surcharge <select>, aj náhľadový LUX-01)
const hiddenRows = doc.querySelectorAll("tr.surcharge-list.lcd-vz-native-hidden");
if (hiddenRows.length === SELECTS_IN_DOM) ok(`všetkých ${SELECTS_IN_DOM} natívnych riadkov skrytých`);
else fail(`skrytých riadkov ${hiddenRows.length} (čakal ${SELECTS_IN_DOM})`);

// REGRESIA: LUX-01 má v DOM-e <select>, ale v manifeste je orderable:false →
// MUSÍ byť náhľad (neobjednávateľný), nie klikateľná dlaždica.
const lux01 = root.querySelector('.lcd-vz-swatch[data-id="LUX-01"]');
if (lux01 && lux01.classList.contains("lcd-vz-swatch--preview") && !lux01.hasAttribute("aria-pressed"))
  ok("LUX-01 je náhľad aj s prítomným <select> (riadi sa manifestom, nie DOM-om)");
else fail("LUX-01 sa dá vybrať, hoci je orderable:false (select v DOM-e ho zmenil na objednávateľný)");

// root je v pravom stĺpci, ZA tabuľkou parametrov (nie cez celú stránku)
const col = doc.querySelector(".p-info-wrapper");
if (col && col.contains(root)) ok("#lcd-vzorky-root je v pravom stĺpci .p-info-wrapper");
else fail("#lcd-vzorky-root NIE je v .p-info-wrapper (mountol sa zle)");
const table = doc.querySelector("table.surcharge-parameters");
if (table && table.compareDocumentPosition(root) & window.Node.DOCUMENT_POSITION_FOLLOWING)
  ok("root je umiestnený ZA tabuľkou parametrov");
else fail("root nie je za tabuľkou parametrov");

// poradie sérií: Diamond, Stripe, Hexa, 2. vrstva
const titles = [...series].map((s) => s.querySelector(".lcd-vz-acc-title").textContent);
if (titles[0] === "Diamond Line" && titles[3] === "2. vrstva (Lux Color)")
  ok(`poradie sérií OK: ${titles.join(" → ")}`);
else fail(`zlé poradie: ${titles.join(" → ")}`);

// helpery: select / swatch podľa ID
const selectForId = (id) => doc.querySelector(`select[data-parameter-name*="(${id})"]`);
const swatchForId = (id) => root.querySelector(`.lcd-vz-swatch[data-id="${id}"]`);
const yesValOf = (id) => [...selectForId(id).options].find((o) => /chcem/i.test(o.textContent) && !/nechcem/i.test(o.textContent)).value;
const noneValOf = (id) => [...selectForId(id).options].find((o) => /nechcem/i.test(o.textContent)).value;
const norm = (s) => (s || "").replace(/ /g, " ").trim();
const recapCount = () => norm(root.querySelector(".lcd-vz-recap-count").textContent);
const recapTotal = () => norm(root.querySelector(".lcd-vz-recap-total").textContent);
const click = async (id) => {
  swatchForId(id).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
};

// --- interakcia: klik na D-1 → jeho parameter na "Chcem" --------------------
await click("D-1");
if (selectForId("D-1").value === yesValOf("D-1")) ok("klik D-1 → jeho <select> = 'Chcem' (+5 €)");
else fail(`D-1 select.value=${selectForId("D-1").value}, čakal ${yesValOf("D-1")}`);
if (changeCounts.get(selectForId("D-1")) >= 1) ok("'change' event dispatchnutý (Shoptet by prepočítal zálohu)");
else fail("'change' event sa nedispatchol");
if (swatchForId("D-1").getAttribute("aria-pressed") === "true") ok("dlaždica D-1 označená (aria-pressed)");
else fail("D-1 nie je označená");
if (recapCount() === "1 vzorka" && recapTotal() === "5 €") ok(`rekapitulácia: ${recapCount()} / ${recapTotal()}`);
else fail(`rekapitulácia zle: "${recapCount()}" / "${recapTotal()}"`);

// --- MULTI-SELECT: klik na D-2 (tá istá séria) → OBE ostanú vybrané ---------
await click("D-2");
if (swatchForId("D-1").getAttribute("aria-pressed") === "true" && swatchForId("D-2").getAttribute("aria-pressed") === "true")
  ok("MULTI-SELECT: D-1 aj D-2 súčasne vybrané (kľúčová zmena oproti single-selectu)");
else fail("multi-select zlyhal — D-1 alebo D-2 nie je vybraná");
if (selectForId("D-1").value === yesValOf("D-1") && selectForId("D-2").value === yesValOf("D-2"))
  ok("oba parametre D-1 aj D-2 = 'Chcem'");
else fail("podkladové selecty D-1/D-2 nie sú oba 'Chcem'");
if (recapCount() === "2 vzorky" && recapTotal() === "10 €") ok(`rekapitulácia: ${recapCount()} / ${recapTotal()}`);
else fail(`rekapitulácia zle: "${recapCount()}" / "${recapTotal()}"`);

// --- výber naprieč sériami: S-3 → 3 vzorky / 15 € ---------------------------
await click("S-3");
if (recapCount() === "3 vzorky" && recapTotal() === "15 €") ok(`rekapitulácia naprieč sériami: ${recapCount()} / ${recapTotal()}`);
else fail(`rekapitulácia zle: "${recapCount()}" / "${recapTotal()}"`);

// --- opätovný klik na D-2 → zruší len D-2, D-1 ostáva -----------------------
await click("D-2");
if (selectForId("D-2").value === noneValOf("D-2")) ok("opätovný klik → D-2 späť na 'Nechcem' (0 €)");
else fail(`po odznačení D-2 select.value=${selectForId("D-2").value}, čakal ${noneValOf("D-2")}`);
if (swatchForId("D-1").getAttribute("aria-pressed") === "true") ok("D-1 ostáva vybraná (odznačenie D-2 ju neovplyvnilo)");
else fail("odznačenie D-2 omylom zrušilo aj D-1");
if (recapCount() === "2 vzorky" && recapTotal() === "10 €") ok(`rekapitulácia po zrušení D-2: ${recapCount()} / ${recapTotal()}`);
else fail(`rekapitulácia zle: "${recapCount()}" / "${recapTotal()}"`);

// --- klik na NÁHĽAD (LUX-01) nič neurobí (neobjednávateľná) -----------------
await click("LUX-01");
if (recapCount() === "2 vzorky" && !swatchForId("LUX-01").hasAttribute("aria-pressed"))
  ok("klik na náhľad LUX-01 nič nezmenil (neobjednávateľná)");
else fail(`klik na náhľad zmenil stav: "${recapCount()}"`);
// podkladový parameter LUX-01 ostáva „Nechcem" → nikdy sa nedostane do objednávky
if (selectForId("LUX-01").value === noneValOf("LUX-01"))
  ok("parameter LUX-01 ostáva 'Nechcem' (náhľad sa neobjedná)");
else fail(`LUX-01 select.value=${selectForId("LUX-01").value}, čakal 'Nechcem' (${noneValOf("LUX-01")})`);

// --- REKAPITULÁCIA OBJEDNÁVKY (tmavá karta podľa návrhu) -------------------
const recapItems = root.querySelectorAll(".lcd-vz-recap-list li");
if (recapItems.length === 2) ok("rekapitulácia: 2 položky (D-1 + S-3)");
else fail(`rekapitulácia má ${recapItems.length} položiek (čakal 2)`);
// poradie v rekapitulácii: séria (Diamond pred Stripe), v rámci série podľa idx
const recapText = root.querySelector(".lcd-vz-recap-list").textContent;
if (/D-1[\s\S]*S-3/.test(recapText)) ok("rekapitulácia zoradená podľa sérií (Diamond → Stripe)");
else fail(`zlé poradie rekapitulácie: "${recapText}"`);
if (/D-1\s*[—–-]\s*Diamond Line:/.test(recapText)) ok("položka rekapitulácie: 'D-1 — Diamond Line: …'");
else fail(`zlý formát položky: "${recapText}"`);
// počítadlo v hlavičke Diamond akordeonu = "1 vybraná"
const diamondAcc = [...series].find((s) => s.querySelector(".lcd-vz-acc-title").textContent === "Diamond Line");
const diamondCount = diamondAcc.querySelector(".lcd-vz-acc-count");
if (!diamondCount.hidden && /1 vybran/.test(diamondCount.textContent)) ok("hlavička Diamond: počítadlo '1 vybraná'");
else fail(`Diamond počítadlo zle: hidden=${diamondCount.hidden} text="${diamondCount.textContent}"`);
// blok "Vybrané vzorky" zobrazený (count > 0)
if (!root.querySelector(".lcd-vz-recap-selected").hidden) ok("rekapitulácia: blok „Vybrané vzorky“ zobrazený");
else fail("rekapitulácia: blok vybraných je skrytý");

// --- skip dlaždica: stav podľa výberu + klik zruší celú sériu --------------
// stav: Diamond má vybranú D-1, Stripe má vybranú S-3 (D-2 zrušená skôr).
const skipFor = (line) => {
  const acc = [...series].find((s) => s.querySelector(".lcd-vz-acc-title").textContent.startsWith(line));
  return acc.querySelector(".lcd-vz-skip");
};
const diamondSkip = skipFor("Diamond");
if (diamondSkip.getAttribute("aria-pressed") === "false")
  ok("skip Diamondu je neaktívny (séria má vybranú vzorku)");
else fail("skip Diamondu mal byť neaktívny");
// klik na skip Diamondu → zruší D-1, počítadlo série 0, skip späť aktívny
diamondSkip.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 10));
if (selectForId("D-1").value === noneValOf("D-1")) ok("klik na skip → D-1 späť na 'Nechcem'");
else fail(`po klik na skip D-1 select.value=${selectForId("D-1").value}, čakal ${noneValOf("D-1")}`);
if (!swatchForId("D-1").hasAttribute("aria-pressed") || swatchForId("D-1").getAttribute("aria-pressed") === "false")
  ok("klik na skip → dlaždica D-1 odznačená");
else fail("dlaždica D-1 ostala označená po klik na skip");
if (diamondSkip.getAttribute("aria-pressed") === "true") ok("skip Diamondu späť aktívny (séria prázdna)");
else fail("skip Diamondu nie je aktívny po zrušení série");
// S-3 (iná séria) ostáva nedotknutá → rekapitulácia 1 vzorka / 5 €
if (recapCount() === "1 vzorka" && recapTotal() === "5 €")
  ok(`skip zrušil len Diamond, S-3 ostáva: ${recapCount()} / ${recapTotal()}`);
else fail(`skip ovplyvnil aj iné série: "${recapCount()}" / "${recapTotal()}"`);
if (skipFor("Stripe").getAttribute("aria-pressed") === "false")
  ok("skip Stripe ostáva neaktívny (S-3 stále vybraná)");
else fail("skip Stripe sa omylom aktivoval");

// --- ZAOKRÚHLENIE zobrazenej ceny na celé eurá -----------------------------
const calc = doc.querySelector(".calculated-price");
if (calc && /^€?\s*0\s*€?$/.test(norm(calc.textContent)))
  ok(`základná cena zaokrúhlená na celé euro: "${norm(calc.textContent)}" (0,01 € → 0 €)`);
else fail(`základná cena nezaokrúhlená na 0: "${calc && norm(calc.textContent)}"`);

// simuluj Shoptet async prepočet po výbere vzorky (5,01 €) → watchPrices zaokrúhli
calc.textContent = "€5,01";
await new Promise((r) => setTimeout(r, 90));
if (/5/.test(calc.textContent) && !/[.,]01/.test(calc.textContent))
  ok(`prepočítaná cena zaokrúhlená: "${norm(calc.textContent)}" (5,01 € → 5 €)`);
else fail(`prepočítaná cena nezaokrúhlená: "${norm(calc.textContent)}"`);

console.log(process.exitCode ? "\nVÝSLEDOK: FAIL" : "\nVÝSLEDOK: OK");
