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
    // Oznac K3 "Rozloženie kobercov" parameter-wrap triedou lcd-k3-layout —
    // umozni cieleny mobile CSS (img left + text right + price). Marker:
    // option "len prvý rad" (SK) / "pouze první řada" (CZ) — unikatne pre K3.
    document.querySelectorAll(".option-button").forEach(function (btn) {
      var txt = (btn.textContent || "").toLowerCase().replace(/\s+/g, " ");
      if (/\blen\s+prv\S*\s+rad\b|\bpouze\s+prvn\S*\s+ř?ad/i.test(txt)) {
        var wrap = btn.closest(".parameter-wrap");
        if (wrap && !wrap.classList.contains("lcd-k3-layout")) {
          wrap.classList.add("lcd-k3-layout");
        }
      }
    });

    // K3 "Rozloženie kobercov" — badge "NAJOBJEDNÁVANEJŠIE" na "prvý a druhý rad".
    // Robustne cez TEXT match — nezavisi od parameter-ID (BASIC vs ELITE,
    // SK vs CZ mozu mat ine ID, ale text moznosti je rovnaky).
    document.querySelectorAll(".option-button").forEach(function (btn) {
      var txt = (btn.textContent || "").toLowerCase().replace(/\s+/g, " ");
      // SK: "prvý a druhý rad", CZ: "první a druhá řada"
      // POZOR: nesmie chytit "prvy, druhy A TRETI rad"
      var isSecondRow =
        /\bprv\S*\s+a\s+druh\S*\s+(rad|řad|rada|řada)/i.test(txt) &&
        !/tret|třet/i.test(txt);
      if (isSecondRow && !btn.classList.contains("lcd-najobjednavanejsie")) {
        btn.classList.add("lcd-najobjednavanejsie");
      }
    });
    // K5/K6 trunk (autokoberce do kufru) — "KLASIK - NA DNO".
    document.querySelectorAll(".upsale-buttons.trunk .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase();
      if (/klasik/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
      }
    });
    // K5/K6 boxs (boxy do kufra) — "2x box".
    document.querySelectorAll(".upsale-buttons.boxs .upsale-button").forEach(function (card) {
      var txt = (card.textContent || "").toLowerCase().replace(/\s+/g, " ");
      if (/2\s*x\s*box/.test(txt) && !card.classList.contains("lcd-bestseller")) {
        card.classList.add("lcd-bestseller");
      }
    });
  }

  // Detekcia meny — Shoptet priceCurrency meta + html[lang] fallback
  function getCurrencyInfo() {
    var meta = document.querySelector('meta[itemprop="priceCurrency"]');
    var code = meta ? (meta.getAttribute("content") || "").toUpperCase() : "";
    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (code === "CZK" || lang.indexOf("cs") === 0) {
      return { symbol: "Kč", locale: "cs-CZ" };
    }
    return { symbol: "€", locale: "sk-SK" };
  }

  // Box "cena mimo setu" = data-recommended / 1.6 (skutočná solo cena)
  // Mena: CZK na luxurycardesign.cz, EUR na luxurycardesign.sk
  function fixBoxSoloPrices() {
    var cur = getCurrencyInfo();
    document
      .querySelectorAll(".boxs .upsale-button .price-recommended")
      .forEach(function (el) {
        if (el.getAttribute("data-lcd-solo-fixed")) return;
        var rec = parseFloat(
          (el.getAttribute("data-recommended") || "").replace(",", ".")
        );
        if (!rec || isNaN(rec)) return;
        var solo = Math.round(rec / 1.6);
        try {
          el.textContent = solo.toLocaleString(cur.locale) + " " + cur.symbol;
        } catch (e) {
          el.textContent = solo + " " + cur.symbol;
        }
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
