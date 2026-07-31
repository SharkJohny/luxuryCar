const SUMMARY_TEXTS = {
  sk: {
    headings: {
      vehicle: "ŠPECIFIKÁCIA VOZIDLA",
      carpets: "KOBERČEKY POD SEDAČKY",
      doors: "TAPACÍR DVERÍ",
    },
    labels: {
      vehicle: "Vozidlo",
      materialColor: "Typ a farba materiálu",
      edgingColor: "Farba lemovania",
      embroideryPlacement: "Rozloženie nášiviek",
      centrePatchType: "Typ nášivky na stred",
      centrePatchColor: "Farba nášivky na stred",
      sidePatchType: "Typ nášiviek na boky",
      sidePatchColor: "Farba nášiviek na boky",
      doorPatches: "Nášivky na tapacír",
      doorPatchType: "Typ nášivky na tapacír",
      doorPatchColor: "Farba nášiviek na tapacíre",
    },
    extras: {
      prevodovka: "Typ prevodovky",
      sedadlo: "Typ sedadla spolujazdca",
      zasuvky: "Počet zásuviek",
      brzda: "Typ parkovacej brzdy",
      podlaha: "Typ podlahy",
    },
    placements: {
      nechcem: "Bez nášiviek",
      stred: "Len stred",
      boky: "Šofér + spolujazdec",
      "boky+stred": "Šofér + spolujazdec + stred",
    },
    noPatch: "Bez nášivky",
    yes: "Chcem",
    no: "Nechcem",
    sameMaterial: "Rovnaký ako koberčeky",
    sameEdging: "Rovnaká ako farba lemovania koberčekov",
    samePatch: "Rovnaká ako na koberčekoch",
    markerStart: "[KONFIGURÁCIA KAMIÓNA]",
    markerEnd: "[/KONFIGURÁCIA KAMIÓNA]",
  },
  cs: {
    headings: {
      vehicle: "SPECIFIKACE VOZIDLA",
      carpets: "KOBEREČKY POD SEDAČKY",
      doors: "TAPACÍR DVEŘÍ",
    },
    labels: {
      vehicle: "Vozidlo",
      materialColor: "Typ a barva materiálu",
      edgingColor: "Barva lemování",
      embroideryPlacement: "Rozložení nášivek",
      centrePatchType: "Typ nášivky na střed",
      centrePatchColor: "Barva nášivky na střed",
      sidePatchType: "Typ nášivek na boky",
      sidePatchColor: "Barva nášivek na boky",
      doorPatches: "Nášivky na tapacír",
      doorPatchType: "Typ nášivky na tapacír",
      doorPatchColor: "Barva nášivek na tapacíru",
    },
    extras: {
      prevodovka: "Typ převodovky",
      sedadlo: "Typ sedadla spolujezdce",
      zasuvky: "Počet zásuvek",
      brzda: "Typ parkovací brzdy",
      podlaha: "Typ podlahy",
    },
    placements: {
      nechcem: "Bez nášivek",
      stred: "Pouze střed",
      boky: "Řidič + spolujezdec",
      "boky+stred": "Řidič + spolujezdec + střed",
    },
    noPatch: "Bez nášivky",
    yes: "Chci",
    no: "Nechci",
    sameMaterial: "Stejný jako koberečky",
    sameEdging: "Stejná jako barva lemování koberečků",
    samePatch: "Stejná jako na koberečcích",
    markerStart: "[KONFIGURACE KAMIONU]",
    markerEnd: "[/KONFIGURACE KAMIONU]",
  },
};

export function detectTruckSummaryLanguage() {
  if (typeof window === "undefined") return "sk";
  try {
    const hostname = String(window.location && window.location.hostname || "").toLowerCase();
    if (hostname === "luxurycardesign.cz" || hostname.endsWith(".luxurycardesign.cz")) return "cs";
    if (hostname === "luxurycardesign.sk" || hostname.endsWith(".luxurycardesign.sk")) return "sk";

    const dlEntry = Array.isArray(window.dataLayer)
      ? window.dataLayer.find((entry) => entry && entry.shoptet)
      : null;
    if (dlEntry && (dlEntry.shoptet.language === "cs" || String(dlEntry.shoptet.projectId) === "704436")) {
      return "cs";
    }
  } catch (e) { /* use Slovak fallback */ }
  return "sk";
}

function selectedText(value, preferName = false) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (preferName && value.name) return value.name;
  return value.code || value.name || "";
}

function addLine(lines, label, value) {
  if (value === null || value === undefined || value === "") return;
  lines.push(`- ${label}: ${value}`);
}

function materialAndColor(material, color) {
  return [material, selectedText(color, true)].filter(Boolean).join(" – ");
}

function hasSideEmbroidery(placement) {
  return placement === "boky" || placement === "boky+stred";
}

function hasCentreEmbroidery(placement) {
  return placement === "stred" || placement === "boky+stred";
}

function addGroup(lines, heading, entries) {
  const group = [];
  entries(group);
  if (!group.length) return;
  if (lines.length) lines.push("");
  lines.push(heading, ...group);
}

/**
 * Text urceny priamo do poznamky objednavky v Shoptete. Neobsahuje ceny — tie
 * Shoptet eviduje cez priplatkove parametre — iba vyrobne specifikacie, ktore
 * sa z dynamickeho konfiguratora inak do administracie nedostanu.
 */
