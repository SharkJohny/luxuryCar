import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = dirname(fileURLToPath(import.meta.url));

const SELECTS_SK = `
  <select data-parameter-id="403" data-parameter-name="Nášivka boky">
    <option value=""></option><option value="no">Bez nášivky +€0</option><option value="h2">Nášivka H2 +€0</option>
  </select>
  <select data-parameter-id="409" data-parameter-name="Nášivka stred">
    <option value=""></option><option value="no">Bez nášivky +€0</option><option value="h3">Nášivka H3 +€0</option>
  </select>
  <select data-parameter-id="406" data-parameter-name="Niť boky">
    <option value=""></option><option value="no">Bez nite +€0</option><option value="2901">2901 – Strieborná +€0</option>
  </select>
  <select data-parameter-id="412" data-parameter-name="Niť stred">
    <option value=""></option><option value="no">Bez nite +€0</option><option value="2824">2824 – Červená +€0</option>
  </select>
  <select data-parameter-id="397" data-parameter-name="Nášivka dvere druh">
    <option value=""></option><option value="same">Rovnaká ako koberec +€0</option><option value="no">Bez nášivky +€0</option><option value="h4">Nášivka H4 +€0</option>
  </select>
  <select data-parameter-id="400" data-parameter-name="Niť dvere">
    <option value=""></option><option value="same">Rovnaká ako koberec +€0</option><option value="no">Bez nite +€0</option><option value="3842">3842 – Modrá +€0</option>
  </select>
`;

const SELECTS_CZ = `
  <select data-parameter-id="343" data-parameter-name="Nášivka boky">
    <option value=""></option><option value="no">Bez nášivky +0 Kč</option><option value="h2">Nášivka H2 +0 Kč</option>
  </select>
  <select data-parameter-id="349" data-parameter-name="Nášivka stred">
    <option value=""></option><option value="no">Bez nášivky +0 Kč</option><option value="h3">Nášivka H3 +0 Kč</option>
  </select>
  <select data-parameter-id="346" data-parameter-name="Niť boky">
    <option value=""></option><option value="no">Bez nitě +0 Kč</option><option value="2901">2901 – Stříbrná +0 Kč</option>
  </select>
  <select data-parameter-id="352" data-parameter-name="Niť stred">
    <option value=""></option><option value="no">Bez nitě +0 Kč</option><option value="2824">2824 – Červená +0 Kč</option>
  </select>
  <select data-parameter-id="337" data-parameter-name="Nášivka dveře druh">
    <option value=""></option><option value="same">Stejná jako koberec +0 Kč</option><option value="no">Bez nášivky +0 Kč</option><option value="h4">Nášivka H4 +0 Kč</option>
  </select>
  <select data-parameter-id="340" data-parameter-name="Niť dveře">
    <option value=""></option><option value="same">Stejná jako koberec +0 Kč</option><option value="no">Bez nitě +0 Kč</option><option value="3842">3842 – Modrá +0 Kč</option>
  </select>
  <select data-parameter-id="301" data-parameter-name="Čalounění">
    <option value=""></option><option value="no">Ne, nechci čalounění dveří +0 Kč</option><option value="yes">Ano, chci (v konfigurátoru – balíček) +0 Kč</option>
  </select>
  <select data-parameter-id="door-embroidery" data-parameter-name="Nášivka dveře">
    <option value=""></option><option value="no">Ne, nechci nášivku na dveřích +0 Kč</option><option value="yes">Ano, chci nášivku na dveřích +0 Kč</option>
  </select>
  <select data-parameter-id="door-material" data-parameter-name="Materiál dveře">
    <option value=""></option><option value="same">Stejný jako koberec +0 Kč</option><option value="custom">Vybere se v konfigurátoru +0 Kč</option>
  </select>
  <select data-parameter-id="door-color" data-parameter-name="Barva dveře">
    <option value=""></option><option value="same">Stejná jako koberec +0 Kč</option><option value="custom">Vybere se v konfigurátoru +0 Kč</option>
  </select>
  <select data-parameter-id="door-trim" data-parameter-name="Lemování dveře">
    <option value=""></option><option value="same">Stejné jako koberec +0 Kč</option><option value="custom">Vybere se v konfigurátoru +0 Kč</option>
  </select>
`;

function loadSync(sourceName) {
  const source = readFileSync(join(ROOT, sourceName), "utf8");
  const start = source.indexOf("function normalizeOptionText");
  const end = source.indexOf("function Configurator()");
  if (start < 0 || end < 0) {
    throw new Error(`${sourceName}: sync helpery sa nepodarilo nájsť`);
  }
  return source.slice(start, end);
}

