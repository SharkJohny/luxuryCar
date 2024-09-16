$(document).ready(function() {
    poznamka();
    priplatky();
    barva();
    kontakt_detail();
})

document.addEventListener('ShoptetCartUpdated', function() {
    if ($(".type-detail").length) {
        setTimeout(() => {
            fill_textarea();
        }, 300);
    }
})

function kontakt_detail() {
    if ($(".type-detail").length) {
        /*
        var kontakt_detail_nadpis = "Chcete se k produktu na něco zeptat?"
        var kontakt_detail_popis = "Zavolejte nebo napište, rádi Vám odpovíme na všechny dotazy"
        var kontakt_detail_foto = "/user/documents/upload/logo.jpg"
        var kontakt_detail_jmeno = "Michal Švancár"
        */

        var kontakt_detail_mail = $("#footer .mail a").text().trim()
        var kontakt_detail_phone = $("#footer .tel a").text().trim()

        var contact_div = `
        <div class="contact-us">
            <div class="contact-us-container">
                <div class="title-section">
                    <h3>` + kontakt_detail_nadpis + `</h3>
                    <p>` + kontakt_detail_popis + `</p>
                </div>
                <div class="us-details-section">
                    <div class="us-photo">
                        <img src="` + kontakt_detail_foto + `" alt="">
                    </div>
                    <div class="us-contact">
                        <h4>` + kontakt_detail_jmeno + `</h4>
                        <a class="phone" href="tel:` + kontakt_detail_phone + `">` + kontakt_detail_phone + `</a>
                        <a class="email" href="mailto:` + kontakt_detail_mail + `">` + kontakt_detail_mail + `</a>
                    </div>
                </div>
            </div>
        </div>    
        `
        $(contact_div).insertAfter(".p-to-cart-block")
    }
}

function custom_select_cars() {
    if (
        $(".type-detail").length &&
        $("#dkLabNoteDetailWrapper>div").length > 1
    ) {
        $(".surcharge-list th:contains(" + cstm_typ[0] + ")").parent().find("option:first").text(cstm_typ[1])

        var znacka = `
        <tr class="surcharge-list brands dm-selector">
            <th>` + cstm_znacka.at(0) + `</th>
            <td>
                <select required="required">
                    <option class='notselect'>` + cstm_znacka.at(1) + `</option>
                </select>
            </td>
        </tr>
        `

        var model = `
        <tr class="surcharge-list models dm-selector">
            <th>` + cstm_model.at(0) + `</th>
            <td>
                <select required="required">
                    <option class='notselect'>` + cstm_model.at(1) + `</option>
                </select>
            </td>
        </tr>
        `

        var rocnik = `
        <tr class="surcharge-list years dm-selector">
            <th>` + cstm_rocnik.at(0) + `</th>
            <td>
                <select required="required">
                    <option class='notselect'>` + cstm_rocnik.at(1) + `</option>
                </select>
            </td>
        </tr>
        `

        var type = `
        <tr class="surcharge-list type dm-selector">
            <th>` + cstm_type.at(0) + `</th>
            <td>
                <select required="required">
                    <option class='notselect'>` + cstm_type.at(1) + `</option>
                </select>
            </td>
        </tr>
        `

        $(znacka + model + rocnik + type).appendTo(".p-variants-block .detail-parameters")
        $(".surcharge-list:not(.dm-selector)").appendTo(".p-variants-block .detail-parameters")

        for (var i = 0; i < types.length; i++) {
            $("<option>" + types[i] + "</option>").appendTo(".type select")
        }

        var cars = car_json.cars;
        var numberOfBrands = Object.keys(cars).length;
        var brands = Object.keys(cars);
        for (var i = 0; i < numberOfBrands; i++) {
            $("<option>" + brands[i] + "</option>").appendTo(".brands select")
        }

        var d = new Date();
        var currentYear = d.getFullYear();
        for (var year = Number(years_from); year <= currentYear; year++) {
            $("<option>" + year + "</option>").appendTo(".years select")
        }

        var other_option = "<option>" + other + "</option>"
        $(other_option).appendTo(".type select")
        $(other_option).appendTo(".years select")

        $(".brands select").on("change", function() {
            if ($(this).val() === cstm_znacka.at(1)) {
                $(".models option:not(.notselect)").remove()
            } else {
                $(".models option:not(.notselect)").remove()
                var models_for_brand = car_json.cars[$(this).val()];
                for (var i = 0; i < models_for_brand.length; i++) {
                    $("<option>" + models_for_brand.at(i) + "</option>").appendTo(".models select")
                }
            }
        })

        $(".dm-selector").on("change", fill_textarea)
    }
}

function fill_textarea() {
    var car_type_detail = ""
    var allSelected = true;
    $("#dkLabNoteDetailWrapper>div:nth-last-child(1):not(:nth-child(1)) textarea").val("")

    $(".dm-selector").each(function() {
        if ($(this).find("option:selected").hasClass("notselect")) {
            allSelected = false;
            $(".p-add-to-cart-wrapper .add-to-cart-button").removeClass("dmready")
            $("#dkLabNoteDetailWrapper>div:nth-last-child(1):not(:nth-child(1)) textarea").val("")
            initTooltips();
            return false;
        }
    });

    if (allSelected) {
        $(".dm-selector select").each(function() {
            car_type_detail = car_type_detail + $(this).val() + ", "
        });

        if (String(car_type_detail) === "") {} else {
            $("#dkLabNoteDetailWrapper>div:nth-last-child(1):not(:nth-child(1)) textarea").val("")
            $("#dkLabNoteDetailWrapper>div:nth-last-child(1):not(:nth-child(1)) textarea").val(car_type_detail)
            $(".p-add-to-cart-wrapper .add-to-cart-button").addClass("dmready")
            initTooltips();
        }
    }
}

