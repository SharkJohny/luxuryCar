# Roadmap

## Vzorkovník → Shoptet (pasteable HTML)
- [x] Analýza klientskeho repa `luxusnerohoze-dev/vzorky` (zdroj, obrázky, runtime deps)
- [x] Build pipeline `vzorky/build-vzorky.mjs` (sharp resize + esbuild JSX→JS)
- [x] Inline React (UMD z node_modules) — odstránený unpkg/Babel CDN
- [x] Inline base64 obrázky (len 48 referencovaných, downscale) — žiadne externé cesty
- [x] Scopnuté CSS pod `#lcd-vzorky-root` + guard proti dvojitému mountu
- [x] `fetch-source.sh` + npm scripty (`vzorky:fetch`, `build:vzorky`, `vzorky:test`)
- [x] jsdom mount test — 0 runtime chýb, 49 base64 img, order math OK
- [x] Výstup `vzorky/dist/vzorky-shoptet.html` (~2.7 MB), pripravený na vloženie
- [x] Fix: celý blok prepísaný na čisté ASCII (\uXXXX) — opravená rozsypaná diakritika
- [x] Klient doplnil fotky `2.vrstva/new/Lux_color_14/15/16.png` (commit `de70531`,
      8.5.2026) → `yarn vzorky:fetch` (opravený `mapfile`→portable read loop pre bash 3.2
      + `Accept: application/vnd.github.raw` namiesto base64 `content`, ktorý má na GH API
      1MB limit — fotky boli 14-18MB) + `yarn build:vzorky` → placeholder v
      `dist/vzorky-shoptet.html` nahradený reálnymi náhľadmi, `yarn vzorky:test` OK
- [ ] Klient: vložiť blok do Shoptet stránky a vizuálne overiť

