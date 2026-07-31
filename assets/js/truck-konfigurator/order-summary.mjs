const EXTRA_LABELS = {
  prevodovka: "Transmission",
  sedadlo: "Passenger seat",
  zasuvky: "Number of drawers",
  brzda: "Parking brake",
  podlaha: "Floor",
};

const PLACEMENT_LABELS = {
  nechcem: "No embroidery",
  stred: "Centre only",
  boky: "Driver + passenger",
  "boky+stred": "Driver + passenger + centre",
};

const SUMMARY_START = "[TRUCK CONFIGURATION]";
const SUMMARY_END = "[/TRUCK CONFIGURATION]";

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

  addLine(lines, "Vehicle", [s.znacka, s.model].filter(Boolean).join(" "));
  Object.keys(EXTRA_LABELS).forEach((key) => {
    addLine(lines, EXTRA_LABELS[key], s.extras && s.extras[key]);
  });

  const carpetColor = selectedText(s.selectedColor);
  if (lines.length) lines.push("");
  addLine(lines, "Carpet material", s.selectedMaterial);
  addLine(lines, "Carpet colour", carpetColor);
  addLine(lines, "Carpet edging", selectedText(s.selectedLemovanie, true));

  lines.push("");
  addLine(lines, "Embroidery placement", PLACEMENT_LABELS[s.nasivkyPlacement]);
  if (s.selectedNasivka) {
    addLine(lines, "Driver + passenger embroidery code", selectedText(s.selectedNasivka));
    addLine(lines, "Driver + passenger thread", selectedText(s.selectedNitColor, true));
  }
  if (s.selectedStredNasivka) {
    addLine(lines, "Centre embroidery code", selectedText(s.selectedStredNasivka));
    addLine(lines, "Centre embroidery thread", selectedText(s.selectedStredNitColor, true));
  }

  const wantsDoorPanels = s.doorPanelChoice === true || s.doorPanelChoice === "ano";
  lines.push("");
  addLine(lines, "Door upholstery", wantsDoorPanels ? "Yes" : "No");
  if (wantsDoorPanels) {
    addLine(lines, "Door upholstery material", s.doorMaterial);
    addLine(lines, "Door upholstery colour", selectedText(s.doorColor));
    addLine(lines, "Door upholstery edging", selectedText(s.doorLemovanie, true));

    const wantsDoorPatch = s.doorWantsNasivka === true;
    addLine(lines, "Door embroidery", wantsDoorPatch ? "Yes" : "No");
    if (wantsDoorPatch) {
      addLine(lines, "Door embroidery code", selectedText(s.doorNasivka));
      addLine(lines, "Door embroidery thread", selectedText(s.doorNitColor, true));
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
  const legacyStart = "[TRUCK KONFIGURÁCIA]".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const legacyEnd = "[/TRUCK KONFIGURÁCIA]".replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withoutOldSummary = String(currentNote || "")
    .replace(new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, "g"), "")
    .replace(new RegExp(`${legacyStart}[\\s\\S]*?${legacyEnd}`, "g"), "")
    .trim();

  if (!summary) return withoutOldSummary;
  const block = `${SUMMARY_START}\n${summary}\n${SUMMARY_END}`;
  return withoutOldSummary ? `${withoutOldSummary}\n\n${block}` : block;
}
