import { optionData } from "../option.js";
let setupData;
$.getJSON(optionData.downloadData, function (data) {
  setupData = data;
});

/**
 * Initializes the product page.
 */
export function initProduct() {
  if ($(".id-751")[0]) {
    $(".benefitBanner__item").remove();
  }
  $(".p-detail-inner .p-detail-info").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".p-detail-inner .p-detail-inner-header").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".benefitBanner.position--benefitProduct .benefitBanner__item").insertBefore(".col-xs-12.col-lg-6.p-info-wrapper");
  const model = sessionStorage.getItem("model");

  priplatky();

  $(".button.btn.select-model").on("click", function () {
    const overflow = $("<div>", {
      class: "overflow",
      style:
        "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;",
    }).appendTo("body");

    const popup = $("<div>", {
      class: "model-select",
      style: "position: relative; background-color: #fff; padding: 20px;",
    }).appendTo(overflow);

    $("<div>", {
      class: "h3",
      text: "Vyberte model",
    }).appendTo(popup);
    initModelSelect();
  });

  $("select.parameter-id-38.surcharge-parameter").val("248").trigger("change");
  const buttons = $("button.timeline__nav-item");
  const prevButton = $('button[is="prev-button"]');
  const nextButton = $('button[is="next-button"]');
  let currentIndex = 0;

  buttons.on("click", function () {
    const index = $(this).index();
    buttons.removeClass("active");
    $(this).addClass("active");

    $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
    $(`.timeline__slide:eq(${index})`)
      .addClass("is-selected")
      .removeClass("reveal-invisible")
      .attr("style", "opacity: 1; visibility: visible; z-index: 1;");

    currentIndex = index;
    console.log(`Kliknul jsi na tlačítko s indexem: ${index}`);
  });

  prevButton.on("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      buttons.removeClass("active");
      buttons.eq(currentIndex).addClass("active");

      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(`.timeline__slide:eq(${currentIndex})`)
        .addClass("is-selected")
        .removeClass("reveal-invisible")
        .attr("style", "opacity: 1; visibility: visible; z-index: 1;");

      console.log(`Posunul jsi zpět na index: ${currentIndex}`);
    }
  });

  nextButton.on("click", function () {
    if (currentIndex < buttons.length - 1) {
      currentIndex++;
      buttons.removeClass("active");
      buttons.eq(currentIndex).addClass("active");

      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(`.timeline__slide:eq(${currentIndex})`)
        .addClass("is-selected")
        .removeClass("reveal-invisible")
        .attr("style", "opacity: 1; visibility: visible; z-index: 1;");

      console.log(`Posunul jsi dopředu na index: ${currentIndex}`);
    }
  });

  const wrap = $("<div>", {
    class: "thumbnails-wrap",
  }).appendTo(".col-xs-12.col-lg-6.p-image-wrapper");
  $(".p-thumbnails-inner>div>a").each(function (n) {
    if (n % 2 !== 0 || n > 15) return;
    console.log(n);
    const src = $(this).attr("href");
    const image = $("<a>", {
      class: "thumbnail-image p-main-image cloud-zoom",
      href: src,
    }).appendTo(wrap);
    $("<img>", {
      src,
    }).appendTo(image);
  });
}

/**
 * Initializes the upsale section.
 */
