/**
 * Entry point pro truck konfigurátor.
 *
 * Exportuje funkci `renderTruckConfigurator`, kterou `productPage.js`
 * volá po vložení mount elementu do `.p-info-wrapper` (jen na /test-truck/).
 * esbuild tenhle modul zabaluje přímo do hlavního bundlu `luxuryCar.js`
 * stejně jako jakýkoliv jiný importovaný soubor (productPage.js, header.js…).
 *
 * ErrorBoundary zabezpečuje, že prípadná runtime chyba v konfigurátore
 * nespôsobí bielu stránku – namiesto toho sa zobrazí fallback so správou
 * a debug info.
 */
import React from "react";
import { createRoot } from "react-dom/client";
// .gen.jsx = base64 obrázky vytiahnuté na Shoptet upload (truck/build-truck-images.mjs).
// Zdrojové konfigurator.jsx / konfigurator.phone.jsx (s base64) ostávajú kvôli
// čistému re-syncu z klienta; bundlujú sa LEN tieto ľahké .gen verzie.
import { Configurator as DesktopConfigurator } from "./konfigurator.gen.jsx";
import { Configurator as PhoneConfigurator } from "./konfigurator.phone.gen.jsx";

const MOUNTED_ATTR = "data-tk-mounted";

// Mobil dostáva PHONE verziu konfigurátora, desktop DESKTOP — rozhoduje šírka
// displeja pri mounte. Breakpoint 768 px (telefóny). Tablety a viac = desktop.
// (Mount-time rozhodnutie; pri zmene šírky po načítaní sa UI neprepína.)
const PHONE_MQ = "(max-width: 768px)";
function pickConfigurator() {
  try {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia(PHONE_MQ).matches) {
      return PhoneConfigurator;
    }
  } catch (e) {
    /* matchMedia nedostupné → desktop fallback */
  }
  return DesktopConfigurator;
}

class ConfiguratorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[truck-konfig] ErrorBoundary caught:", error, info);
    if (typeof window !== "undefined") {
      window.__truckKonfigError = { message: String(error), stack: error && error.stack, info };
    }
  }
  render() {
    if (this.state.error) {
      return React.createElement(
        "div",
        {
          style: {
            padding: 24,
            background: "#fff4f4",
            border: "2px solid #d32f2f",
            borderRadius: 10,
            color: "#333",
            fontFamily: "system-ui, sans-serif",
            maxWidth: 720,
            margin: "24px auto",
          },
        },
        React.createElement(
          "div",
          { style: { fontSize: 16, fontWeight: 700, color: "#d32f2f", marginBottom: 8 } },
          "Konfigurátor zlyhal pri renderovaní",
        ),
        React.createElement(
          "div",
          { style: { fontSize: 13, marginBottom: 8 } },
          "Pozrite sa do DevTools Console – podrobnosti sú tiež v ",
          React.createElement("code", null, "window.__truckKonfigError"),
          ".",
        ),
        React.createElement(
          "pre",
          {
            style: {
              background: "#fff",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              color: "#666",
              overflow: "auto",
              maxHeight: 240,
              whiteSpace: "pre-wrap",
            },
          },
          String((this.state.error && this.state.error.stack) || this.state.error),
        ),
      );
    }
    return this.props.children;
  }
}

export function renderTruckConfigurator(element) {
  if (!element) return false;
  if (element.getAttribute(MOUNTED_ATTR) === "1") return true;
  element.setAttribute(MOUNTED_ATTR, "1");
  const Picked = pickConfigurator();
  createRoot(element).render(
    React.createElement(
      ConfiguratorErrorBoundary,
      null,
      React.createElement(Picked),
    ),
  );
  return true;
}
