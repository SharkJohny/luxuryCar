/** Konfigurátor — tok krokov: model, verifikácia, scroll, handlery. */

function lcdGetSteps() {
  var steps = [];
  document
    .querySelectorAll(".content-wrap > .position-wrap, .content-wrap > .parameter-wrap")
    .forEach(function (el) { steps.push(el); });
  var trunk = document.querySelector(".upsale-buttons.trunk");
  if (trunk) steps.push(trunk);
  var boxs = document.querySelector(".upsale-buttons.boxs");
  if (boxs) steps.push(boxs);
  return steps;
}

function lcdStepFilled(stepEl) {
  var $s = $(stepEl);
  // Kroky trunk (autokoberce do kufra) a boxs (boxy) su NEPOVINNE.
  // Cislo kroku K4/K5/K6 zavisi od produktu (BASIC vs ELITE),
  // preto detekujeme cez selektor, nie index. Ak zakaznik nevybere,
  // automaticky to znamena "nechcem" — krok je platny.
  if ($s.hasClass("trunk") || $s.hasClass("boxs") ||
      $s.is(".upsale-buttons.trunk") || $s.is(".upsale-buttons.boxs")) {
    return true;
  }
  // Krok "Specifikace vozidla" — vsetky car dropdowny musia mat realny
  // vyber. Placeholder = selectedIndex 0. sessionStorage.model moze byt
  // staly po reloade, preto kontrolujeme priamo dropdowny (zdroj pravdy).
  if ($s.find(".wheel-Position").length) {
    var lcdPlaceholders = ["Značka", "Model", "Rok výroby", "Typ auta",
                           "Značka", "Ročník", "Typ"];
    var carOk = true;
    $s.find("select").each(function () {
      var opt = this.options[this.selectedIndex];
      var txt = (opt ? opt.text : "").replace(/\s+/g, " ").trim();
      if (!txt || lcdPlaceholders.indexOf(txt) > -1) carOk = false;
    });
    if (!carOk) return false;
  }
  var hasControl = false, picked = false;
  if ($s.find(".option-button").length) {
    hasControl = true;
    if ($s.find(".option-button.active").length) picked = true;
  }
  if ($s.find(".upsale-button").length) {
    hasControl = true;
    if ($s.find(".upsale-button.active").length) picked = true; // NECHCI sa pocita
  }
  if ($s.find("select.surcharge-parameter").length) {
    hasControl = true;
    $s.find("select.surcharge-parameter").each(function () {
      var v = $(this).val();
      if (v && v !== "0" && v !== "") picked = true;
    });
  }
  if ($s.find("input[type='radio'], input[type='checkbox']").length) {
    hasControl = true;
    if ($s.find("input[type='radio']:checked, input[type='checkbox']:checked").length) picked = true;
  }
  return !hasControl || picked;
}

var lcdScroll = { token: 0, priority: false };

function lcdHeaderH() {
  var sels = [".plugin-fixed-header", ".top-navigation-bar", "header.header", "header"];
  for (var i = 0; i < sels.length; i++) {
    var e = document.querySelector(sels[i]);
    if (e && e.offsetHeight > 20) return e.offsetHeight;
  }
  return 90;
}

function lcdDesiredY(el) {
  var vh = window.innerHeight || document.documentElement.clientHeight || 0;
  var hH = lcdHeaderH();
  var avail = vh - hH;
  var r = el.getBoundingClientRect();
  var delta;
  if (r.height > 0 && r.height <= avail) delta = r.top - (hH + (avail - r.height) / 2);
  else delta = r.top - (hH + 20);
  return Math.max(0, Math.round(window.scrollY + delta));
}

/**
 * Vycentruje krok na stred. isVerify=true => priorita.
 * Pocka kym sa layout ustali, potom INSTANTNE skoci (CSS scroll-behavior:smooth
 * by inak animoval kazdy scrollTo a vznikol by 2s "skakajuci" efekt).
 * Max 3 instantne scrolly, rozlozene v case — ziadne tesne hamranie.
 */
