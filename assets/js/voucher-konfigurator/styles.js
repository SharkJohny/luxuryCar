/* styles.js — scoped CSS konfigurátora poukážky.
 *
 * Port z darcekova-poukazka/index.html — orezané o standalone chrome (header/
 * nav/breadcrumb/footer, tie dodáva Shoptet téma) a o marketingové sekcie,
 * ktoré App() nikdy nerenderuje (staršia .reasons-section/.timeline/... CSS
 * vrstva v origináli — nahradená .gv-* sekciami v InfoSections()).
 *
 * Všetky pravidlá sú pod #lcd-voucher-root a generické názvy tried (container,
 * main, summary, cta, …) sú premenované na "vch-" prefix, aby nekolidovali so
 * Shoptet témou (tá bežne používa Bootstrap-like .container/.main atď.).
 * Vzor: assets/js/vzorky-konfigurator/index.js#injectStyles (lcd-vz- prefix).
 */

const STYLE_ID = "lcd-voucher-style";
export const ROOT_ID = "lcd-voucher-root";

export function injectVoucherStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const R = `#${ROOT_ID}`;
  const css = `
${R} {
  --gold: #C5A44E;
  --gold-dark: #A8893A;
  --dark: #2E1810;
  --dark-2: #1a1008;
  --cream: #fdf8ec;
  --bg: #f9f7f2;
  --border: #e0d5b8;
  --text-muted: #777;
  --white: #ffffff;
  --bg-soft: #fafafa;
  display: block;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--dark);
  font-size: 15px;
  line-height: 1.5;
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
${R} *, ${R} *::before, ${R} *::after { box-sizing: border-box; }
${R} button { font: inherit; }
${R} a { color: var(--gold); text-decoration: none; }
${R} a:hover { color: var(--gold-dark); }
${R} img { max-width: 100%; display: block; }
${R} h1, ${R} h2, ${R} h3 { margin: 0; overflow-wrap: break-word; word-wrap: break-word; }
${R} p { margin: 0; }
${R} input[type=number]::-webkit-inner-spin-button,
${R} input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
${R} input[type=number] { -moz-appearance: textfield; }
${R} button:focus-visible, ${R} input:focus-visible { outline: 3px solid rgba(197,164,78,0.4); outline-offset: 2px; }

${R} .vch-container { max-width: 1280px; width: 100%; margin: 0 auto; padding: 24px 24px 60px; }

${R} .vch-main { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: start; }
@media (min-width: 980px) {
  ${R} .vch-main { grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 40px; }
}
@media (min-width: 1200px) {
  ${R} .vch-main { grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 48px; }
}
${R} .vch-stage { min-width: 0; }
@media (min-width: 980px) { ${R} .vch-stage { position: sticky; top: 20px; } }
${R} .vch-config { min-width: 0; }

/* Voucher card */
${R} .voucher-card {
  position: relative; width: 100%; max-width: 480px; margin: 0 auto;
  aspect-ratio: 1.586 / 1;
  background:
    radial-gradient(circle at 18% 22%, rgba(197,164,78,0.22) 0%, transparent 50%),
    radial-gradient(circle at 82% 78%, rgba(197,164,78,0.14) 0%, transparent 50%),
    linear-gradient(135deg, #1A1A1A 0%, #000 50%, #1A1A1A 100%);
  border: 1px solid var(--gold-dark); border-radius: 16px; padding: 24px 28px;
  box-shadow: 0 24px 48px -18px rgba(0,0,0,0.5), 0 0 0 1px rgba(197,164,78,0.08) inset;
  color: var(--white); overflow: hidden;
}
${R} .voucher-grid { width: 100%; height: 100%; display: grid; grid-template-rows: auto 1fr auto; gap: 8px; }
${R} .voucher-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
${R} .voucher-brand-name { font-size: 18px; font-weight: 800; letter-spacing: 3px; color: var(--gold); text-transform: uppercase; line-height: 1; }
${R} .voucher-brand-sub { font-size: 9px; letter-spacing: 3px; color: #999; text-transform: uppercase; margin-top: 4px; }
${R} .voucher-chip { width: 38px; height: 28px; background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); border-radius: 5px; flex-shrink: 0; }
${R} .voucher-amount { align-self: center; text-align: right; }
${R} .voucher-amount-label { font-size: 10px; letter-spacing: 3px; color: #999; text-transform: uppercase; margin-bottom: 4px; }
${R} .voucher-amount-value { font-size: 44px; font-weight: 800; color: var(--gold); line-height: 1; letter-spacing: -1px; text-shadow: 0 0 30px rgba(197,164,78,0.4); transition: transform 0.25s ease; }
@media (min-width: 1200px) { ${R} .voucher-amount-value { font-size: 56px; } }
${R} .voucher-amount-value.flash { transform: scale(1.06); }
${R} .voucher-bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
${R} .voucher-meta { font-size: 8px; letter-spacing: 1.5px; color: #999; text-transform: uppercase; }
${R} .voucher-meta strong { color: var(--white); font-weight: 500; display: block; margin-top: 3px; font-size: 10px; letter-spacing: 1px; }
${R} .voucher-tagline { font-family: Georgia, serif; font-style: italic; color: var(--gold); font-size: 12px; letter-spacing: 0.5px; }

/* Coin breakdown badge (koľko a akých mincí sa pridá do košíka) */
${R} .vch-coins { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
${R} .vch-coin-chip { background: var(--white); border: 2px solid var(--border); border-radius: 999px; padding: 5px 12px; font-size: 12px; font-weight: 700; color: var(--dark); }
${R} .vch-coin-chip strong { color: var(--gold-dark); }

/* Trust strip */
${R} .vch-trust-strip { margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
${R} .vch-trust-item { background: var(--white); border: 2px solid var(--border); border-radius: 10px; padding: 14px 10px; text-align: center; }
${R} .vch-trust-icon { font-size: 20px; color: var(--gold); margin-bottom: 6px; line-height: 1; }
${R} .vch-trust-title { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; color: var(--dark); margin-bottom: 3px; }
${R} .vch-trust-desc { font-size: 10px; color: #666; }

${R} .vch-tip-box { margin-top: 16px; padding: 14px 18px; background: var(--cream); border: 2px solid var(--gold); border-radius: 10px; font-size: 13px; line-height: 1.55; }
${R} .vch-tip-box strong { color: var(--gold-dark); }
${R} .vch-tip-box a { color: var(--gold-dark); font-weight: 700; text-decoration: underline; }

${R} .vch-step-next-btn {
  margin-top: 14px; width: 100%; padding: 12px 18px;
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: #fff;
  border: none; border-radius: 9px; font-size: 13px; font-weight: 700; letter-spacing: .02em;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(76,175,80,0.35); transition: filter .15s ease, transform .1s ease;
}
${R} .vch-step-next-btn:hover { filter: brightness(1.07); }
${R} .vch-step-next-btn:active { transform: scale(.99); }

${R} .vch-config-eyebrow { font-size: 11px; letter-spacing: 3px; color: var(--gold); text-transform: uppercase; font-weight: 700; margin-bottom: 8px; }
${R} .vch-config-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: var(--dark); text-transform: uppercase; margin-bottom: 10px; line-height: 1.1; }
@media (min-width: 768px) { ${R} .vch-config-title { font-size: 32px; } }
@media (min-width: 1200px) { ${R} .vch-config-title { font-size: 38px; } }
${R} .vch-config-lead { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 22px; }
@media (min-width: 768px) { ${R} .vch-config-lead { font-size: 15px; } }

/* Accordion */
${R} .vch-acc { margin-bottom: 10px; scroll-margin-top: 16px; }
${R} .vch-acc-header {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 13px 14px;
  border: none; cursor: pointer; text-align: left;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
  color: var(--white); border-radius: 8px; transition: border-radius 0.2s;
}
${R} .vch-acc.open .vch-acc-header { border-radius: 8px 8px 0 0; }
${R} .vch-acc-badge { min-width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.22); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
${R} .vch-acc-label { flex: 1; min-width: 0; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
@media (min-width: 768px) { ${R} .vch-acc-label { font-size: 14px; } ${R} .vch-acc-header { padding: 14px 18px; } }
${R} .vch-acc-status { background: rgba(0,0,0,0.18); padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
${R} .vch-acc.open .vch-acc-status { background: rgba(255,255,255,0.3); }
${R} .vch-acc-arrow { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.22); display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; transition: transform 0.3s; }
${R} .vch-acc.open .vch-acc-arrow { transform: rotate(180deg); }
${R} .vch-acc-body { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; background: var(--bg-soft); }
${R} .vch-acc.open .vch-acc-body { max-height: 1200px; border: 2px solid var(--border); border-top: none; border-radius: 0 0 8px 8px; }
${R} .vch-acc-body-inner { padding: 16px; }

/* Value buttons */
${R} .vch-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@media (min-width: 1100px) { ${R} .vch-values-grid { grid-template-columns: repeat(6, 1fr); } }
${R} .vch-val-btn { padding: 14px 6px; background: var(--white); border: 2px solid var(--border); border-radius: 10px; color: var(--dark); font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.18s ease; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
${R} .vch-val-btn:hover { border-color: var(--gold); }
${R} .vch-val-btn.active { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); color: var(--white); border-color: var(--gold); box-shadow: 0 6px 16px rgba(197,164,78,0.4); }
${R} .vch-val-btn.active::after { content: "✓"; position: absolute; top: 4px; right: 6px; font-size: 10px; font-weight: 700; }
${R} .vch-val-btn.popular { position: relative; border-color: var(--gold); background: linear-gradient(135deg, var(--white) 0%, var(--cream) 100%); box-shadow: 0 4px 12px rgba(197,164,78,0.18); }
${R} .vch-val-btn.popular::before { content: "Top"; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); color: var(--white); font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 10px; box-shadow: 0 3px 8px rgba(197,164,78,0.5); white-space: nowrap; z-index: 2; }
${R} .vch-val-btn.popular.active { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); }
${R} .vch-val-btn.popular.active::before { background: var(--dark); color: var(--gold); }

${R} .vch-custom-amount { margin-top: 12px; }
${R} .vch-custom-amount label { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #666; margin-bottom: 6px; font-weight: 700; }
${R} .vch-custom-input-wrap { position: relative; }
${R} .vch-custom-input { width: 100%; padding: 14px 50px 14px 16px; border: 2px solid var(--gold); border-radius: 10px; font-size: 16px; font-weight: 700; color: var(--dark); background: var(--white); outline: none; font-family: inherit; }
${R} .vch-custom-currency { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--gold); font-weight: 700; font-size: 16px; pointer-events: none; }
${R} .vch-custom-hint { font-size: 11px; color: #888; margin-top: 6px; line-height: 1.5; }

/* Delivery info card */
${R} .vch-delivery-info { display: flex; gap: 14px; padding: 16px 18px; background: var(--cream); border: 2px solid var(--gold); border-radius: 10px; align-items: flex-start; }
${R} .vch-delivery-info-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--white); border: 2px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--gold); flex-shrink: 0; }
${R} .vch-delivery-info-content { flex: 1; min-width: 0; }
${R} .vch-delivery-info-title { font-size: 15px; font-weight: 800; color: var(--dark); margin-bottom: 6px; letter-spacing: 0.3px; }
${R} .vch-delivery-free { color: #4CAF50; font-weight: 600; }
${R} .vch-delivery-info-desc { font-size: 13px; color: #555; line-height: 1.55; margin-bottom: 10px; }
${R} .vch-delivery-info-list { margin: 0; padding: 0 0 0 18px; font-size: 12px; color: #666; line-height: 1.6; }
${R} .vch-delivery-info-list li { margin-bottom: 2px; }

/* Summary */
${R} .vch-summary { margin-top: 22px; padding: 22px; border-radius: 12px; background: linear-gradient(135deg, var(--dark) 0%, var(--dark-2) 100%); color: var(--white); box-shadow: 0 12px 30px rgba(46,24,16,0.3); }
${R} .vch-summary-eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 10px; }
${R} .vch-summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: rgba(255,255,255,0.85); }
${R} .vch-summary-row strong { color: var(--white); font-weight: 700; }
${R} .vch-summary-total { border-top: 1px solid rgba(255,255,255,0.15); margin-top: 12px; padding-top: 14px; display: flex; justify-content: space-between; align-items: baseline; }
${R} .vch-summary-total-label { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; }
${R} .vch-summary-total-value { font-size: 28px; font-weight: 800; color: var(--gold); letter-spacing: -0.5px; }
${R} .vch-cta { display: block; width: 100%; margin-top: 18px; padding: 16px; background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: var(--white); border: none; border-radius: 10px; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 20px rgba(76,175,80,0.4); transition: transform 0.2s, box-shadow 0.2s; }
${R} .vch-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(76,175,80,0.55); }
${R} .vch-cta:active { transform: translateY(0); }
${R} .vch-cta:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
${R} .vch-summary-trust { margin-top: 14px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; font-size: 11px; color: rgba(255,255,255,0.7); }

/* Toast */
${R} .vch-toast {
  position: fixed; bottom: 24px; right: 24px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); color: var(--white);
  padding: 14px 20px; border-radius: 10px; font-weight: 700; font-size: 14px;
  box-shadow: 0 16px 36px rgba(197,164,78,0.5); max-width: calc(100vw - 48px); z-index: 1000;
  animation: lcd-vch-toast-in 0.4s ease;
}
@keyframes lcd-vch-toast-in { from { transform: translateY(140%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 640px) {
  ${R} .vch-container { padding: 14px 14px 40px; }
  ${R} .vch-config-title { font-size: 24px; }
  ${R} .voucher-card { padding: 20px; max-width: 100%; }
  ${R} .voucher-amount-value { font-size: 38px; }
  ${R} .voucher-brand-name { font-size: 16px; }
  ${R} .vch-acc-status { max-width: 90px; font-size: 10px; padding: 2px 8px; }
  ${R} .vch-summary { padding: 18px; }
  ${R} .vch-summary-total-value { font-size: 24px; }
  ${R} .vch-toast { left: 14px; right: 14px; bottom: 14px; text-align: center; }
}

/* ===== Popisné sekcie (gv- prefix — už dostatočne unikátne, port 1:1) ===== */
${R} .gv-wrap { max-width: 1280px; margin: 40px auto 8px; padding: 0 24px; display: flex; flex-direction: column; gap: 48px; }
${R} .gv-eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #A8893A; font-weight: 800; margin-bottom: 8px; }
${R} .gv-title { font-size: 25px; font-weight: 800; color: #2E1810; margin: 0 0 10px; line-height: 1.22; text-align: left; text-transform: none; letter-spacing: normal; }
${R} .gv-lead { font-size: 15px; color: #5f564d; line-height: 1.6; margin: 0 0 22px; max-width: 660px; }
${R} .gv-audience-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
${R} .gv-audience-card { background: #fff; border: 1px solid #e0d5b8; border-radius: 12px; padding: 22px 18px; }
${R} .gv-audience-icon { font-size: 30px; margin-bottom: 12px; }
${R} .gv-audience-title { font-size: 15px; font-weight: 800; color: #2E1810; margin-bottom: 7px; }
${R} .gv-audience-text { font-size: 13px; color: #6a6058; line-height: 1.55; }
${R} .gv-reasons-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
${R} .gv-reason-card { display: flex; gap: 13px; background: #fdf8ec; border: 1px solid #e0d5b8; border-radius: 12px; padding: 18px; }
${R} .gv-reason-icon { font-size: 24px; flex-shrink: 0; line-height: 1; }
${R} .gv-reason-title { font-size: 14px; font-weight: 800; color: #2E1810; margin-bottom: 5px; }
${R} .gv-reason-text { font-size: 13px; color: #6a6058; line-height: 1.55; }
${R} .gv-occasions-row { display: flex; flex-wrap: wrap; gap: 12px; }
${R} .gv-occasion-chip { display: flex; align-items: center; gap: 9px; background: #fff; border: 2px solid #e0d5b8; border-radius: 999px; padding: 11px 20px; font-size: 14px; font-weight: 700; color: #2E1810; }
${R} .gv-occasion-icon { font-size: 18px; }
${R} .gv-steps-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
${R} .gv-step-card { background: #fff; border: 1px solid #e0d5b8; border-radius: 12px; padding: 24px 20px; }
${R} .gv-step-num { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #C5A44E 0%, #A8893A 100%); color: #fff; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
${R} .gv-step-title { font-size: 16px; font-weight: 800; color: #2E1810; margin-bottom: 7px; }
${R} .gv-step-text { font-size: 13px; color: #6a6058; line-height: 1.55; }
${R} .gv-reviews-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
${R} .gv-review-card { background: #fdf8ec; border: 1px solid #e0d5b8; border-radius: 12px; padding: 20px; }
${R} .gv-review-stars { color: #C5A44E; font-size: 14px; letter-spacing: 3px; margin-bottom: 10px; }
${R} .gv-review-text { font-size: 13.5px; color: #4a423c; line-height: 1.6; font-style: italic; margin-bottom: 12px; }
${R} .gv-review-author { font-size: 13px; font-weight: 800; color: #2E1810; }
${R} .gv-review-author span { font-weight: 500; color: #8a8078; }
${R} .gv-compare-table { border: 1px solid #e0d5b8; border-radius: 12px; overflow: hidden; }
${R} .gv-compare-head, ${R} .gv-compare-row { display: grid; grid-template-columns: 1.4fr 1.3fr 1.3fr; }
${R} .gv-compare-head { background: #2E1810; }
${R} .gv-compare-head .gv-compare-cell { color: #fff; font-weight: 800; font-size: 13px; }
${R} .gv-compare-row { border-top: 1px solid #e0d5b8; }
${R} .gv-compare-row:nth-child(even) { background: #fdf8ec; }
${R} .gv-compare-cell { padding: 13px 15px; font-size: 13px; color: #5f564d; display: flex; align-items: center; gap: 8px; }
${R} .gv-compare-aspect { font-weight: 700; color: #2E1810; }
${R} .gv-compare-mark { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: #fff; }
${R} .gv-compare-mark.yes { background: #4CAF50; }
${R} .gv-compare-mark.no { background: #c0996a; }
${R} .gv-faq-list { display: flex; flex-direction: column; gap: 10px; }
${R} .gv-faq-item { border: 1px solid #e0d5b8; border-radius: 10px; overflow: hidden; background: #fff; }
${R} .gv-faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 700; color: #2E1810; text-align: left; }
${R} .gv-faq-icon { font-size: 22px; color: #A8893A; flex-shrink: 0; line-height: 1; transition: transform 0.25s; }
${R} .gv-faq-item.open .gv-faq-icon { transform: rotate(45deg); }
${R} .gv-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
${R} .gv-faq-item.open .gv-faq-a { max-height: 360px; }
${R} .gv-faq-a-inner { padding: 0 18px 16px; font-size: 13px; color: #6a6058; line-height: 1.6; }
@media (max-width: 880px) {
  ${R} .gv-audience-grid, ${R} .gv-reasons-grid, ${R} .gv-steps-row, ${R} .gv-reviews-grid { grid-template-columns: minmax(0, 1fr); }
  ${R} .gv-title { font-size: 22px; }
  ${R} .gv-compare-head, ${R} .gv-compare-row { grid-template-columns: 1.3fr 1fr 1fr; }
}
`;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
