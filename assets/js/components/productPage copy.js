import { optionData } from "../option.js";
let setupData;
$.getJSON(optionData.downloadData, function (data) {
  setupData = data;
});

export function initProduct() {
  if ($(".id-751")[0]) {
    $(".benefitBanner__item").remove();
  }
  $(".p-detail-inner .p-detail-info").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".p-detail-inner .p-detail-inner-header").prependTo(".col-xs-12.col-lg-6.p-info-wrapper");
  $(".benefitBanner.position--benefitProduct .benefitBanner__item").insertBefore(".col-xs-12.col-lg-6.p-info-wrapper");
  const model = sessionStorage.getItem("model");

  // if (model != null) {
  //   $("<div>", {
  //     class: "model",
  //     html: 'Pro auto <div class="button btn select-model">' + model + "</div>",
  //   }).insertAfter(".availability-value");
  // } else {
  //   const modelWrap = $("<div>", {
  //     class: "choice-model",
  //   }).insertAfter(".availability-value");
  //   $("<div>", {
  //     class: "button btn select-model",
  //     text: "Zvolte model",
  //   }).appendTo(modelWrap);
  // }

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
    // Získání indexu tlačítka, které bylo kliknuto
    const index = $(this).index();

    // Přepnutí aktivní třídy
    buttons.removeClass("active");
    $(this).addClass("active");

    // Přepnutí viditelnosti odpovídajícího slide
    $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
    $(".timeline__slide:eq(" + index + ")")
      .addClass("is-selected")
      .removeClass("reveal-invisible")
      .attr("style", "opacity: 1; visibility: visible; z-index: 1;");

    // Aktualizace aktuálního indexu
    currentIndex = index;

    // Zobrazí zprávu s informací o tom, které tlačítko bylo kliknuto
    console.log(`Kliknul jsi na tlačítko s indexem: ${index}`);
  });

  prevButton.on("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      buttons.removeClass("active");
      buttons.eq(currentIndex).addClass("active");

      // Přepnutí viditelnosti odpovídajícího slide
      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(".timeline__slide:eq(" + currentIndex + ")")
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

      // Přepnutí viditelnosti odpovídajícího slide
      $(".timeline__slide").removeClass("is-selected").addClass("reveal-invisible").attr("style", "opacity: 0; visibility: hidden; z-index: 0;");
      $(".timeline__slide:eq(" + currentIndex + ")")
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
    // Zobrazí každý druhý obrázek a navíc osmý obrázek
    if (n % 2 !== 0 || n > 15) return; // Každý druhý a osmý (n = 7)
    console.log(n);
    const src = $(this).attr("href");
    const image = $("<a>", {
      class: "thumbnail-image p-main-image cloud-zoom",
      href: src,
    }).appendTo(wrap);
    $("<img>", {
      src: src,
    }).appendTo(image);
  });
}

