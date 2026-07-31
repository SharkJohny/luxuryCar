import assert from "node:assert/strict";
import { buildTruckOrderSummary, mergeTruckOrderSummaryIntoNote } from "./order-summary.mjs";

const summary = buildTruckOrderSummary({
  znacka: "DAF (TIR)",
  model: "XF 2022-2025",
  extras: {
    prevodovka: "Automatická prevodovka",
    sedadlo: "Sedadlo spolujazdca CINEMA",
  },
  selectedMaterial: "Prémiová syntetická koža – prešívaná",
  selectedColor: { code: "K2" },
  selectedLemovanie: { code: "L3", name: "Červené lemovanie" },
  nasivkyPlacement: "boky+stred",
  selectedNasivka: { code: "H1" },
  selectedNitColor: { code: "N2", name: "Červená" },
  selectedStredNasivka: { code: "H4" },
  selectedStredNitColor: { code: "N1", name: "Čierna" },
  doorPanelChoice: "ano",
  doorMaterial: "Mikrosemiš – jednofarebný",
  doorColor: { code: "A4" },
  doorLemovanie: { code: "L3", name: "Červené lemovanie" },
  doorWantsNasivka: true,
  doorNasivka: { code: "H1" },
  doorNitColor: { code: "N2", name: "Červená" },
});

[
  "Vehicle: DAF (TIR) XF 2022-2025",
  "Transmission: Automatická prevodovka",
  "Carpet colour: K2",
  "Driver + passenger embroidery code: H1",
  "Centre embroidery code: H4",
  "Door upholstery: Yes",
  "Door upholstery colour: A4",
  "Door embroidery code: H1",
].forEach((line) => assert.ok(summary.includes(line), `Chýba riadok: ${line}`));

assert.ok(!summary.includes("undefined"));
assert.ok(!summary.includes("[object Object]"));

const once = mergeTruckOrderSummaryIntoNote("Prosím zavolať pred doručením.", summary);
const twice = mergeTruckOrderSummaryIntoNote(once, summary);
assert.equal(twice, once, "automatický blok sa pri opakovanom odoslaní nesmie duplikovať");
assert.ok(twice.startsWith("Prosím zavolať pred doručením."), "ručná poznámka zákazníka sa musí zachovať");
assert.equal((twice.match(/\[TRUCK CONFIGURATION\]/g) || []).length, 1);

console.log("✓ súhrn truck konfigurácie obsahuje všetky výrobné voľby");
