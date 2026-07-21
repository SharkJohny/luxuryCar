const EXTRA_LABELS = {
  prevodovka: "Prevodovka",
  sedadlo: "Sedadlo spolujazdca",
  zasuvky: "Počet zásuviek",
  brzda: "Parkovacia brzda",
  podlaha: "Podlaha",
};

const PLACEMENT_LABELS = {
  nechcem: "Bez nášiviek",
  stred: "Len stred",
  boky: "Šofér + spolujazdec",
  "boky+stred": "Šofér + spolujazdec + stred",
};

const SUMMARY_START = "[TRUCK KONFIGURÁCIA]";
const SUMMARY_END = "[/TRUCK KONFIGURÁCIA]";

function selectedText(value, preferName = false) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (preferName && value.name) return value.name;
  return value.code || value.name || "";
}

function addLine(lines, label, value) {
  if (value === null || value === undefined || value === "") return;
  lines.push(`${label}: ${value}`);
}

/**
 * Text urceny priamo do poznamky objednavky v Shoptete. Neobsahuje ceny — tie
 * Shoptet eviduje cez priplatkove parametre — iba vyrobne specifikacie, ktore
 * sa z dynamickeho konfiguratora inak do administracie nedostanu.
 */
export function buildTruckOrderSummary(state) {
  const s = state || {};
  const lines = [];

  addLine(lines, "Vozidlo", [s.znacka, s.model].filter(Boolean).join(" "));
  Object.keys(EXTRA_LABELS).forEach((key) => {
    addLine(lines, EXTRA_LABELS[key], s.extras && s.extras[key]);
  });

  const carpetColor = selectedText(s.selectedColor);
  addLine(lines, "Materiál kobercov", s.selectedMaterial);
  addLine(lines, "Farba kobercov", carpetColor);
  addLine(lines, "Lemovanie kobercov", selectedText(s.selectedLemovanie, true));

  addLine(lines, "Umiestnenie nášiviek", PLACEMENT_LABELS[s.nasivkyPlacement]);
  if (s.selectedNasivka) {
    addLine(lines, "Nášivka šofér + spolujazdec", selectedText(s.selectedNasivka));
    addLine(lines, "Niť šofér + spolujazdec", selectedText(s.selectedNitColor, true));
  }
  if (s.selectedStredNasivka) {
    addLine(lines, "Stredová nášivka", selectedText(s.selectedStredNasivka));
    addLine(lines, "Niť stredovej nášivky", selectedText(s.selectedStredNitColor, true));
  }

  const wantsDoorPanels = s.doorPanelChoice === true || s.doorPanelChoice === "ano";
  addLine(lines, "Tapacír dverí", wantsDoorPanels ? "Áno" : "Nie");
  if (wantsDoorPanels) {
    addLine(lines, "Materiál dverí", s.doorMaterial);
    addLine(lines, "Farba dverí", selectedText(s.doorColor));
    addLine(lines, "Lemovanie dverí", selectedText(s.doorLemovanie, true));

    const wantsDoorPatch = s.doorWantsNasivka === true;
    addLine(lines, "Nášivka na dverách", wantsDoorPatch ? "Áno" : "Nie");
    if (wantsDoorPatch) {
      addLine(lines, "Druh nášivky na dverách", selectedText(s.doorNasivka));
      addLine(lines, "Niť nášivky na dverách", selectedText(s.doorNitColor, true));
    }
  }

  return lines.join("\n");
}

export function persistTruckOrderSummary(state) {
  const summary = buildTruckOrderSummary(state);
  if (typeof sessionStorage !== "undefined" && summary) {
    sessionStorage.setItem("truckOrderSummary", summary);
  }
  return summary;
}

export function mergeTruckOrderSummaryIntoNote(currentNote, summary) {
  const escapedStart = SUMMARY_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = SUMMARY_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withoutOldSummary = String(currentNote || "")
    .replace(new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, "g"), "")
    .trim();

  if (!summary) return withoutOldSummary;
  const block = `${SUMMARY_START}\n${summary}\n${SUMMARY_END}`;
  return withoutOldSummary ? `${withoutOldSummary}\n\n${block}` : block;
}
