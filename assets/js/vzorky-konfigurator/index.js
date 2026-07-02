/* ===========================================================================
 * VZORKOVNÍK DRAGONSKIN — vizuálny vzorkovník napojený na Shoptet košík
 * ===========================================================================
 * JS výnimka (vzor: truck konfigurátor) pre produktovú stránku
 *   /vzorkovnik-dragonskin---objednavka-vzoriek
 *
 * Produkt má 45 surcharge parametrov — KAŽDÁ VZORKA = jeden parameter (yes/no):
 *   NAME  = "Vzorka <séria> – <farba> (<ID>)"   napr. "Vzorka Stripe – … (S-1)"
 *   VALUES = "Nechcem" (0 €) / "Chcem – vratná záloha 5 €" (+5 €)
 *
 * Prečo 45 parametrov a nie 4: príplatkový parameter s viacerými hodnotami je
 * single-select (dropdown) — z vrstvy by šlo vybrať len 1 farbu. Samostatný
 * parameter na vzorku umožní objednať ľubovoľný počet vzoriek naraz.
 *
 * Čo robíme:
 *   1) nájdeme tieto <select>-y (ID čítame z data-parameter-name "(…)"),
 *   2) zoskupíme ich do 4 sérií (Stripe / Hexa / Diamond / 2. vrstva) POD SEBA,
 *   3) NATÍVNE riadky skryjeme,
 *   4) vykreslíme mriežku farebných dlaždíc (obrázky zo Shoptet uploadu
 *      /user/documents/upload/assets/config/<ID>.jpg — žiadny base64 v bundli),
 *   5) klik na dlaždicu prepne podkladový <select> na "Chcem" / "Nechcem" +
 *      dispatchne 'change' → Shoptet prepočíta vratnú zálohu.
 *
 * MULTI-SELECT: každá dlaždica = vlastný parameter, takže v rámci série (aj
 * naprieč sériami) sa dá vybrať ľubovoľný počet vzoriek. Opätovný klik na
 * vybranú dlaždicu ju odznačí (vráti daný parameter na "Nechcem").
 * ========================================================================= */

import { VZORKY_SERIES, VZORKY_ITEMS } from "./swatch-data.js";

const MOUNT_ID = "lcd-vzorky-root";
const DEPOSIT = 5; // EUR / vzorka
// ID v texte: S-1, H-2, D-18, LUX-10 …
const ID_RE = /\b(S-\d+|H-\d+|D-\d+|LUX-\d+)\b/;

const SERIES_BY_KEY = Object.fromEntries(VZORKY_SERIES.map((s) => [s.key, s]));
// ID → poradie v rámci série (na stabilné zoradenie dlaždíc).
const ID_ORDER = Object.fromEntries(
  VZORKY_SERIES.flatMap((s) => s.ids.map((id, i) => [id, i])),
);

/**
 * Je vzorka objednávateľná? AUTORITATÍVNE z manifestu (konfigurator.jsx →
 * swatch-data.js), NIE z prítomnosti <select> v DOM-e. Náhľady (orderable:false)
 * sa nedajú vybrať, ani keby pre ne Shoptet vystavil príplatkový parameter.
 * Starší manifest bez flagu (undefined) považujeme za objednávateľný.
 */
function isOrderableId(id) {
  return (VZORKY_ITEMS[id] || {}).orderable !== false;
}

/** Stránka vzorkovníka? Slug alebo H1. */
export function isVzorkyConfiguratorPage() {
  try {
    if (/vzorkovnik-dragonskin/i.test(window.location.pathname)) return true;
    const h1 = document.querySelector("h1");
    const t = (h1 && h1.textContent) || "";
    return /vzorkovn|objedn[aá]vka\s+vzor/i.test(t);
  } catch (e) {
    return false;
  }
}

/** Vyparsuj ID vzorky z textu (alebo null). */
function idFromText(t) {
  const m = ID_RE.exec(t || "");
  return m ? m[1] : null;
}

/** Séria podľa ID prefixu. */
function seriesKeyForId(id) {
  if (/^S-/.test(id)) return "stripe";
  if (/^H-/.test(id)) return "hexa";
  if (/^D-/.test(id)) return "diamond";
  if (/^LUX-/.test(id)) return "second";
  return null;
}

