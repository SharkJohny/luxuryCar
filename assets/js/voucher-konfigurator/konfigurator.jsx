/* konfigurator.jsx — Darčeková poukážka, port z darcekova-poukazka/konfigurator.jsx.
 *
 * Zmeny oproti originálu (viď plán "Fáze 1"):
 *  - Žiadny backend/PDF/email automatika — poukaz sú reálne Shoptet produkty
 *    ("mince" 100–500 €), pridávajú sa do košíka a admin uplatnenie rieši
 *    ručne cez Shoptet zľavové kupóny. Texty o "PDF do 5 minút" preto
 *    zmiernené na "kód emailom po spracovaní objednávky" (pricing.js, cart.js).
 *  - Vlastná suma nie je plovoucí príplatok (Shoptet to nevie) — je to krok
 *    po 100 € (STEP), poskladaný z mincí (decomposeToCoins). Zobrazujeme
 *    rozklad, nech zákazník vie, že dostane viac kódov.
 *  - Header/nav/breadcrumb/footer z originálu vypustené — dodáva ich Shoptet
 *    téma okolo mount elementu (rovnaký princíp ako truck-konfigurator).
 */
import React from "react";
import {
  PRESET_VALUES,
  DEFAULT_VALUE,
  STEP,
  CUSTOM_MIN,
  CUSTOM_MAX,
  decomposeToCoins,
  clampToStep,
  fmtEur,
  validityDate,
} from "./pricing.js";
import { addCoinsToCart, goToCart } from "./cart.js";

// Doručenie — jednotne emailom, kód poukážky, žiadny príplatok.
const DELIVERY_INFO = {
  title: "Email — kód poukážky",
  desc: "Po spracovaní objednávky ti pošleme kód poukážky na email. Kód zadáš v košíku pri ďalšom nákupe a hodnota sa odráta.",
  status: "Email — zdarma",
};

const AUDIENCE = [
  { icon: "🎁", title: "Keď neviete, čo presne kúpiť", text: "Autokoberce sa šijú na mieru konkrétneho auta. Bez presného typu vozidla darček ľahko netrafíte — poukážka to vyrieši za vás." },
  { icon: "🚗", title: "Pre milovníka svojho auta", text: "Partner, otec či kamarát, ktorý si auto stráži ako oko v hlave. Toto je darček, ktorý naozaj využije a ocení." },
  { icon: "🏢", title: "Ako firemný darček", text: "Pre zamestnancov, klientov aj obchodných partnerov. Hodnotu zvolíte podľa príležitosti a všetko vybavíte z jedného miesta." },
  { icon: "⏱️", title: "Na poslednú chvíľu", text: "Zabudli ste na darček? Poukážku vybavíme rýchlo — stihnete to aj na poslednú chvíľu." },
];

const REASONS = [
  { icon: "🎯", title: "Nemôžete sa netrafiť", text: "Obdarovaný si vyberie presne to, čo chce — farbu, dizajn aj typ produktu. Žiadne hádanie." },
  { icon: "✉️", title: "Príde emailom", text: "Kód poukážky ti pošleme na email po spracovaní objednávky." },
  { icon: "🖨️", title: "Vyzerá ako darček", text: "Poukážku môžeš vytlačiť a odovzdať pekne do ruky — nielen holý kód v správe." },
  { icon: "💶", title: "Hodnotu volíte vy", text: `Od ${fmtEur(CUSTOM_MIN)} do ${fmtEur(CUSTOM_MAX)}, v krokoch po ${fmtEur(STEP)}.` },
  { icon: "📅", title: "Celý rok platnosti", text: "Obdarovaný sa nemusí ponáhľať — na výber aj objednávku má 12 mesiacov." },
  { icon: "🛒", title: "Platí na celý sortiment", text: "Autokoberce, kufrové rohože aj bundle sety — všetko z webu luxurycardesign.sk." },
];

const OCCASIONS = [
  { icon: "🎄", label: "Vianoce" },
  { icon: "🎂", label: "Narodeniny" },
  { icon: "🚗", label: "Nové auto" },
  { icon: "💍", label: "Výročie" },
  { icon: "👔", label: "Otcov deň" },
  { icon: "🤝", label: "Firemný darček" },
];

