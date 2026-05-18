import { showUpsalePopup } from "../components/UpsalePopup.js";

export function validation(texts) {
  $("button.btn.btn-lg.btn-conversion.add-to-cart-button").on("click", function (e) {
    // Klient: „byly tam validace na všechno, nemůže se přidat do košíku
    // produkt který není nakonfigurovaný". Predtým bolo všetko
    // (preventDefault a stopPropagation) zakomentované – Shoptet form
    // sa odoslal bez ohľadu na chýbajúce výbery. Teraz blokujeme.
    if (!validateProductConfig()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    errorToCart(e, texts);
    // Find highest errorToCart element and scroll to it
    const $errorElements = $(".errorToCart");
    if ($errorElements.length) {
      $errorElements.toArray().reduce((prev, curr) => {
        return $(prev).offset().top < $(curr).offset().top ? prev : curr;
      });
    }
  });

  $(document).on("click", ".close-btn.return", function () {
    if (!optionTest()) return;
    $(this).parents(".upsale-Banner").removeClass("showConf");
  });

  // V5 PATTERN: AUTO-CLEAR — keď user vyplní wrap ktorý mal error, zmaž
  // jeho .errorToCart class hneď (bez kliku na "do košíka" znova).
  // Bind sa raz, aplikuje na všetky budúce zmeny v configurator-e.
  $(document).on("click", ".errorToCart .option-button, .errorToCart .upsale-button, .errorToCart .button.option-button", function () {
    const $w = $(this).closest(".errorToCart");
    $w.removeClass("errorToCart");
    // V5: po vyplneni wrapu spusti revalidate ktora oznaci a otvori dalsiu
    // chybu (sekvencny walkthrough). Delay 300ms aby Shoptet stihol update
    // active state.
    setTimeout(function () {
      if (typeof window.lcdRevalidate === "function") window.lcdRevalidate();
    }, 300);
  });
  $(document).on("change", ".errorToCart select.surcharge-parameter, .errorToCart input[type='radio'], .errorToCart input[type='checkbox']", function () {
    const $w = $(this).closest(".errorToCart");
    const v = $(this).val();
    if (v && v !== "0" && v !== "") {
      $w.removeClass("errorToCart");
      setTimeout(function () {
        if (typeof window.lcdRevalidate === "function") window.lcdRevalidate();
      }, 300);
    }
  });

  // V5: pri zmene auto selectu (znacka/model/rok/typ) revaliduj — ak chyba
  // K1 ako $first, oznaci ho a pri auto-clear sa otvori dalsia chyba.
  $(document).on("change", "#model-selector select", function () {
    setTimeout(function () {
      // iba ak nejaka .errorToCart existuje aktualne
      if ($(".errorToCart").length && typeof window.lcdRevalidate === "function") {
        window.lcdRevalidate();
      }
    }, 500);
  });

  $(".content-wrap").on("click", function (event) {
    if ($(event.target).closest(".modl-selector-wrap").length) {
      return;
    }
    const model = sessionStorage.getItem("model");
    console.log(model);
    if (
      !model ||
      (model && (model.includes("Zna\u010Dka") || model.trim() === "Model" || model.includes("Rok v\xFDroby") || model.includes("Typ auta")))
    ) {
      const name = $("h1").text();
      if (name.includes("box") || name.includes("Boxy")) {
        return;
      }
      console.log("click neeeeniiii");
      createpopup(texts);
      setTimeout(() => {
        $(event.target).closest(".button.option-button").removeClass("active");
      }, 1e3);
      $(".image-wrap").remove();
    }
  });
}

/**
 * Komplexná pre-cart validácia. Vracia `true` ak sa môže pokračovať
 * do košíka, `false` ak chýba výber – v tom prípade označí chýbajúce
 * sekcie `.errorToCart`, otvorí prípadne zatvorený `.upsale-Banner`,
 * zoskrolnie na prvú chybu a po 2.5 s zhodí červené borders.
 *
 * Klient: „byly tam validace na všechno, nemůže se přidat do košíku
 * produkt který není nakonfigurovaný do piče". Vrátené naspäť.
 */
function validateProductConfig() {
  const $errors = $();
  let $first = null;
  const isBoxConfigSelected = $(".upsale-buttons.boxs .upsale-button.active.config").not(".none").length > 0;

  // V5 SINGLE-ERROR mode: iba prvy chronologicky chybny wrap dostane .errorToCart.
  // Klient: "len mi ich zvýrazní červeným ale neotvorí ich chronologicky jedn
  // po druhom" — chce sekvenčný walkthrough.
  // Najprv vycisti vsetky stare errorToCart (z predoshlej validacie).
  $(".errorToCart").removeClass("errorToCart");

  function add($el) {
    if (!$el || !$el.length) return;
    if ($first) return; // V5: iba prvy error, ostatne ignoruj
    $el.addClass("errorToCart");
    $errors.push.apply($errors, $el.toArray());
    $first = $el;
  }

  // 0) K1 SPECIFIKACE VOZIDLA — značka/model/rok/typ auta.
  //    Klient: na Elite Diamond Line (kampaňová URL) "Pridať do košíka" bez
  //    výberu auta nevolalo validáciu — K1 parameter-cars wrap nemá option-button
  //    ani upsale-button, len Shoptet selecty. Cielime cez sessionStorage 'model'.
  const productName = ($("h1").text() || "").toLowerCase();
  const isBoxProduct = productName.includes("box") || productName.includes("boxy");
  if (!isBoxProduct) {
    const _model = sessionStorage.getItem("model") || "";
    const isModelMissing = !_model ||
      _model.includes("Zna\u010dka null") ||
      _model.includes("Rok v\u00fdroby") ||
      _model.includes("Typ auta") ||
      _model.trim() === "Model" ||
      /^zna\u010dka\s*null/i.test(_model.trim());
    if (isModelMissing) {
      const $k1 = $(".position-wrap.parameter-cars.base-config, .position-wrap.parameter-cars.parameter-wrap").filter(":visible").first();
      if ($k1.length) add($k1);
    }
  }

  // 1) Všetky viditeľné `.parameter-wrap` – akordeon kroky aj box-config
  //    musia mať aktívny výber, ak obsahujú selectable element.
  $(".parameter-wrap:visible").each(function () {
    const $wrap = $(this);
    if ($wrap.hasClass("boxs")) return;
    if ($wrap.hasClass("trunk")) return;
    if ($wrap.closest(".box-config").length && !isBoxConfigSelected) return;
    if (!isWrapValid($wrap)) add($wrap);
  });

  // 1.5) Surcharge selecty mimo `.parameter-wrap` (napr. `<tr class="surcharge-list">`
  //      na klasickom Shoptet detaile typu "Dragonskin Diamond Line"). Bez tohto
  //      kroku validácia nezachytí prázdne TYP / rozloženie / autokoberce do kufru
  //      a submit prejde s chýbajúcimi príplatkami.
  //
  //      DÔLEŽITÉ: validujeme len `required` selecty. Voliteľné príplatky
  //      (boxy, farba boxov, veľkosti boxov) zákazník vyberať NEMUSÍ — ak
  //      nechce boxy, validácia ho nesmie blokovať.
  $("select.surcharge-parameter[required]:visible").each(function () {
    const $sel = $(this);
    if ($sel.closest(".parameter-wrap").length) return; // už pokryté bodom 1
    const val = $sel.val();
    if (!val || val === "0") {
      const $row = $sel.closest("tr.surcharge-list, .surcharge-list, .variant-list").first();
      add($row.length ? $row : $sel.parent());
    }
  });

  // 2) Skupiny upsale tlačítok (carpets, boxes, atď.) – každá viditeľná
  //    `.upsale-buttons` musí mať aspoň jednu `.upsale-button.active`
  //    (mimo voľby „Nechcem"/none, ktorá je `.none`).
  $(".upsale-buttons:visible").each(function () {
    const $group = $(this);
    if (!$group.find(".upsale-button").length) return;
    if ($group.hasClass("boxs")) return;
    if ($group.hasClass("trunk")) return;
    if (!$group.find(".upsale-button.active").not(".none").length) {
      add($group);
    }
  });

  // 3) Aktivuj zatvorené nadradené paneli, aby user videl chybu.
  if ($first) {
    const $banner = $first.closest(".upsale-Banner");
    if ($banner.length && !$banner.hasClass("showConf")) {
      $banner.addClass("showConf");
    }
    const $boxConfig = $first.closest(".box-config");
    if ($boxConfig.length && $boxConfig.css("display") === "none") {
      $boxConfig.css("display", "");
    }

    // 3b) Otvor prvy nevyplneny akordeon (position-wrap / parameter-wrap).
    // Klient: ked je akordeon zatvoreny a chyba mu vyber, user nevidi.
    // Pri validacii otvorime prvy nevalidny akordeon (chronologicky prvy).
    var $accordion = $first.closest(".content-wrap > .position-wrap, .content-wrap > .parameter-wrap").first();
    if (!$accordion.length) {
      $accordion = $first.closest(".position-wrap, .parameter-wrap").first();
    }
    if ($accordion.length && !$accordion.hasClass("active")) {
      $(".content-wrap > .position-wrap.active, .content-wrap > .parameter-wrap.active").each(function () {
        if (this !== $accordion[0] && !$(this).closest(".box-config").length) {
          $(this).removeClass("active");
        }
      });
      $accordion.addClass("active");
    }

    // 4) Scroll na prvú chybu — V5 pattern: čakaj 450ms aby akordeon stihol
    // expand-núť, **potom** skroluj. VYCENTRUJ element v strede viewportu na
    // výšku (kompatibilné s každým rozlíšením). Ak element vyšší než 80% viewportu,
    // scroll na vrch s 80px offsetom.
    setTimeout(function () {
      const $target = $first.is(":visible") ? $first : ($accordion && $accordion.length ? $accordion : $first);
      if (!$target || !$target.length) return;
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const wrapTop = $target.offset() ? $target.offset().top : 0;
      const wrapH = $target.outerHeight() || 0;
      let target;
      if (wrapH > viewportH * 0.8) {
        target = wrapTop - 80;
      } else {
        target = wrapTop - (viewportH - wrapH) / 2;
      }
      target = Math.max(0, target);
      $("html, body").stop(true).animate({ scrollTop: target }, 500);
    }, 450);

    // 5) Po 2.5 s zhoď červené orámovanie.
    setTimeout(function () {
      $(".errorToCart").removeClass("errorToCart");
    }, 2500);
  }

  return $first === null;
}

// V5 sekvencny walkthrough: expose validateProductConfig globalne aby ju
// auto-clear handler mohol zavolat (presunie sa do dalsej chyby).
if (typeof window !== "undefined") {
  window.lcdRevalidate = function () {
    try { return validateProductConfig(); } catch (e) { return null; }
  };
}

/**
 * Lokálne mirroruje `isWrapSelectionValid` z productPage.js (tam je
 * v closure a nedá sa importovať). Wrap je validný ak nemá selectable
 * element (info wrap), ALEBO ak má aspoň jeden aktívny.
 */
function isWrapValid($wrap) {
  if ($wrap.hasClass("boxs")) return true;
  if ($wrap.hasClass("trunk")) return true;
  if ($wrap.closest(".box-config").length && !$(".upsale-buttons.boxs .upsale-button.active.config").not(".none").length) return true;

  let hasSelectable = false;
  let valid = false;

  if ($wrap.find(".option-button").length) {
    hasSelectable = true;
    if ($wrap.find(".option-button.active").length) valid = true;
  }
  if ($wrap.find(".upsale-button").length) {
    hasSelectable = true;
    if ($wrap.find(".upsale-button.active").length) valid = true;
  }
  if ($wrap.find("select.surcharge-parameter").length) {
    hasSelectable = true;
    $wrap.find("select.surcharge-parameter").each(function () {
      const val = $(this).val();
      if (val && val !== "0" && val !== "" && val !== null) valid = true;
    });
  }
  if ($wrap.find("input[type='radio'], input[type='checkbox']").length) {
    hasSelectable = true;
    if ($wrap.find("input[type='radio']:checked, input[type='checkbox']:checked").length) {
      valid = true;
    }
  }

  return !hasSelectable || valid;
}

function upsaleValidation(e) {
  if (!$(".upsale-buttons")[0]) return;
  if (!$(".upsale-buttons .active")[1]) {
    e.preventDefault();
    e.stopPropagation();
    // Přidej errorToCart pouze na ty upsale-buttons, kde není žádné .active tlačítko
    $(".upsale-buttons").each(function () {
      if (!$(this).find(".active").length) {
        $(this).addClass("errorToCart").addClass("active");
        setTimeout(() => {
          $(this).removeClass("errorToCart");
        }, 2000);
      }
    });
  }
  if ($(".upsale-button.radio.active").not(".none")[0]) {
    window.allowDirectAddToCart = true;
  }
}
function popupValidation(e) {
  console.log("Popup validation triggered");

  console.log(window.allowDirectAddToCart);
  if (window.allowDirectAddToCart) {
    console.log("allowDirectAddToCart");
    // povolíme submit, resetujeme flag a dál nic neblokujeme
    window.allowDirectAddToCart = false;
    document.addEventListener("ShoptetCartUpdated", function () {
      //window.location.href = "/kosik/";
    });
    return;
  } else if (!$(".goToAction")[0]) {
    console.log("nenene");
    // showUpsalePopup();
    // e.stopPropagation();
    // e.preventDefault();
    return;
  } else {
    console.log("povolíme submit");
    document.addEventListener("ShoptetCartUpdated", function () {
      // window.location.href = "/kosik/";
    });
  }
}

function boxValidation(e) {
  const name = $("h1").text().trim();
  if (!name.toLowerCase().includes("box")) return;

  const visibleWraps = $(".parameter-wrap:visible");
  let allWrapsHaveActive = true;

  visibleWraps.each(function () {
    if (!$(this).find(".option-button.active").length) {
      allWrapsHaveActive = false;
      $(this).addClass("errorToCart");
      e.stopPropagation();
      e.preventDefault();
    }
  });

  if (!allWrapsHaveActive) {
    setTimeout(() => {
      $(".parameter-wrap").removeClass("errorToCart");
    }, 2000);

    return;
  }
}

function errorToCart(e, texts) {
  console.log("Error to cart initialized --------------");

  const header = $("h1").text();
  if (header.includes("box") || header.includes("Boxy")) {
    document.addEventListener("ShoptetCartUpdated", function () {
      console.log("Error to cart initialized xxxxxxxxxxxxxxxx");
      window.location.href = "/kosik/";
    });
    return;
  }
  // Inicializace při načtení DOMu

  if ($(".goToAction")[0]) {
    console.log("goToAction exists");
    $(".position-wrap").removeClass("active");
    $(".goToAction").addClass("errorToCart").addClass("active");

    setTimeout(() => {
      $(".goToAction").removeClass("errorToCart");
    }, 2000);
    // e.preventDefault();
    // e.stopPropagation();
    return;
  }
  if (!$(".upsale-buttons")[0]) {
    document.addEventListener("ShoptetCartUpdated", function () {
      // window.location.href = "/kosik/";
    });
    return;
  }
  if ($(".upsale-popup-active")[0]) {
    document.addEventListener("ShoptetCartUpdated", function () {
      window.location.href = "/kosik/";
    });
    return;
  }

  const length = $(".upsale-buttons .active").not(".none").length;
  console.log("Active upsale buttons:", length);
  if (length == 0) {
    // e.preventDefault();
    // e.stopPropagation();
    // $(".upsale-buttons").each(function () {
    //   if (!$(this).find(".active").length) {
    //     $(this).addClass("errorToCart");
    //     const $errorElement = $(".errorToCart:eq(0)");
    //     console.log($errorElement.length);
    //     if ($errorElement.length) {
    //       $("html, body").animate(
    //         {
    //           scrollTop: $errorElement.offset().top - 100,
    //         },
    //         500
    //       );
    //     }
    //     setTimeout(() => {
    //       $(this).removeClass("errorToCart");
    //     }, 2000);
    //   }
    // });
    // showUpsalePopup(texts);
  }
  document.addEventListener("ShoptetCartUpdated", function () {
    window.location.href = "/kosik/";
  });
  return;
}

function optionTest() {
  let allSelected = true;
  let firstErrorElement = null;

  $(".config-wrap .parameter-wrap:visible").each(function () {
    if (!$(this).find(".option-button.active").length) {
      $(this).addClass("errorToCart");
      if (!firstErrorElement) {
        firstErrorElement = $(this);
      }
      allSelected = false;
    }
  });

  // Klient: „posledný krok blbí — keď si nevyberie farbu, nevyroluje to tam
  // kde má na výber farby boxov". Označíme všetky chýbajúce naraz červeným
  // borderom (už urobené vyššie), zoskrolujeme k prvému, a po 2 s farbu
  // zhodíme aby user vedel skúsiť znova.
  if (!allSelected && firstErrorElement) {
    const $err = firstErrorElement;

    // Ak parent .box-config je zatvorený (display:none), otvoríme ho.
    const $boxConfig = $err.closest(".box-config");
    const $upsaleBanner = $err.closest(".upsale-Banner");
    if ($upsaleBanner.length && !$upsaleBanner.hasClass("showConf")) {
      $upsaleBanner.addClass("showConf");
    }
    if ($boxConfig.length && $boxConfig.css("display") === "none") {
      $boxConfig.css("display", "");
    }

    // Scroll na první chybějící (s 100px ofsetem od horního okraje viewportu)
    setTimeout(() => {
      const offsetTop = $err.offset() && $err.offset().top;
      if (offsetTop != null) {
        $("html, body").stop(true).animate({ scrollTop: Math.max(offsetTop - 100, 0) }, 400);
      }
    }, 50);

    setTimeout(() => {
      $(".config-wrap .parameter-wrap.errorToCart").removeClass("errorToCart");
    }, 2500);
  }

  return allSelected;
}
function createpopup(texts) {
  if ($(".overflow")[0]) return;
  const overflow = $("<div>", {
    class: "overflow",
    style: `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(3px);
    `,
  }).appendTo("body");

  const popup = $("<div>", {
    style: `
      background: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      max-width: 450px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      animation: fadeIn 0.3s ease-out;
    `,
  }).appendTo(overflow);

  $("<h3>", {
    text: texts.no_model_select,
    style: `
      margin-bottom: 30px;
      font-size: 22px;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
    `,
  }).appendTo(popup);

  $("<button>", {
    text: texts.i_understand,
    class: "btn",
    style: `
      padding: 12px 40px;
      font-size: 16px;
      border: none;
      border-radius: 6px;
      background: #c49b31;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
      font-weight: 500;
      &:hover {
        background: #c49b31;
      }
    `,
    click: function () {
      $(".overflow").remove();
      overflow.fadeOut(200, function () {
        $(this).remove();

        let scrollselector = ".col-xs-12.col-lg-6.p-info-wrapper";
        if ($("body").hasClass("mobile")) {
          scrollselector = ".p-thumbnails-wrapper";
        }
        // Zobrazit model selector bez scrollování
        $("#model-selector").fadeIn(200);
        $(".position-wrap.parameter-cars.parameter-wrap.base-config.active").removeClass("active");
        $(".position-wrap.parameter-cars.parameter-wrap.base-config:eq(1)").addClass("active");
      });
      $("#model-selector").addClass("errorToCart");
      // vzroluj o  100px nad nejvrchnější errorToCart

      setTimeout(() => {
        $("#model-selector").removeClass("errorToCart");
      }, 2000);
    },
  }).appendTo(popup);

  // Add animation keyframes
  $("<style>")
    .text(
      `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `,
    )
    .appendTo("head");
}