/** Riadok parametra v DOM (Shoptet: <tr class="surcharge-list">). */
function rowOf(select) {
  return (
    select.closest("tr.surcharge-list, tr, .parameter-wrap, .form-group, li") ||
    select.parentElement
  );
}

/**
 * ID vzorky pre tento <select> (1 parameter = 1 vzorka). Primárne z Shoptet
 * `data-parameter-name` ("Vzorka Stripe – Štandard 29 (S-1)"); fallback z
 * `name`, z textu celého riadku, prípadne z textu niektorej option.
 */
function idForSelect(select) {
  return (
    idFromText(select.getAttribute("data-parameter-name")) ||
    idFromText(select.getAttribute("name")) ||
    idFromText((rowOf(select) || {}).textContent) ||
    optionId(select)
  );
}
function optionId(select) {
  for (const o of select.options) {
    const id = idFromText(o.textContent);
    if (id) return id;
  }
  return null;
}

/**
 * Nájdi všetky surcharge <select>-y vzoriek (1 = 1 vzorka). Primárne podľa
 * Shoptet triedy `.surcharge-parameter`; fallback: ľubovoľný select, ktorý vieme
 * priradiť k vzorke (kvôli testom / inému markupu).
 */
function findParamSelects() {
  const out = [];
  const seen = new Set();
  const consider = (sel) => {
    if (seen.has(sel)) return;
    const id = idForSelect(sel);
    if (!id) return;
    const sk = seriesKeyForId(id);
    if (!sk) return;
    seen.add(sel);
    out.push({ select: sel, id, seriesKey: sk });
  };
  const native = document.querySelectorAll("select.surcharge-parameter");
  if (native.length) native.forEach(consider);
  if (!out.length) document.querySelectorAll("select").forEach(consider);
  return out;
}

/** Skry natívny riadok parametra (select ponechaj v DOM kvôli submitu do košíka). */
function hideNativeRow(select) {
  const row = rowOf(select);
  if (row) row.classList.add("lcd-vz-native-hidden");
  else select.classList.add("lcd-vz-native-hidden");
}

