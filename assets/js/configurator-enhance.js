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

  // ── Vybrana FARBA ako inline text pod swatchmi (nahradza tmavy tooltip).
  // Tmavy hover tooltip (.text) sa na mobile zasekol a prekryval obsah.
  // Tu citame vybrany swatch a vykreslime obycajny text pod .options-wrap.
  function isColorParameter(wrap) {
    // farebne kroky maju swatche s textom "Farba ..." a NIE su .noText box ve-
    // -likosti. Detegujeme podla obsahu .text v moznostiach.
    if (wrap.classList.contains("noText")) return false;
    var opt = wrap.querySelector(".option-button .text");
    if (!opt) return false;
    return /farba/i.test(opt.textContent || "");
  }

  function renderColorPick() {
    document
      .querySelectorAll(".options-wrap")
      .forEach(function (ow) {
        var wrap = ow.closest(".parameter-wrap, .position-wrap") || ow.parentElement;
        if (!wrap || !isColorParameter(wrap)) return;

        var active = ow.querySelector(".option-button.active");
        // najdi / vytvor riadok s vybranou farbou hned za .options-wrap
        var pick = wrap.querySelector(":scope > .lcd-color-pick");
        if (!pick) {
          pick = document.createElement("div");
          pick.className = "lcd-color-pick";
          ow.insertAdjacentElement("afterend", pick);
        }

        if (!active) { pick.style.display = "none"; return; }

        var raw = ((active.querySelector(".text") || {}).textContent || "").trim();
        if (!raw) { pick.style.display = "none"; return; }

        // odsekni cenovy priplatok (napr. "+€0", "+5 €", "+ 5,00 Kč")
        var priceMatch = raw.match(/\+\s*[€$]?\s*[\d.,]+\s*(?:€|Kč|EUR|CZK)?/i);
        var price = priceMatch ? priceMatch[0].replace(/\s+/g, " ").trim() : "";
        var label = raw.replace(/\+\s*[€$]?\s*[\d.,]+\s*(?:€|Kč|EUR|CZK)?/i, "").trim();
        label = label.replace(/\s*\/\s*$/, "").trim();

        // box cena vedla farby (ak ide o farbu boxov a box-config ma cenu)
        var boxPrice = "";
        var boxCfg = wrap.closest(".box-config");
        if (boxCfg) {
          var bp = boxCfg.querySelector(".price-recommended[data-lcd-solo-fixed], .config-wrap .price .price-final, .config-wrap [itemprop='price']");
          if (bp) boxPrice = (bp.textContent || "").trim();
        }

        var html = '<span class="lcd-color-pick-val">' + label + "</span>";
        if (price && !/\+\s*[€$]?\s*0+([.,]0+)?/.test(price)) {
          html += '<span class="lcd-color-pick-price">' + price + "</span>";
        }
        if (boxPrice) {
          html += '<span class="lcd-color-pick-price">' + boxPrice + "</span>";
        }
        pick.innerHTML = html;
        pick.style.display = "flex";
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
      renderColorPick();
      if (tries > 40) clearInterval(iv);
    }, 600);
    // okamzita aktualizacia vybranej farby po kliku na swatch
    // (interval po 24s prestane bezat, klik musi fungovat aj potom)
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest(".option-button")) {
        setTimeout(renderColorPick, 60);
        setTimeout(renderColorPick, 250);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