function lcdScrollToStep(el, isVerify) {
  if (!el) return;
  if (lcdScroll.priority && !isVerify) return; // verifikacny scroll ma prednost
  if (isVerify) lcdScroll.priority = true;
  var myToken = ++lcdScroll.token;
  var aborted = false;
  function onUser() { aborted = true; }
  window.addEventListener("wheel", onUser, { passive: true });
  window.addEventListener("touchmove", onUser, { passive: true });
  window.addEventListener("keydown", onUser, { passive: true });
  function done() {
    window.removeEventListener("wheel", onUser);
    window.removeEventListener("touchmove", onUser);
    window.removeEventListener("keydown", onUser);
    if (lcdScroll.token === myToken) lcdScroll.priority = false;
  }
  function alive() {
    return myToken === lcdScroll.token && !aborted && el.isConnected;
  }
  function jump() {
    window.scrollTo({ top: lcdDesiredY(el), behavior: "instant" });
  }
  // 1) Pockaj kym sa layout ustali (abs-pozicia kroku 3x rovnaka), max 1.2s.
  var lastAbs = null, stable = 0, waited = 0;
  function settle() {
    if (!alive()) { done(); return; }
    var abs = window.scrollY + el.getBoundingClientRect().top;
    if (lastAbs !== null && Math.abs(abs - lastAbs) < 2) stable++;
    else stable = 0;
    lastAbs = abs;
    waited += 70;
    if (stable >= 3 || waited >= 1200) {
      jump();
      // 2) Korekcia po dozneni accordion animacie.
      setTimeout(function () {
        if (!alive()) { done(); return; }
        var w1 = lcdDesiredY(el);
        if (Math.abs(window.scrollY - w1) > 60) {
          window.scrollTo({ top: w1, behavior: "instant" });
        }
        // 3) Posledna korekcia — neskore nacitanie obrazkov.
        setTimeout(function () {
          if (alive()) {
            var w2 = lcdDesiredY(el);
            if (Math.abs(window.scrollY - w2) > 60) {
              window.scrollTo({ top: w2, behavior: "instant" });
            }
          }
          done();
        }, 700);
      }, 450);
    } else {
      setTimeout(settle, 70);
    }
  }
  settle();
}

function lcdResetOptionsWrap($s) {
  $s.find("> .options-wrap").each(function () {
    this.style.maxHeight = ""; this.style.overflow = "";
    this.style.opacity = ""; this.style.padding = "";
  });
}

/** Otvori IBA tento krok, ostatne zatvori. */
function lcdOpenStep(el) {
  lcdGetSteps().forEach(function (s) {
    if (s !== el) $(s).removeClass("active");
  });
  var $s = $(el);
  if ($s.hasClass("trunk") || $s.hasClass("boxs")) {
    $s.show();
    $(".upsale-Banner").show();
  }
  $s.addClass("active");
  lcdResetOptionsWrap($s);
  $s.find("> .next-step-button").show();
}

/** Cerveno zvyrazni krok + vyzva na doplnenie. */
function lcdHighlightStep(el) {
  var $s = $(el);
  $s.addClass("lcd-needs-fill");
  setTimeout(function () { $s.removeClass("lcd-needs-fill"); }, 3000);
}

/** Vrati prvy nevyplneny krok 0..uptoIndex, alebo null. */
function lcdFirstUnfilled(uptoIndex) {
  var steps = lcdGetSteps();
  var limit = (typeof uptoIndex === "number" && uptoIndex >= 0) ? uptoIndex : steps.length - 1;
  for (var i = 0; i <= limit && i < steps.length; i++) {
    if (!lcdStepFilled(steps[i])) return steps[i];
  }
  return null;
}

function lcdGoToStep(el, isVerify) {
  lcdOpenStep(el);
  lcdScrollToStep(el, isVerify);
}

/** Prvy nevyplneny box-config pod-krok (farba/velkost boxov) — len ak je
 *  vybrany box (config, nie "nechci"). Vrati element alebo null. */
function lcdBoxConfigUnfilled() {
  var boxPicked = document.querySelector(
    ".upsale-buttons.boxs .upsale-button.active.config:not(.none)"
  );
  if (!boxPicked) return null;
  var wraps = document.querySelectorAll(".box-config .parameter-wrap");
  for (var i = 0; i < wraps.length; i++) {
    if (wraps[i].offsetParent === null) continue; // skryty pod-krok
    if (!lcdStepFilled(wraps[i])) return wraps[i];
  }
  return null;
}

/** Overi box-config. Ak chyba farba/velkost — otvori, oznaci, naskroluje
 *  a vrati false. Inak true. */
function lcdHandleBoxConfig() {
  var bad = lcdBoxConfigUnfilled();
  if (!bad) return true;
  var bc = bad.closest(".box-config");
  if (bc && getComputedStyle(bc).display === "none") bc.style.display = "";
  lcdHighlightStep(bad);
  lcdScrollToStep(bad, true);
  return false;
}

