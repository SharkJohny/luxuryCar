// ─────────────────────────────────────────────────────────────────────
// Konfigurátor — best-seller označenie + box solo ceny
// (v5, 2026-05-15)
//
// 1) Badge "NAJOBJEDNÁVANEJŠIE" na možnostiach (krok 4/5/6)
// 2) Box "cena mimo setu" = data-recommended / 1.6 (skutočná SOLO cena,
//    nie RRP). Overené z cenníka: 315,2/1,6 = 197 €, 630,4/1,6 = 394 €.
//
// Konfigurátor sa generuje async, preto retry interval.
// ─────────────────────────────────────────────────────────────────────

(function configuratorEnhance() {
  "use strict";

  function markBestsellers() {
    // Krok 4 — "prvý a druhý rad" (data-value 589)
    document
      .querySelectorAll(
        ".parameter-85 .option-button, .parameter-wrap.parameter-85 .option-button"
      )
      .forEach(function (btn) {
        var dv = btn.getAttribute("data-value");
        var txt = (btn.textContent || "").toLowerCase();
        var isSecondRow =
          dv === "589" ||
          (/prv[ýy]\s*a\s*druh[ýy]\s*rad/.test(txt) && !/tret/.test(txt));
        if (isSecondRow && !btn.classList.contains("lcd-najobjednavanejsie")) {
          btn.classList.add("lcd-najobjednavanejsie");
        }
      });
    // Krok 5 — "KLASIK - NA DNO"
    document.querySelectorAll(".trunk .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase();
      if (/klasik/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
      }
    });
    // Krok 6 — "2x box"
    document.querySelectorAll(".boxs .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase().replace(/\s+/g, " ");
      if (/2\s*x\s*box/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
      }
    });
  }

  // Box "cena mimo setu" = data-recommended / 1.6 (skutočná solo cena)
  function fixBoxSoloPrices() {
    document
      .querySelectorAll(".boxs .upsale-button .price-recommended")
      .forEach(function (el) {
        if (el.getAttribute("data-lcd-solo-fixed")) return;
        var rec = parseFloat(
          (el.getAttribute("data-recommended") || "").replace(",", ".")
        );
        if (!rec || isNaN(rec)) return;
        el.textContent = Math.round(rec / 1.6) + " €";
        el.setAttribute("data-lcd-solo-fixed", "1");
      });
  }

  function run() {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      markBestsellers();
      fixBoxSoloPrices();
      if (tries > 40) clearInterval(iv);
    }, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