/** Príplatok danej option (€) — z data-atribútu, inak z textu "… 5 €". */
function optPrice(o) {
  const a = o.getAttribute("data-surcharge-final-price");
  if (a != null && a !== "") {
    const n = parseFloat(a);
    if (!Number.isNaN(n)) return n;
  }
  const m = (o.textContent || "").match(/(\d+(?:[.,]\d+)?)\s*€/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}

/** "Nechcem" option (explicitná 0 €), nie placeholder "Vyberte príplatok". */
function noneOption(select) {
  const opts = Array.from(select.options);
  return (
    opts.find((o) => /nechcem/i.test(o.textContent || "")) ||
    opts.find((o) => o.value !== "" && optPrice(o) === 0) ||
    opts.find((o) => o.value === "") ||
    select.options[0]
  );
}

/** "Chcem" option (+5 €) — kladný príplatok. */
function yesOption(select) {
  const opts = Array.from(select.options);
  return (
    opts.find((o) => /chcem/i.test(o.textContent || "") && !/nechcem/i.test(o.textContent || "")) ||
    opts.find((o) => optPrice(o) > 0) ||
    opts.find((o) => o.value !== "" && !/nechcem/i.test(o.textContent || "")) ||
    null
  );
}

function injectStyles() {
  if (document.getElementById("lcd-vz-style")) return;
  const css = `
.lcd-vz-native-hidden{display:none!important}
#${MOUNT_ID}{width:100%;margin:18px 0 0;clear:both}

/* Akordeon sérií — vzhľad zhodný s krokmi konfigurátora (zlatý gradient header). */
#${MOUNT_ID} .lcd-vz-acc{position:relative;margin:0 0 8px;border-radius:10px;overflow:hidden;border:2px solid transparent;transition:border-color .3s}
#${MOUNT_ID} .lcd-vz-acc.is-open{border-color:#e0d5b8}
#${MOUNT_ID} .lcd-vz-acc-head{display:flex;align-items:center;gap:12px;width:100%;padding:14px 20px;background:linear-gradient(135deg,#c5a44e,#a8893a);color:#fff;font-family:'Exo 2',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:left;cursor:pointer;user-select:none;border:none;border-radius:10px;transition:border-radius .2s}
#${MOUNT_ID} .lcd-vz-acc.is-open .lcd-vz-acc-head{border-radius:10px 10px 0 0}
#${MOUNT_ID} .lcd-vz-acc-num{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:14px}
#${MOUNT_ID} .lcd-vz-acc-title{flex:1 1 auto}
#${MOUNT_ID} .lcd-vz-acc-count{flex:0 0 auto;font-size:12px;font-weight:700;letter-spacing:.4px;background:#fff;color:#a8893a;border-radius:20px;padding:3px 10px;text-transform:none}
#${MOUNT_ID} .lcd-vz-acc-count[hidden]{display:none}
#${MOUNT_ID} .lcd-vz-acc-chev{flex:0 0 auto;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #fff;transition:transform .25s}
#${MOUNT_ID} .lcd-vz-acc.is-open .lcd-vz-acc-chev{transform:rotate(180deg)}
#${MOUNT_ID} .lcd-vz-acc-body{display:none;background:#fff;border-radius:0 0 10px 10px;padding:16px}
#${MOUNT_ID} .lcd-vz-acc.is-open .lcd-vz-acc-body{display:block}
#${MOUNT_ID} .lcd-vz-hint{font-size:12px;color:#777;margin:0 0 10px}

/* Mriežka dlaždíc — max 5 vedľa seba (ako návrh), na mobile menej. */
#${MOUNT_ID} .lcd-vz-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
@media (max-width:600px){#${MOUNT_ID} .lcd-vz-grid{grid-template-columns:repeat(3,1fr)}}

/* Dlaždica = full-bleed obrázok bez paddingu + názov pod ním (ako návrh). */
#${MOUNT_ID} .lcd-vz-swatch{position:relative;display:block;padding:0;border:2px solid #e3e3e3;border-radius:10px;overflow:hidden;background:#fff;cursor:pointer;text-align:center;font:inherit;transition:border-color .15s,box-shadow .15s,transform .1s}
#${MOUNT_ID} .lcd-vz-swatch:hover{border-color:#C5A44E;transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.10)}
#${MOUNT_ID} .lcd-vz-thumb-wrap{position:relative;display:block;width:100%;aspect-ratio:1/1}
#${MOUNT_ID} .lcd-vz-thumb{width:100%;height:100%;object-fit:cover;display:block;background:#f1ede2 url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 fill=%22none%22 stroke=%22%23c9bfa0%22 stroke-width=%221.5%22><circle cx=%2212%22 cy=%2212%22 r=%229%22/></svg>') center/28px no-repeat}
#${MOUNT_ID} .lcd-vz-name{display:block;font-size:11px;line-height:1.25;color:#333;padding:5px 4px 6px;min-height:30px}
#${MOUNT_ID} .lcd-vz-swatch[aria-pressed="true"]{border-color:#C5A44E;box-shadow:0 0 0 3px rgba(197,164,78,.25)}
#${MOUNT_ID} .lcd-vz-swatch[aria-pressed="true"] .lcd-vz-thumb-wrap::after{content:"\\2713";position:absolute;top:6px;right:6px;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:#C5A44E;color:#fff;font-size:13px;font-weight:700}

/* Náhľadové (neobjednávateľné) vzorky — zobrazia sa, ale nejdú vybrať. */
#${MOUNT_ID} .lcd-vz-swatch--preview{cursor:default;opacity:.82}
#${MOUNT_ID} .lcd-vz-swatch--preview:hover{border-color:#e3e3e3;transform:none;box-shadow:0 2px 6px rgba(0,0,0,.06)}
#${MOUNT_ID} .lcd-vz-swatch--preview .lcd-vz-thumb{filter:saturate(.85)}
#${MOUNT_ID} .lcd-vz-swatch--preview .lcd-vz-name{color:#9a9a9a}
#${MOUNT_ID} .lcd-vz-swatch--send{border-color:#4CAF50}
#${MOUNT_ID} .lcd-vz-tag{position:absolute;left:0;right:0;padding:3px 4px;font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;text-align:center;color:#fff;pointer-events:none}
#${MOUNT_ID} .lcd-vz-tag--no{bottom:0;background:rgba(46,24,16,.9)}
#${MOUNT_ID} .lcd-vz-tag--send{top:0;background:linear-gradient(135deg,#4CAF50,#2E7D32)}
#${MOUNT_ID} .lcd-vz-swatch--send[aria-pressed="true"] .lcd-vz-tag--send{display:none}

/* Dlaždica „Nechcem" — prvá v každej sérii (zruší výber série). Vzhľad z návrhu. */
#${MOUNT_ID} .lcd-vz-skip{position:relative;display:block;padding:0;border:2px dashed #bbb;border-radius:10px;overflow:hidden;background:#fafafa;cursor:pointer;font:inherit;color:#2E1810;text-align:center;transition:all .15s}
#${MOUNT_ID} .lcd-vz-skip:hover{border-color:#2E7D32}
#${MOUNT_ID} .lcd-vz-skip-ico{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1/1;font-size:30px;font-weight:700}
#${MOUNT_ID} .lcd-vz-skip-label{display:block;font-size:11px;font-weight:700;line-height:1.25;padding:5px 4px 6px;min-height:30px}
#${MOUNT_ID} .lcd-vz-skip[aria-pressed="true"]{border:2px solid #2E7D32;background:linear-gradient(135deg,#4CAF50,#2E7D32);color:#fff}

/* Rekapitulácia objednávky — tmavá karta podľa návrhu (DARK + zlaté akcenty). */
#${MOUNT_ID} .lcd-vz-recap{margin:18px 0 0;padding:20px;border-radius:12px;background:linear-gradient(135deg,#2E1810 0%,#1a1008 100%);color:#fff;box-shadow:0 10px 30px rgba(46,24,16,.25)}
#${MOUNT_ID} .lcd-vz-recap-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
#${MOUNT_ID} .lcd-vz-recap-col{flex:1 1 240px}
#${MOUNT_ID} .lcd-vz-recap-col.right{flex:0 0 auto;text-align:right}
#${MOUNT_ID} .lcd-vz-recap-eyebrow{font-size:11px;color:#C5A44E;font-weight:700;text-transform:uppercase;letter-spacing:2px}
#${MOUNT_ID} .lcd-vz-recap-count{font-size:26px;font-weight:800;margin-top:4px}
#${MOUNT_ID} .lcd-vz-recap-desc{font-size:13px;opacity:.85;margin:4px 0 0}
#${MOUNT_ID} .lcd-vz-recap-total{font-size:38px;font-weight:900;color:#C5A44E;line-height:1}
#${MOUNT_ID} .lcd-vz-recap-sub{font-size:10.5px;opacity:.65;margin-top:4px;letter-spacing:.5px}
#${MOUNT_ID} .lcd-vz-recap-selected{margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.15)}
#${MOUNT_ID} .lcd-vz-recap-selected[hidden]{display:none}
#${MOUNT_ID} .lcd-vz-recap-list{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.6}
#${MOUNT_ID} .lcd-vz-recap-list li strong{color:#fff}
#${MOUNT_ID} .lcd-vz-recap-note{font-size:11.5px;opacity:.7;margin:14px 0 0}
`;
  const style = document.createElement("style");
  style.id = "lcd-vz-style";
  style.textContent = css;
  document.head.appendChild(style);
}

/** Postav dlaždicu pre jednu vzorku (id).
 *  opts.onPick   — handler (len objednávateľné)
 *  opts.preview  — neobjednávateľná vzorka (len náhľad, nejde vybrať)
 *  opts.highlight— zvýrazni ako "Posielame" (objednávateľná v sérii s náhľadmi)
 */
function buildSwatch(id, opts = {}) {
  const { onPick, preview = false, highlight = false } = opts;
  const item = VZORKY_ITEMS[id] || {};
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "lcd-vz-swatch" +
    (preview ? " lcd-vz-swatch--preview" : "") +
    (highlight ? " lcd-vz-swatch--send" : "");
  btn.dataset.id = id;
  if (preview) btn.setAttribute("aria-disabled", "true");
  else btn.setAttribute("aria-pressed", "false");
  btn.title = (item.label || id) + (preview ? " — neposiela sa, len náhľad" : "");

  // Štvorcová oblasť s full-bleed obrázkom; štítky stavu sú prekryv NAD obrázkom.
  const wrap = document.createElement("span");
  wrap.className = "lcd-vz-thumb-wrap";
  const thumb = document.createElement(item.img ? "img" : "span");
  thumb.className = "lcd-vz-thumb";
  if (item.img) {
    thumb.src = item.img;
    thumb.alt = item.label || id;
    thumb.loading = "lazy";
  }
  wrap.appendChild(thumb);

  if (preview) {
    const tag = document.createElement("span");
    tag.className = "lcd-vz-tag lcd-vz-tag--no";
    tag.textContent = "Neposiela sa";
    wrap.appendChild(tag);
  } else if (highlight) {
    const tag = document.createElement("span");
    tag.className = "lcd-vz-tag lcd-vz-tag--send";
    tag.textContent = "Posielame";
    wrap.appendChild(tag);
  }
  btn.appendChild(wrap);

  const name = document.createElement("span");
  name.className = "lcd-vz-name";
  name.textContent = item.label || id;
  btn.appendChild(name);

  if (!preview) btn.addEventListener("click", () => onPick(btn));
  return btn;
}

/** Dlaždica „Nechcem" — prvá v sérii; klik zruší celý výber danej série. */
function buildSkipTile(onSkip) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lcd-vz-skip";
  btn.setAttribute("aria-pressed", "true"); // default: nič nevybrané = aktívna
  btn.title = "Nechcem žiadnu vzorku z tejto série";

  const ico = document.createElement("span");
  ico.className = "lcd-vz-skip-ico";
  ico.textContent = "✓"; // ✓ (aktívna na začiatku)
  btn.appendChild(ico);

  const label = document.createElement("span");
  label.className = "lcd-vz-skip-label";
  label.textContent = "Nechcem";
  btn.appendChild(label);

  btn._ico = ico;
  btn.addEventListener("click", () => onSkip());
  return btn;
}

