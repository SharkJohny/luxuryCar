// ─────────────────────────────────────────────────────────────────────
// Konfigurátor — best-seller označenie možností (Fáza 5, 2026-05-08)
//
// Pridáva CSS class .lcd-bestseller na najpredávanejšie možnosti v
// jednotlivých krokoch konfigurátora. CSS (.lcd-bestseller::after)
// vykreslí zlatý badge "BESTSELLER".
//
// Dáta z LCD brain (wiki/concepts — predaje):
//   • 5 miest na sedenie  — 88,6 % objednávok
//   • Diamond Black+Red (čierna koža + červené šitie) — 22,7 % (top farba)
//   • Elite 2-vrstva — 82–90 % predaja (typ produktu, nie krok konfig.)
//
// Konfigurátor sa generuje async (priplatky() appenduje DOM), preto
// retry niekoľkokrát po DOMContentLoaded.
// ─────────────────────────────────────────────────────────────────────

(function configuratorEnhance() {
  "use strict";

  function markBestsellers() {
    let marked = 0;

    // 1) Miesta na sedenie — "5" (88,6 % objednávok)
    //    Generované v productPage.js: .sit-Position .option-button[data-value='pass-5']
    document
      .querySelectorAll(".parameter-cars.sit-Position .option-wrap .option-button")
      .forEach((btn) => {
        const dv = btn.getAttribute("data-value");
        const txt = (btn.textContent || "").trim();
        if (dv === "pass-5" || txt === "5") {
          if (!btn.classList.contains("lcd-bestseller")) {
            btn.classList.add("lcd-bestseller");
            marked++;
          }
        }
      });

    // 2) Farba 1.vrstvy — Diamond Black+Red (čierna koža + červené šitie, 22,7 %)
    //    Identifikujeme cez img src: "...cierna-farba-sitia-cervena..."
    document
      .querySelectorAll(".parameter-78 .button.option-button, .parameter-wrap.parameter-78 .button.option-button")
      .forEach((btn) => {
        const img = btn.querySelector("img");
        const src = img ? (img.getAttribute("src") || "") : "";
        if (/cierna-farba-sitia-cervena/i.test(src)) {
          if (!btn.classList.contains("lcd-bestseller")) {
            btn.classList.add("lcd-bestseller");
            marked++;
          }
        }
      });

    return marked;
  }

  function run() {
    // Konfigurátor sa generuje async — skús viackrát kým sa DOM naplní
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      const marked = markBestsellers();
      // Skonči keď sme niečo označili a stabilizovalo sa, alebo po 15 pokusoch
      if ((marked > 0 && tries > 3) || tries > 15) {
        clearInterval(iv);
      }
    }, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