export function initConfiguratorEngine() {
  // "Prejsť k ďalšiemu kroku"
  $(document).on("click", ".next-step-button", function (e) {
    e.preventDefault(); e.stopPropagation();
    var steps = lcdGetSteps();
    // Nájdi krok ktorý obsahuje toto tlačidlo (robustne — nezávisí na triedach).
    var btn = this;
    var curIdx = -1;
    for (var ci = 0; ci < steps.length; ci++) {
      if (steps[ci].contains(btn)) { curIdx = ci; break; }
    }
    if (curIdx < 0) curIdx = steps.length - 1;
    var bad = lcdFirstUnfilled(curIdx);
    if (bad) {
      lcdHighlightStep(bad);
      lcdGoToStep(bad, true);   // verifikacny scroll — priorita
      return;
    }
    if (curIdx < steps.length - 1) {
      lcdGoToStep(steps[curIdx + 1], false);
    } else {
      var $cart = $("button.add-to-cart-button").filter(":visible").first();
      if ($cart.length) $cart.trigger("click");
    }
  });

  // Auto-select "nechcem" (.upsale-button.none) v trunk a boxs ak ziadna
  // option nie je .active. Tym sa do Shoptet objednavky dostane
  // "Autokoberce do kufru: nechcem" / "Boxy do kufru: nechcem".
  function lcdAutoSelectNoneIfEmpty() {
    ["trunk", "boxs"].forEach(function (cls) {
      var $wrap = $(".upsale-buttons." + cls);
      if (!$wrap.length) return;
      if ($wrap.find(".upsale-button.active").length) return;
      var $none = $wrap.find(".upsale-button.none").first();
      if ($none.length) {
        // Trigger click — spusti Shoptet handlers + nastavi surcharge na 0.
        $none.trigger("click");
      }
    });
  }

  // K3 "Rozloženie kobercov" → auto-otvorit trunk (Autokoberce do kufru).
  // Cislo kroku K4/K5 zavisi od produktu (BASIC vs ELITE) — detegujeme
  // cieli trunk cez selektor .upsale-buttons.trunk, NIE cez index.
  $(document).on("click", ".lcd-k3-layout .button.option-button", function (e) {
    var trunk = document.querySelector(".upsale-buttons.trunk");
    if (!trunk) return;
    // Pockaj kym Shoptet update-ne stav (cena, image-wrap), potom advance.
    setTimeout(function () {
      lcdGoToStep(trunk, false);
    }, 400);
  });

  // "Pridať do košíka"
  $(document).on("click", "button.add-to-cart-button", function (e) {
    // Auto "nechcem" pre nepovinne trunk/boxs ak prazdne.
    lcdAutoSelectNoneIfEmpty();
    var bad = lcdFirstUnfilled();
    if (bad) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      lcdHighlightStep(bad);
      lcdGoToStep(bad, true);
      return false;
    }
    // Box-config: ak je vybrany box, farba aj velkost musia byt vybrate.
    if (!lcdHandleBoxConfig()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      return false;
    }
    // Vsetko vyplnene → Shoptet prida do kosika. Po pridani prejdi rovno
    // do kosika (/kosik/). __lcdCartReloading flag zabrani cart.js reloadu
    // produktovej stranky — namiesto toho spravime redirect.
    window.__lcdCartReloading = true;
    document.addEventListener("ShoptetCartUpdated", function lcdToCart() {
      document.removeEventListener("ShoptetCartUpdated", lcdToCart);
      window.location.href = "/kosik/";
    });
  });

  // "potvrdiť" v box-config — over farba/velkost boxov.
  // Ak je vsetko OK, zatvor box-config panel (removeClass showConf)
  // a krok K5/K6 sa vrati do compact view.
  $(document).on("click", ".close-btn.return", function (e) {
    if (!lcdHandleBoxConfig()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      return false;
    }
    // Vyplneny box-config → zatvor panel
    $(this).closest(".upsale-Banner").removeClass("showConf");
  });

  // BOX PRODUKT (URL /luxusny-boxi-do-kufra/ alebo H1 obsahuje "box"):
  // pri loade auto-otvor K1 (prvy krok). Ostatné kroky zatvorene. Po vybere
  // ziaden auto-advance — user klika "Prejst k dalsiemu kroku" rucne.
  function isBoxProduct() {
    var h1 = ($("h1").first().text() || "").toLowerCase();
    if (h1.indexOf("box") > -1) return true;
    var path = (window.location.pathname || "").toLowerCase();
    return /boxi|boxy|box/.test(path);
  }
  function lcdAutoOpenFirstStep() {
    if (!isBoxProduct()) return;
    var steps = lcdGetSteps();
    if (steps.length === 0) return;
    lcdOpenStep(steps[0]);
  }
  // Retry — Shoptet generuje kroky async (5x 600ms).
  setTimeout(lcdAutoOpenFirstStep, 600);
  setTimeout(lcdAutoOpenFirstStep, 1500);
  setTimeout(lcdAutoOpenFirstStep, 3000);
}