/** Prepni vizuálny stav „Nechcem" dlaždice (aktívna = v sérii nič nevybrané). */
function setSkipActive(btn, active) {
  if (!btn) return;
  btn.setAttribute("aria-pressed", active ? "true" : "false");
  if (btn._ico) btn._ico.textContent = active ? "✓" : "⊘"; // ✓ / ⊘
}

function setSelectValue(select, opt) {
  if (!opt) return;
  select.value = opt.value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  // niektoré Shoptet handlery počúvajú aj input
  select.dispatchEvent(new Event("input", { bubbles: true }));
}

/* --- Zaokrúhlenie ZOBRAZENEJ ceny na celé eurá ------------------------------
 * Admin musí mať základnú cenu produktu 0,01 € (Shoptet inak produkt s 0 €
 * nezobrazí). Zákazníkovi by sa tak ukazovalo "0,01 €" / "5,01 €" … Tu vizuálne
 * zaokrúhlime zobrazenú Shoptet cenu na celé eurá (0 €, 5 €, 10 €…). Mení sa LEN
 * text v cenových elementoch — skutočná cena/objednávka (base + zálohy) ostáva.
 * ------------------------------------------------------------------------- */
const PRICE_SELECTORS = ".calculated-price, .price-final-holder, .price-final";

/** Vyparsuj číslo z ceny v SK/CZ formáte ("1 250,00" / "5,01" / "€ 0,01"). */
function parsePriceNumber(raw) {
  const t = String(raw).replace(/[^\d.,]/g, "");
  if (!t) return NaN;
  const dp = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
  if (dp > -1 && t.length - dp <= 3) {
    const intPart = t.slice(0, dp).replace(/[.,]/g, "");
    return Number(intPart + "." + t.slice(dp + 1));
  }
  return Number(t.replace(/[.,]/g, ""));
}