function priplatky() {
  if ($(".type-detail").length) {
    // createPop()

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
      41
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/new/full-p.jpg",
      "LUXUSNÉ BOXY DO KUFRU NA MIERU",
      upsaleBanner,
      44
    );
    createUpsaleButton(
      "https://cdn.myshoptet.com/usr/689946.myshoptet.com/user/documents/upload/assets/boxy.jpg",
      "LUXUSNÉ BOXY DO KUFRU NA MIERU",
      upsaleBanner
    );
    $("<div>", { class: "content-wrap" }).insertAfter(".detail-parameters");

    // $("<div>", {
    //   class: "heder h2",
    //   text: "Prikup doplnky za zvyhodněnou cenu",
    // }).appendTo(upsaleText);
    // $("<p>", {
    //   text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nam quis nulla. Curabitur sagittis hendrerit ante. Fusce nibh. Nullam faucibus mi quis velit. ",
    // }).appendTo(upsaleText);
    // $("<div>", { class: "btn button upsale", text: "Koupit výhodně" }).appendTo(upsaleText);
    $("button.btn.btn-lg.btn-conversion.add-to-cart-button").addClass("upsale");
    // $(".btn.button.upsale").on("click", function () {
    //   $(".upsale-wrap").toggleClass("active");
    //   $("button.btn.btn-lg.btn-conversion.add-to-cart-button").removeClass("upsale");
    // });
    $(".add-to-cart").on("click", "button.btn.btn-lg.btn-conversion.add-to-cart-button.upsale", function (e) {
      e.stopPropagation();
      e.preventDefault();
      createUpsalePopup();
    });

    firstPage();

    const pairVariantList = JSON.parse(setupData.settings.pairVariantList);
    const pairedOrders = {};
    let orders = 0;
    $(".detail-parameters .variant-list select").each(function () {
      orders += 1;
      const position = this;
      createOptions(position, orders);
    });
    $(".detail-parameters .surcharge-list select").each(function () {
      const id = $(this).attr("data-parameter-id");

      // Přeskočíme, pokud se jedná o ID 37 nebo 22
      if (id == "37" || id == "22") return;

      // Kontrola, zda je ID v párovacím seznamu
      let sharedOrder = null;
      pairVariantList.forEach((pair) => {
        if (pair.includes(parseInt(id))) {
          sharedOrder = pair;
        }
      });

      if (sharedOrder) {
        // Pokud již existuje objednávka pro párované ID, použijeme ji
        if (pairedOrders[sharedOrder]) {
          orders = pairedOrders[sharedOrder];
        } else {
          // Pokud neexistuje, vytvoříme novou a uložíme
          orders += 1;
          pairedOrders[sharedOrder] = orders;
        }
      } else {
        orders += 1;
      }

      console.log(id);
      const position = this;

      // Vytvoření možností pro aktuální prvek
      createOptions(position, orders);
      console.log(pairVariantList);
    });

    $(".button.option-button").on("click", function () {
      $("body").removeClass("disabled-add-to-cart");
      const value = $(this).attr("data-value");
      const variant = $(this).attr("data-variant");
      $(this).addClass("active").siblings().removeClass("active");
      const parameterId = $(this).parents(".parameter-wrap").attr("data-parameterid");
      const image = $(this).find("img").attr("src");
      $(".navigatte-button.parameterNav" + parameterId).attr("style", " background-image: url(" + image + ");");
      console.log(parameterId);
      // console.log(value + '/' + variant)
      $(".parameter-id-" + variant).val(value);

      shoptet.surcharges.updatePrices();
      if (variant == 4) {
        const image = $(this).find("img").attr("src");
        console.log(image);
        $(".image-wrap").remove();
        const imageWrap = $("<div>", {
          class: "image-wrap",
        }).appendTo(".parameter-wrap.parameter-4.orders-1");
        $("<img>", { src: image }).appendTo(imageWrap);
      }
    });

    // $(".surcharge-list td option").each(function() {
    //     var defoption = $(this).html()

    //     let newtxt = defoption.replace(" +€0", '');
    //     newtxt = newtxt.replace(" +0 Kč", '');
    //     newtxt = newtxt.replace(" +0 €", '');
    //     $(this).text(newtxt)
    // });

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
      // console.log(optionName)

      $(".parameter-wrap").removeClass("active");
      $(".parameter-wrap:eq(" + optionName + ")").addClass("active");
      $(".navigatte-button").removeClass("active");
      $(".navigatte-button:eq(" + optionName + ")").addClass("active");
    });
  }

  // $('.parameter-wrap').swipe({
  //     swipe: function(event, direction) {
  //         if (direction === 'left') {
  //             // Přesuň se doprava
  //             const next = $(this).next('.parameter-wrap');
  //             if (next.length) {
  //                 const currentNav = $('.navigatte-button.active');
  //                 const nextNav = currentNav.next('.navigatte-button');
  //                 $(this).removeClass('active').fadeOut(300, function() {
  //                     next.fadeIn(300).addClass('active');
  //                 });
  //                 if (nextNav.length) {
  //                     currentNav.removeClass('active');
  //                     nextNav.addClass('active');
  //                 }
  //             }
  //         } else if (direction === 'right') {
  //             // Přesuň se doleva
  //             const prev = $(this).prev('.parameter-wrap');
  //             if (prev.length) {
  //                 const currentNav = $('.navigatte-button.active');
  //                 const prevNav = currentNav.prev('.navigatte-button');
  //                 $(this).removeClass('active').fadeOut(300, function() {
  //                     prev.fadeIn(300).addClass('active');
  //                 });
  //                 if (prevNav.length) {
  //                     currentNav.removeClass('active');
  //                     prevNav.addClass('active');
  //                 }
  //             }
  //         }
  //     },
  //     // Nastavení pouze pro swipe na ose X
  //     allowPageScroll: "vertical",
  //     threshold: 50 // Práh pro rozpoznání swipu
  // });

  // Nastavení prvního prvku jako aktivního
  // $('.parameter-wrap').first().addClass('active');
}
/**
 * Creates an upsale button with an image and text, and appends it to the specified position.
 *
 * @param {string} img - The URL of the image to be displayed on the button.
 * @param {string} text - The text to be displayed on the button.
 * @param {jQuery|HTMLElement} position - The element where the button will be appended.
 */