export function buildTruckOrderSummary(state, language = detectTruckSummaryLanguage()) {
  const s = state || {};
  const texts = SUMMARY_TEXTS[language] || SUMMARY_TEXTS.sk;
  const lines = [];
  const carpetMaterial = materialAndColor(s.selectedMaterial, s.selectedColor);
  const carpetEdging = selectedText(s.selectedLemovanie, true);
  const sideEmbroidery = hasSideEmbroidery(s.nasivkyPlacement);
  const centreEmbroidery = hasCentreEmbroidery(s.nasivkyPlacement);

  addGroup(lines, texts.headings.vehicle, (group) => {
    addLine(group, texts.labels.vehicle, [s.znacka, s.model].filter(Boolean).join(" "));
    Object.keys(texts.extras).forEach((key) => {
      addLine(group, texts.extras[key], s.extras && s.extras[key]);
    });
  });

  addGroup(lines, texts.headings.carpets, (group) => {
    addLine(group, texts.labels.materialColor, carpetMaterial);
    addLine(group, texts.labels.edgingColor, carpetEdging);
    addLine(group, texts.labels.embroideryPlacement, texts.placements[s.nasivkyPlacement]);
    addLine(group, texts.labels.centrePatchType, centreEmbroidery ? selectedText(s.selectedStredNasivka) : texts.noPatch);
    addLine(group, texts.labels.centrePatchColor, centreEmbroidery ? selectedText(s.selectedStredNitColor, true) : texts.noPatch);
    addLine(group, texts.labels.sidePatchType, sideEmbroidery ? selectedText(s.selectedNasivka) : texts.noPatch);
    addLine(group, texts.labels.sidePatchColor, sideEmbroidery ? selectedText(s.selectedNitColor, true) : texts.noPatch);
  });

  const wantsDoorPanels = s.doorPanelChoice === true || s.doorPanelChoice === "ano";
  if (wantsDoorPanels) {
    const wantsDoorPatch = s.doorWantsNasivka === true;
    const doorMaterial = materialAndColor(s.doorMaterial, s.doorColor);
    const doorMaterialValue = s.doorSameAsCarpet && s.doorSameAsCarpet.material
      ? `${texts.sameMaterial} – ${carpetMaterial}`
      : doorMaterial;
    const doorEdging = selectedText(s.doorLemovanie, true);
    const doorEdgingValue = s.doorSameAsCarpet && s.doorSameAsCarpet.lemovanie
      ? `${texts.sameEdging} – ${carpetEdging}`
      : doorEdging;
    const doorPatch = s.doorSameNasivkaAsCarpet
      ? `${texts.samePatch} – ${selectedText(s.doorNasivka)}`
      : selectedText(s.doorNasivka);
    const doorPatchColor = s.doorSameNitAsCarpet
      ? `${texts.samePatch} – ${selectedText(s.doorNitColor, true)}`
      : selectedText(s.doorNitColor, true);

    addGroup(lines, texts.headings.doors, (group) => {
      addLine(group, texts.labels.materialColor, doorMaterialValue);
      addLine(group, texts.labels.edgingColor, doorEdgingValue);
      addLine(group, texts.labels.doorPatches, wantsDoorPatch ? texts.yes : texts.no);
      if (wantsDoorPatch) {
        addLine(group, texts.labels.doorPatchType, doorPatch);
        addLine(group, texts.labels.doorPatchColor, doorPatchColor);
      }
    });
  }

  return lines.join("\n");
}

export function parseTruckOrderSummary(summary) {
  const groups = [];
  let current = null;

  String(summary || "").split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    if (!line.startsWith("- ")) {
      current = { heading: line, items: [] };
      groups.push(current);
      return;
    }
    if (!current) return;
    const item = line.slice(2);
    const separator = item.indexOf(":");
    if (separator < 0) return;
    current.items.push({
      label: item.slice(0, separator).trim(),
      value: item.slice(separator + 1).trim(),
    });
  });

  return groups.filter((group) => group.items.length);
}

export function persistTruckOrderSummary(state) {
  const summary = buildTruckOrderSummary(state, detectTruckSummaryLanguage());
  if (typeof sessionStorage !== "undefined" && summary) {
    sessionStorage.setItem("truckOrderSummary", summary);
  }
  return summary;
}

export function mergeTruckOrderSummaryIntoNote(currentNote, summary) {
  const texts = /^SPECIFIKACE VOZIDLA\b/m.test(String(summary || ""))
    ? SUMMARY_TEXTS.cs
    : SUMMARY_TEXTS.sk;
  const markerPairs = [
    [SUMMARY_TEXTS.sk.markerStart, SUMMARY_TEXTS.sk.markerEnd],
    [SUMMARY_TEXTS.cs.markerStart, SUMMARY_TEXTS.cs.markerEnd],
    ["[TRUCK CONFIGURATION]", "[/TRUCK CONFIGURATION]"],
    ["[TRUCK KONFIGURÁCIA]", "[/TRUCK KONFIGURÁCIA]"],
  ];
  const withoutOldSummary = markerPairs.reduce((note, [start, end]) => {
    const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return note.replace(new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, "g"), "");
  }, String(currentNote || "")).trim();

  if (!summary) return withoutOldSummary;
  const block = `${texts.markerStart}\n${summary}\n${texts.markerEnd}`;
  return withoutOldSummary ? `${withoutOldSummary}\n\n${block}` : block;
}