function priplatky() {
  if ($(".type-detail").length) {
    $("<div>", {
      class: "upsale-wrap",
    }).insertAfter(".detail-parameters");
    const upsaleBanner = $("<div>", {
      class: "upsale-Banner",
    }).insertAfter(".detail-parameters");

    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/base-p.jpg",
      "autokoberce do kufra KLASIK",
      upsaleBanner,
      "20-41",
      "radio"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/full-p.jpg",
      "LUXUSNÉ BOXY DO KUFRU NA MIERU",
      upsaleBanner,
      "20-296",
      "radio"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/boxy.jpg",
      "LUXUSNÉ BOXY DO KUFRU NA MIERU",
      upsaleBanner,
      "conf",
      "config"
    );
    $("<div>", { class: "content-wrap" }).insertAfter(".detail-parameters");

    $("button.btn.btn-lg.btn-conversion.add-to-cart-button").addClass("upsale");
    $(".add-to-cart").on("click", "button.btn.btn-lg.btn-conversion.add-to-cart-button.upsale", function (e) {
      e.stopPropagation();
      e.preventDefault();
      createUpsalePopup();
    });

    firstPage();

    const pairVariantList = JSON.parse(setupData.settings.pairVariantList);
    const pairedOrders = {};
    let orders = 0;

    createBoxConfig();

    $(".detail-parameters .variant-list select").each(function () {
      orders += 1;
      const position = this;
      createOptions(position, orders);
    });
    $(".detail-parameters .surcharge-list select").each(function () {
      const id = $(this).attr("data-parameter-id");

      if (id == "37" || id == "22" || id == "20") return;

      let sharedOrder = null;
      pairVariantList.forEach((pair) => {
        if (pair.includes(parseInt(id))) {
          sharedOrder = pair;
        }
      });

      if (sharedOrder) {
        if (pairedOrders[sharedOrder]) {
          orders = pairedOrders[sharedOrder];
        } else {
          orders += 1;
          pairedOrders[sharedOrder] = orders;
        }
      } else {
        orders += 1;
      }

      console.log(id);
      const position = this;
      createOptions(position, orders);
      console.log(pairVariantList);
    });

    $(".button.option-button").on("click", function () {
      $(this).parents(".parameter-wrap").removeClass("goToAction");
      $("body").removeClass("disabled-add-to-cart");
      const value = $(this).attr("data-value");
      const variant = $(this).attr("data-variant");
      $(this).addClass("active").siblings().removeClass("active");
      const parameterId = $(this).parents(".parameter-wrap").attr("data-parameterid");
      const image = $(this).find("img").attr("src");
      $(".navigatte-button.parameterNav" + parameterId).attr("style", " background-image: url(" + image + ");");
      console.log(parameterId);
      $(".parameter-id-" + variant).val(value);
      shoptet.surcharges.updatePrices();
      if (variant == 4) {
        const image2 = $(this).find("img").attr("src");
        console.log(image2);
        $(".image-wrap").remove();
        const imageWrap = $("<div>", {
          class: "image-wrap",
        }).appendTo(".parameter-wrap.parameter-4.orders-1");
        $("<img>", { src: image2 }).appendTo(imageWrap);
      }
      if (!$(".goToAction")[0]) {
        console.log("goToAction");
        $(".upsale-wrap").addClass("active");
      }
    });

    if ($("html[lang='cs']").length) {
      $(".p-variants-block .surcharge-list:contains('Velikost boxu') option[data-index='0']").text("Zvolte velikost boxu");
      $(".p-variants-block .surcharge-list:contains('Rozměr 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Rozměr boxu') option[data-index='0']").text("Zvolte velikost boxu");
      $(".p-variants-block .surcharge-list:contains('Velikost 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Barva boxu') option[data-index='0']").text("Zvolte barvu boxu");
      $(".p-variants-block .surcharge-list:contains('Barva 2. boxu') option[data-index='0']").text("Zvolte barvu 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Umístění volantu') option[data-index='0']").text("Prosím, vyberte umístění volantu");
    }
    if ($("html[lang='sk']").length) {
      $(".p-variants-block .surcharge-list:contains('Veľkosť boxu') option[data-index='0']").text("Zvoľte veľkosť boxu");
      $(".p-variants-block .surcharge-list:contains('Rozmer 2. Boxu') option[data-index='0']").text("Zvoľte veľkosť 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Rozmer boxu') option[data-index='0']").text("Zvoľte veľkosť boxu");
      $(".p-variants-block .surcharge-list:contains('Veľkosť 2. Boxu') option[data-index='0']").text("Zvoľte veľkosť 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Farba boxu') option[data-index='0']").text("Zvoľte farbu boxu");
      $(".p-variants-block .surcharge-list:contains('Farba 2. boxu') option[data-index='0']").text("Zvoľte farbu 2.boxu");

      $(".p-variants-block .surcharge-list:contains('Umiestenie volantu') option[data-index='0']").text("Prosím,vyberte umiestnenie volantu");
    }

    $(".navigatte-button").on("click", function () {
      const option = $(this).attr("data-option").split("-");
      const optionName = option[1];
      $(".parameter-wrap").removeClass("active");
      $(`.parameter-wrap:eq(${optionName})`).addClass("active");
      $(".navigatte-button").removeClass("active");
      $(`.navigatte-button:eq(${optionName})`).addClass("active");
    });
  }
}