const STEPS = [
  { num: "1", title: "Vyberiete hodnotu", text: "Zvolíte sumu poukážky a dokončíte objednávku. Platba prebehne ako pri bežnom nákupe." },
  { num: "2", title: "Kód príde na email", text: "Po spracovaní objednávky ti pošleme kód poukážky emailom." },
  { num: "3", title: "Obdarovaný uplatní kód", text: "Kód zadá v košíku na luxurycardesign.sk a hodnota poukážky sa odráta z jeho objednávky." },
];

const REVIEWS = [
  { text: "Manželovi som dala poukážku pod stromček — koberce do auta si stále odkladal na potom. Konečne si ich objednal presne podľa seba.", author: "Lucia", role: "Trnava" },
  { text: "Darček pre kolegu som riešil na poslednú chvíľu. Kód prišiel rýchlo, stihol som to ešte v práci.", author: "Martin", role: "Bratislava" },
  { text: "Nevedeli sme, aký má brat presný model auta. Poukážka to vyriešila — všetko si vybral sám.", author: "Veronika", role: "Žilina" },
];

const COMPARE = [
  { aspect: "Trafíte sa do vkusu?", voucher: "Obdarovaný si vyberie sám", guess: "Riskujete, že netrafíte" },
  { aspect: "Kedy je darček pripravený", voucher: "Kód dostaneš emailom", guess: "Čakáte na dodanie alebo sklad" },
  { aspect: "Treba poznať auto?", voucher: "Nie — typ zadá obdarovaný", guess: "Musíte poznať model aj výbavu" },
  { aspect: "Čas na rozhodnutie", voucher: "Celých 12 mesiacov", guess: "Žiadny" },
  { aspect: "Výsledok", voucher: "Presne to, čo si obdarovaný praje", guess: "Dúfate, že sa trafíte" },
];

const FAQ_ITEMS = [
  { q: "Ako sa poukážka uplatní?", a: "Po objednávke ti príde email s kódom poukážky. Tento kód zadáš v košíku na luxurycardesign.sk a hodnota poukážky sa odráta z objednávky." },
  { q: "Ako dlho poukážka platí?", a: "12 mesiacov od zakúpenia." },
  { q: "Kedy mi poukážka príde?", a: "Kód poukážky ti pošleme na email po spracovaní objednávky." },
  { q: "Čo ak je objednávka drahšia ako poukážka?", a: "Žiadny problém — rozdiel jednoducho doplatíte pri objednávke bežným spôsobom." },
  { q: "Na čo sa dá poukážka použiť?", a: "Na celý sortiment na luxurycardesign.sk — autokoberce, kufrové rohože aj bundle sety." },
  { q: "Musím poznať typ auta obdarovaného?", a: "Nie. Autokoberce sa síce vyrábajú na mieru, ale presný typ a výbavu vozidla zadá až obdarovaný pri svojej objednávke." },
  { q: "Dá sa poukážka vrátiť?", a: "Darčekové poukážky sa nedajú vrátiť ani vymeniť za hotovosť. Platia však na celý sortiment, takže obdarovaný si vždy nájde, čo využije." },
  { q: "Ako funguje vlastná suma?", a: `Vlastnú sumu vieš zvoliť v krokoch po ${fmtEur(STEP)} (napr. 600 €, 700 €…) — poukaz vtedy dostaneš ako kombináciu viacerých kódov v súčte danej hodnoty. Pre väčšiu alebo atypickú sumu nás kontaktuj priamo.` },
];

function VoucherCard({ value, validity }) {
  const [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 280);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="voucher-card">
      <div className="voucher-grid">
        <div className="voucher-top">
          <div>
            <div className="voucher-brand-name">LCD</div>
            <div className="voucher-brand-sub">Darčeková poukážka</div>
          </div>
          <div className="voucher-chip"></div>
        </div>
        <div className="voucher-amount">
          <div className="voucher-amount-label">Hodnota</div>
          <div className={"voucher-amount-value" + (flash ? " flash" : "")}>{fmtEur(value)}</div>
        </div>
        <div className="voucher-bottom">
          <div className="voucher-meta">
            Platnosť
            <strong>do {validity}</strong>
          </div>
          <div className="voucher-tagline">— Drive in luxury</div>
        </div>
      </div>
    </div>
  );
}

