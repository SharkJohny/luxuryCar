// assets/js/option.js
var timestamp = Date.now();
var optionData = {
  key: "value",
  downloadData: "/user/documents/upload/data.json?" + timestamp
};

// assets/js/components/index.js
function intIndex() {
  setTimeout(function() {
  }, 4e3);
  $(".twentytwenty-container").twentytwenty({
    before_label: "P\u0159edt\xEDm",
    after_label: "Potom"
  });
  function animateCountUp(element, targetNumber, duration) {
    const $element = $(element);
    $({ count: 0 }).animate(
      { count: targetNumber },
      {
        duration,
        easing: "swing",
        step: function(now) {
          $element.text(Math.floor(now));
        },
        complete: function() {
          $element.text(targetNumber);
        }
      }
    );
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const $element = $(entry.target).find('span[style*="text-align: end"]');
        const targetNumber = parseFloat($element.text().replace(",", ""));
        console.log(targetNumber);
        if (targetNumber > 0) {
          console.log("assdsd");
          const duration = parseFloat($(entry.target).attr("count-up")) * 1e3;
          animateCountUp($element, targetNumber, duration);
          observer.unobserve(entry.target);
        }
      }
    });
  });
  $("[count-up]").each(function() {
    observer.observe(this);
  });
  $("collection-list.collection-list").slick({
    dots: true,
    centerMode: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 4e3,
    arrows: true,
    responsive: [
      {
        breakpoint: 1480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: true
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 770,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          autoplay: false
        }
      },
      {
        breakpoint: 350,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
  $("section.foto-slider").slick({
    dots: true,
    centerMode: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4e3,
    arrows: true
  });
  $("button.text-with-icon.group").on("click", function() {
    if (!$("button.text-with-icon.group.less")[0]) {
      $(".feature-chart__table-row[hidden]").removeAttr("hidden").addClass("addHidden");
      const less = $(this).attr("data-view-less");
      $(this).addClass("less");
      $(this).find("span.feature-chart__toggle-text.reversed-link").text(less);
    } else {
      const more = $(this).attr("data-view-more");
      $(".feature-chart__table-row.addHidden").attr("hidden", true).removeClass("addHidden");
      $(this).removeClass("less");
      $(this).find("span.feature-chart__toggle-text.reversed-link").text(more);
    }
  });
  $(".btn.more-pictures-button").on("click", function() {
    $(".more-pictures").toggleClass("slow");
    if (!$(".btn.more-pictures-button.less")[0]) {
      const less = $(this).attr("data-view-less");
      $(this).text(less);
      $(this).addClass("less");
    } else {
      const more = $(this).attr("data-view-more");
      $(this).text(more);
      $(this).removeClass("less");
    }
  });
  $("video").parent().click(function() {
    if ($(this).children("video").get(0).paused) {
      $(this).children("video").get(0).play();
      $(this).children("video").addClass("active");
      $(this).children(".playpause").fadeOut();
    } else {
      $(this).children("video").get(0).pause();
      $(this).children(".playpause").fadeIn();
      $(this).children("video").removeClass("active");
    }
  });
  $(".hotspot").on("click", function() {
    $(".tooltips").removeClass("show");
    $(this).find(".tooltips").addClass("show");
  });
  $(document).on("click", function(e) {
    const $target = $(e.target);
    if (!$target.closest(".hotspot").length && !$target.closest(".tooltips").length) {
      $(".tooltips").removeClass("show");
    }
  });
}

// assets/js/components/productPage.js
var setupData;
$.getJSON(optionData.downloadData, function(data) {
  setupData = data;
});
function initProduct() {
  if ($(".id-751")[0]) {
    $(".benefitBanner__item").remove();
  }
  $(".p-detail-inner .p-detail-info").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".p-detail-inner .p-detail-inner-header").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".benefitBanner.position--benefitProduct .benefitBanner__item").insertBefore(".col-xs-12.col-lg-6.p-info-wrapper");
  const model = sessionStorage.getItem("model");
  priplatky();
  $(".button.btn.select-model").on("click", function() {
    const overflow = $("<div>", {
      class: "overflow",
      style: "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;"
    }).appendTo("body");
    const popup = $("<div>", {
      class: "model-select",
      style: "position: relative; background-color: #fff; padding: 20px;"
    }).appendTo(overflow);
    $("<div>", {
      class: "h3",
      text: "Vyberte model"
    }).appendTo(popup);
    initModelSelect();
  });
  $("select.parameter-id-38.surcharge-parameter").val("248").trigger("change");
  const buttons = $("button.timeline__nav-item");
  const prevButton = $('button[is="prev-button"]');
  const nextButton = $('button[is="next-button"]');
  let currentIndex = 0;
  buttons.on("click", function() {
    const index = $(this).index();
    buttons.removeClass("active");
    $(this).addClass("active");
    $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
    $(`.timeline__slide:eq(${index})`).addClass("is-selected").removeClass("reveal-invisible").attr("style", "opacity: 1; visibility: visible; z-index: 1;");
    currentIndex = index;
    console.log(`Kliknul jsi na tla\u010D\xEDtko s indexem: ${index}`);
  });
  prevButton.on("click", function() {
    if (currentIndex > 0) {
      currentIndex--;
      buttons.removeClass("active");
      buttons.eq(currentIndex).addClass("active");
      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(`.timeline__slide:eq(${currentIndex})`).addClass("is-selected").removeClass("reveal-invisible").attr("style", "opacity: 1; visibility: visible; z-index: 1;");
      console.log(`Posunul jsi zp\u011Bt na index: ${currentIndex}`);
    }
  });
  nextButton.on("click", function() {
    if (currentIndex < buttons.length - 1) {
      currentIndex++;
      buttons.removeClass("active");
      buttons.eq(currentIndex).addClass("active");
      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(`.timeline__slide:eq(${currentIndex})`).addClass("is-selected").removeClass("reveal-invisible").attr("style", "opacity: 1; visibility: visible; z-index: 1;");
      console.log(`Posunul jsi dop\u0159edu na index: ${currentIndex}`);
    }
  });
  const wrap = $("<div>", {
    class: "thumbnails-wrap"
  }).appendTo(".col-xs-12.col-lg-6.p-image-wrapper");
  $(".p-thumbnails-inner>div>a").each(function(n) {
    if (n % 2 !== 0 || n > 15) return;
    console.log(n);
    const src = $(this).attr("href");
    const image = $("<a>", {
      class: "thumbnail-image p-main-image cloud-zoom",
      href: src
    }).appendTo(wrap);
    $("<img>", {
      src
    }).appendTo(image);
  });
}
function priplatky() {
  if ($(".type-detail").length) {
    $("<div>", {
      class: "upsale-wrap"
    }).insertAfter(".detail-parameters");
    const upsaleBanner = $("<div>", {
      class: "upsale-Banner"
    }).insertAfter(".detail-parameters");
    $(upsaleBanner).hide();
    condownMessage(upsaleBanner, 30, "Zv\xFDhodn\u011Bn\xE1 nab\xEDdka na p\u0159islu\u0161enstv\xED plat\xED je\u0161t\u011B: ");
    const buttonWrap = $("<div>", {
      class: "upsale-buttons trunk"
    }).appendTo(upsaleBanner);
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/base-p.jpg",
      "nechci nic",
      buttonWrap,
      "20-44",
      "radio"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/base-p.jpg",
      "autokoberce do kufra KLASIK",
      buttonWrap,
      "20-41",
      "radio"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/full-p.jpg",
      "LUXUSN\xC9 BOXY DO KUFRU NA MIERU",
      buttonWrap,
      "20-296",
      "radio"
    );
    const buttonWrapBox = $("<div>", {
      class: "upsale-buttons boxs"
    }).appendTo(upsaleBanner);
    $(buttonWrapBox).hide();
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/base-p.jpg",
      "Nechci box",
      buttonWrapBox,
      "0",
      "0"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/boxy.jpg",
      "LUXUSN\xC9 BOX DO KUFRU NA MIERU 1ks",
      buttonWrapBox,
      "conf1",
      "config"
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/boxy.jpg",
      "LUXUSN\xC9 BOXY DO KUFRU NA MIERU 2ks",
      buttonWrapBox,
      "conf2",
      "config"
    );
    $("<div>", { class: "content-wrap" }).insertAfter(".detail-parameters");
    $("button.btn.btn-lg.btn-conversion.add-to-cart-button").addClass("upsale");
    $(".add-to-cart").on("click", "button.btn.btn-lg.btn-conversion.add-to-cart-button.upsale", function(e) {
      e.stopPropagation();
      e.preventDefault();
      createUpsalePopup();
    });
    firstPage();
    const pairVariantList = JSON.parse(setupData.settings.pairVariantList);
    const pairedOrders = {};
    let orders = 0;
    createBoxConfig();
    $(".detail-parameters .variant-list select").each(function() {
      orders += 1;
      const position = this;
      createOptions(position, orders);
    });
    $(".detail-parameters .surcharge-list select").each(function() {
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
    $(".button.option-button").on("click", function() {
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
      }
      const image2 = $(this).find("img").attr("src");
      console.log(image2);
      $(".image-wrap").remove();
      const imageWrap = $("<div>", {
        class: "image-wrap"
      }).appendTo(".parameter-wrap.parameter-" + parameterId);
      $("<img>", { src: image2 }).appendTo(imageWrap);
      if (!$(".goToAction")[0]) {
        console.log("goToAction");
        $(".upsale-Banner").show();
      }
    });
    if ($("html[lang='cs']").length) {
      $(".p-variants-block .surcharge-list:contains('Velikost boxu') option[data-index='0']").text("Zvolte velikost boxu");
      $(".p-variants-block .surcharge-list:contains('Rozm\u011Br 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Rozm\u011Br boxu') option[data-index='0']").text("Zvolte velikost boxu");
      $(".p-variants-block .surcharge-list:contains('Velikost 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Barva boxu') option[data-index='0']").text("Zvolte barvu boxu");
      $(".p-variants-block .surcharge-list:contains('Barva 2. boxu') option[data-index='0']").text("Zvolte barvu 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Um\xEDst\u011Bn\xED volantu') option[data-index='0']").text("Pros\xEDm, vyberte um\xEDst\u011Bn\xED volantu");
    }
    if ($("html[lang='sk']").length) {
      $(".p-variants-block .surcharge-list:contains('Ve\u013Ekos\u0165 boxu') option[data-index='0']").text("Zvo\u013Ete ve\u013Ekos\u0165 boxu");
      $(".p-variants-block .surcharge-list:contains('Rozmer 2. Boxu') option[data-index='0']").text("Zvo\u013Ete ve\u013Ekos\u0165 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Rozmer boxu') option[data-index='0']").text("Zvo\u013Ete ve\u013Ekos\u0165 boxu");
      $(".p-variants-block .surcharge-list:contains('Ve\u013Ekos\u0165 2. Boxu') option[data-index='0']").text("Zvo\u013Ete ve\u013Ekos\u0165 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Farba boxu') option[data-index='0']").text("Zvo\u013Ete farbu boxu");
      $(".p-variants-block .surcharge-list:contains('Farba 2. boxu') option[data-index='0']").text("Zvo\u013Ete farbu 2.boxu");
      $(".p-variants-block .surcharge-list:contains('Umiestenie volantu') option[data-index='0']").text("Pros\xEDm,vyberte umiestnenie volantu");
    }
    $(".navigatte-button").on("click", function() {
      const option = $(this).attr("data-option").split("-");
      const optionName = option[1];
      $(".parameter-wrap").removeClass("active");
      $(`.parameter-wrap:eq(${optionName})`).addClass("active");
      $(".navigatte-button").removeClass("active");
      $(`.navigatte-button:eq(${optionName})`).addClass("active");
    });
  }
}
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
  const button = $(buttonHTML).appendTo(position);
}
$(document).on("click", ".upsale-button", function(e) {
  const trunk = $(this).closest(".upsale-buttons.trunk");
  if (trunk.length) {
    if (trunk.hasClass("minimalize")) {
      e.stopPropagation();
      trunk.removeClass("minimalize");
    } else {
      $(".upsale-buttons.boxs").show();
      setTimeout(() => {
        trunk.addClass("minimalize");
      }, 200);
    }
  }
  const value = $(this).attr("value")?.split("-");
  console.log(value);
  if (!value) {
    console.error("Atribut 'value' nen\xED dostupn\xFD!");
    return;
  }
  $(".upsale-buttons.boxs .upsale-button").removeClass("active");
  if ($(this).hasClass("active")) {
    $(this).removeClass("active");
    $("select.surcharge-parameter.parameter-id-" + value[0]).val(0);
  } else {
    if ($(this).hasClass("radio")) {
      $(".upsale-button.radio").removeClass("active");
    }
    $(this).addClass("active");
    $("select.surcharge-parameter.parameter-id-" + value[0]).val(value[1]);
  }
  if ($(this).hasClass("config")) {
    $(this).parents(".upsale-Banner").addClass("showConf");
  }
  if (value[0] === "conf1") {
    $(".parameter-wrap.parameter-29.orders-5").hide();
  } else if (value[0] === "conf2") {
    $(".parameter-wrap.parameter-29.orders-5").show();
  }
  setTimeout(() => {
    if (typeof shoptet !== "undefined" && shoptet.surcharges?.updatePrices) {
      shoptet.surcharges.updatePrices();
    } else {
      console.warn("Funkce `shoptet.surcharges.updatePrices` nen\xED dostupn\xE1.");
    }
  }, 100);
});
$(document).on("click", ".box-config .close-btn", function() {
  $(this).parents(".upsale-Banner").removeClass("showConf");
});
function firstPage() {
  const wrap = $("<div>", {
    class: "navigatte-button class first",
    "data-option": "option-0"
  }).appendTo(".navidation-Wrap");
  const wheelval = $("select.parameter-id-37.surcharge-parameter").val();
  let typeVal = $("select.parameter-id-22.surcharge-parameter").val();
  if (wheelval == "") {
    $("select.parameter-id-37.surcharge-parameter").val(250);
  }
  if (typeVal == "") {
    const getModel = sessionStorage.getItem("carType");
    console.log(getModel);
    const value = $("select.parameter-id-22.surcharge-parameter option").filter(function() {
      return $(this).text().indexOf(getModel) !== -1;
    }).val();
    console.log(value);
    $("select.parameter-id-22.surcharge-parameter").val(value);
    typeVal = value;
  }
  const pageWrap = $("<div>", {
    class: "position-wrap parameter-cars active"
  }).appendTo(".content-wrap");
  const wheelWrao = $("<div>", {
    class: "parameter-cars wheel-Position"
  }).appendTo(pageWrap);
  $("<div>", {
    class: "label wheel",
    text: "Pozice volantu"
  }).appendTo(wheelWrao);
  $(`<div class="can-toggle demo-rebrand-1 wheel-option ">
  <input id="d" type="checkbox" control-id="ControlID-4">
  <label for="d">
    <div class="can-toggle__switch" data-checked="Prav\xE1" data-unchecked="Lev\xE1"></div>
    <div class="can-toggle__label-text"></div>
  </label>
</div>`).appendTo(wheelWrao);
  $(".can-toggle.wheel-option").on("click", function() {
    if ($(this).find("input").is(":checked")) {
      $("select.parameter-id-37.surcharge-parameter").val(253);
    }
  });
  $(".type-option.button").on("click", function() {
    $(this).addClass("active").siblings().removeClass("active");
    const value = $(this).attr("data-value");
    $("select.parameter-id-22.surcharge-parameter").val(value);
  });
}
function createOptions(position, orders) {
  console.log(position);
  let name = $(position).parents(".variant-list").find("th").text().trim();
  if (name == "") {
    name = $(position).parents(".surcharge-list").find("th").text().trim().replace("?", "");
  }
  const createSlug = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
  };
  let slug = createSlug(name);
  const options = $(position).find("option");
  const parameterId = $(position).attr("data-parameter-id");
  let optPosition = ".content-wrap";
  if (orders == 4) {
    const wrapOwerflow = $("<div>", {
      class: "pop-ower"
    }).appendTo("#options-wrap ");
    const popup = $("<div>", {
      class: "pop-up-options"
    }).appendTo(wrapOwerflow);
    $("<div>", {
      class: "close-btn",
      text: "+"
    }).appendTo(popup);
    $("<div>", {
      class: "btn button-more",
      text: "N\u011Bco nav\xEDc?"
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
      "data-option": `option-${orders}`
    }).appendTo(".navidation-Wrap");
  }
  $(".btn.button-more").on("click", function() {
    $(".pop-ower").addClass("show");
  });
  $(".close-btn").on("click", function() {
    $(".pop-ower").removeClass("show");
  });
  if (!$(`.orders-${orders}`)[0]) {
    const wrap = $("<div>", {
      class: `parameter-wrap parameter-${parameterId} orders-${orders}`,
      "data-parameterId": parameterId
    }).appendTo(optPosition);
    if (orders <= upsale) {
      $(wrap).addClass("goToAction");
      $(wrap).addClass("base-config");
    }
    $("<div>", {
      class: "order",
      text: orders
    }).appendTo(`.parameter-wrap.orders-${orders}`);
  }
  $(".navigatte-button:eq(0)").addClass("active");
  const paramerer = `.parameter-wrap.orders-${orders}`;
  $("<h5>", {
    class: "variant name",
    text: name
  }).appendTo(paramerer);
  const optionsWrap = $("<div>", {
    class: "options-wrap"
  }).appendTo(paramerer);
  $(options).each(function() {
    const value = $(this).val();
    if (value == "") return;
    const textOption = $(this).text();
    const optionButton = $("<div>", {
      class: "button option-button",
      "data-value": value,
      "data-variant": parameterId
    }).appendTo(optionsWrap);
    $("<div>", {
      text: textOption,
      class: "text"
    }).appendTo(optionButton);
    $("<img>", {
      alt: `${parameterId}-${value}.jpg`,
      src: `/user/documents/upload/assets/variants/${parameterId}-${value}.jpg?8`
    }).appendTo(optionButton);
  });
}
function createBoxConfig() {
  const wrap = $("<div>", {
    class: "box-config"
  }).appendTo(".upsale-buttons.boxs");
  $("<div>", {
    class: "label",
    text: "Konfigurace boxu"
  }).appendTo(wrap);
  $("<div>", {
    class: "close-btn",
    text: "-"
  }).appendTo(wrap);
  const configWrap = $("<div>", {
    class: "config-wrap"
  }).appendTo(wrap);
}
function condownMessage(position, time, text) {
  const wrap = $("<div>", {
    class: "countdown-wrap"
  }).appendTo(position);
  $("<div>", {
    class: "label",
    html: text + "<span></span>"
  }).appendTo(wrap);
  condown(time, ".countdown-wrap .label span");
}
function condown(time, selector) {
  const endTime = (/* @__PURE__ */ new Date()).getTime() + time * 60 * 1e3;
  function updateCountdown() {
    const now = (/* @__PURE__ */ new Date()).getTime();
    const remainingTime = endTime - now;
    if (remainingTime <= 0) {
      $(selector).text("\u010Das vypr\u0161el!");
      clearInterval(countdownInterval);
    } else {
      const minutes = Math.floor(remainingTime / 1e3 / 60 % 60);
      const seconds = Math.floor(remainingTime / 1e3 % 60);
      $(selector).text(`${minutes} min ${seconds} sec`);
    }
  }
  const countdownInterval = setInterval(updateCountdown, 1e3);
  updateCountdown();
}

