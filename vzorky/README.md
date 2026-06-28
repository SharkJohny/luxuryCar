# Vzorkovník → Shoptet (pasteable HTML blok)

Vyrobí **jeden samostatný HTML blok**, ktorý sa vloží priamo do Shoptet stránky.
Zdroj je klientsky konfigurátor vzoriek (`luxusnerohoze-dev/vzorky`).

## Výstup — čo vložiť do Shoptetu

**`dist/vzorky-shoptet.html`** — skopíruj **celý obsah** súboru a vlož ho do
Shoptet stránky v režime **HTML / zdrojový kód** (nie WYSIWYG).

Blok je úplne self-contained:
- **React je inline** (UMD z `node_modules`) — žiadny externý CDN (unpkg/Babel).
- **Obrázky sú inline base64** (downscale + JPEG) — žiadne relatívne cesty, nič netreba hostovať.
- **CSS je scopnuté pod `#lcd-vzorky-root`** — neprepíše štýly Shoptet témy.
- **Guard proti dvojitému mountu** — bezpečné aj keď sa blok omylom vloží 2×.

Funkcionalita: výber vzoriek (Diamond/Stripe/Hexa + 2. vrstva), súhrn, tlačidlo
skopíruje objednávku do schránky (`navigator.clipboard`) → zákazník ju pošle na
`objednavky@luxurycardesign.sk`. Žiadny backend, žiadna Shoptet cart integrácia.

## Regenerácia (keď klient upraví konfigurátor)

```bash
yarn vzorky:fetch    # stiahne najnovší konfigurator.jsx + referencované obrázky z GitHubu
yarn build:vzorky    # pregeneruje dist/vzorky-shoptet.html
yarn vzorky:test     # jsdom mount test (žiadne runtime chyby, obrázky base64, math OK)
```

`vzorky:fetch` vyžaduje prihlásené `gh` (GitHub CLI).

## Štruktúra

| Súbor | Popis |
|---|---|
| `build-vzorky.mjs` | Build pipeline (sharp resize + esbuild JSX→JS + inline React + scoped CSS) |
| `fetch-source.sh` | Stiahne zdroj + len referencované obrázky (nie celých ~110 MB repa) |
| `test-mount.mjs` | jsdom mount test |
| `src/konfigurator.jsx` | Zrkadlo klientskeho zdroja (kompiluje sa) — **needituj ručne**, prepíše `vzorky:fetch` |
| `src/shell.html` | HTML šablóna so scopnutým `<style>` + mount div |
| `src/index.original.html` | Referencia — ako to klient spúšťa štandalone |
| `images/` | Stiahnuté originály (gitignored, re-fetchable) |
| `dist/vzorky-shoptet.html` | **VÝSTUP — toto sa vkladá do Shoptetu** |

## Vzorkovník ako Shoptet produkt (SURCHARGE_PARAMETER)

`vzorky/dist/vzorky-product.xml` — produkt na **XML import** do Shoptetu, kde
**každá vzorka = jeden samostatný príplatkový parameter** (Nechcem 0 € /
Chcem +5 € vratná záloha). **45 parametrov** (Stripe 8 + Hexa 3 + Diamond 18 +
2.vrstva 16× Lux Color). Základná cena 0 €, každá zaškrtnutá vzorka pridá 5 €.

> **Prečo samostatný parameter na vzorku, nie jeden parameter na vrstvu?**
> Príplatkový parameter s viacerými hodnotami je v Shoptete **single-select**
> (dropdown) — z vrstvy by šlo vybrať len 1 farbu. Aby si zákazník mohol objednať
> **viac vzoriek naraz**, je každá vzorka vlastný yes/no parameter.

```bash
yarn vzorky:product   # vygeneruje + zvaliduje proti RELAX NG schéme
```

Dáta sa čítajú z `src/konfigurator.jsx` (rovnaký zdroj ako konfigurátor), takže
produkt a konfigurátor ostávajú konzistentné. Pri zmene vzoriek stačí
`yarn vzorky:fetch` + `yarn vzorky:product`.

## Ladenie veľkosti

V `build-vzorky.mjs`: `SWATCH_EDGE/SWATCH_Q` (swatche 1. vrstvy + 2. vrstva) a
`PHOTO_EDGE/PHOTO_Q` (3 hero fotky vľavo). Aktuálne ~2.7 MB.

## Pozn. k chýbajúcim obrázkom

`2.vrstva/new/Lux_color_14/15/16.png` zatiaľ nie sú v klientskom repe → build
za ne dá tmavú placeholder dlaždicu (sú to len náhľady, neobjednávateľné; label
sa zobrazí pod swatchom). Keď klient fotky doplní, `vzorky:fetch` + `build:vzorky`
ich automaticky vloží.
