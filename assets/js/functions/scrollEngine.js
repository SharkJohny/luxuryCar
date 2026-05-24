/**
 * LCD SCROLL ENGINE - rebuild 2026-05-23
 * Jediny scroll mechanizmus konfiguratora.
 *  - default: hlavicka kroku tesne pod fixny header-menu (postup K0-K6)
 *  - opts.center: krok vycentrovany na vysku viewportu (validacia chyb)
 * Pouziva nativne window.scrollTo (jQuery .animate na tomto Shoptete nehybe).
 */

/** Vyska realne pripnuteho header-menu vratane loga. */
export function lcdGetHeaderOffset() {
  var selectors = [
    ".plugin-fixed-header",
    ".header-fixed",
    "#header",
    "header.header",
    ".top-navigation-bar",
    "header",
    "#header .site-name",
    ".site-name",
    "#logo",
    ".header-logo",
    ".logo",
  ];
  var maxBottom = 0;
  var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;

  for (var s = 0; s < selectors.length; s++) {
    var nodes;
    try {
      nodes = document.querySelectorAll(selectors[s]);
    } catch (err) {
      continue;
    }
    for (var n = 0; n < nodes.length; n++) {
      var el = nodes[n];
      if (!el || !el.offsetHeight) continue;
      var cs = window.getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (parseFloat(cs.opacity || "1") < 0.1) continue;
      var r = el.getBoundingClientRect();
      if (r.height < 8 || r.width < 8) continue;
      var isFixed = cs.position === "fixed" || cs.position === "sticky";
      var pinnedAtTop = r.top >= -8 && r.top <= 24;
      if (!isFixed && !pinnedAtTop) continue;
      if (r.bottom > maxBottom && r.bottom < viewportH * 0.45) {
        maxBottom = r.bottom;
      }
    }
  }
  if (maxBottom < 40 && (window.pageYOffset || 0) > 50) {
    maxBottom = 90;
  }
  return maxBottom;
}

/**
 * Naskroluje na dany krok.
 * @param {Element|jQuery} target
 * @param {{center?:boolean}} [opts] - center: vycentruj na vysku viewportu
 */
export function lcdScrollToStep(target, opts) {
  var el = target;
  if (el && el.jquery) el = el.get(0);
  if (!el || typeof el.getBoundingClientRect !== "function") return;

  var GAP = 16;
  var center = !!(opts && opts.center);
  var lastTop = null;
  var stableFrames = 0;
  var frames = 0;
  var startTs = Date.now();

  function pageY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function absTop() {
    return pageY() + el.getBoundingClientRect().top;
  }

  function nativeScroll(top) {
    top = Math.max(0, Math.round(top));
    try {
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch (err) {
      window.scrollTo(0, top);
    }
  }

  // Pozadovana pozicia horneho okraja kroku vo viewporte.
  function desiredViewportTop() {
    var headerH = lcdGetHeaderOffset();
    if (center) {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var elH = el.getBoundingClientRect().height || 0;
      var avail = vh - headerH;
      // Ak je krok privelky na vycentrovanie - zarovnaj tesne pod header.
      if (elH >= avail - 20) return headerH + GAP;
      return headerH + (avail - elH) / 2;
    }
    return headerH + GAP;
  }

  // Po scrolle layout este reflowuje (nacitanie obrazkov v kroku 4/5,
  // accordion animacie, async Shoptet skripty) — krok by skoncil za fixnym
  // header-menu. Preto ~2.9s po scrolle kazdych 120ms prepocitame ciel a
  // instantne dorovname. Instant scroll funguje aj na pozadi a nebije sa s
  // animaciou. Watchdog sa zrusi ak pouzivatel sam scrolluje.
  function correctAfterSettle() {
    var ticks = 0;
    var aborted = false;
    var lastApplied = null;
    function onUserScroll() { aborted = true; }
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll, { passive: true });
    function unbind() {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    }
    function step() {
      ticks++;
      if (aborted || !el.isConnected) { unbind(); return; }
      if (lastApplied !== null && Math.abs(pageY() - lastApplied) > 60) {
        unbind();
        return;
      }
      var have = el.getBoundingClientRect().top;
      var want = desiredViewportTop();
      if (Math.abs(have - want) > 3) {
        var t = Math.max(0, Math.round(pageY() + have - want));
        window.scrollTo(0, t);
        lastApplied = t;
      } else {
        lastApplied = pageY();
      }
      if (ticks < 22) setTimeout(step, 120);
      else unbind();
    }
    setTimeout(step, 260);
  }

  function performScroll() {
    nativeScroll(absTop() - desiredViewportTop());
    correctAfterSettle();
  }

  function tick() {
    frames++;
    var t = absTop();
    if (lastTop !== null && Math.abs(t - lastTop) < 0.6) stableFrames++;
    else stableFrames = 0;
    lastTop = t;
    if (stableFrames >= 5 || frames > 150 || Date.now() - startTs > 1100) {
      performScroll();
    } else {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

/** Stabilne oznacenie krokov atributom data-lcd-step. */
export function lcdTagSteps() {
  var steps = [];
  var contentSteps = document.querySelectorAll(
    ".content-wrap > .position-wrap, .content-wrap > .parameter-wrap"
  );
  for (var i = 0; i < contentSteps.length; i++) {
    steps.push(contentSteps[i]);
  }
  var trunk = document.querySelector(".upsale-buttons.trunk");
  if (trunk) steps.push(trunk);
  var boxs = document.querySelector(".upsale-buttons.boxs");
  if (boxs) steps.push(boxs);
  for (var j = 0; j < steps.length; j++) {
    steps[j].setAttribute("data-lcd-step", String(j));
  }
  return steps;
}
