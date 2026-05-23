/**
 * LCD SCROLL ENGINE - kompletny rebuild 2026-05-23
 * -------------------------------------------------
 * Jediny scroll mechanizmus pre konfigurator (kroky K0-K6).
 *
 * Princip:
 *  1. Volajuci otvori novy akordeon (openNextAccordion) a zavola lcdScrollToStep.
 *  2. Engine pocka v requestAnimationFrame slucke kym sa layout USTALI
 *     (accordion collapse/expand animacia dobehne) - nehada fixny timeout.
 *  3. Potom RAZ cisto naskroluje tak, aby hlavicka kroku (zlaty pruh s cislom
 *     a nazvom kroku) bola viditelna tesne pod fixnym header-menu.
 *  4. Po dojazde scrollu spravi jednu korekciu (header sa pri scrolle moze
 *     zmensit, obrazky v kroku sa mozu donacitat).
 *
 * Preco window.scrollTo a nie jQuery .animate({scrollTop}):
 *  Na tomto Shoptet shope jQuery .animate({scrollTop}) so strankou nehybe.
 *  Funguje VYHRADNE nativne window.scrollTo.
 */

/**
 * Vyska realne pripnuteho (position: fixed / sticky) header-menu - kolko px
 * zhora prekryva obsah. Ak header nie je pripnuty hore, vrati 0.
 */
export function lcdGetHeaderOffset() {
  var selectors = [
    ".plugin-fixed-header",
    ".header-fixed",
    "#header",
    "header.header",
    ".top-navigation-bar",
    "header",
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
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (parseFloat(cs.opacity || "1") < 0.1) continue;
      var r = el.getBoundingClientRect();
      if (r.height < 8) continue;
      // Len elementy realne pripnute o horny okraj a nie privelke.
      if (r.top <= 10 && r.bottom > maxBottom && r.bottom < viewportH * 0.6) {
        maxBottom = r.bottom;
      }
    }
  }
  return maxBottom;
}

/**
 * Naskroluje na dany krok tak, aby jeho hlavicka bola tesne pod header-menu.
 * @param {Element|jQuery} target - akordeon kroku (.position-wrap / .parameter-wrap)
 */
export function lcdScrollToStep(target) {
  var el = target;
  if (el && el.jquery) el = el.get(0);
  if (!el || typeof el.getBoundingClientRect !== "function") return;

  // Medzera pod headerom - aby bol zlaty pruh s cislom kroku jasne vidno.
  var GAP = 14;

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

  // Po dojazde scrollu over a pripadne doprav (1x).
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
        var headerH = lcdGetHeaderOffset();
        var have = el.getBoundingClientRect().top;
        var want = headerH + GAP;
        if (Math.abs(have - want) > 38) {
          nativeScroll(pageY() + have - headerH - GAP);
        }
      } else {
        requestAnimationFrame(watch);
      }
    }
    requestAnimationFrame(watch);
  }

  function performScroll() {
    var headerH = lcdGetHeaderOffset();
    nativeScroll(absTop() - headerH - GAP);
    correctAfterSettle();
  }

  // Cakaj kym sa absolutna pozicia kroku ustali (accordion animacia dobehne).
  function tick() {
    frames++;
    var t = absTop();
    if (lastTop !== null && Math.abs(t - lastTop) < 0.6) stableFrames++;
    else stableFrames = 0;
    lastTop = t;
    // Ustalene (5 frameov bez pohybu) ALEBO poistka po ~2.5 s.
    if (stableFrames >= 5 || frames > 150) {
      performScroll();
    } else {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

/**
 * Stabilne oznacenie krokov atributom data-lcd-step="0,1,2,...".
 * Poradie: vsetky kroky v .content-wrap (K0-K4), potom trunk (K5), potom
 * boxs (K6). Umoznuje scroll engine-u aj navigacii jednoznacne adresovat krok.
 * @returns {Element[]} pole krokov v poradi
 */
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