/**
 * Creates an upsale button with an image and text, and appends it to the specified position.
 *
 * @param {string} img - The URL of the image to be displayed on the button.
 * @param {string} text - The text to be displayed on the button.
 * @param {jQuery|HTMLElement} position - The element where the button will be appended.
 * @param {number} [value] - Optional value attribute for the button.
 */
function createUpsaleButton(img, text, position, value, type) {
  if (!img || !text || !position) {
    console.error("Invalid parameters passed to createUpsaleButton");
    return;
  }

  const buttonHTML = `
    <div class="upsale-button ${type}" value="${value}">
      <img src="${img}" alt="${text}" />
      <div class="text">${text}</div>
    </div>
  `;

  //   $(position).append(buttonHTML);
  const button = $(buttonHTML).appendTo(position);
}

$(document).on("click", ".upsale-button", function () {
  const value = $(this).attr("value")?.split("-");

  if (!value) {
    console.error("Atribut 'value' není dostupný!");
    return;
  }

  if ($(this).hasClass("active")) {
    $(this).removeClass("active");
    $("select.surcharge-parameter.parameter-id-" + value[0]).val(0);
  } else {
    if ($(this).hasClass("radio")) {
      // Ujistěte se, že všechny radio tlačítka deaktivujete
      $(".upsale-button.radio").removeClass("active");
    }
    $(this).addClass("active");
    $("select.surcharge-parameter.parameter-id-" + value[0]).val(value[1]);
  }

  if ($(this).hasClass("config")) {
    $(this).parents(".upsale-Banner").addClass("showConf");
  }
  // Zpoždění pro aktualizaci cen
  setTimeout(() => {
    if (typeof shoptet !== "undefined" && shoptet.surcharges?.updatePrices) {
      shoptet.surcharges.updatePrices();
    } else {
      console.warn("Funkce `shoptet.surcharges.updatePrices` není dostupná.");
    }
  }, 100);
});

$(document).on("click", ".box-config .close-btn", function () {
  $(this).parents(".upsale-Banner").removeClass("showConf");
});

/**
 * Initializes the first page of the upsale section.
 */
function firstPage() {
  const wrap = $("<div>", {
    class: "navigatte-button class first",
    "data-option": "option-0",
  }).appendTo(".navidation-Wrap");

  const wheelval = $("select.parameter-id-37.surcharge-parameter").val();
  let typeVal = $("select.parameter-id-22.surcharge-parameter").val();

  if (wheelval == "") {
    $("select.parameter-id-37.surcharge-parameter").val(250);
  }
  if (typeVal == "") {
    const getModel = sessionStorage.getItem("carType");
    console.log(getModel);

    const value = $("select.parameter-id-22.surcharge-parameter option")
      .filter(function () {
        return $(this).text().indexOf(getModel) !== -1;
      })
      .val();

    console.log(value);

    $("select.parameter-id-22.surcharge-parameter").val(value);
    typeVal = value;
  }
  const pageWrap = $("<div>", {
    class: "position-wrap parameter-cars active",
  }).appendTo(".content-wrap");

  const wheelWrao = $("<div>", {
    class: "parameter-cars wheel-Position",
  }).appendTo(pageWrap);
  $("<div>", {
    class: "label wheel",
    text: "Pozice volantu",
  }).appendTo(wheelWrao);

  $(`<div class="can-toggle demo-rebrand-1 wheel-option ">
  <input id="d" type="checkbox" control-id="ControlID-4">
  <label for="d">
    <div class="can-toggle__switch" data-checked="Pravá" data-unchecked="Levá"></div>
    <div class="can-toggle__label-text"></div>
  </label>
</div>`).appendTo(wheelWrao);

  $(".can-toggle.wheel-option").on("click", function () {
    if ($(this).find("input").is(":checked")) {
      $("select.parameter-id-37.surcharge-parameter").val(253);
    }
  });

  $(".type-option.button").on("click", function () {
    $(this).addClass("active").siblings().removeClass("active");
    const value = $(this).attr("data-value");
    $("select.parameter-id-22.surcharge-parameter").val(value);
  });
}

