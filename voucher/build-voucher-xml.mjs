#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * build-voucher-xml.mjs — Shoptet produkty pre darčekovú poukážku (fáze 1)
 *
 * Poukaz = 6 produktov:
 *   - 1× MASTER ("VOUCHER") — visible, hostí konfigurátor (assets/js/
 *     voucher-konfigurator/). Základná cena 0,01 € (Shoptet nezobrazí
 *     produkt s cenou 0 €; konfigurátor zobrazenú cenu vlastnou UI prekrýva).
 *     Sám sa do košíka nepridáva.
 *   - 5× "MINCA" ("VOUCHER-100" … "VOUCHER-500") — VISIBILITY=detailOnly:
 *     dostupné cez priamu URL (potrebné pre cart.js — iframe + natívne
 *     tlačidlo), ale NEZOBRAZUJÚ sa v kategóriách/vyhľadávaní, takže sa
 *     nedajú kúpiť inak než cez konfigurátor. Vlastná suma sa skladá z
 *     kombinácie mincí (assets/js/voucher-konfigurator/pricing.js).
 *
 * Discount/loyalty/quantity zľavy na minciach VYPNUTÉ (bežná prax pri
 * darčekových poukazoch — zabráni "zlacneniu" poukazu kupónom). Uprav, ak
 * má klient inú politiku.
 *
 * PO IMPORTE DO SHOPTETU (viď plán "Riziká a body k overeniu"):
 *   1) over reálne vygenerované URL adries (slug zo Shoptetu) a dopln ich do
 *      assets/js/voucher-konfigurator/cart.js#COIN_URLS,
 *   2) over VAT sadzbu (nižšie 21 % — prevzaté z vzorky/build-product-xml.mjs,
 *      over proti aktuálnemu nastaveniu Shoptet administrácie).
 *
 * Spustenie: node voucher/build-voucher-xml.mjs   (alebo yarn voucher:product)
 * ------------------------------------------------------------------------- */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist", "voucher-products.xml");

const CATEGORY_ID = "500";
const CATEGORY_NAME = "Naše produkty";
const VAT = 21; // TODO: over proti aktuálnemu nastaveniu Shoptet administrácie

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const COINS = [100, 200, 300, 400, 500];

function categories() {
  return [
    "    <CATEGORIES>",
    `      <CATEGORY id="${CATEGORY_ID}">${esc(CATEGORY_NAME)}</CATEGORY>`,
    `      <DEFAULT_CATEGORY id="${CATEGORY_ID}">${esc(CATEGORY_NAME)}</DEFAULT_CATEGORY>`,
    "    </CATEGORIES>",
  ].join("\n");
}

function masterProduct() {
  const guid = randomUUID();
  const shortDesc =
    "<![CDATA[<p>Darčeková poukážka Luxury Car Design — vyber hodnotu v konfigurátore nižšie. " +
    "Platnosť 12 mesiacov, platí na celý sortiment.</p>]]>";
  const desc =
    "<![CDATA[<p>Daruj zážitok z luxusu. Vyber hodnotu poukážky v konfigurátore — " +
    "kód poukážky ti pošleme emailom po spracovaní objednávky. Obdarovaný ho uplatní " +
    "v košíku na <strong>luxurycardesign.sk</strong> pri ďalšom nákupe.</p>]]>";
  return [
    '  <SHOPITEM id="3101">',
    "    <NAME>Darčeková poukážka</NAME>",
    `    <GUID>${guid}</GUID>`,
    `    <SHORT_DESCRIPTION>${shortDesc}</SHORT_DESCRIPTION>`,
    `    <DESCRIPTION>${desc}</DESCRIPTION>`,
    "    <MANUFACTURER>Luxury Car Design</MANUFACTURER>",
    "    <ADULT>0</ADULT>",
    "    <ITEM_TYPE>product</ITEM_TYPE>",
    categories(),
    "    <FLAGS>",
    "      <FLAG><CODE>new</CODE><ACTIVE>1</ACTIVE></FLAG>",
    "    </FLAGS>",
    "    <VISIBILITY>visible</VISIBILITY>",
    "    <META_DESCRIPTION>Darčeková poukážka Luxury Car Design — hodnota 100–500 € alebo vlastná suma po 100 €. Platnosť 12 mesiacov.</META_DESCRIPTION>",
    "    <UNIT>ks</UNIT>",
    "    <CODE>VOUCHER</CODE>",
    "    <CURRENCY>EUR</CURRENCY>",
    "    <PRICE>0.01</PRICE>",
    `    <VAT>${VAT}</VAT>`,
    "    <STANDARD_PRICE>0.01</STANDARD_PRICE>",
    "    <APPLY_DISCOUNT_COUPON>0</APPLY_DISCOUNT_COUPON>",
    "    <APPLY_LOYALTY_DISCOUNT>0</APPLY_LOYALTY_DISCOUNT>",
    "    <APPLY_QUANTITY_DISCOUNT>0</APPLY_QUANTITY_DISCOUNT>",
    "    <APPLY_VOLUME_DISCOUNT>0</APPLY_VOLUME_DISCOUNT>",
    "    <STOCK>",
    "      <AMOUNT>999</AMOUNT>",
    "    </STOCK>",
    "    <VISIBLE>1</VISIBLE>",
    "    <AVAILABILITY_IN_STOCK>Skladem</AVAILABILITY_IN_STOCK>",
    "  </SHOPITEM>",
  ].join("\n");
}

