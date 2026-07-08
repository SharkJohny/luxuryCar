/* cart.js — napojenie konfigurátora poukážky na Shoptet košík.
 *
 * ⚠️ PRED NASADENÍM DOPLNIŤ (viď plán "Riziká a body k overeniu"):
 *  1) COIN_URLS — reálne URL adries 5 produktov-mincí PO importe
 *     voucher/dist/voucher-products.xml do Shoptetu. Shoptet generuje slug
 *     automaticky z NAME produktu, takže sa nedá predpovedať vopred — over
 *     v Shoptet adminovi (Zoznam produktov) a dopln nižšie.
 *  2) CART_URL — over skutočnú URL stránky košíka pre luxurycardesign.sk.
 *  3) AMOUNT_INPUT_SELECTORS / ADD_BUTTON_SELECTOR — ak produktová stránka
 *     mince používa iný selektor pre množstvo/tlačidlo, uprav tu.
 *
 * Mechanizmus: pre každú mincu otvoríme jej reálnu produktovú stránku v
 * skrytom same-origin <iframe>, nastavíme množstvo a klikneme na natívne
 * Shoptet tlačidlo "Pridať do košíka" (rovnaký princíp ako UpsalePopup.js —
 * simulovaný klik na button.add-to-cart-button — len mimo aktuálnu stránku).
 * Shoptet tak spracuje pridanie presne tak, ako pri bežnom nákupe; nie je
 * potrebné poznať/replikovať interný AJAX formát Shoptetu.
 * Mince sa pridávajú SEKVENČNE (jedna po druhej), aby si Shoptet stihol
 * prepočítať košík medzi jednotlivými pridaniami.
 */

export const COIN_URLS = {
  100: "/darcekova-poukazka-100-eur/", // TODO: over/uprav po importe XML do Shoptetu
  200: "/darcekova-poukazka-200-eur/", // TODO
  300: "/darcekova-poukazka-300-eur/", // TODO
  400: "/darcekova-poukazka-400-eur/", // TODO
  500: "/darcekova-poukazka-500-eur/", // TODO
};

export const CART_URL = "/kosik/"; // TODO: over v Shoptet administrácii

const AMOUNT_INPUT_SELECTORS = 'input[name="amount"], input.amount, .p-quantity input[type="number"]';
const ADD_BUTTON_SELECTOR = "button.add-to-cart-button";
const IFRAME_TIMEOUT_MS = 8000;
const AFTER_CLICK_DELAY_MS = 1200;

function addOneCoin(url, qty) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;

    let settled = false;
    let timeoutId = null;
    const cleanup = (ok, reason) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      iframe.remove();
      resolve({ ok, reason });
    };

    timeoutId = setTimeout(() => cleanup(false, "timeout"), IFRAME_TIMEOUT_MS);

    iframe.addEventListener("load", () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return cleanup(false, "no-document");

        const amountInput = doc.querySelector(AMOUNT_INPUT_SELECTORS);
        if (amountInput) {
          amountInput.value = String(qty);
          amountInput.dispatchEvent(new Event("input", { bubbles: true }));
          amountInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const btn = doc.querySelector(ADD_BUTTON_SELECTOR);
        if (!btn) return cleanup(false, "no-add-button");

        btn.click();
        // Shoptet potvrdí pridanie AJAXom vo vnútri iframe — dáme mu čas doriešiť request.
        setTimeout(() => cleanup(true, null), AFTER_CLICK_DELAY_MS);
      } catch (e) {
        cleanup(false, "exception:" + (e && e.message));
      }
    });

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}

/**
 * Pridá do košíka všetky mince z rozkladu { [hodnota]: počet } (viď
 * pricing.js#decomposeToCoins). Vracia pole výsledkov po minciach —
 * volajúci (konfigurátor) rozhodne, ako naložiť s čiastočným zlyhaním.
 */
export async function addCoinsToCart(coins) {
  const entries = Object.entries(coins).filter(([, n]) => n > 0);
  const results = [];
  for (const [value, qty] of entries) {
    const url = COIN_URLS[value];
    if (!url) {
      results.push({ value: Number(value), qty, ok: false, reason: "missing-url" });
      continue;
    }
    const { ok, reason } = await addOneCoin(url, qty);
    results.push({ value: Number(value), qty, ok, reason });
  }
  return results;
}

export function goToCart() {
  window.location.href = CART_URL;
}
