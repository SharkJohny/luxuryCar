/* pricing.js — hodnoty darčekovej poukážky a rozklad na "mince".
 *
 * Poukaz sa v Shoptete predáva ako 5 samostatných produktov ("mincí")
 * 100/200/300/400/500 € (viď voucher/build-voucher-xml.mjs). Vlastná suma sa
 * poskladá kombináciou mincí — kroková po 100 €. Väčšie/atypické sumy mimo
 * CUSTOM_MAX rieši admin ručne (mimo tento konfigurátor).
 */

export const PRESET_VALUES = [100, 200, 300, 400, 500];
export const DEFAULT_VALUE = 300; // najobľúbenejšia — zvýraznená ako "Top"

export const STEP = 100;
export const CUSTOM_MIN = 100;
export const CUSTOM_MAX = 2000; // nad túto sumu odporúčame kontaktovať priamo (viac mincí v košíku)

export const VALIDITY_MONTHS = 12;

// Zoradené zostupne — greedy rozklad najväčšou mincou napred (menej položiek v košíku).
export const COIN_VALUES = [500, 400, 300, 200, 100];

/** Rozlož sumu (násobok 100) na mince: { [hodnota]: počet }. */
export function decomposeToCoins(value) {
  let remaining = Math.max(0, Math.round(value / STEP) * STEP);
  const coins = {};
  for (const coin of COIN_VALUES) {
    const count = Math.floor(remaining / coin);
    if (count > 0) {
      coins[coin] = count;
      remaining -= count * coin;
    }
  }
  return coins;
}

/** Zaokrúhli na najbližší násobok STEP a zarovnaj do <CUSTOM_MIN, CUSTOM_MAX>. */
export function clampToStep(value) {
  const stepped = Math.round(value / STEP) * STEP;
  return Math.max(CUSTOM_MIN, Math.min(CUSTOM_MAX, stepped));
}

export function fmtEur(n) {
  const r = Math.round(n * 100) / 100;
  if (r === Math.round(r)) {
    return new Intl.NumberFormat("sk-SK").format(Math.round(r)) + " €";
  }
  return (
    new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(r) + " €"
  );
}

export function validityDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + VALIDITY_MONTHS);
  return d.toLocaleDateString("sk-SK");
}