function CoinsBreakdown({ coins }) {
  const entries = Object.entries(coins)
    .map(([v, n]) => [Number(v), n])
    .sort((a, b) => b[0] - a[0]);
  if (entries.length <= 1) return null;
  return (
    <div className="vch-coins">
      {entries.map(([v, n]) => (
        <span className="vch-coin-chip" key={v}>
          <strong>{n}×</strong> {fmtEur(v)}
        </span>
      ))}
    </div>
  );
}

function Accordion({ open, badge, label, status, onToggle, children, id }) {
  return (
    <div className={"vch-acc" + (open ? " open" : "")} id={id}>
      <button type="button" className="vch-acc-header" onClick={onToggle} aria-expanded={open}>
        <span className="vch-acc-badge">{badge}</span>
        <span className="vch-acc-label">{label}</span>
        {status ? <span className="vch-acc-status">{status}</span> : null}
        <span className="vch-acc-arrow" aria-hidden="true">▾</span>
      </button>
      <div className="vch-acc-body">
        <div className="vch-acc-body-inner">{children}</div>
      </div>
    </div>
  );
}

function FaqRow({ item, open, onToggle }) {
  return (
    <div className={"gv-faq-item" + (open ? " open" : "")}>
      <button type="button" className="gv-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{item.q}</span>
        <span className="gv-faq-icon" aria-hidden="true">+</span>
      </button>
      <div className="gv-faq-a">
        <div className="gv-faq-a-inner">{item.a}</div>
      </div>
    </div>
  );
}