/** Celé číslo s medzerou ako tisícovým oddeľovačom (SK formát). */
function formatWhole(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Nahraď v texte prvé číslo (cenu) jeho zaokrúhlením na celé euro. */
function roundPriceText(text) {
  return text.replace(/\d[\d\s.,]*\d|\d/, (token) => {
    const num = parsePriceNumber(token);
    return Number.isFinite(num) ? formatWhole(Math.round(num)) : token;
  });
}

/** Zaokrúhli text vo všetkých "listových" cenových elementoch (idempotentne). */
function normalizePrices() {
  document.querySelectorAll(PRICE_SELECTORS).forEach((el) => {
    if (el.children.length) return; // len leaf elementy, nech neprepíšeme vnorený markup
    const orig = el.textContent || "";
    if (!/\d/.test(orig)) return;
    const next = roundPriceText(orig);
    if (next !== orig) el.textContent = next;
  });
}

/** Sleduj async prepočty ceny Shoptetom a po každom znova zaokrúhli. */
function watchPrices() {
  const area =
    document.querySelector(".p-final-price-wrapper") ||
    document.querySelector(".p-info-wrapper") ||
    document.body;
  if (!area || area.__lcdVzPriceWatch) return;
  area.__lcdVzPriceWatch = true;
  let scheduled = false;
  const obs = new MutationObserver(() => {
    if (scheduled) return; // debounce — a vďaka idempotencii nehrozí slučka
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      normalizePrices();
    }, 30);
  });
  obs.observe(area, { childList: true, subtree: true, characterData: true });
}

