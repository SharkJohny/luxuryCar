#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * build-vzorky.mjs — Konfigurátor vzoriek → jeden self-contained HTML blok
 *
 * Z klientskeho zdroja (vzorky/src/konfigurator.jsx) vyrobí pasteable blok pre
 * Shoptet: React inline (UMD z node_modules), obrázky inline ako base64
 * (downscale + JPEG q80), CSS scopnuté pod #lcd-vzorky-root.
 *
 * Spustenie:  yarn build:vzorky   (alebo: node vzorky/build-vzorky.mjs)
 *
 * Refresh po zmene od klienta:
 *   1) yarn vzorky:fetch   — stiahne najnovší konfigurator.jsx + referencované obrázky
 *   2) yarn build:vzorky   — pregeneruje dist/vzorky-shoptet.html
 * ------------------------------------------------------------------------- */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { transform } from "esbuild";

const ROOT = dirname(fileURLToPath(import.meta.url)); // vzorky/
const REPO = join(ROOT, "..");
const SRC = join(ROOT, "src", "konfigurator.jsx");
const SHELL = join(ROOT, "src", "shell.html");
const IMAGES = join(ROOT, "images");
const OUT = join(ROOT, "dist", "vzorky-shoptet.html");

// Zobrazovacie veľkosti (2× retina): swatch 128px + inline preview ~360px →
// 480px stačí. Hero fotky vľavo (ProductPhotos) sa zobrazujú väčšie → 760px.
const SWATCH_EDGE = 480;
const SWATCH_Q = 78;
const PHOTO_EDGE = 760;
const PHOTO_Q = 82;
const MOUNT_ID = "lcd-vzorky-root";

const log = (...a) => console.log("[vzorky]", ...a);

// --- 1. Načítaj klientsky zdroj --------------------------------------------
let jsx = readFileSync(SRC, "utf8");

