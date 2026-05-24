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
  // Krok "Specifikace vozidla" vyzaduje vybrane auto.
  if ($s.find(".wheel-Position").length) {
    var m = sessionStorage.getItem("model");
    if (!m || m.indexOf("Značka") > -1 || m.trim() === "Model" ||
        m.indexOf("Rok výroby") > -1 || m.indexOf("Typ auta") > -1) return false;
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

/** Vycentruje krok na stred. isVerify=true => priorita, nedá sa prebiť. */
function lcdScrollToStep(el, isVerify) {
  if (!el) return;
  if (lcdScroll.priority && !isVerify) return; // verifikacny scroll ma prednost
  if (isVerify) lcdScroll.priority = true;
  var myToken = ++lcdScroll.token;
  window.scrollTo(0, lcdDesiredY(el));
  var ticks = 0, aborted = false;
  function onUser() { aborted = true; }
  window.addEventListener("wheel", onUser, { passive: true });
  window.addEventListener("touchmove", onUser, { passive: true });
  window.addEventListener("keydown", onUser, { passive: true });
  function stop() {
    window.removeEventListener("wheel", onUser);
    window.removeEventListener("touchmove", onUser);
    window.removeEventListener("keydown", onUser);
    if (lcdScroll.token === myToken) lcdScroll.priority = false;
  }
  function tick() {
    if (myToken !== lcdScroll.token || aborted || !el.isConnected) { stop(); return; }
    var want = lcdDesiredY(el);
    if (Math.abs(window.scrollY - want) > 3) window.scrollTo(0, want);
    ticks++;
    if (ticks < 24) setTimeout(tick, 110);
    else stop();
  }
  setTimeout(tick, 90);
}
