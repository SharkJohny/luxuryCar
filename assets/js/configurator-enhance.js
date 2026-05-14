// ─────────────────────────────────────────────────────────────────────
// Konfigurátor — best-seller označenie + box solo ceny + set úspora
// (v4, 2026-05-15)
//
// 1) Badge "NAJOBJEDNÁVANEJŠIE" na možnostiach (krok 4/5/6)
// 2) Box "cena mimo setu" = data-recommended / 1.6 (skutočná SOLO cena,
//    nie RRP). Overené z cenníka: 315,2/1,6 = 197 €, 630,4/1,6 = 394 €.
// 3) Set úspora pod cenou: "Vďaka vytvorenému setu ušetríte X €"
//    X = doporučená cena − aktuálna cena.
//
// Konfigurátor sa generuje async, preto retry interval + event listener.
// ─────────────────────────────────────────────────────────────────────

(function configuratorEnhance() {
  "use strict";

  var isCz = /\.cz$/.test(location.hostname.replace(/^www\./, ""));

  function parsePrice(s) {
    s = (s || "").replace(/[^\d,.\s]/g, "").trim();
    s = s.replace(/\s/g, "").replace(",", ".");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

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

  // Set úspora pod hlavnou cenou: doporučená − aktuálna
  function addSetSavingsLine() {
    var wrap = document.querySelector(".p-final-price-wrapper");
    if (!wrap) return;
    var recSpan = wrap.querySelector(".price-standard > span:not(.price-save)");
    var actHolder = wrap.querySelector(".price-final-holder");
    if (!recSpan || !actHolder) return;
    var recommended = parsePrice(recSpan.textContent);
    var actual = parsePrice(
      actHolder.getAttribute("data-price") || actHolder.textContent
    );
    var savings = Math.round(recommended - actual);
    var line = wrap.querySelector(".lcd-set-savings");
    if (savings <= 0) {
      if (line) line.style.display = "none";
      return;
    }
    if (!line) {
      line = document.createElement("div");
      line.className = "lcd-set-savings";
      wrap.appendChild(line);
    }
    line.style.display = "";
    line.textContent = isCz
      ? "Díky vytvořenému setu ušetříte " + savings + " €"
      : "Vďaka vytvorenému setu ušetríte " + savings + " €";
  }

  function tick() {
    markBestsellers();
    fixBoxSoloPrices();
    addSetSavingsLine();
  }

  function run() {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      tick();
      if (tries > 40) clearInterval(iv);
    }, 600);
    // prepočet úspory pri každej zmene ceny v konfigurátore
    document.addEventListener("LuxuryCarPriceRecalculated", function () {
      setTimeout(addSetSavingsLine, 50);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
