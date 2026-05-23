/**
 * LCD SCROLL ENGINE - kompletny rebuild 2026-05-23
 * -------------------------------------------------
 * Jediny scroll mechanizmus pre konfigurator (kroky K0-K6).
 *
 * Princip:
 *  1. Volajuci otvori novy akordeon a zavola lcdScrollToStep s PREDOSLYM
 *     (prave dokoncenym) krokom - aby ho zakaznik videl hore zatvoreny
 *     a novy krok otvoreny pod nim.
 *  2. Engine pocka v requestAnimationFrame slucke kym sa layout USTALI.
 *  3. Potom RAZ cisto naskroluje tak, aby hlavicka kroku bola tesne pod
 *     fixnym header-menu (vratane loga).
 *  4. Po dojazde scrollu spravi jednu korekciu.
 *
 * Preco window.scrollTo a nie jQuery .animate(scrollTop):
 *  Na tomto Shoptet shope jQuery .animate so strankou nehybe. Funguje
 *  VYHRADNE nativne window.scrollTo.
 */

/**
 * Vyska realne pripnuteho header-menu vratane loga - kolko px zhora
 * prekryva obsah. Ak header nie je pripnuty hore, vrati 0.
 */
export function lcdGetHeaderOffset() {
  // Header pasmo + LOGO. Logo visi nizsie nez tmavy header pruh - preto
  // ho treba zaratat, inak logo prekryje nazov kroku.
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
 * Naskroluje na dany krok tak, aby jeho hlavicka bola tesne pod header-menu.
 */
export function lcdScrollToStep(target) {
  var el = target;
  if (el && el.jquery) el = el.get(0);
  if (!el || typeof el.getBoundingClientRect !== "function") return;

  var GAP = 16;
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

/**
 * Stabilne oznacenie krokov atributom data-lcd-step.
 * Poradie: kroky v content-wrap, potom trunk, potom boxs.
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