/** Slovenský plurál: 1 vzorka, 2–4 vzorky, inak vzoriek (podľa návrhu). */
function pluralVzorka(n) {
  const m10 = Math.abs(n) % 10;
  const m100 = Math.abs(n) % 100;
  if (m10 === 1 && m100 !== 11) return "vzorka";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "vzorky";
  return "vzoriek";
}

/** Kratší popis pre rekapituláciu (LUX-10 → "čierna", inak bez prefixu). */
function shortLabel(id, label) {
  if (!label) return "?";
  if (id === "LUX-10") return "čierna";
  return label.replace(/^(Lux Color( \d+)?|Comfort)\s*[—–-]\s*/, "");
}

export function renderVzorkyConfigurator(host) {
  injectStyles();
  const entries = findParamSelects();
  if (!entries.length) return false;

  // poradie dlaždíc v rámci série
  entries.forEach((e) => {
    e.idx = e.id in ID_ORDER ? ID_ORDER[e.id] : 999;
  });

  const root = document.createElement("div");
  root.id = MOUNT_ID;

  const seriesCountEls = {};
  const skipEls = {}; // seriesKey → „Nechcem" dlaždica
  const seriesSwatches = {}; // seriesKey → [{ entry, btn }] (na zrušenie výberu)
  const recapEls = {};
  const isYes = (e) => {
    const yo = yesOption(e.select);
    return !!yo && e.select.value === yo.value;
  };

  // poradie sérií: Diamond, Stripe, Hexa, 2. vrstva
  const order = ["diamond", "stripe", "hexa", "second"];

  // Prepočet: počítadlá v hlavičkách akordeonov + rekapitulácia objednávky.
  const recompute = () => {
    order.forEach((sk) => {
      const c = entries.filter((e) => e.seriesKey === sk && isYes(e)).length;
      const el = seriesCountEls[sk];
      if (el) {
        el.textContent = c === 1 ? "1 vybraná" : `${c} vybrané`;
        el.hidden = c === 0;
      }
      // „Nechcem" dlaždica je aktívna, keď v sérii nie je vybrané nič
      setSkipActive(skipEls[sk], c === 0);
    });

    const selected = entries
      .filter(isYes)
      .sort((a, b) => order.indexOf(a.seriesKey) - order.indexOf(b.seriesKey) || a.idx - b.idx);
    const n = selected.length;

    if (recapEls.count) recapEls.count.textContent = `${n} ${pluralVzorka(n)}`;
    if (recapEls.total) recapEls.total.textContent = `${n * DEPOSIT} €`;
    if (recapEls.desc) {
      recapEls.desc.textContent =
        n === 0
          ? "Zatiaľ nemáš vybratú žiadnu vzorku. Klikaj na vzorky v akordeónoch vyššie."
          : `Vratná záloha ${DEPOSIT} € za každú vzorku. Keď nám vzorky vrátiš, zálohu ti pošleme späť.`;
    }
    if (recapEls.selected) recapEls.selected.hidden = n === 0;
    if (recapEls.list) {
      recapEls.list.textContent = "";
      selected.forEach((e) => {
        const item = VZORKY_ITEMS[e.id] || {};
        const meta = SERIES_BY_KEY[e.seriesKey] || { title: e.seriesKey };
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = e.id;
        li.appendChild(strong);
        li.append(` — ${meta.title}: ${shortLabel(e.id, item.label)}`);
        recapEls.list.appendChild(li);
      });
    }

    // naša akcia → hneď zaokrúhli, Shoptet async prepočet dorieši watchPrices()
    normalizePrices();
    setTimeout(normalizePrices, 60);
  };

  // skry všetky natívne riadky parametrov
  entries.forEach((e) => hideNativeRow(e.select));

  // ID → entry (select). Vzorky bez parametra = neobjednávateľné náhľady.
  const entryById = Object.fromEntries(entries.map((e) => [e.id, e]));

  // Jednotlivé série ako akordeony (single-open, ako kroky konfigurátora).
  const accordions = [];
  let num = 0;
  order.forEach((seriesKey) => {
    const meta = SERIES_BY_KEY[seriesKey];
    if (!meta || !meta.ids || !meta.ids.length) return;
    const ids = meta.ids; // všetky vzorky série (vrátane náhľadov), v poradí návrhu
    if (!ids.some((id) => entryById[id] && isOrderableId(id))) return; // séria bez objednávateľných vzoriek
    const hasPreview = ids.some((id) => !isOrderableId(id));
    num += 1;

    const acc = document.createElement("div");
    acc.className = "lcd-vz-acc";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "lcd-vz-acc-head";
    head.setAttribute("aria-expanded", "false");
    const numEl = document.createElement("span");
    numEl.className = "lcd-vz-acc-num";
    numEl.textContent = String(num);
    const title = document.createElement("span");
    title.className = "lcd-vz-acc-title";
    title.textContent = meta.title;
    const countEl = document.createElement("span");
    countEl.className = "lcd-vz-acc-count";
    countEl.hidden = true;
    const chev = document.createElement("span");
    chev.className = "lcd-vz-acc-chev";
    head.append(numEl, title, countEl, chev);
    seriesCountEls[seriesKey] = countEl;

    const body = document.createElement("div");
    body.className = "lcd-vz-acc-body";
    const hint = document.createElement("p");
    hint.className = "lcd-vz-hint";
    hint.textContent = hasPreview
      ? "Vyber ľubovoľný počet objednávateľných vzoriek (5 € záloha / vzorka). Náhľady „Neposiela sa“ sa objednať nedajú."
      : "Vyber ľubovoľný počet vzoriek (vratná záloha 5 € / vzorka). Opätovný klik výber zruší.";
    body.appendChild(hint);
    const grid = document.createElement("div");
    grid.className = "lcd-vz-grid";

    // „Nechcem" dlaždica ako PRVÁ — klik zruší celý výber tejto série.
    const swatchRefs = [];
    seriesSwatches[seriesKey] = swatchRefs;
    const onSkip = () => {
      swatchRefs.forEach(({ entry, btn }) => {
        btn.setAttribute("aria-pressed", "false");
        setSelectValue(entry.select, noneOption(entry.select));
      });
      recompute();
    };
    const skip = buildSkipTile(onSkip);
    skipEls[seriesKey] = skip;
    grid.appendChild(skip);

    ids.forEach((id) => {
      const e = entryById[id];
      // Objednávateľná = manifest hovorí orderable AND existuje podkladový <select>.
      // Náhľad = všetko ostatné (vrátane neobjednávateľnej vzorky, pre ktorú by
      // Shoptet omylom vystavil parameter — tú držíme poistne na „Nechcem").
      if (e && isOrderableId(id)) {
        const none = noneOption(e.select);
        const yes = yesOption(e.select);
        const onPick = (btn) => {
          const already = btn.getAttribute("aria-pressed") === "true";
          if (already) {
            btn.setAttribute("aria-pressed", "false");
            setSelectValue(e.select, none); // odznač → "Nechcem"
          } else {
            btn.setAttribute("aria-pressed", "true");
            setSelectValue(e.select, yes); // označ → "Chcem" (+5 €)
          }
          recompute();
        };
        const sw = buildSwatch(id, { onPick, highlight: hasPreview });
        if (isYes(e)) sw.setAttribute("aria-pressed", "true");
        swatchRefs.push({ entry: e, btn: sw });
        grid.appendChild(sw);
      } else {
        // Neobjednávateľný náhľad. Ak preň Shoptet predsa len vystavil <select>,
        // držíme ho na „Nechcem", aby sa nikdy nedostal do objednávky.
        if (e) {
          const none = noneOption(e.select);
          if (none && e.select.value !== none.value) setSelectValue(e.select, none);
        }
        grid.appendChild(buildSwatch(id, { preview: true })); // náhľad, nejde vybrať
      }
    });
    body.appendChild(grid);

    const setOpen = (open) => {
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", open ? "true" : "false");
    };
    head.addEventListener("click", () => {
      const willOpen = !acc.classList.contains("is-open");
      accordions.forEach((a) => a.setOpen(false)); // single-open ako konfigurátor
      setOpen(willOpen);
    });

    acc.append(head, body);
    accordions.push({ setOpen });
    root.appendChild(acc);
  });

  // prvý akordeon otvorený (ako krok 1 konfigurátora)
  if (accordions[0]) accordions[0].setOpen(true);

  // Rekapitulácia objednávky — tmavá karta podľa návrhu (DARK + zlaté akcenty).
  const recap = document.createElement("div");
  recap.className = "lcd-vz-recap";

  const top = document.createElement("div");
  top.className = "lcd-vz-recap-top";

  const colL = document.createElement("div");
  colL.className = "lcd-vz-recap-col";
  const ebL = document.createElement("div");
  ebL.className = "lcd-vz-recap-eyebrow";
  ebL.textContent = "Tvoja objednávka vzoriek";
  const countBig = document.createElement("div");
  countBig.className = "lcd-vz-recap-count";
  const desc = document.createElement("div");
  desc.className = "lcd-vz-recap-desc";
  colL.append(ebL, countBig, desc);

  const colR = document.createElement("div");
  colR.className = "lcd-vz-recap-col right";
  const ebR = document.createElement("div");
  ebR.className = "lcd-vz-recap-eyebrow";
  ebR.textContent = "Vratná záloha spolu";
  const totalBig = document.createElement("div");
  totalBig.className = "lcd-vz-recap-total";
  const sub = document.createElement("div");
  sub.className = "lcd-vz-recap-sub";
  sub.textContent = "+ poštovné + poplatok za platbu";
  colR.append(ebR, totalBig, sub);

  top.append(colL, colR);

  const selBlock = document.createElement("div");
  selBlock.className = "lcd-vz-recap-selected";
  selBlock.hidden = true;
  const selEb = document.createElement("div");
  selEb.className = "lcd-vz-recap-eyebrow";
  selEb.textContent = "Vybrané vzorky:";
  const list = document.createElement("ul");
  list.className = "lcd-vz-recap-list";
  selBlock.append(selEb, list);

  const note = document.createElement("p");
  note.className = "lcd-vz-recap-note";
  note.textContent =
    "Záloha 5 € / vzorka sa vráti po obdržaní vzoriek späť. Objednávku dokonči kliknutím na „Pridať do košíka“ nižšie.";

  recap.append(top, selBlock, note);
  recapEls.count = countBig;
  recapEls.total = totalBig;
  recapEls.desc = desc;
  recapEls.selected = selBlock;
  recapEls.list = list;
  root.appendChild(recap);

  host.appendChild(root);
  recompute();

  // Zaokrúhli zobrazenú cenu na celé eurá (0,01 € základ → 0 €) a sleduj
  // ďalšie prepočty Shoptetu (po výbere vzorky). Niekoľko retry-ov pre prípad,
  // že Shoptet vykreslí cenu až po našom mounte.
  watchPrices();
  normalizePrices();
  [120, 400, 1000].forEach((d) => setTimeout(normalizePrices, d));
  return true;
}

