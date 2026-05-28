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

  // K2 / K3 / box-config: nad preview obrazkom vybranej farby zobraz text
  // s nazvom vzorky/farby (napr. "Diamond Farba kože : Čierna"). Text sa
  // berie z <select> option zodpovedajucej aktivnemu .option-button.
  function buildLabelFromActive(active) {
    var value = active.getAttribute("data-value");
    var variant = active.getAttribute("data-variant");
    if (!value || !variant) return "";
    var sel = document.querySelector("select.parameter-id-" + variant);
    var label = "";
    if (sel) {
      var opt = sel.querySelector('option[value="' + value + '"]');
      if (opt) label = (opt.textContent || "").trim();
    }
    // Strip "+X €/Kč" suffix a normalizuj medzery
    label = label.replace(/\s*\+\s*(?:€|Kč|EUR|CZK)?\s*[\d.,]+\s*(?:€|Kč|EUR|CZK)?\s*$/i, "").trim();
    label = label.replace(/\s+/g, " ");
    // Skratit "Diamond Farba kože : Čierna Farba šitia : Zelená" -> "Diamond — Čierna / Zelená"
    var m = label.match(/^(.+?)\s*Farba\s+ko[žz]e\s*:\s*([^\s].*?)(?:\s+Farba\s+[šs]itia\s*:\s*([^\s].*?))?\s*$/i);
    if (m) {
      // Trim trailing/leading whitespace + slash — option text moze obsahovat "Čierna /" pred "Farba šitia"
      var v1 = m[1].trim().replace(/[\s\/]+$/, "").replace(/^[\s\/]+/, "");
      var v2 = m[2].trim().replace(/[\s\/]+$/, "").replace(/^[\s\/]+/, "");
      var v3 = m[3] ? m[3].trim().replace(/[\s\/]+$/, "").replace(/^[\s\/]+/, "") : "";
      label = v1 + " — " + v2 + (v3 ? " / " + v3 : "");
    }
    return label;
  }

  function upsertLabel(container, text, position) {
    var existing = container.querySelector(":scope > .lcd-color-label");
    if (existing) {
      if (existing.textContent !== text) existing.textContent = text;
      return;
    }
    var div = document.createElement("div");
    div.className = "lcd-color-label";
    div.textContent = text;
    if (position === "end") container.appendChild(div);
    else container.insertBefore(div, container.firstChild);
  }

  function addColorLabels() {
    // 1) K2 / K3 — label NAD obrazkom v .image-wrap.
    //    SKIP box-config: tam je .image-wrap CSS-hidden (display:none),
    //    label by zmizol s rodicom. Box-config riesi vetva 2.
    document.querySelectorAll(".image-wrap").forEach(function (wrap) {
      if (wrap.closest(".box-config")) return;
      var parWrap = wrap.closest(".parameter-wrap");
      if (!parWrap) return;
      var active = parWrap.querySelector(".button.option-button.active");
      if (!active) return;
      var label = buildLabelFromActive(active);
      if (!label) return;
      upsertLabel(wrap, label, "start");
    });

    // 2) Box-config — label v .parameter-wrap LEN PRE FARBU (nie velikost).
    //    Kombinovany filter: 3 detekcie size wrap (robustne):
    //      a) class .parameter-sizes
    //      b) text active option obsahuje "XxYxZ cm"
    //      c) h5 nadpis sa zacina "Velikost / Veľkosť / Velokost"
    document.querySelectorAll(".box-config .parameter-wrap").forEach(function (parWrap) {
      if (parWrap.classList.contains("parameter-sizes")) return;
      var h5 = parWrap.querySelector("h5");
      if (h5 && /^vel[ioe]kos[tť]/i.test((h5.textContent || "").trim())) return;
      var active = parWrap.querySelector(".button.option-button.active");
      if (!active) return;
      var activeTxt = (active.textContent || "").toLowerCase();
      if (/\b\d+\s*x\s*\d+\s*x\s*\d+\s*cm\b/.test(activeTxt)) return;
      var label = buildLabelFromActive(active);
      if (!label) return;
      // Pre box-config color wrap: vloz label PO .options-wrap (nie do parWrap),
      // aby bol POD swatchmi nezavisle od flex/grid layoutu parameter-wrap-u.
      var optionsWrap = parWrap.querySelector(".options-wrap");
      if (optionsWrap) {
        // Najst existujuci label hned za optionsWrap, alebo vytvorit novy
        var next = optionsWrap.nextElementSibling;
        if (next && next.classList && next.classList.contains("lcd-color-label")) {
          if (next.textContent !== label) next.textContent = label;
        } else {
          var div = document.createElement("div");
          div.className = "lcd-color-label";
          div.textContent = label;
          optionsWrap.parentNode.insertBefore(div, optionsWrap.nextSibling);
        }
      } else {
        upsertLabel(parWrap, label, "end");
      }
    });
  }

  // Pridaj play button overlay na .customers-video karty (RECENZIA/POROVNANIE)
  // — aby ľudia videli že ide o videá a nie statické obrázky.
  function addVideoPlayOverlays() {
    document.querySelectorAll(".customers-video .customer-video").forEach(function (card) {
      if (card.querySelector(".lcd-video-play-overlay")) return;
      var vid = card.querySelector("video, a, .image-wrap");
      if (!vid) return;
      var overlay = document.createElement("div");
      overlay.className = "lcd-video-play-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = '<span class="lcd-video-play-circle"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>';
      // vlozit ako prvy child .customer-video (absolute pozicia na video)
      card.insertBefore(overlay, card.firstChild);
    });
  }

  function run() {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      markBestsellers();
      fixBoxSoloPrices();
      addColorLabels();
      addVideoPlayOverlays();
      if (tries > 40) clearInterval(iv);
    }, 600);
    // Tiez prepoctaj label po kazdom kliku na option-button (rychla odozva)
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest(".button.option-button");
      if (!btn) return;
      setTimeout(addColorLabels, 250);
      setTimeout(addColorLabels, 800);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