## Vzorkovník — JS výnimka v HLAVNOM kóde (vizuálny vzorkovník napojený na košík)
Pôvodný pokus (mount celého standalone React bloku s base64) ZAMIETNUTÝ — rozbíjal
bundle. Nová, čistá implementácia:
- [x] `assets/js/vzorky-konfigurator/index.js` — vanilla (žiadny React/base64),
      nájde 45 surcharge `<select>`-ov (ID z `data-parameter-name` „(S-1)"), skryje
      natívne riadky, zoskupí do 4 sérií POD SEBA, vyrenderuje mriežku dlaždíc;
      klik → set `<select>` na „Chcem/Nechcem" + `change` → Shoptet ráta zálohu
- [x] Swatch obrázky cez CDN: `vzorky/build-swatch-assets.mjs` (`yarn vzorky:swatches`)
      optimalizuje 42 fotiek do `assets/img/vzorky/<ID>.jpg` (1.1 MB), CI ich mirroruje
      na CDN — **žiadny base64 bloat** (bundle ostáva 10.4 MB)
- [x] Manifest `assets/js/vzorky-konfigurator/swatch-data.js` (45 položiek, ~3 KB)
- [x] `productPage.js`: import + `isVzorkyConfiguratorPage()` (slug /vzorkovnik-dragonskin
      al. H1) + výnimka v `initProduct` (vzor truck)
- [x] FIX umiestnenia: selecty hľadané cez `.surcharge-parameter` + `data-parameter-name`;
      mount do PRAVÉHO stĺpca `.p-info-wrapper` ZA `<table>` surcharge parametrov (nie cez
      celú šírku) → cena/množstvo/„Pridať do košíka" ostávajú, e-shop funguje normálne
- [x] FIX „JS sa nespúšťa / overlay visí": odstránený `return` po mountVzorkyConfigurator.
      Truck má `return` (nahrádza celú stránku), ale vzorkovník je NORMÁLNY produkt →
      initProduct musí dobehnúť do konca (inak sa nedokončí init stránky a overlay ostane).
      Overené proti reálnemu DOM (stiahnuté live HTML): mount bez výnimky, 45 dlaždíc,
      root v `.p-info-wrapper`, 4 natívne riadky skryté
- [x] MULTI-SELECT: každá vzorka = vlastný yes/no parameter → dá sa vybrať
      ľubovoľný počet vzoriek (aj viac v jednej sérii), opätovný klik ruší len daný výber
- [x] `productPage.js`: príznak `isVzorky` vypína generátory autokoberec-konfigurátora
      (`createModelInfo`, `priplatky` = upsale/kroky, cenové bannery) na vzorkovníku —
      bez `return` (odhalenie stĺpca/cena/košík bežia ďalej, stránka nevisí).
      `createModelInfo` má aj vlastný guard (bráni globálnemu `.position-wrap` klik handleru)
- [x] UI ako konfigurátor: série = AKORDEONY (zlatý gradient header `#c5a44e→#a8893a`,
      'Exo 2', číslo kroku, počítadlo vybraných, šípka; single-open, 1. otvorený default).
      Vlastné `.lcd-vz-*` triedy (nie `.position-wrap`) → bez väzby na auto-konfigurátor
- [x] NÁHĽADY (neobjednávateľné) podľa návrhu: Lux Color bez parametra sa zobrazia ako dlaždice
      so štítkom „Neposiela sa“, nejdú vybrať; LUX-10 zvýraznená „Posielame“ (zelená)
- [x] REKAPITULÁCIA objednávky = tmavá karta podľa návrhu (#2E1810 + zlaté akcenty):
      počet vzoriek + vratná záloha spolu, zoznam „ID — séria: farba“, live update, prázdny/plný stav
- [x] Zaokrúhlenie ZOBRAZENEJ ceny na celé eurá (`normalizePrices`/`watchPrices` v index.js):
      admin base 0,01 € (Shoptet inak produkt nezobrazí) → zákazník vidí 0 € / 5 € / 10 €…
      Beží pri mounte aj po každej zmene (MutationObserver). Mení len zobrazenie, nie cenu objednávky.
- [x] DLAŽDICE podľa návrhu: full-bleed obrázky bez paddingu (`.lcd-vz-thumb-wrap` štvorec,
      `object-fit:cover`, štítky stavu ako prekryv na obrázku, názov farby pod ním); mriežka
      max 5 v rade (`repeat(5,1fr)`, mobil 3); v každej sérii PRVÁ dlaždica „Nechcem"
      (`buildSkipTile`) — aktívna keď nič nevybrané, klik zruší celý výber série
- [x] Integračný jsdom test `vzorky/test-konfigurator.mjs` (`yarn vzorky:test`) — 45/45 OK:
      akordeony + single-open toggle, multi-select v sérii aj naprieč, náhľady (15× neobjednávateľné,
      klik nič nerobí), LUX-10 „Posielame“, rekapitulácia (počet/záloha/poradie/formát položky),
      zaokrúhlenie ceny (0,01 €→0 €, 5,01 €→5 €), skip dlaždice (4×, prvá v mriežke, aktivita
      podľa výberu, klik zruší len danú sériu)
- [x] FIX „vyberateľné aj to, čo nemá ísť vybrať": objednávateľnosť je teraz
      AUTORITATÍVNE z manifestu (`orderable` flag), nie z prítomnosti `<select>` v DOM-e.
      `build-swatch-assets.mjs` nesie `orderable` do `swatch-data.js` (30 orderable /
      15 náhľadov); `index.js` `isOrderableId()` → náhľad sa nedá vybrať, ani keď preň
      Shoptet vystaví parameter (poistne držaný na „Nechcem"). Regresný test
      v `test-konfigurator.mjs` (LUX-01 so selectom ostáva náhľad). 46/46 OK, bundle rebuilt.
- [x] LUX-14/15/16: fotky doplnené do `vzorky/images/web/2.vrstva/new/`,
      `yarn vzorky:swatches` vygeneroval `assets/img/vzorky/LUX-{14,15,16}.jpg`
      (42→45 súborov) + zapísal manifest, `yarn vzorky:test` OK (nezmenené počty
      dlaždíc/náhľadov, LUX-14/15/16 ostávajú `orderable:false`)
- [x] Poradie sérií zmenené na Diamond ako 1. voľba: `order` pole v `index.js`
      (`["diamond","stripe","hexa","second"]`) + `SERIES` v `build-swatch-assets.mjs`
      zosúladené s `vzorky/src/konfigurator.jsx` (klientský zdroj mal Diamond už
      prvý v akordeóne). Testy (`test-konfigurator.mjs`) prepísané na nové
      očakávané poradie (akordeóny aj rekapitulácia), `yarn vzorky:test` OK
- [ ] DEPLOY na produkciu: `luxuryCar.js` tam teraz 404-uje → výnimka beží len v deve.
      Treba commit+push (CI rebuild+SFTP mirror) alebo manuálny upload bundla+`assets/img/vzorky/`
- [ ] Vizuálne overiť v deve na /vzorkovnik-dragonskin---objednavka-vzoriek

## Vzorkovník ako Shoptet PRODUKT (SURCHARGE_PARAMETER)
- [x] v1: 30 samostatných yes/no parametrov — kedysi zamietnuté
- [x] v4: **4 vrstvy = 4 parametre** (farby ako hodnoty +5 €) — problém: parameter je single-select, z vrstvy šlo vybrať len 1 farbu
- [x] v5: každá vzorka = samostatný yes/no parameter (Nechcem 0 € / Chcem +5 €) → viac vzoriek naraz
- [x] v6 (FINAL): LEN OBJEDNÁVATEĽNÉ vzorky = parameter — **30 parametrov** (Stripe 8 + Hexa 3 +
      Diamond 18 + 2.vrstva len LUX-10). Ostatné Lux Color (15×) sú v konfigurátore len náhľady
      (orderable:false v `konfigurator.jsx`), nemajú parameter → nedajú sa objednať
- [x] Zdroj farieb = repo konfigurátor (rozhodnutie klienta)
- [x] Bez fotiek pri voľbách (stačia príplatkové parametre)
- [x] `vzorky/dist/vzorky-product.xml` validuje proti RELAX NG (`yarn vzorky:product`)
- [ ] Potvrdiť VAT na vratnej zálohe (teraz 21 %, deposit môže byť 0 %)
- [ ] Naimportovať do Shoptetu cez XML import a overiť parametre v košíku

## Truck konfigurátor — re-sync z klienta + mobilná verzia
- [x] DESKTOP update z klienta (`luxusnerohoze-dev/konfigurator` origin/master): 3-way
      git merge (base=abad847 → theirs=origin/master) na spt `konfigurator.jsx` —
      prinieslo klientove UX zmeny (scroll-once `*Scrolled`, galéria fotiek `activePhoto`,
      odstránený auto-advance, door-lemovanie sync) a zachovalo spt adaptácie (React import,
      DOM-pricing, syncToShoptet, add-to-cart, export). 2 triviálne konflikty vyriešené.
- [x] PHONE verzia (`phone/konfigurator.jsx`) zapojená ako `konfigurator.phone.jsx` —
      rovnaké Shoptet adaptácie aplikované scriptom (pricing/sync/state shape identický s desktopom).
- [x] FIX TDZ bug v klientovom phone kóde: auto-scroll useEffect referencoval `step1Done`
      v deps PRED jeho deklaráciou → presunutý za deklaráciu.
- [x] Viewport switch v `index.jsx`: `matchMedia(max-width:768px)` → phone, inak desktop (mount-time).
- [x] Smoke test `assets/js/truck-konfigurator/test-truck-mount.mjs` (`yarn truck:test`):
      obe verzie mountujú bez runtime chýb + renderujú DOM. OK.
- [x] Bundle: base64 obrázky von z bundla → **19.7MB → 1.5MB** (aj pôvodný desktop
      externalizovaný). `truck/build-truck-images.mjs` (`yarn truck:images`, beží v build:once
      a v CI) vytiahne 174 unikátnych obrázkov (dedup desktop+phone) do `assets/img/truck/`
      a vygeneruje `konfigurator*.gen.jsx` (base64→URL `…/upload/assets/config/truck/`).
      Zdrojové `konfigurator*.jsx` ostávajú s base64 (čistý re-sync); `index.jsx` bundluje .gen.
      IMG_BASE = `https://www.luxurycardesign.cz/user/documents/upload/assets/config/`
      (file manager NIE je zdieľaný medzi doménami: truck = .cz, vzorky = .sk).
- [x] ⬆️ Obrázky nahraté klientom do Shoptet (.cz) `assets/config/` — overené všetkých 174/174 = HTTP 200.
- [ ] Vizuálne overiť desktop aj mobil na reálnom truck produkte (cena/sync/košík).
- [ ] Breakpoint 768px doladiť podľa reálneho zariadenia (tablet teraz dostáva desktop).

## Konfigurátor — redesign kroku "Autokoberce do kufra" podľa návrhu (2.7.2026)
- [x] `lcdTrunkCardsRedesign()` v `configurator-enhance.js`: split textu karty na
      titulok + podtitulok, save badge s percentom (−66 % / −58 % z data-recommended),
      NECHCEM podtitulok "Ponechať kufor prázdny" + poznámka "Bez zľavy na tento doplnok",
      badge "★ Najobjednávanejšie" na PREMIUM karte (SK/CZ lokalizácia)
- [x] SCSS `_productPage.scss`: horizontálne karty (obrázok 38 % vľavo, object-fit cover),
      veľká cena s prečiarknutou RRP, zelený save badge, ✓ krúžok na aktívnej karte,
      NECHCEM grayscale obrázok; mobilná verzia (≤768px)
- [x] jsdom test logiky (3 karty, percentá sedia s návrhom) + `yarn build:once` OK
- [x] Presné gradienty podľa spec od Michala (2.7.2026): hlavička kroku
      135deg #d9bb6b→#b98f36; badge Najobjednávanejšie 135deg #e2c163→#b98f36;
      zelená (save lišta + všetky flow CTA vrátane potvrdiť — klientove pravidlo
      jednotnej zelenej) 135deg #34a865→#238049, hover #2f9a5c→#1e7241
- [ ] Zlatý oddeľovač pod názvom (90deg #e2c163→#b98f36) — čaká na upresnenie,
      pod ktorým názvom má byť (v dodanom výreze návrhu nie je vidieť)
- [x] Hlavička akordeónu: číslo kroku v tmavom štvorčeku (#1d1911, JS wrap
      `lcdWrapStepNumbers()` — samoopravný voči `.text()` prepisu z productPage.js),
      tmavý titulok #1f1a10 weight 800, malá tmavá šipka; výška 48px desktop /
      40px mobil (rešpektuje max-height 50/42px zbaleného kroku); jsdom test OK
- [ ] Vizuálne overiť na reálnom produkte (desktop + mobil) a odladiť podľa návrhu
