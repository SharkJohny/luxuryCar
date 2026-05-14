// ─────────────────────────────────────────────────────────────────────
// Konfigurátor — best-seller / najobjednávanejšie označenie možností
// (v2, 2026-05-14 — po Michalovom feedbacku)
//
// Michal feedback 2026-05-14:
//   • krok 1 (miesta na sedenie)  — bestseller PREČ (nezmysel)
//   • krok 2 (farba 1.vrstvy)     — bestseller PREČ (nezmysel)
//   • krok 3 (farba 2.vrstvy)     — žiadny bestseller
//   • krok 4 (rozloženie koberc.) — "prvý a druhý rad" = NAJOBJEDNÁVANEJŠIE
//   • krok 5 (rohož do kufra)     — "KLASIK - NA DNO"  = BESTSELLER
//   • krok 6 (boxy do kufra)      — "2x box"           = BESTSELLER
//
// Konfigurátor sa generuje async (DOM sa dopĺňa po načítaní), preto
// retry interval kým sa možnosti objavia.
// ─────────────────────────────────────────────────────────────────────

(function configuratorEnhance() {
  "use strict";

  function markBestsellers() {
    let marked = 0;

    // 4) Krok 4 — rozloženie kobercov: "prvý a druhý rad" (data-value 589)
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
          marked++;
        }
      });

    // 5) Krok 5 — rohož do kufra: "KLASIK - NA DNO"
    document.querySelectorAll(".trunk .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase();
      if (/klasik/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
        marked++;
      }
    });

    // 6) Krok 6 — boxy do kufra: "2x box"
    document.querySelectorAll(".boxs .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase().replace(/\s+/g, " ");
      if (/2\s*x\s*box/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
        marked++;
      }
    });

    return marked;
  }

  function run() {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      markBestsellers();
      if (tries > 20) clearInterval(iv);
    }, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
