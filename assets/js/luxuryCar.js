jQuery(document).ready(function($) {

    dinamicPictures()
    initHeader()
    initModelSelect()
    intIndex()
    initSignpost()
    initProduct()
});

function intIndex() {

    $(".twentytwenty-container").twentytwenty({
        before_label: 'Befosre',
        after_label: 'Aftsser',
        move_slider_on_hover: true,

    });


    $('.btn.choice-Model').on('click', function() {

        const Brand = $('.surcharge-list.brands.dm-selector select').val()
        const Model = $('.surcharge-list.models.dm-selector select').val()
        const Year = $('.surcharge-list.years.dm-selector select').val()
        console.log(Brand + ' ' + Model + ' ' + Year)
        sessionStorage.setItem('model', Brand + ' ' + Model + ' ' + Year)
        window.location.href = '/rozcestnik/'
    })

}

function dinamicPictures() {
    var sections = $('.text-block');
    var dynamicImage = $('#dynamic-image');

    function changeImage() {
        var currentSection = null;

        sections.each(function() {
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
            var newImageSrc = currentSection.data('picture');

            if (dynamicImage.attr('src') !== newImageSrc) {
                // Přidání přechodového efektu
                dynamicImage.css('opacity', 0);

                setTimeout(function() {
                    dynamicImage.attr('src', newImageSrc);
                    dynamicImage.css('opacity', 1);
                }, 500); // Doba trvání přechodu musí odpovídat CSS přechodu
            }
        }
    }

    $(window).on('scroll', changeImage);
    changeImage(); // Inicializace při načtení stránky
}

function initHeader() {
    $(".top-navigation-bar-menu-helper").empty();
    $("ul.top-navigation-bar-menu li")
        .addClass("cropped")
        .clone()
        .appendTo(".top-navigation-bar-menu-helper");

    $(".navigation-buttons .cart-count span:contains(košík)").text("Košík");

    $(
        '<a href="#" class="toggle-window" data-target="search" data-testid="linkSearchIcon"></a>'
    ).prependTo(".desktop  .navigation-buttons");
}


function initModelSelect() {
    const section = $('<section>', {
        id: 'model-selector'
    }).insertAfter('.in-index .content-wrapper.container:eq(1)')
    const container = $('<div>', {
        class: 'model-selector container',
    }).appendTo(section)
    $('<h2>').text('Obchod pro tvoje Auto').appendTo(container)
    const choiceWrap = $('<div>').addClass('modl-selector-wrap').appendTo(container)
    const znacka = `
        <div class="surcharge-list brands dm-selector">
            <div class='label'>` + cstm_znacka.at(0) + `</div>
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_znacka.at(1) + `</option>
                </select>
            </div>
        </div>
        `

    const model = `
        <div class="surcharge-list models dm-selector">
            <div class='label'>` + cstm_model.at(0) + `</div>
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_model.at(1) + `</option>
                </select>
            </div>
        </div>
        `

    const rocnik = `
        <div class="surcharge-list years dm-selector">
            <div class='label'>` + cstm_rocnik.at(0) + `</div>
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_rocnik.at(1) + `</option>
                </select>
            </div>
        </div>
        `

    const type = `
        <div class="surcharge-list type dm-selector">
            <div class='label'>` + cstm_type.at(0) + `</div>
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_type.at(1) + `</option>
                </select>
            </div>
        </div>
        `
    const button = `<div class='btn choice-Model'>Zvolit model</div>`

    $(znacka + model + rocnik + button).appendTo(choiceWrap)

    for (let i = 0; i < types.length; i++) {
        $("<option>" + types[i] + "</option>").appendTo(".type select")
    }

    const cars = car_json.cars;
    const numberOfBrands = Object.keys(cars).length;
    const brands = Object.keys(cars);
    for (let i = 0; i < numberOfBrands; i++) {
        $("<option>" + brands[i] + "</option>").appendTo(".brands select")
    }
    const d = new Date();
    const currentYear = d.getFullYear();
    for (let year = Number(years_from); year <= currentYear; year++) {
        $("<option>" + year + "</option>").appendTo(".years select")
    }

    const other_option = "<option>" + other + "</option>"
    $(other_option).appendTo(".type select")
    $(other_option).appendTo(".years select")

    $(".brands select").on("change", function() {
        if ($(this).val() === cstm_znacka.at(1)) {
            $(".models option:not(.notselect)").remove()
        } else {
            $(".models option:not(.notselect)").remove()
            const models_for_brand = car_json.cars[$(this).val()];
            for (let i = 0; i < models_for_brand.length; i++) {
                $("<option>" + models_for_brand.at(i) + "</option>").appendTo(".models select")
            }
        }
    })
}

function initSignpost() {
    const model = sessionStorage.getItem('model')
    $('section#Model-selecte .model span').text(model)
}


function initProduct() {
    priplatky()
}

function priplatky() {
    if ($(".type-detail").length) {
        $(".surcharge-list td option").each(function() {
            var defoption = $(this).html()
            let newtxt = defoption.replace(" +€0", '');
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