function createUpsaleButton(img, text, position, value) {
  if (!img || !text || !position) {
    console.error("Invalid parameters passed to createUpsaleButton");
    return;
  }

  const buttonHTML = `
    <div class="upsale-button" value="${value}">
      <img src="${img}" alt="${text}" />
      <div class="text">${text}</div>
    </div>
  `;

  $(position).append(buttonHTML);
}

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

    // Najdeme příslušný element 'option' podle textu, získáme jeho hodnotu
    const value = $("select.parameter-id-22.surcharge-parameter option")
      .filter(function () {
        return $(this).text().indexOf(getModel) !== -1;
      })
      .val();

    console.log(value);

    // Nastavíme vybranou hodnotu do 'select' elementu
    $("select.parameter-id-22.surcharge-parameter").val(value);
    typeVal = value;
  }
  const pageWrap = $("<div>", {
    class: "position-wrap parameter-cars active",
  }).appendTo(".content-wrap");
  // $('<div>', {
  //     class: 'order',
  //     text: '1'
  // }).appendTo(pageWrap)

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

  // const typeWrap = $('<div>', {
  //     class: 'parameter-cars type'
  // }).appendTo(pageWrap)
  // $('<div>', {
  //     class: 'label type',
  //     text: 'Typ vozu'
  // }).appendTo(typeWrap)
  // const typeOption = $('<div>', {
  //         class: 'type-option-wrap'
  //     }).appendTo(typeWrap)
  // $('select.parameter-id-22.surcharge-parameter option').each(function(n) {
  //     if (n == 0) return
  //     const val = $(this).val()
  //     let text = $(this).text().replace('+0 Kč', '')
  //     let textArr = text.split('+')
  //     text = textArr[0]
  //     let price = textArr[1]
  //     if (price == undefined) {
  //         price = ''
  //     } else {
  //         price = '+ ' + price
  //     }
  //     const button = $('<div>', {
  //         class: 'type-option button',
  //         'data-value': val,
  //         html: text + '<span>' + price + '</span>',
  //     }).appendTo(typeOption)

  //     if (typeVal == val) {
  //         $(button).addClass('active')
  //     }
  //     // if (n == 1) {
  //     //     $(button).addClass('active')
  //     // }

  // })
  $(".type-option.button").on("click", function () {
    $(this).addClass("active").siblings().removeClass("active");
    const value = $(this).attr("data-value");
    $("select.parameter-id-22.surcharge-parameter").val(value);
  });
}

function createOptions(position, orders) {
  let name = $(position).parents(".variant-list").find("th").text().trim();
  if (name == "") {
    name = $(position).parents(".surcharge-list").find("th").text().trim().replace("?", "");
  }

  const createSlug = (text) => {
    return text
      .toLowerCase() // převedeme na malá písmena
      .normalize("NFD") // normalizace znaku s diakritikou
      .replace(/[\u0300-\u036f]/g, "") // odstraníme diakritiku
      .replace(/[^\w\s-]/g, "") // odstraníme speciální znaky
      .trim() // ořežeme mezery na začátku a na konci
      .replace(/\s+/g, "-") // mezery nahradíme pomlčkami
      .replace(/-+/g, "-"); // odstraníme více pomlček za sebou
  };
  let slug = createSlug(name);

  const options = $(position).find("option");
  // console.log(options)
  const parameterId = $(position).attr("data-parameter-id");
  // console.log(parameterId)
  let optPosition = ".content-wrap";
  // if (orders == 2) {

  //     upsalePage(orders)
  // }
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
    upsale = 2;
  }
  if (orders > upsale) {
    optPosition = ".upsale-wrap";
  }
  if (orders <= upsale) {
    $("<div>", {
      class: "navigatte-button class" + orders + " " + slug + " parameterNav" + parameterId,
      "data-option": "option-" + orders,
    }).appendTo(".navidation-Wrap");
  }
  // if (orders == 1) {
  //     $('.navigatte-button').addClass('active')
  // }

  $(".btn.button-more").on("click", function () {
    $(".pop-ower").addClass("show");
  });
  $(".close-btn").on("click", function () {
    $(".pop-ower").removeClass("show");
  });

  // console.log(name)
  if (!$(".orders-" + orders)[0]) {
    const wrap = $("<div>", {
      class: "parameter-wrap parameter-" + parameterId + " orders-" + orders,
      "data-parameterId": parameterId,
    }).appendTo(optPosition);
    if (orders <= upsale) {
      $(wrap).addClass("goToAction");
    }
    $("<div>", {
      class: "order",
      text: orders,
    }).appendTo(".parameter-wrap.orders-" + orders);
  }

  $(".navigatte-button:eq(0)").addClass("active");
  // $('.parameter-wrap').addClass('active')
  const paramerer = ".parameter-wrap.orders-" + orders;

  $("<h5>", {
    class: " variant name",
    text: name,
  }).appendTo(paramerer);
  const optionsWrap = $("<div>", {
    class: "options-wrap",
  }).appendTo(paramerer);

  $(options).each(function () {
    const value = $(this).val();
    // console.log(value)
    const textOption = $(this).text();
    if (value == "") return;
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
      alt: parameterId + "-" + value + ".jpg",
      src: "/user/documents/upload/assets/variants/" + parameterId + "-" + value + ".jpg?7",
    }).appendTo(optionButton);
  });
}
