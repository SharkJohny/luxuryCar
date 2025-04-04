const timestamp = Date.now();

const downloadData = "/user/documents/upload/data.json?" + timestamp;
let setupData;
$.getJSON(downloadData, function (data) {
  setupData = data;
  console.log(setupData.settings.carVariant.split(","));
  initModelSelect();
  googleReviews();
  initProduct();
});

const logoGoogle =
  '<svg viewBox="0 0 512 512" height="18" width="18"><g fill="none" fill-rule="evenodd"><path d="M482.56 261.36c0-16.73-1.5-32.83-4.29-48.27H256v91.29h127.01c-5.47 29.5-22.1 54.49-47.09 71.23v59.21h76.27c44.63-41.09 70.37-101.59 70.37-173.46z" fill="#4285f4"></path><path d="M256 492c63.72 0 117.14-21.13 156.19-57.18l-76.27-59.21c-21.13 14.16-48.17 22.53-79.92 22.53-61.47 0-113.49-41.51-132.05-97.3H45.1v61.15c38.83 77.13 118.64 130.01 210.9 130.01z" fill="#34a853"></path><path d="M123.95 300.84c-4.72-14.16-7.4-29.29-7.4-44.84s2.68-30.68 7.4-44.84V150.01H45.1C29.12 181.87 20 217.92 20 256c0 38.08 9.12 74.13 25.1 105.99l78.85-61.15z" fill="#fbbc05"></path><path d="M256 113.86c34.65 0 65.76 11.91 90.22 35.29l67.69-67.69C373.03 43.39 319.61 20 256 20c-92.25 0-172.07 52.89-210.9 130.01l78.85 61.15c18.56-55.78 70.59-97.3 132.05-97.3z" fill="#ea4335"></path><path d="M20 20h472v472H20V20z"></path></g></svg>';

jQuery(document).ready(function ($) {
  dinamicPictures();
  initHeader();

  intIndex();
  initSignpost();
  initCart();
});