function syncValues(helperSource, state, selects = SELECTS_SK, url = "https://www.luxurycardesign.sk/luxusne-autokoberce-truck/") {
  const dom = new JSDOM(`<body>${selects}</body>`, {
    url,
  });
  const sync = new Function(
    "document",
    "Event",
    "sessionStorage",
    `${helperSource}; return syncToShoptet;`,
  )(dom.window.document, dom.window.Event, dom.window.sessionStorage);

  sync(state);
  return Object.fromEntries(
    Array.from(dom.window.document.querySelectorAll("select")).map((select) => [
      select.dataset.parameterName,
      select.selectedOptions[0]?.textContent.trim() || "",
    ]),
  );
}

function expectStartsWith(values, name, prefix, sourceName) {
  if (!values[name]?.startsWith(prefix)) {
    throw new Error(`${sourceName}: ${name} = "${values[name]}", očakávané "${prefix}…"`);
  }
}

const manualState = {
  znacka: "Scania (TIR)",
  model: "R 2016-2023",
  extras: {},
  nasivkyPlacement: "boky+stred",
  selectedNasivka: { code: "H2" },
  selectedNitColor: { code: "2901" },
  selectedStredNasivka: { code: "H3" },
  selectedStredNitColor: { code: "2824" },
  doorPanelChoice: "ano",
  doorWantsNasivka: true,
  doorNasivka: { code: "H4" },
  doorNitColor: { code: "3842" },
  doorSameNasivkaAsCarpet: false,
  doorSameNitAsCarpet: false,
  doorSameAsCarpet: { material: false, lemovanie: false },
  doorMaterial: "Kůže",
  doorColor: { code: "D-17" },
  doorLemovanie: { code: "L-1" },
};

for (const sourceName of ["konfigurator.jsx", "konfigurator.phone.jsx"]) {
  const helperSource = loadSync(sourceName);
  const manual = syncValues(helperSource, manualState);

  expectStartsWith(manual, "Nášivka boky", "Nášivka H2", sourceName);
  expectStartsWith(manual, "Niť boky", "2901", sourceName);
  expectStartsWith(manual, "Nášivka stred", "Nášivka H3", sourceName);
  expectStartsWith(manual, "Niť stred", "2824", sourceName);
  expectStartsWith(manual, "Nášivka dvere druh", "Nášivka H4", sourceName);
  expectStartsWith(manual, "Niť dvere", "3842", sourceName);

  const none = syncValues(helperSource, {
    ...manualState,
    nasivkyPlacement: "nechcem",
    selectedNasivka: null,
    selectedNitColor: null,
    selectedStredNasivka: null,
    selectedStredNitColor: null,
    doorPanelChoice: "nie",
    doorWantsNasivka: null,
    doorNasivka: null,
    doorNitColor: null,
  });

  for (const name of ["Nášivka boky", "Nášivka stred", "Nášivka dvere druh"]) {
    expectStartsWith(none, name, "Bez nášivky", sourceName);
  }
  for (const name of ["Niť boky", "Niť stred", "Niť dvere"]) {
    expectStartsWith(none, name, "Bez nite", sourceName);
  }

  const manualCz = syncValues(
    helperSource,
    manualState,
    SELECTS_CZ,
    "https://www.luxurycardesign.cz/luxusni-autokoberce-truck/",
  );
  expectStartsWith(manualCz, "Nášivka boky", "Nášivka H2", sourceName);
  expectStartsWith(manualCz, "Niť boky", "2901", sourceName);
  expectStartsWith(manualCz, "Nášivka stred", "Nášivka H3", sourceName);
  expectStartsWith(manualCz, "Niť stred", "2824", sourceName);
  expectStartsWith(manualCz, "Čalounění", "Ano, chci", sourceName);
  expectStartsWith(manualCz, "Nášivka dveře", "Ano, chci", sourceName);
  expectStartsWith(manualCz, "Materiál dveře", "Vybere se", sourceName);
  expectStartsWith(manualCz, "Barva dveře", "Vybere se", sourceName);
  expectStartsWith(manualCz, "Lemování dveře", "Vybere se", sourceName);
  expectStartsWith(manualCz, "Nášivka dveře druh", "Nášivka H4", sourceName);
  expectStartsWith(manualCz, "Niť dveře", "3842", sourceName);

  const sameCz = syncValues(
    helperSource,
    {
      ...manualState,
      doorSameAsCarpet: { material: true, lemovanie: true },
      doorSameNasivkaAsCarpet: true,
      doorSameNitAsCarpet: true,
    },
    SELECTS_CZ,
    "https://www.luxurycardesign.cz/luxusni-autokoberce-truck/",
  );
  expectStartsWith(sameCz, "Materiál dveře", "Stejný jako koberec", sourceName);
  expectStartsWith(sameCz, "Barva dveře", "Stejná jako koberec", sourceName);
  expectStartsWith(sameCz, "Lemování dveře", "Stejné jako koberec", sourceName);
  expectStartsWith(sameCz, "Nášivka dveře druh", "Stejná jako koberec", sourceName);
  expectStartsWith(sameCz, "Niť dveře", "Stejná jako koberec", sourceName);

  console.log(`✓ ${sourceName}: slovenské i české příplatkové parametry se synchronizují`);
}
