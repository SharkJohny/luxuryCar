export function initCart(texts) {
  console.log("Initializing cart with texts:", texts);
  console.log("Cart initialized");
  changeDescription();

  // Michal req 2026-05-18: po zmene/zmazani produktu v kosiku Shoptet AJAX-om
  // prekresli obsah — span.main-link-surcharges sa vyrenderuje surovy a
  // changeDescription() (formator priplatkovych parametrov) sa uz nespusti,
  // co rozhodi format. Riesenie: po ShoptetCartUpdated evente spravit reload.
  // ShoptetCartUpdated sa emituje IBA pri AJAX zmene kosika (nie pri page load),
  // takze reload je bezpecny — guard flag pre istotu proti loop-u.
  if (!window.__lcdCartReloadBound) {
    window.__lcdCartReloadBound = true;
    document.addEventListener("ShoptetCartUpdated", function () {
      if (window.__lcdCartReloading) return;
      window.__lcdCartReloading = true;
      location.reload();
    });
  }
  if ($(".id--9")[0]) {
    $(".cart-content.summary-wrapper").appendTo("div#cart-wrapper .col-md-8");
    $(".p-label:contains(Cena za m. j.)").text("Cena za set");

    chechCupon(texts);
    document.addEventListener("ShoptetDOMContentLoaded", function () {
      chechCupon(texts);
      $(".cart-content.summary-wrapper").appendTo("div#cart-wrapper .col-md-8");
      $(".p-label:contains(Cena za m. j.)").text("Cena za set");
    });

    $("button.btn.btn-secondary").click(function () {
      $(".messages").hide();
    });
  }
  const wheelPosition = sessionStorage.getItem("wheelPosition");
  const seatPosition = sessionStorage.getItem("seatPosition");
  const doorPosition = sessionStorage.getItem("doorPosition");
  $(
    `<input type="text" value="` +
      wheelPosition +
      `" id="varchar1" name="varchar1" class="form-control short js-validate   spellcheck="false" data-ms-editor="true">`
  ).appendTo(".co-billing-address");
  $(
    `<input type="text" value="` +
      seatPosition +
      `" id="varchar2" name="varchar2" class="form-control short js-validate   spellcheck="false" data-ms-editor="true">`
  ).appendTo(".co-billing-address");
  $(
    `<input type="text" value="` +
      doorPosition +
      `" id="varchar3" name="varchar3" class="form-control short js-validate   spellcheck="false" data-ms-editor="true">`
  ).appendTo(".co-billing-address");
}

function changeDescription() {
  const getBrand = sessionStorage.getItem("Brand");
  const getModel = sessionStorage.getItem("Model");
  const getYear = sessionStorage.getItem("Year");
  const getCarType = sessionStorage.getItem("carType");
  console.log("Changing description for cart items");
  $("span.main-link-surcharges").each(function () {
    const text = $(this).text().split(",");
    let newText = "";
    if (text.length > 1) {
      newText += "<ul>";
      $(text).each(function () {
        if (this.includes("TYP")) return;
        newText += "<li>" + this.replace(/P[rř][ií]platky:\s*/gi, "") + "</li>";
      });
      newText += "</ul>";
    }
    console.log(text);
    const infowrap = $("<div>").addClass("info-wrap");
    const model = $("<ul>").addClass("model").appendTo(infowrap);
    const setup = $("<div>").addClass("setup").appendTo(infowrap);
    $("<li>")
      .text("Značka: " + getBrand)
      .appendTo(model);
    $("<li  >")
      .text("Model: " + getModel)
      .appendTo(model);
    $("<li>")
      .text("Rok: " + getYear)
      .appendTo(model);
    $("<li>")
      .text("Typ: " + getCarType)
      .appendTo(model);
    // Farba 1. a 2. vrstvy z variantu (span.main-link-variant) - nad priplatkami.
    var $variant = $(this).closest("tr").find("span.main-link-variant").first();
    var variantText = ($variant.text() || "").replace(/\s+/g, " ");
    var m1 = variantText.match(/farba\s*1\.?\s*vrstvy\s*:\s*([^,]+)/i);
    var m2 = variantText.match(/farba\s*2\.?\s*vrstvy\s*:\s*(.+)$/i);
    if (m1) $("<li>").text("Farba 1. vrstvy: " + m1[1].trim()).appendTo(model);
    if (m2) $("<li>").text("Farba 2. vrstvy: " + m2[1].trim()).appendTo(model);
    $variant.hide();
    $("<span>").html(newText).appendTo(setup);
    $(this).html(infowrap);

    // $(this).html(newText);
  });
}

function chechCupon(texts) {
  console.log(texts);
  console.log("Checking coupon code in cart -----------------------");
  const getCode = shoptetData.cartInfo.discountCoupon.code;
  let chechCupon = false;
  if (getCode == "LUX10") {
    console.log("Checking coupon code:", getCode);
    $(".main-link-surcharges").each(function () {
      const $this = $(this);
      if (
        $this.text().includes("Farba boxov ") ||
        $this.text().includes("autokoberce do kufru - Jednoduché") ||
        $this.text().includes("Kompletní ochrana")
      ) {
        console.log("Coupon found in surcharge:", $this.text());
        chechCupon = true;
      }
    });
    // $(".applied-coupon input.btn.btn-sm.btn-primary").click();
  }

  if (!chechCupon) {
    if (!$(".alert.alert-warning")[0] && getCode == "LUX10") {
      setTimeout(function () {
        $(".cart-summary").before('<div class="alert alert-warning" role="alert">' + texts.cupon_message + "</div>");
      }, 1000);
    }
    console.log("Coupon code is not valid, applying changes");
    $(".applied-coupon input.btn.btn-sm.btn-primary").click();
  }
}