/**
 * Creates options for a given position and order.
 *
 * @param {HTMLElement} position - The position element.
 * @param {number} orders - The order number.
 */
function createOptions(position, orders) {
  console.log(position);
  let name = $(position).parents(".variant-list").find("th").text().trim();
  if (name == "") {
    name = $(position).parents(".surcharge-list").find("th").text().trim().replace("?", "");
  }

  const createSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };
  let slug = createSlug(name);

  const options = $(position).find("option");
  const parameterId = $(position).attr("data-parameter-id");
  let optPosition = ".content-wrap";

  if (orders == 4) {
    const wrapOwerflow = $("<div>", {
      class: "pop-ower",
    }).appendTo("#options-wrap ");
    const popup = $("<div>", {
      class: "pop-up-options",
    }).appendTo(wrapOwerflow);
    $("<div>", {
      class: "close-btn",
      text: "+",
    }).appendTo(popup);
    $("<div>", {
      class: "btn button-more",
      text: "Něco navíc?",
    }).appendTo("#options-wrap");
  }

  let upsale = 1;
  if (shoptetData.product.id == 347) {
    $(".benefitBanner__content").hide();
    upsale = 2;
  }
  if (orders > upsale) {
    optPosition = ".config-wrap";
  }
  if (orders <= upsale) {
    $("<div>", {
      class: `navigatte-button class${orders} ${slug} parameterNav${parameterId}`,
      "data-option": `option-${orders}`,
    }).appendTo(".navidation-Wrap");
  }

  $(".btn.button-more").on("click", function () {
    $(".pop-ower").addClass("show");
  });
  $(".close-btn").on("click", function () {
    $(".pop-ower").removeClass("show");
  });

  if (!$(`.orders-${orders}`)[0]) {
    const wrap = $("<div>", {
      class: `parameter-wrap parameter-${parameterId} orders-${orders}`,
      "data-parameterId": parameterId,
    }).appendTo(optPosition);
    if (orders <= upsale) {
      $(wrap).addClass("goToAction");
    }
    $("<div>", {
      class: "order",
      text: orders,
    }).appendTo(`.parameter-wrap.orders-${orders}`);
  }

  $(".navigatte-button:eq(0)").addClass("active");
  const paramerer = `.parameter-wrap.orders-${orders}`;

  $("<h5>", {
    class: "variant name",
    text: name,
  }).appendTo(paramerer);
  const optionsWrap = $("<div>", {
    class: "options-wrap",
  }).appendTo(paramerer);

  $(options).each(function () {
    const value = $(this).val();
    if (value == "") return;
    const textOption = $(this).text();
    const optionButton = $("<div>", {
      class: "button option-button",
      "data-value": value,
      "data-variant": parameterId,
    }).appendTo(optionsWrap);
    $("<div>", {
      text: textOption,
      class: "text",
    }).appendTo(optionButton);
    $("<img>", {
      alt: `${parameterId}-${value}.jpg`,
      src: `/user/documents/upload/assets/variants/${parameterId}-${value}.jpg?7`,
    }).appendTo(optionButton);
  });
}

function createBoxConfig() {
  const wrap = $("<div>", {
    class: "box-config",
  }).appendTo(".upsale-Banner");

  $("<div>", {
    class: "label",
    text: "Konfigurace boxu",
  }).appendTo(wrap);

  $("<div>", {
    class: "close-btn",
    text: "-",
  }).appendTo(wrap);

  const configWrap = $("<div>", {
    class: "config-wrap",
  }).appendTo(wrap);
}