function intIndex() {
  setTimeout(function () {}, 4000);
  $(".twentytwenty-container").twentytwenty({
    before_label: "Předtím",
    after_label: "Potom",
  });

  // Funkce pro přičítání čísel
  function animateCountUp(element, targetNumber, duration) {
    const $element = $(element);
    $({ count: 0 }).animate(
      { count: targetNumber },
      {
        duration: duration,
        easing: "swing",
        step: function (now) {
          $element.text(Math.floor(now));
        },
        complete: function () {
          $element.text(targetNumber); // Pro zajištění, že se zobrazí konečná hodnota
        },
      }
    );
  }
  // Nastavení IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const $element = $(entry.target).find('span[style*="text-align: end"]');
        const targetNumber = parseFloat($element.text().replace(",", ""));
        console.log(targetNumber);
        if (targetNumber > 0) {
          console.log("assdsd");
          const duration = parseFloat($(entry.target).attr("count-up")) * 1000;
          animateCountUp($element, targetNumber, duration);
          observer.unobserve(entry.target); // Odstraní pozorování, aby se animace nespustila znovu
        }
      }
    });
  });

  // Inicializace pozorování pro každý prvek s atributem count-up
  $("[count-up]").each(function () {
    observer.observe(this);
  });
  $("collection-list.collection-list").slick({
    dots: true,
    centerMode: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,

    responsive: [
      {
        breakpoint: 1480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: true,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 770,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,

          autoplay: false,
        },
      },
      {
        breakpoint: 350,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  $("section.foto-slider").slick({
    dots: true,
    centerMode: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  });

  $("button.text-with-icon.group").on("click", function () {
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

  $(".btn.more-pictures-button").on("click", function () {
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

  $("video")
    .parent()
    .click(function () {
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

  $(".hotspot").on("click", function () {
    $(".tooltips").removeClass("show");
    $(this).find(".tooltips").addClass("show");
  });
  $(document).on("click", function (e) {
    // Check if clicked outside .hotspot and .tooltips
    const $target = $(e.target);
    if (!$target.closest(".hotspot").length && !$target.closest(".tooltips").length) {
      $(".tooltips").removeClass("show");
    }
  });
}

function dinamicPictures() {
  var sections = $(".text-block");
  var dynamicImage = $("#dynamic-image");

  function changeImage() {
    var currentSection = null;

    sections.each(function () {
      var section = $(this);
      var rect = this.getBoundingClientRect();
      var sectionTop = rect.top;
      var sectionBottom = rect.bottom;

      // Kontrola, zda je sekce uprostřed obrazovky
      if (sectionTop <= $(window).height() / 2 && sectionBottom >= $(window).height() / 2) {
        currentSection = section;
        return false; // Ukončíme each loop, protože jsme našli aktuální sekci
      }
    });

    if (currentSection) {
      var newImageSrc = currentSection.data("picture");

      if (dynamicImage.attr("src") !== newImageSrc) {
        // Přidání přechodového efektu
        dynamicImage.css("opacity", 0);

        setTimeout(function () {
          dynamicImage.attr("src", newImageSrc);
          dynamicImage.css("opacity", 1);
        }, 500); // Doba trvání přechodu musí odpovídat CSS přechodu
      }
    }
  }

  $(window).on("scroll", changeImage);
  changeImage(); // Inicializace při načtení stránky
}

function initHeader() {
  $(".top-navigation-bar-menu-helper").empty();
  $("ul.top-navigation-bar-menu li").addClass("cropped").clone().appendTo(".top-navigation-bar-menu-helper");

  $(".navigation-buttons .cart-count span:contains(košík)").text("Košík");

  $('<a href="#" class="toggle-window" data-target="search" data-testid="linkSearchIcon"></a>').prependTo(".desktop  .navigation-buttons");

  $("<div>", {
    class: "navigation-show",
    text: "E-shop",
  }).appendTo(".top-navigation-bar");

  $(".navigation-show").on("click", function () {
    $("body").toggleClass("showNav");
  });
}

function initModelSelect() {
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
    id: "model-selector",
  }).insertAfter(insertPosidion);
  const container = $("<div>", {
    class: "model-selector container",
  }).appendTo(section);
  if ($(".in-index")[0]) {
    $("<h2>").text("Obchod pro tvoje Auto").appendTo(container);
  }
  const choiceWrap = $("<div>").addClass("modl-selector-wrap").appendTo(container);
  const znacka =
    `
        <div class="surcharge-list brands dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` +
    cstm_znacka[0] +
    `</option>
                </select>
            </div>
        </div>
        `;

  const model =
    `
        <div class="surcharge-list models dm-selector">
          
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` +
    cstm_model[0] +
    `</option>
                </select>
            </div>
        </div>
        `;

  const rocnik =
    `
        <div class="surcharge-list years dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` +
    cstm_rocnik[0] +
    `</option>
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

  $(znacka + model + rocnik + type + button).appendTo(choiceWrap);
  $(setupData.settings.carVariant.split(",")).each(function () {
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

  const cars = setupData.cars;

  const numberOfBrands = Object.keys(cars).length;
  const brands = Object.keys(cars);
  for (let i = 0; i < numberOfBrands; i++) {
    $("<option>" + brands[i] + "</option>").appendTo(".brands select");
  }
  const d = new Date();
  const currentYear = d.getFullYear();
  for (let year = Number(years_from); year <= currentYear; year++) {
    $("<option>" + year + "</option>").appendTo(".years select");
  }

  const other_option = "<option>" + other + "</option>";
  $(other_option).appendTo(".type select");
  $(other_option).appendTo(".years select");

  $(".brands select").on("change", function () {
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

  $(".btn.choice-Model").on("click", function () {
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
    } else {
      location.reload();
    }
  });
}

function initSignpost() {
  const model = sessionStorage.getItem("model");
  $("section#Model-selecte .model span").text(model);
}

function initProduct() {
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
    const upsaleText = $("<div>", {
      class: "upsale-text",
    }).insertAfter(".detail-parameters");

    createUpsaleButton("/user/documents/upload/assets/new/base-p.jpg", "test", upsaleText);
    // $("<div>", { class: "content-wrap" }).insertAfter(".detail-parameters");

    // $("<div>", {
    //   class: "heder h2",
    //   text: "Prikup doplnky za zvyhodněnou cenu",
    // }).appendTo(upsaleText);
    // $("<p>", {
    //   text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nam quis nulla. Curabitur sagittis hendrerit ante. Fusce nibh. Nullam faucibus mi quis velit. ",
    // }).appendTo(upsaleText);
    // $("<div>", { class: "btn button upsale", text: "Koupit výhodně" }).appendTo(upsaleText);
    // $("button.btn.btn-lg.btn-conversion.add-to-cart-button").addClass("upsale");
    // $(".btn.button.upsale").on("click", function () {
    //   $(".upsale-wrap").toggleClass("active");
    //   $("button.btn.btn-lg.btn-conversion.add-to-cart-button").removeClass("upsale");
    // });
    // $(".add-to-cart").on("click", "button.btn.btn-lg.btn-conversion.add-to-cart-button.upsale", function (e) {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   createUpsalePopup();
    // });

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
      $(this).parents(".parameter-wrap").removeClass("goToAction");
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
      if (!$(".goToAction")[0]) {
        console.log("goToAction");
        $(".upsale-wrap").addClass("active");
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

function googleReviews() {
  // console.log('review')
  $("<section/>").attr("id", "goggle-review-wrap").insertAfter(".in-index section#model-selector");

  // $("<section/>")
  //   .attr("id", "goggle-review-wrap")
  //   .insertBefore(".type-product footer");

  // $(
  //     '<div class="header-rewiew"><h3> Děkujeme za Vaše recenze</h3></div>'
  // ).appendTo("#goggle-review-wrap");

  // const review = $("<div/>")
  //     .addClass("review-row")
  //     .appendTo("#goggle-review-wrap");

  // $(`<div class="ti-widget-container"> <a href="#dropdown" class="ti-header source-Google" data-subcontent="1" data-subcontent-target=".ti-dropdown-widget"> <div class="ti-small-logo"> <img src="https://cdn.trustindex.io/assets/platform/Google/logo.svg" loading="lazy" alt="Google"  height="25"> </div><div class="review-stars"><ul><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li></ul></div> <div class="ti-mob-row"> <span class="nowrap"><strong>` +
  //     numberReviews + ` recenzí</strong></span> <span class="ti-arrow-down"></span> </div> </a> </div>`).appendTo(review);
  // $("<div/>").attr("id", "google-reviews").appendTo(review);

  // $(".js-navigation-container").insertAfter(".site-name");
  // $(".contact-box.no-image").clone().appendTo(".top-navigation-menu");
  // $('a.ti-header.source-Google').on('click', function() {
  //     createPopUp()
  // })

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJcRYHIStjj4wRIHx41hbkAtc&fields=name,rating,reviews&key=AIzaSyCeZU6zd0N8r7Uxu73NUIOhftj0OUGxcU4`;
  $('<div class="header-rewiew"><h3> Ďakujeme za Vaše recenzie po slovensky</h3></div>').appendTo("#goggle-review-wrap");

  $(`<div class="elfsight-app-0852ca33-abe7-4be3-8eb8-6bfa99b7bde9" data-elfsight-app-lazy></div>`).appendTo("#goggle-review-wrap");
  $(`<script src="https://static.elfsight.com/platform/platform.js" async></script>
`).appendTo("#goggle-review-wrap");
  function waitForElementAndRemove() {
    const targetElement = $('a:contains("Free Google Reviews widget")');

    if (targetElement.length) {
      targetElement.addClass("hide").remove(); // Odstranění elementu
      console.log("Element byl odstraněn:", targetElement);
    } else {
      // Zkontroluj znovu za 100 ms
      setTimeout(waitForElementAndRemove, 1000);
    }
  }

  // Spuštění funkce
  waitForElementAndRemove();
  // const review = $("<div/>")
  //   .addClass("review-row")
  //   .appendTo("#goggle-review-wrap");
  // $(
  //   `<div class="grw-slider-header"><div class="grw-slider-header-inner"><div class="wp-google-place"><div class="wp-google-left"></div><div class="wp-google-right"><div class="wp-google-name"><a href="https://search.google.com/local/reviews?placeid=ChIJcRYHIStjj4wRIHx41hbkAtc" target="_blank" rel="nofollow noopener"><span>Luxury car</span></a></div><div><span class="wp-google-rating">5.0</span><span class="wp-google-stars"><span class="wp-stars"><span class="wp-star"><svg width="17" height="17" viewBox="0 0 1792 1792"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" fill="#e7711b"></path></svg></span><span class="wp-star"><svg width="17" height="17" viewBox="0 0 1792 1792"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" fill="#e7711b"></path></svg></span><span class="wp-star"><svg width="17" height="17" viewBox="0 0 1792 1792"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" fill="#e7711b"></path></svg></span><span class="wp-star"><svg width="17" height="17" viewBox="0 0 1792 1792"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" fill="#e7711b"></path></svg></span><span class="wp-star"><svg width="17" height="17" viewBox="0 0 1792 1792"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" fill="#e7711b"></path></svg></span></span></span></div><div class="wp-google-powered">Na základě <a href="https://search.google.com/local/reviews?placeid=ChIJcRYHIStjj4wRIHx41hbkAtc" style="font-weight: 600 !important;text-decoration: underline !important;" target="_blank">` +
  //     numberReviews +
  //     ` recenzí</a></div><div class="wp-google-powered"><img src="https://www.mojerky.cz/user/documents/upload/google.svg" alt="powered by Google" width="144" height="18" title="powered by Google"></div><div class="wp-google-wr"><a href="https://search.google.com/local/reviews?placeid=ChIJcRYHIStjj4wRIHx41hbkAtc" onclick="return rplg_leave_review_window.call(this)">Napsat&nbsp;recenzi</a></div></div></div></div></div>`
  // ).appendTo(review);
  // $("<div/>").attr("id", "google-reviews").appendTo(review);

  // $(".js-navigation-container").insertAfter(".site-name");
  // $(".contact-box.no-image").clone().appendTo(".top-navigation-menu");

  // $("<a/>")
  //   .addClass("yelowText")
  //   .attr("href", "#goggle-review-wrap")
  //   .html(
  //     `<div class="review-stars"><ul><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li></ul></div><span class="numreview">(` +
  //       numberReviews +
  //       ")</span>Hodnocení zákazníků"
  //   )
  //   .insertAfter(" .p-data-wrapper h1");

  // $("<a/>")
  //   .addClass("yelowText")
  //   .attr("href", "#goggle-review-wrap")
  //   .html(
  //     `<div class="review-stars"><ul><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li></ul></div><span class="numreview">(` +
  //       numberReviews +
  //       ")</span>Hodnocení zákazníků"
  //   )
  //   .insertBefore(" .p-image");

  // if ($("#google-reviews").length == 0) {
  //   return;
  // }
  // // Find a placeID via https://developers.google.com/places/place-id
  // $("#google-reviews").googlePlaces({
  //   placeId: "ChIJcRYHIStjj4wRIHx41hbkAtc",
  //   // the following params are optional (default values)
  //   header: "", // html/text over Reviews
  //   footer: "", // html/text under Reviews block
  //   maxRows: 5, // max 5 rows of reviews to be displayed
  //   minRating: 3, // minimum rating of reviews to be displayed
  //   months: [
  //     "Jan",
  //     "Feb",
  //     "Mär",
  //     "Apr",
  //     "Mai",
  //     "Jun",
  //     "Jul",
  //     "Aug",
  //     "Sep",
  //     "Okt",
  //     "Nov",
  //     "Dez",
  //   ],
  //   textBreakLength: "90", // length before a review box is set to max width
  //   shortenNames: true, // example: "Max Mustermann" -> "Max M."",

  //   showProfilePicture: true,
  // });
  // const checkReviewsLoaded = setInterval(() => {
  //   if ($(".review-header").length > 0) {
  //     // Pokud recenze byly přidány
  //     // Zastaví kontrolu po načtení
  //     clearInterval(checkReviewsLoaded);
  //     $("#google-reviews").slick({
  //       dots: true,
  //       centerMode: false,
  //       infinite: true,
  //       slidesToShow: 4,
  //       slidesToScroll: 1,
  //       autoplay: true,
  //       autoplaySpeed: 8000,
  //       arrows: false,

  //       responsive: [
  //         {
  //           breakpoint: 1600,
  //           settings: {
  //             slidesToShow: 4,
  //             slidesToScroll: 1,
  //           },
  //         },
  //         {
  //           breakpoint: 1480,
  //           settings: {
  //             slidesToShow: 3,
  //             slidesToScroll: 1,
  //           },
  //         },
  //         {
  //           breakpoint: 1200,
  //           settings: {
  //             slidesToShow: 2,
  //             slidesToScroll: 1,
  //           },
  //         },
  //         {
  //           breakpoint: 800,
  //           settings: {
  //             slidesToShow: 1,
  //             slidesToScroll: 1,

  //             autoplay: false,
  //           },
  //         },
  //         // {
  //         //     breakpoint: 350,
  //         //     settings: {
  //         //         slidesToShow: 1,
  //         //         slidesToScroll: 1,
  //         //     },
  //         // },
  //       ],
  //     });
  //   }
  // }, 200);
  // // Kontrola každých 200 ms
}

function createPopUp() {
  $(`<div class="ti-dropdown-widget">
        <div class="ti-dropdown-widget-inner">
            <div class="ti-widget-container">
                <div class="ti-popup-header">
                    <a href="#" class="ti-close-lg"></a>
                </div>
                <div class="ti-reviews-container">
                    <div class="ti-reviews-container-wrapper"></div>
                </div>
            </div>
        </div>
    </div>`).appendTo(".model-selector.container");

  if ($(".ti-reviews-container-wrapper").length == 0) {
    return;
  }

  // Find a placeID via https://developers.google.com/places/place-id
}
setTimeout(function () {
  $(logoGoogle).appendTo(".review-item-long");
  $("#google-reviews br").remove();

  // $("#google-reviews").slick({
  //     dots: true,
  //     centerMode: false,
  //     infinite: true,
  //     slidesToShow: 5,
  //     slidesToScroll: 2,
  //     autoplay: true,
  //     autoplaySpeed: 8000,
  //     arrows: false,

  //     responsive: [{
  //             breakpoint: 1600,
  //             settings: {
  //                 slidesToShow: 4,
  //                 slidesToScroll: 1,
  //             },
  //         },
  //         {
  //             breakpoint: 1480,
  //             settings: {
  //                 slidesToShow: 3,
  //                 slidesToScroll: 1,
  //             },
  //         },
  //         {
  //             breakpoint: 1200,
  //             settings: {
  //                 slidesToShow: 2,
  //                 slidesToScroll: 1,
  //             },
  //         },
  //         {
  //             breakpoint: 800,
  //             settings: {
  //                 slidesToShow: 1,
  //                 slidesToScroll: 1,

  //                 autoplay: false,
  //             },
  //         },
  //         // {
  //         //     breakpoint: 350,
  //         //     settings: {
  //         //         slidesToShow: 1,
  //         //         slidesToScroll: 1,
  //         //     },
  //         // },
  //     ],
  // });
}, 2500);

function createPop() {
  $(`<div class="overflow" style="position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <div class="ti-dropdown-widget">
        <style>
        .ti-dropdown-widget {
    opacity: 1;
    display: -ms-flexbox;
    display: flex;
   
    position: absolute;
    top: initial;
    bottom: initial;
    background: none;
    text-align: left !important;
    z-index: 999999;
    left: 50%;
        width: 100%;
    transform: translateX(-50%);
}
@media (max-width: 768px) {
    .ti-dropdown-widget {
        left: unset;
        transform: none;
        width: 90%;
    }
}

.ti-dropdown-widget-inner {
    height: 100%;
    padding: 40px 10px 10px 10px;
    overflow: visible;
    background-color: #ffffff !important;
    position: relative;
    max-width: 700px;
    margin: auto;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
     width: 100%;

}

.ti-content-container-wrapper {
    overflow: auto;
    display: inherit;
    margin: 0px !important;
    margin-top: 0px !important;
    padding-right: 20px;
}

.ti-widget-container {
    margin-bottom: 0px;
    height: 100%;
    display: flex !important;
    flex-direction: column;
    font-size: 14px;
    line-height: 1.4em;
    overflow-y: scroll;
    height: 95%;
}

.ti-close-lg {
    position: absolute;
    width: 30px;
    height: 30px;
    background-color: #fff;
    right: 6px;
    top: 6px;
    border-radius: 50px;
    display: block;
    cursor: pointer;
    pointer-events: visible !important;
    color: #333;
    &:before,
    &:after {
        content: "";
        position: absolute;
        display: block;
        border-radius: 2px;
        width: 16px;
        height: 3px;
        top: 13px;
        left: 7px;
        background-color: #555;
    }
    &:before {
        transform: rotate(45deg);
    }
    &:after {
        transform: rotate(-45deg);
    }
}
        </style>
        
        <div class="ti-dropdown-widget-inner">
        <div class="ti-popup-header">      <a href="#" class="ti-close-lg"></a>
                </div>
            <div class="ti-widget-container">
                
              
                <div class="ti-content-container">
                    <div class="ti-content-container-wrapper"></div>
                </div>
            </div>
            </div>
        </div>
    </div>`).appendTo("body");
  $("a.ti-close-lg").on("click", function () {
    $(".overflow").remove();
  });
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

function upsalePage(orders) {
  $("<div>", {
    class: "navigatte-button class" + orders + "  upsale",
    "data-option": "option-" + orders,
  }).appendTo(".navidation-Wrap");
  const pageWrap = $("<div>", { class: "parameter-wrap upsale " }).appendTo(".content-wrap");
  $("<h5>", {
    text: "Rekapitulace",
  }).appendTo(pageWrap);
  $("<p>", {
    text: " text pro upsale ",
  }).appendTo(pageWrap);
  const buttonWrao = $("<div>", {
    class: "button-wrap",
  }).appendTo(pageWrap);
  $("<div>", { class: "btn upsale", text: "upsale" }).appendTo(buttonWrao);
  $("<div>", { class: "btn close", text: "Ukoncit konfigurator" }).appendTo(buttonWrao);
}

function initCart() {
  if (!$(".id--9")[0]) return;
  const bannerWrap = $("<div>", {
    class: "banner-wrap",
  }).insertBefore("table.cart-table");
  $("<div>", {
    class: "h3",
    text: "Dokonalá ochrana pre váš kufor za EXTRÉMNE zvýodnenu cenu!",
  }).appendTo(bannerWrap);
  $("<p>", {
    text: "Len teraz môžete pridať luxusné autokoberce do kufra alebo úložné boxy za výrazne zvýhodnenú cenu. Chráňte kufor Vášho vozidla pred nečistotami a majte všetko na mieste!",
  }).appendTo(bannerWrap);
  const timer = $("<div>", {
    class: "timer-wrap",
  }).appendTo(bannerWrap);
  $("<span>", {
    text: "Špeciálna ponuka končí za",
  }).appendTo(timer);

  const countdownSpan = $("<span>", {
    class: "countdown",
    text: "",
  }).appendTo(timer);

  $("<a>", {
    class: "btn",
    text: "Pridať so zľavou do objednávky!",
    href: "#",
  }).appendTo(bannerWrap);
  $("<div>", {
    class: "description",
    text: "Túto ponuku získate len pri tejto objednávke. Nepremeškajte šancu získať doplnky za najlepšiu cenu!",
  }).appendTo(bannerWrap);

  // Získání aktuálního času odpočtu ze sessionStorage nebo nastavení 30 minut
  let endTime = sessionStorage.getItem("timerEndTime");
  if (!endTime || new Date(endTime) < new Date()) {
    // Pokud není uložený čas nebo je již vypršel, nastavíme nový odpočet na 30 minut
    endTime = new Date(new Date().getTime() + 30 * 60 * 1000);
    sessionStorage.setItem("timerEndTime", endTime);
  } else {
    // Pokud je uložený čas platný, použijeme jej
    endTime = new Date(endTime);
  }

  // Aktualizace odpočtu každou sekundu
  function updateCountdown() {
    const now = new Date();
    const remainingTime = endTime - now;

    if (remainingTime <= 0) {
      countdownSpan.text("čas vypršel!");
      clearInterval(countdownInterval);
      sessionStorage.removeItem("timerEndTime");
    } else {
      const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);
      countdownSpan.text(`${minutes} min ${seconds} sec`);
    }
  }

  // Spustit aktualizaci odpočtu každou sekundu
  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function createUpsalePopup() {
  createPop();
  $(".ti-widget-container").addClass("upsale");
  $("<div>", {
    class: "h2",
    text: "Iba teraz za zvýhodnenú cenu!",
  }).appendTo(".ti-widget-container");
  $("<div>", {
    class: "description",
    text: " Doplňte svoju objednávku o kufrové koberčeky alebo úložné boxy s výraznou zľavou. Ponuka platí len chvíľu!",
  }).appendTo(".ti-widget-container");
  $("<div>", {
    class: "button btn open-upsale",
    text: "Využiť zvýhodnenú ponuku!",
  }).appendTo(".ti-widget-container");
  $("<div>", {
    class: "prefix",
    text: "Len počas tejto objednávky môžete získať koberčeky do kufra alebo úložné boxy za extrémne zvýhodnenú cenu. Chráňte a organizujte svoj kufor so štýlom!",
  }).appendTo(".ti-widget-container");

  $(".button.btn.open-upsale").on("click", function () {
    $(".overflow").remove();
    $(".upsale-wrap").addClass("active");
  });
}

function createUpsaleButton(img, text, position) {
  const button = $("<div>", {
    class: "upsale-button",
  }).appendTo(position);
  $("<img>", {
    src: img,
    alt: text,
  }).appendTo(button);
  $("<span>", {
    text: text,
  }).appendTo(button);
}