// --- 2. Vytiahni referencované obrázky -------------------------------------
//   IMG("...")      → images/web/...      (swatche)
//   IMG_PATH("...") → images/product/...  (fotky vľavo)
const webArgs = [...jsx.matchAll(/\bIMG\("([^"]+)"\)/g)].map((m) => m[1]);
const prodArgs = [...jsx.matchAll(/\bIMG_PATH\("([^"]+)"\)/g)].map((m) => m[1]);
log(`referencií: ${webArgs.length} web + ${prodArgs.length} product`);

// --- 3. Optimalizuj + base64, postav mapu ----------------------------------
async function placeholderTile() {
  // Tmavá dlaždica pre chýbajúce náhľady (label sa aj tak zobrazí pod swatchom).
  return sharp({ create: { width: SWATCH_EDGE, height: SWATCH_EDGE, channels: 3, background: "#1a1008" } })
    .jpeg({ quality: 60 })
    .toBuffer();
}
async function encode(rel, { edge, quality }) {
  const abs = join(IMAGES, rel);
  let buf;
  let placeholder = false;
  const raw = existsSync(abs) ? readFileSync(abs) : null;
  if (raw && raw.length > 0) {
    buf = await sharp(raw)
      .rotate() // rešpektuj EXIF orientáciu
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  } else {
    buf = await placeholderTile();
    placeholder = true;
  }
  return { dataUri: "data:image/jpeg;base64," + buf.toString("base64"), bytes: buf.length, placeholder };
}

const map = {};
const missing = [];
let totalBytes = 0;
for (const a of webArgs) {
  const { dataUri, bytes, placeholder } = await encode("web/" + a, { edge: SWATCH_EDGE, quality: SWATCH_Q });
  map["IMG:" + a] = dataUri;
  totalBytes += bytes;
  if (placeholder) missing.push("web/" + a);
}
for (const a of prodArgs) {
  const { dataUri, bytes, placeholder } = await encode("product/" + a, { edge: PHOTO_EDGE, quality: PHOTO_Q });
  map["IMGP:" + a] = dataUri;
  totalBytes += bytes;
  if (placeholder) missing.push("product/" + a);
}
log(`obrázky optimalizované: ${(totalBytes / 1048576).toFixed(2)} MB (pred base64)`);
if (missing.length) log(`CHÝBAJÚCE (placeholder tile): ${missing.join(", ")}`);

// --- 4. Predefinuj helpery na lookup do mapy -------------------------------
const FALLBACK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="; // 1px transparent
const beforeWeb = jsx;
jsx = jsx.replace(
  /const IMG = \(path\) => "\.\/images\/web\/" \+ path\.split\("\/"\)\.map\(encodeURIComponent\)\.join\("\/"\);/,
  `const IMG = (path) => (window.__LCD_IMG_MAP__["IMG:" + path] || ${JSON.stringify(FALLBACK)});`,
);
const beforeProd = jsx;
jsx = jsx.replace(
  /const IMG_PATH = \(name\) => "\.\/images\/product\/" \+ encodeURIComponent\(name\);/,
  `const IMG_PATH = (name) => (window.__LCD_IMG_MAP__["IMGP:" + name] || ${JSON.stringify(FALLBACK)});`,
);
if (jsx === beforeWeb) throw new Error("IMG() helper sa nepodarilo nahradiť — zmenila sa definícia v zdroji?");
if (jsx === beforeProd) throw new Error("IMG_PATH() helper sa nepodarilo nahradiť — zmenila sa definícia v zdroji?");

// --- 5. Presmeruj mount #root → #lcd-vzorky-root ---------------------------
const beforeMount = jsx;
jsx = jsx.replace(/getElementById\("root"\)/g, `getElementById(${JSON.stringify(MOUNT_ID)})`);
if (jsx === beforeMount) throw new Error("Mount getElementById(\"root\") sa v zdroji nenašiel.");

// --- 6. JSX → JS (classic runtime, globálny React), minify -----------------
const { code: compiledRaw } = await transform(jsx, {
  loader: "jsx",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  // charset: "ascii" (default) escapuje diakritiku v stringoch na \uXXXX.
  charset: "ascii",
});

// esbuild NEescapuje non-ASCII vnútri regex literálov (napr. `—` v
// /^(Lux Color|Comfort) — /). Doescapujeme KAŽDÝ zostávajúci non-ASCII code
// point na \uXXXX — sémanticky identické v stringoch aj regexoch. Výsledok je
// 100 % ASCII → renderuje správne v ľubovoľnom kódovaní hostiteľskej stránky.
const toAscii = (s) =>
  s.replace(/[\u0080-\uFFFF]/g, (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"));
const compiled = toAscii(compiledRaw);

// --- 7. React UMD (z node_modules) -----------------------------------------
const react = readFileSync(join(REPO, "node_modules/react/umd/react.production.min.js"), "utf8");
const reactDom = readFileSync(join(REPO, "node_modules/react-dom/umd/react-dom.production.min.js"), "utf8");

// --- 8. Poskladaj <script> a vlož do shellu --------------------------------
const bundle = [
  "/* React 18.3.1 (UMD production) - inline, ziadny externy CDN */",
  react,
  reactDom,
  "(function(){",
  '  if (window.__LCD_VZORKY_MOUNTED__) return;            // guard proti dvojitemu mountu',
  "  window.__LCD_VZORKY_MOUNTED__ = true;",
  "  window.__LCD_IMG_MAP__ = " + JSON.stringify(map) + ";",
  compiled,
  "})();",
].join("\n");

const shell = readFileSync(SHELL, "utf8");
const html = shell.replace("/*__LCD_VZORKY_BUNDLE__*/", () => bundle);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html, "utf8");

// Samostatné JS a CSS (na porovnanie vo vývojovom prostredí). Funkčne sú už
// súčasťou vzorky-shoptet.html; tu len oddelené pre prehľad/diff.
const JS_OUT = join(ROOT, "dist", "vzorky.js");
const CSS_OUT = join(ROOT, "dist", "vzorky.css");
writeFileSync(JS_OUT, bundle + "\n", "utf8");
const cssMatch = shell.match(/<style>([\s\S]*?)<\/style>/);
writeFileSync(CSS_OUT, (cssMatch ? cssMatch[1].trim() : "") + "\n", "utf8");

// Lokálny náhľad: kompletný dokument s <meta charset> na bezproblémové otvorenie
// v prehliadači (file://). Do Shoptetu sa vkladá vzorky-shoptet.html, NIE toto.
const PREVIEW = join(ROOT, "dist", "preview.html");
const preview =
  '<!DOCTYPE html>\n<html lang="sk">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  "<title>Náhľad — Konfigurátor vzoriek</title>\n</head>\n<body>\n" +
  html +
  "\n</body>\n</html>\n";
writeFileSync(PREVIEW, preview, "utf8");

const sizeMB = (Buffer.byteLength(html, "utf8") / 1048576).toFixed(2);
log(`HOTOVO → ${OUT} (${sizeMB} MB)`);
log(`JS     → ${JS_OUT}`);
log(`CSS    → ${CSS_OUT}`);
log(`náhľad  → ${PREVIEW} (otvor v prehliadači)`);
