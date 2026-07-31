<!-- shoptet-tool: auto-generated, bezpečné smazat -->
# AI kontext pro projekt luxurycar
Tento soubor je auto-generovaný nástrojem Shoptet Tool. Slouží jako rychlá
orientace v projektu pro AI asistenta. Když ho ručně upravíš, při dalším
otevření projektu se přepíše — případné dlouhodobé poznámky dej do
`AI-NOTES.md` (ten zůstane nedotčený).
## Základní údaje
- **Název:** luxurycar
- **URL náhledu:** https://www.luxurycardesign.sk/
- **Lokální složka:** `/Users/sharkjohny/Dev/shoptet/spt-luxuryCar`
- **JS výstup:** `/Users/sharkjohny/Dev/shoptet/spt-luxuryCar/assets/js/main.js`
## E-shopy projektu (varianty) — KRITICKÉ
- **Aktivní e-shop:** Výchozí — https://www.luxurycardesign.sk/
Tento projekt obsluhuje VÍCE e-shopů na stejném kódu:
- Výchozí — https://www.luxurycardesign.sk/   ← AKTIVNÍ
- CZ — https://www.luxurycardesign.cz/
Veškeré operace (navigate/curl na náhled, screenshoty, admin, kontroly) prováděj
VÝHRADNĚ proti aktivnímu e-shopu výše. URL jiných variant NIKDY nepoužívej.
## SCSS — TOTO edituj (KRITICKÉ)
- **SCSS entry:** `/Users/sharkjohny/Dev/shoptet/spt-luxuryCar/assets/css/luxuryCar.scss`
- **Partialy:** `/Users/sharkjohny/Dev/shoptet/spt-luxuryCar/assets/css/partials` (`_*.scss`)
- **Generovaný CSS (needituj):** `/Users/sharkjohny/Dev/shoptet/spt-luxuryCar/assets/css/luxuryCar.css` — přepíše se při každé kompilaci.
Pravidla (aby proklikávání CSS→SCSS v Inspektoru zůstalo stabilní):
- Edituj vždy existující `.scss`/partial, NIKDY generovaný `.css`.
- NIKDY neslévej partialy do jednoho souboru a neměň `@import` pořadí v entry —
  rozbiješ tím sourcemapu a klik v Inspektoru přestane trefovat správný řádek.
- Nové pravidlo patří do odpovídajícího existujícího partialu podle tématu
  (layout/header/footer/…), ne do entry souboru samotného.
## Swap engine (jak nástroj obsluhuje náhled)
- Každý GET na URL e-shopu, který má protějšek v lokální složce, se přesměruje
  na lokální soubor (path-preserving + /assets/... tail + fallback na cssPath/jsPath).
- Po uložení libovolného .scss/.css/.js/.html ve složce se náhled automaticky reloaduje.
- SCSS se kompiluje uvnitř nástroje (sass) — edituj `.scss`, NE výsledné `.css`
  (přepsalo by se při příští kompilaci).
## Klíčové soubory (do hloubky 3, max 60)
```
assets/css/_UpsalePopup.scss
assets/css/_article.scss
assets/css/_buttons.scss
assets/css/_cart.scss
assets/css/_categories.scss
assets/css/_content.scss
assets/css/_debug.scss
assets/css/_footer.scss
assets/css/_general.scss
assets/css/_googleRew.scss
assets/css/_header.scss
assets/css/_index.scss
assets/css/_menu.scss
assets/css/_mixins.scss
assets/css/_optimization.scss
assets/css/_product.scss
assets/css/_productPage.scss
assets/css/_res_menu.scss
assets/css/_responsive.scss
assets/css/_truckKonfigurator.scss
assets/css/_variables.scss
assets/css/generic.css
assets/css/jquery-google-reviews.css
assets/css/luxuryCar-shoptet.css
assets/css/luxuryCar.css
assets/css/luxuryCar.scss
assets/css/luxuryCarOld.css
assets/css/twentytwenty.css
assets/css/video-play-again.css
assets/js/cars.js
assets/js/components/UpsalePopup.js
assets/js/components/cart.js
assets/js/components/contactForm.js
assets/js/components/creatButtons.js
assets/js/components/header.js
assets/js/components/index.js
assets/js/components/productPage.js
assets/js/configurator-enhance.js
assets/js/functions/configuratorEngine.js
assets/js/functions/errorToCart.js
assets/js/functions/livePrice.js
assets/js/functions/stickyphotos.js
assets/js/functions/validation.js
assets/js/functions/video-play-again.js
assets/js/jquery.twentytwenty.js
assets/js/lcd-reviews.js
assets/js/lcd-videos.js
assets/js/loader.js
assets/js/luxuryCar.js
assets/js/luxuryCarOld.js
assets/js/main.js
assets/js/option.js
assets/js/reviews-data.js
assets/js/script.js
assets/js/seo-runtime.js
assets/js/truck-konfigurator/app.js
assets/js/truck-konfigurator/pricing.js
assets/js/truck-konfigurator/truck-brands.js
assets/js/voucher-konfigurator/cart.js
assets/js/voucher-konfigurator/pricing.js
assets/js/voucher-konfigurator/styles.js
assets/js/vzorky-konfigurator/index.js
seo-faza-a/h1-visible.css
```
## Detekované CSS proměnné (--var)
```css
--feature-chart-heading-width: 140px;
--gradient: linear-gradient(45deg, rgba(128, 130, 133, 1) 31%, rgba(208, 140, 60, 1) 100%);
--impact-text-spacing: 2rem;
--timeline-dot-padding-inline-end: 1.25rem;
--timeline-dot-size: 1.25rem;
```
## Pracovní konvence
- Změny dělej v co nejmenších rozsahových úsecích.
- Pokud upravuješ pravidlo z cizího CSS (např. Shoptet framework), zkopíruj ho
  do lokálního SCSS entry a uprav tam — nepřepisuj cizí soubory.
- Tam, kde mají smysl, používej CSS proměnné z výpisu výše.
- Při úpravách dimenzí kontroluj jak desktop, tak mobil (náhled lze přepnout).
## Addony (znovupoužitelné doplňky)
Na požádání vytvoř addon a publikuj na GitHub:
- Addon = 1 SCSS partial + 1 JS modul + `addon.json` (name kebab-case, version,
  description, scss, js, jsInit, instructions) + README + **INSTRUCTIONS.md**
  (povinné — Markdown s instrukcemi k doplňku), v samostatném adresáři mimo projekt.
- Publikace: `git init && git add -A && git commit` a `gh repo create
  SharkJohny/spt-addon-<name> --private --source=<dir> --remote=origin --push`.
- Pak uživatel addon přidá ve Správci addonů (🧩) a nainstaluje do projektu.
## Co je v každém promptu
Uživatelův dotaz dostáváš s těmito přílohami (pokud existují):
- `last-dom.html` — celý aktuální DOM náhledu
- `preview.png` — screenshot náhledu
- Inspektor context (pokud něco zkoumá)
- Figma screenshot (pokud v dotazu byla figma.com URL)