function InfoSections() {
  const [openFaq, setOpenFaq] = React.useState(-1);
  return (
    <div className="gv-wrap">
      <section className="gv-section">
        <div className="gv-eyebrow">Pre koho</div>
        <h2 className="gv-title">Komu darčeková poukážka sadne</h2>
        <p className="gv-lead">Poukážka je ideálna všade tam, kde chcete darovať luxus do auta, ale výber radšej necháte na obdarovaného.</p>
        <div className="gv-audience-grid">
          {AUDIENCE.map((a, i) => (
            <div className="gv-audience-card" key={i}>
              <div className="gv-audience-icon">{a.icon}</div>
              <div className="gv-audience-title">{a.title}</div>
              <div className="gv-audience-text">{a.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Prečo poukážka</div>
        <h2 className="gv-title">Šesť dôvodov, prečo ňou nič nepokazíte</h2>
        <div className="gv-reasons-grid">
          {REASONS.map((r, i) => (
            <div className="gv-reason-card" key={i}>
              <div className="gv-reason-icon">{r.icon}</div>
              <div className="gv-reason-body">
                <div className="gv-reason-title">{r.title}</div>
                <div className="gv-reason-text">{r.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Dokonalý darček</div>
        <h2 className="gv-title">Sadne na každú príležitosť</h2>
        <p className="gv-lead">Nie je to darček len pod stromček. Luxus do auta poteší vždy, keď chcete niekoho naozaj prekvapiť.</p>
        <div className="gv-occasions-row">
          {OCCASIONS.map((o, i) => (
            <div className="gv-occasion-chip" key={i}>
              <span className="gv-occasion-icon">{o.icon}</span>
              <span>{o.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Ako to funguje</div>
        <h2 className="gv-title">Tri kroky a darček je hotový</h2>
        <div className="gv-steps-row">
          {STEPS.map((s, i) => (
            <div className="gv-step-card" key={i}>
              <div className="gv-step-num">{s.num}</div>
              <div className="gv-step-title">{s.title}</div>
              <div className="gv-step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Skúsenosti</div>
        <h2 className="gv-title">Čo hovoria tí, čo poukážku darovali</h2>
        <div className="gv-reviews-grid">
          {REVIEWS.map((r, i) => (
            <div className="gv-review-card" key={i}>
              <div className="gv-review-stars" aria-hidden="true">★★★★★</div>
              <div className="gv-review-text">{r.text}</div>
              <div className="gv-review-author">{r.author} <span>· {r.role}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Porovnanie</div>
        <h2 className="gv-title">Poukážka vs. hádať konkrétny darček</h2>
        <div className="gv-compare-table">
          <div className="gv-compare-head">
            <div className="gv-compare-cell gv-compare-aspect"></div>
            <div className="gv-compare-cell gv-compare-voucher">Darčeková poukážka</div>
            <div className="gv-compare-cell gv-compare-guess">Hádať darček</div>
          </div>
          {COMPARE.map((c, i) => (
            <div className="gv-compare-row" key={i}>
              <div className="gv-compare-cell gv-compare-aspect">{c.aspect}</div>
              <div className="gv-compare-cell gv-compare-voucher"><span className="gv-compare-mark yes" aria-hidden="true">✓</span>{c.voucher}</div>
              <div className="gv-compare-cell gv-compare-guess"><span className="gv-compare-mark no" aria-hidden="true">✕</span>{c.guess}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="gv-section">
        <div className="gv-eyebrow">Časté otázky</div>
        <h2 className="gv-title">Ešte niečo nejasné?</h2>
        <div className="gv-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={i} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function VoucherApp() {
  const [openSection, setOpenSection] = React.useState(1);
  const [presetValue, setPresetValue] = React.useState(DEFAULT_VALUE);
  const [customMode, setCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  const [toastMsg, setToastMsg] = React.useState(null);
  const [adding, setAdding] = React.useState(false);

  const value = React.useMemo(() => {
    if (customMode) {
      const v = parseInt(customValue, 10);
      if (isNaN(v)) return CUSTOM_MIN;
      return clampToStep(v);
    }
    return presetValue;
  }, [customMode, customValue, presetValue]);

  const coins = React.useMemo(() => decomposeToCoins(value), [value]);
  const total = value;
  const validity = React.useMemo(() => validityDate(), []);

  function toggle(n) { setOpenSection((prev) => (prev === n ? 0 : n)); }
  function goToStep(n) {
    setOpenSection(n);
    setTimeout(() => {
      const el = document.getElementById(n === 0 ? "voucher-summary" : "acc-step-" + n);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  }
  function pickPreset(v) { setPresetValue(v); setCustomMode(false); setCustomValue(""); }
  function pickCustom() {
    setCustomMode(true);
    setTimeout(() => {
      const el = document.getElementById("customAmount");
      if (el) el.focus();
    }, 100);
  }
  function onCustomBlur() {
    if (!customValue) return;
    const v = parseInt(customValue, 10) || CUSTOM_MIN;
    setCustomValue(String(clampToStep(v)));
  }

  async function addToCart() {
    if (adding) return;
    setAdding(true);
    setToastMsg(`Pridávam poukážku ${fmtEur(value)} do košíka…`);
    try {
      const results = await addCoinsToCart(coins);
      const failed = results.filter((r) => !r.ok);
      if (failed.length) {
        setToastMsg("Časť poukážky sa nepodarilo pridať automaticky. Skús to prosím znova alebo nás kontaktuj.");
        setAdding(false);
        return;
      }
      setToastMsg(`Poukážka ${fmtEur(value)} pridaná do košíka ✓`);
      setTimeout(() => goToCart(), 900);
    } catch (e) {
      setToastMsg("Pridanie do košíka zlyhalo. Skús to prosím znova.");
      setAdding(false);
    }
  }

  const statusValue = customMode ? `Vlastná: ${fmtEur(value)}` : fmtEur(value);
  const statusDelivery = DELIVERY_INFO.status;

  return (
    <React.Fragment>
      <div className="vch-container">
        <div className="vch-main">
          <section className="vch-stage">
            <VoucherCard value={value} validity={validity} />
            <CoinsBreakdown coins={coins} />

            <div className="vch-trust-strip">
              <div className="vch-trust-item">
                <div className="vch-trust-icon">⌬</div>
                <div className="vch-trust-title">12 mesiacov</div>
                <div className="vch-trust-desc">Platnosť od nákupu</div>
              </div>
              <div className="vch-trust-item">
                <div className="vch-trust-icon">✦</div>
                <div className="vch-trust-title">Na všetko</div>
                <div className="vch-trust-desc">Celý sortiment LCD</div>
              </div>
              <div className="vch-trust-item">
                <div className="vch-trust-icon">✉</div>
                <div className="vch-trust-title">Email s kódom</div>
                <div className="vch-trust-desc">Uplatníš v košíku</div>
              </div>
            </div>

            <div className="vch-tip-box">
              <strong>Tip:</strong> Poukážku obdarovaný uplatní na čokoľvek z ponuky webu{" "}
              <a href="https://www.luxurycardesign.sk" target="_blank" rel="noopener noreferrer">www.luxurycardesign.sk</a>
              {" "}— autokoberce, kufrové rohože aj bundle sety. Vyberie si presne to, čo potrebuje.
            </div>
          </section>

          <section className="vch-config">
            <div className="vch-config-eyebrow">Luxury Car Design</div>
            <h1 className="vch-config-title">Darčeková poukážka</h1>
            <p className="vch-config-lead">
              Daruj zážitok z luxusu. Vyber hodnotu poukážky — pošleme ti kód na email.
              Obdarovaný zadá kód v košíku a má luxus na celý sortiment.
            </p>

            <Accordion open={openSection === 1} badge={1} label="Hodnota poukážky" status={statusValue} onToggle={() => toggle(1)} id="acc-step-1">
              <div className="vch-values-grid">
                {PRESET_VALUES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={"vch-val-btn" + (!customMode && presetValue === v ? " active" : "") + (v === DEFAULT_VALUE ? " popular" : "")}
                    onClick={() => pickPreset(v)}
                  >{fmtEur(v)}</button>
                ))}
                <button
                  type="button"
                  className={"vch-val-btn" + (customMode ? " active" : "")}
                  onClick={pickCustom}
                >Vlastná</button>
              </div>

              {customMode ? (
                <div className="vch-custom-amount">
                  <label htmlFor="customAmount">Vlastná suma</label>
                  <div className="vch-custom-input-wrap">
                    <input
                      id="customAmount"
                      type="number"
                      className="vch-custom-input"
                      min={CUSTOM_MIN} max={CUSTOM_MAX} step={STEP}
                      inputMode="numeric"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onBlur={onCustomBlur}
                      placeholder={String(DEFAULT_VALUE + STEP)}
                    />
                    <span className="vch-custom-currency">€</span>
                  </div>
                  <div className="vch-custom-hint">
                    Krok {fmtEur(STEP)}. Min. {fmtEur(CUSTOM_MIN)}, max. {fmtEur(CUSTOM_MAX)}.
                    Väčšiu sumu vybavíme na mieru — napíš nám.
                  </div>
                </div>
              ) : null}

              <button type="button" className="vch-step-next-btn" onClick={() => goToStep(2)}>
                Pokračovať na ďalší krok <span aria-hidden="true">→</span>
              </button>
            </Accordion>

            <Accordion open={openSection === 2} badge={2} label="Doručenie" status={statusDelivery} onToggle={() => toggle(2)} id="acc-step-2">
              <div className="vch-delivery-info">
                <div className="vch-delivery-info-icon">✉</div>
                <div className="vch-delivery-info-content">
                  <div className="vch-delivery-info-title">
                    {DELIVERY_INFO.title}
                    <span className="vch-delivery-free"> — zdarma</span>
                  </div>
                  <div className="vch-delivery-info-desc">{DELIVERY_INFO.desc}</div>
                  <ul className="vch-delivery-info-list">
                    <li>Kód poukážky na email</li>
                    <li>Uplatniteľný priamo v košíku</li>
                    <li>Platnosť 12 mesiacov od nákupu</li>
                  </ul>
                </div>
              </div>

              <button type="button" className="vch-step-next-btn" onClick={() => goToStep(0)}>
                Pokračovať na zhrnutie <span aria-hidden="true">→</span>
              </button>
            </Accordion>

            <div className="vch-summary" id="voucher-summary">
              <div className="vch-summary-eyebrow">Zhrnutie objednávky</div>

              <div className="vch-summary-row">
                <span>Hodnota poukážky</span>
                <strong>{fmtEur(value)}</strong>
              </div>
              <div className="vch-summary-row">
                <span>Doručenie</span>
                <strong className="vch-delivery-free">Email — zdarma</strong>
              </div>

              <div className="vch-summary-total">
                <span className="vch-summary-total-label">Spolu</span>
                <span className="vch-summary-total-value">{fmtEur(total)}</span>
              </div>

              <button type="button" className="vch-cta" onClick={addToCart} disabled={adding}>
                {adding ? "Pridávam…" : "Pridať do košíka"}
              </button>

              <div className="vch-summary-trust">
                <span>✓ Platnosť 12 mes.</span>
                <span>✓ Kód emailom</span>
                <span>✓ Na celý sortiment</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <InfoSections />

      {toastMsg ? <div className="vch-toast">{toastMsg}</div> : null}
    </React.Fragment>
  );
}