// assets/js/script.js
var setupData2;
$.getJSON(optionData.downloadData, function(data) {
  setupData2 = data;
  console.log(setupData2.settings.carVariant.split(","));
  initModelSelect2();
  googleReviews();
  initProduct();
});
var logoGoogle = '<svg viewBox="0 0 512 512" height="18" width="18"><g fill="none" fill-rule="evenodd"><path d="M482.56 261.36c0-16.73-1.5-32.83-4.29-48.27H256v91.29h127.01c-5.47 29.5-22.1 54.49-47.09 71.23v59.21h76.27c44.63-41.09 70.37-101.59 70.37-173.46z" fill="#4285f4"></path><path d="M256 492c63.72 0 117.14-21.13 156.19-57.18l-76.27-59.21c-21.13 14.16-48.17 22.53-79.92 22.53-61.47 0-113.49-41.51-132.05-97.3H45.1v61.15c38.83 77.13 118.64 130.01 210.9 130.01z" fill="#34a853"></path><path d="M123.95 300.84c-4.72-14.16-7.4-29.29-7.4-44.84s2.68-30.68 7.4-44.84V150.01H45.1C29.12 181.87 20 217.92 20 256c0 38.08 9.12 74.13 25.1 105.99l78.85-61.15z" fill="#fbbc05"></path><path d="M256 113.86c34.65 0 65.76 11.91 90.22 35.29l67.69-67.69C373.03 43.39 319.61 20 256 20c-92.25 0-172.07 52.89-210.9 130.01l78.85 61.15c18.56-55.78 70.59-97.3 132.05-97.3z" fill="#ea4335"></path><path d="M20 20h472v472H20V20z"></path></g></svg>';
jQuery(document).ready(function($2) {
  dinamicPictures();
  initHeader();
  intIndex();
  initSignpost();
  initCart();
});
function initHeader() {
  $(".top-navigation-bar-menu-helper").empty();
  $("ul.top-navigation-bar-menu li").addClass("cropped").clone().appendTo(".top-navigation-bar-menu-helper");
  $(".navigation-buttons .cart-count span:contains(ko\u0161\xEDk)").text("Ko\u0161\xEDk");
  $('<a href="#" class="toggle-window" data-target="search" data-testid="linkSearchIcon"></a>').prependTo(".desktop  .navigation-buttons");
  $("<div>", {
    class: "navigation-show",
    text: "E-shop"
  }).appendTo(".top-navigation-bar");
  $(".navigation-show").on("click", function() {
    $("body").toggleClass("showNav");
  });
}
function initModelSelect2() {
  let insertPosidion = ".in-index .content-wrapper.container:eq(1)";
  if ($(".mobile")[0]) {
    insertPosidion = ".row.banners-row.has-text-banner";
  }
  if ($(".type-product")[0]) {
    insertPosidion = ".availability-value";
  }
  const getBrand = sessionStorage.getItem("Brand");
  const getModel = sessionStorage.getItem("Model");
  const getYear = sessionStorage.getItem("Year");
  const getCarType = sessionStorage.getItem("carType");
  const section = $("<section>", {
    id: "model-selector"
  }).insertAfter(insertPosidion);
  const container = $("<div>", {
    class: "model-selector container"
  }).appendTo(section);
  if ($(".in-index")[0]) {
    $("<h2>").text("Obchod pro tvoje Auto").appendTo(container);
  }
  const choiceWrap = $("<div>").addClass("modl-selector-wrap").appendTo(container);
  const znacka = `
        <div class="surcharge-list brands dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_znacka[0] + `</option>
                </select>
            </div>
        </div>
        `;
  const model = `
        <div class="surcharge-list models dm-selector">
          
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_model[0] + `</option>
                </select>
            </div>
        </div>
        `;
  const rocnik = `
        <div class="surcharge-list years dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_rocnik[0] + `</option>
                </select>
            </div>
        </div>
        `;
  const type = `
        <div class="surcharge-list type-selector">
           
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>Typ auta</option>
                </select>
            </div>
        </div>
        `;
  const button = `<div class='btn choice-Model'>Zvolit model</div>`;
  if ($(".in-index")[0]) {
    $(znacka + model + rocnik + type + button).appendTo(choiceWrap);
  } else {
    $(znacka + model + rocnik + type).appendTo(choiceWrap);
  }
  $(setupData2.settings.carVariant.split(",")).each(function() {
    console.log(this);
    const option = $("<option>").text(this).appendTo(".type-selector .selector select");
  });
  if (getBrand != null) {
    console.log(getBrand);
    $("<option>" + getBrand + "</option>").prependTo(".surcharge-list.brands.dm-selector select");
    $(".surcharge-list.brands.dm-selector select").val(getBrand);
  }
  if (getModel != null) {
    $("<option>" + getModel + "</option>").prependTo(".surcharge-list.models.dm-selector select");
    $(".surcharge-list.models.dm-selector select").val(getModel);
  }
  if (getYear != null) {
    $("<option>" + getYear + "</option>").prependTo(".surcharge-list.years.dm-selector select");
    $(".surcharge-list.years.dm-selector select").val(getYear);
  }
  if (getCarType != null) {
    $("<option>" + getCarType + "</option>").prependTo(".surcharge-list.type-selector select");
    $(".surcharge-list.type-selector select").val(getCarType);
  }
  const cars = setupData2.cars;
  const numberOfBrands = Object.keys(cars).length;
  const brands = Object.keys(cars);
  for (let i = 0; i < numberOfBrands; i++) {
    $("<option>" + brands[i] + "</option>").appendTo(".brands select");
  }
  const d = /* @__PURE__ */ new Date();
  const currentYear = d.getFullYear();
  for (let year = Number(years_from); year <= currentYear; year++) {
    $("<option>" + year + "</option>").appendTo(".years select");
  }
  const other_option = "<option>" + other + "</option>";
  $(other_option).appendTo(".type select");
  $(other_option).appendTo(".years select");
  $(".brands select").on("change", function() {
    if ($(this).val() === cstm_znacka.at(1)) {
      $(".models option:not(.notselect)").remove();
    } else {
      $(".models option:not(.notselect)").remove();
      const models_for_brand = car_json.cars[$(this).val()];
      for (let i = 0; i < models_for_brand.length; i++) {
        $("<option>" + models_for_brand.at(i) + "</option>").appendTo(".models select");
      }
    }
  });
  $(".btn.choice-Model").on("click", function() {
    saveModel();
  });
  $(".surcharge-list").on("change", function() {
    saveModel();
  });
}
function saveModel() {
  const Brand = $(".surcharge-list.brands.dm-selector select").val();
  const Model = $(".surcharge-list.models.dm-selector select").val();
  const Year = $(".surcharge-list.years.dm-selector select").val();
  const type = $(".surcharge-list.type-selector select").val();
  console.log(Brand + " " + Model + " " + Year);
  sessionStorage.setItem("model", Brand + " " + Model + " " + Year + " " + type);
  sessionStorage.setItem("Brand", Brand);
  sessionStorage.setItem("Model", Model);
  sessionStorage.setItem("Year", Year);
  sessionStorage.setItem("carType", type);
  if ($(".in-index")[0]) {
    window.location.href = "/rozcestnik/";
  }
}
function initSignpost() {
  const model = sessionStorage.getItem("model");
  $("section#Model-selecte .model span").text(model);
}
function googleReviews() {
  $("<section/>").attr("id", "goggle-review-wrap").insertAfter(".in-index section#model-selector");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJcRYHIStjj4wRIHx41hbkAtc&fields=name,rating,reviews&key=AIzaSyCeZU6zd0N8r7Uxu73NUIOhftj0OUGxcU4`;
  $('<div class="header-rewiew"><h3> \u010Eakujeme za Va\u0161e recenzie po slovensky</h3></div>').appendTo("#goggle-review-wrap");
  $(`<div class="elfsight-app-0852ca33-abe7-4be3-8eb8-6bfa99b7bde9" data-elfsight-app-lazy></div>`).appendTo("#goggle-review-wrap");
  $(`<script src="https://static.elfsight.com/platform/platform.js" async><\/script>
`).appendTo("#goggle-review-wrap");
  function waitForElementAndRemove() {
    const targetElement = $('a:contains("Free Google Reviews widget")');
    if (targetElement.length) {
      targetElement.addClass("hide").remove();
      console.log("Element byl odstran\u011Bn:", targetElement);
    } else {
      setTimeout(waitForElementAndRemove, 1e3);
    }
  }
  waitForElementAndRemove();
}
setTimeout(function() {
  $(logoGoogle).appendTo(".review-item-long");
  $("#google-reviews br").remove();
}, 2500);
function initCart() {
  if (!$(".id--9")[0]) return;
  const bannerWrap = $("<div>", {
    class: "banner-wrap"
  }).insertBefore("table.cart-table");
  $("<div>", {
    class: "h3",
    text: "Dokonal\xE1 ochrana pre v\xE1\u0161 kufor za EXTR\xC9MNE zv\xFDodnenu cenu!"
  }).appendTo(bannerWrap);
  $("<p>", {
    text: "Len teraz m\xF4\u017Eete prida\u0165 luxusn\xE9 autokoberce do kufra alebo \xFAlo\u017En\xE9 boxy za v\xFDrazne zv\xFDhodnen\xFA cenu. Chr\xE1\u0148te kufor V\xE1\u0161ho vozidla pred ne\u010Distotami a majte v\u0161etko na mieste!"
  }).appendTo(bannerWrap);
  const timer = $("<div>", {
    class: "timer-wrap"
  }).appendTo(bannerWrap);
  $("<span>", {
    text: "\u0160peci\xE1lna ponuka kon\u010D\xED za"
  }).appendTo(timer);
  const countdownSpan = $("<span>", {
    class: "countdown",
    text: ""
  }).appendTo(timer);
  $("<a>", {
    class: "btn",
    text: "Prida\u0165 so z\u013Eavou do objedn\xE1vky!",
    href: "#"
  }).appendTo(bannerWrap);
  $("<div>", {
    class: "description",
    text: "T\xFAto ponuku z\xEDskate len pri tejto objedn\xE1vke. Nepreme\u0161kajte \u0161ancu z\xEDska\u0165 doplnky za najlep\u0161iu cenu!"
  }).appendTo(bannerWrap);
  let endTime = sessionStorage.getItem("timerEndTime");
  if (!endTime || new Date(endTime) < /* @__PURE__ */ new Date()) {
    endTime = new Date((/* @__PURE__ */ new Date()).getTime() + 30 * 60 * 1e3);
    sessionStorage.setItem("timerEndTime", endTime);
  } else {
    endTime = new Date(endTime);
  }
  function updateCountdown() {
    const now = /* @__PURE__ */ new Date();
    const remainingTime = endTime - now;
    if (remainingTime <= 0) {
      countdownSpan.text("\u010Das vypr\u0161el!");
      clearInterval(countdownInterval);
      sessionStorage.removeItem("timerEndTime");
    } else {
      const minutes = Math.floor(remainingTime / 1e3 / 60 % 60);
      const seconds = Math.floor(remainingTime / 1e3 % 60);
      countdownSpan.text(`${minutes} min ${seconds} sec`);
    }
  }
  const countdownInterval = setInterval(updateCountdown, 1e3);
  updateCountdown();
}
function dinamicPictures() {
  var sections = $(".text-block");
  var dynamicImage = $("#dynamic-image");
  function changeImage() {
    var currentSection = null;
    sections.each(function() {
      var section = $(this);
      var rect = this.getBoundingClientRect();
      var sectionTop = rect.top;
      var sectionBottom = rect.bottom;
      if (sectionTop <= $(window).height() / 2 && sectionBottom >= $(window).height() / 2) {
        currentSection = section;
        return false;
      }
    });
    if (currentSection) {
      var newImageSrc = currentSection.data("picture");
      if (dynamicImage.attr("src") !== newImageSrc) {
        dynamicImage.css("opacity", 0);
        setTimeout(function() {
          dynamicImage.attr("src", newImageSrc);
          dynamicImage.css("opacity", 1);
        }, 500);
      }
    }
  }
  $(window).on("scroll", changeImage);
  changeImage();
}