function poznamka() {
    if ($(".type-detail").length) {
        const myInterval = setInterval(myTimer, 100);

        function myTimer() {
            if ($('#dkLabNoteMainWrapper').length) {
                $('#dkLabNoteMainWrapper').appendTo(".p-basic-info-block")
                $('.dkLabNoteDiv').appendTo(".p-basic-info-block")
                myStopFunction();
                custom_select_cars();
                fill_textarea();
            }
        }

        function myStopFunction() {
            clearInterval(myInterval);
        }
    }
}

function priplatky() {
    if ($(".type-detail").length) {
        $(".surcharge-list td option").each(function() {
            var defoption = $(this).html()
            newtxt = defoption.replace(" +€0", '');
            newtxt = newtxt.replace(" +0 Kč", '');
            newtxt = newtxt.replace(" +0 €", '');
            $(this).text(newtxt)
        });

        if ($("html[lang='cs']").length) {
            $(".p-variants-block .surcharge-list:contains('Velikost boxu') option[data-index='0']").text("Zvolte velikost boxu")
            $(".p-variants-block .surcharge-list:contains('Rozměr 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Rozměr boxu') option[data-index='0']").text("Zvolte velikost boxu")
            $(".p-variants-block .surcharge-list:contains('Velikost 2. Boxu') option[data-index='0']").text("Zvolte velikost 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Barva boxu') option[data-index='0']").text("Zvolte barvu boxu")
            $(".p-variants-block .surcharge-list:contains('Barva 2. boxu') option[data-index='0']").text("Zvolte barvu 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Umístění volantu') option[data-index='0']").text("Prosím, vyberte umístění volantu")
        }
        if ($("html[lang='sk']").length) {
            $(".p-variants-block .surcharge-list:contains('Veľkosť boxu') option[data-index='0']").text("Zvoľte veľkosť boxu")
            $(".p-variants-block .surcharge-list:contains('Rozmer 2. Boxu') option[data-index='0']").text("Zvoľte veľkosť 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Rozmer boxu') option[data-index='0']").text("Zvoľte veľkosť boxu")
            $(".p-variants-block .surcharge-list:contains('Veľkosť 2. Boxu') option[data-index='0']").text("Zvoľte veľkosť 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Farba boxu') option[data-index='0']").text("Zvoľte farbu boxu")
            $(".p-variants-block .surcharge-list:contains('Farba 2. boxu') option[data-index='0']").text("Zvoľte farbu 2.boxu")

            $(".p-variants-block .surcharge-list:contains('Umiestenie volantu') option[data-index='0']").text("Prosím,vyberte umiestnenie volantu")
        }
    }
}

function barva() {
    if (
        $(".type-detail").length
    ) {
        if (
            $("html[lang='sk'] .parameter-id-4").length ||
            $("html[lang='sk'] .parameter-id-71").length ||
            $("html[lang='sk'] .parameter-id-78").length ||
            $("html[lang='cs'] .parameter-id-15").length ||
            $("html[lang='cs'] .parameter-id-44").length ||
            $("html[lang='cs'] .parameter-id-51").length
        ) {

            if ($("html[lang='sk']").length) {
                var parameterid = ["4", "71", "78"]
            } else if ($("html[lang='cs']").length) {
                var parameterid = ["15", "44", "51"]
            }

            for (var i = 0; i < parameterid.length; i++) {
                if ($(".parameter-id-" + parameterid[i]).length) {
                    $(".parameter-id-" + parameterid[i] + " .advanced-parameter").addClass("firecolor")
                    $("<tr class='barvybig'><td colspan='1000'><div class='select_colors'></div></td></tr>").insertAfter($(".parameter-id-" + parameterid[i]).parent().parent())

                    $(".parameter-id-" + parameterid[i] + " .advanced-parameter").each(function() {
                        var val = $(this).find("input").val()

                        var img_src = $(this).find("img").attr("src")
                        img_src = img_src.split("/")
                        var last = img_src.length
                        img_src = img_src[last - 1]
                        img_src = img_src.replace("-1.jpg", ".jpg")

                        $("<div class='" + val + "'><img src='/user/documents/upload/farby/" + img_src + "'><div>").appendTo($(".parameter-id-" + parameterid[i]).parent().parent().find("+tr.barvybig .select_colors"))
                    })
                }
            }

            $(".firecolor").on("click", function() {
                $(this).closest(".variant-list").find("+tr.barvybig").show()

                var val = $(this).find("input").val()
                $(this).closest(".variant-list").find("+tr.barvybig .select_colors div").removeClass("active")
                $(this).closest(".variant-list").find("+tr.barvybig .select_colors div." + val).addClass("active")
            })
        }
    }
}