/** Mount: nájdi miesto v detaile produktu a vykresli (s retry na neskorý DOM). */
export function mountVzorkyConfigurator() {
  document.body && document.body.classList.add("is-vzorky-konfigurator");

  const tryMount = () => {
    if (document.getElementById(MOUNT_ID)) return true;
    const selects = findParamSelects();
    if (!selects.length) return false;

    // Mount do PRAVÉHO stĺpca produktu, hneď ZA tabuľku surcharge parametrov
    // (Shoptet: <table> s <tr class="surcharge-list">). Tým ostane cena, počet
    // aj „Pridať do košíka" presne tam, kde boli — meníme len vzhľad parametrov.
    const host = document.createElement("div");
    host.className = "lcd-vz-host";

    const firstSel = selects[0].select;
    const table = firstSel.closest("table");
    const wrapper = firstSel.closest(".p-info-wrapper") || table;
    if (table && table.parentElement) {
      table.parentElement.insertBefore(host, table.nextSibling); // za tabuľku
    } else if (wrapper) {
      const row = rowOf(firstSel);
      if (row && row.parentElement) row.parentElement.insertBefore(host, row);
      else wrapper.appendChild(host);
    } else {
      (document.querySelector(".p-info-wrapper") || document.body).appendChild(host);
    }
    return renderVzorkyConfigurator(host);
  };

  if (tryMount()) return;
  let tries = 0;
  const iv = setInterval(() => {
    if (tryMount() || ++tries > 40) clearInterval(iv);
  }, 100);
}