function coinProduct(value, id) {
  const guid = randomUUID();
  const name = `Darčeková poukážka ${value} €`;
  const shortDesc = `<![CDATA[<p>Darčeková poukážka v hodnote ${value} € — súčasť konfigurátora darčekovej poukážky (nekupuje sa samostatne).</p>]]>`;
  return [
    `  <SHOPITEM id="${id}">`,
    `    <NAME>${esc(name)}</NAME>`,
    `    <GUID>${guid}</GUID>`,
    `    <SHORT_DESCRIPTION>${shortDesc}</SHORT_DESCRIPTION>`,
    `    <DESCRIPTION>${shortDesc}</DESCRIPTION>`,
    "    <MANUFACTURER>Luxury Car Design</MANUFACTURER>",
    "    <ADULT>0</ADULT>",
    "    <ITEM_TYPE>product</ITEM_TYPE>",
    categories(),
    "    <FLAGS>",
    "      <FLAG><CODE>new</CODE><ACTIVE>0</ACTIVE></FLAG>",
    "    </FLAGS>",
    // detailOnly: dostupné cez priamu URL (potrebné pre cart.js), ale nezobrazí sa
    // v kategóriách/vyhľadávaní — nedá sa kúpiť inak než cez konfigurátor.
    "    <VISIBILITY>detailOnly</VISIBILITY>",
    `    <META_DESCRIPTION>Darčeková poukážka ${value} € — Luxury Car Design.</META_DESCRIPTION>`,
    "    <UNIT>ks</UNIT>",
    `    <CODE>VOUCHER-${value}</CODE>`,
    "    <CURRENCY>EUR</CURRENCY>",
    `    <PRICE>${value}</PRICE>`,
    `    <VAT>${VAT}</VAT>`,
    `    <STANDARD_PRICE>${value}</STANDARD_PRICE>`,
    "    <APPLY_DISCOUNT_COUPON>0</APPLY_DISCOUNT_COUPON>",
    "    <APPLY_LOYALTY_DISCOUNT>0</APPLY_LOYALTY_DISCOUNT>",
    "    <APPLY_QUANTITY_DISCOUNT>0</APPLY_QUANTITY_DISCOUNT>",
    "    <APPLY_VOLUME_DISCOUNT>0</APPLY_VOLUME_DISCOUNT>",
    "    <STOCK>",
    "      <AMOUNT>999</AMOUNT>",
    "    </STOCK>",
    "    <VISIBLE>1</VISIBLE>",
    "    <AVAILABILITY_IN_STOCK>Skladem</AVAILABILITY_IN_STOCK>",
    "  </SHOPITEM>",
  ].join("\n");
}

const items = [masterProduct(), ...COINS.map((v, i) => coinProduct(v, 3102 + i))];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SHOP>
${items.join("\n")}
</SHOP>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, xml, "utf8");
console.log(`[voucher-xml] 1 master (VOUCHER, visible) + ${COINS.length} mincí (VOUCHER-100…500, detailOnly)`);
console.log(`[voucher-xml] HOTOVO → ${OUT}`);
