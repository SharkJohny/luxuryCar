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

  function correctAfterSettle() {
    var lastY = null;
    var sf = 0;
    var f = 0;
    function watch() {
      f++;
      var y = pageY();
      if (lastY !== null && Math.abs(y - lastY) < 0.6) sf++;
      else sf = 0;
      lastY = y;
      if (sf >= 6 || f > 200) {
        var have = el.getBoundingClientRect().top;
        var want = desiredViewportTop();
        if (Math.abs(have - want) > 38) {
          nativeScroll(pageY() + have - want);
        }
      } else {
        requestAnimationFrame(watch);
      }
    }
    requestAnimationFrame(watch);
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
    if (stableFrames >= 5 || frames > 150) {
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
