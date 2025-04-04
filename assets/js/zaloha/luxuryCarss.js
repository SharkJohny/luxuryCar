    const timestamp = Date.now();

    const downloadData = '/user/documents/upload/data.json?' + timestamp
    let setupData
    $.getJSON(downloadData, function(data) {
        setupData = data
    })


    const logoGoogle =
        '<svg viewBox="0 0 512 512" height="18" width="18"><g fill="none" fill-rule="evenodd"><path d="M482.56 261.36c0-16.73-1.5-32.83-4.29-48.27H256v91.29h127.01c-5.47 29.5-22.1 54.49-47.09 71.23v59.21h76.27c44.63-41.09 70.37-101.59 70.37-173.46z" fill="#4285f4"></path><path d="M256 492c63.72 0 117.14-21.13 156.19-57.18l-76.27-59.21c-21.13 14.16-48.17 22.53-79.92 22.53-61.47 0-113.49-41.51-132.05-97.3H45.1v61.15c38.83 77.13 118.64 130.01 210.9 130.01z" fill="#34a853"></path><path d="M123.95 300.84c-4.72-14.16-7.4-29.29-7.4-44.84s2.68-30.68 7.4-44.84V150.01H45.1C29.12 181.87 20 217.92 20 256c0 38.08 9.12 74.13 25.1 105.99l78.85-61.15z" fill="#fbbc05"></path><path d="M256 113.86c34.65 0 65.76 11.91 90.22 35.29l67.69-67.69C373.03 43.39 319.61 20 256 20c-92.25 0-172.07 52.89-210.9 130.01l78.85 61.15c18.56-55.78 70.59-97.3 132.05-97.3z" fill="#ea4335"></path><path d="M20 20h472v472H20V20z"></path></g></svg>';

    jQuery(document).ready(function($) {
        setTimeout(function() {
            console.log(setupData)
            initModelSelect()
            googleReviews()

        }, 200)
        dinamicPictures()
        initHeader()

        intIndex()
        initSignpost()
        initProduct()

    });

    function intIndex() {

        setTimeout(function() {}, 4000)
        $(".twentytwenty-container").twentytwenty({
            before_label: 'Předtím',
            after_label: 'Potom',


        });



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
        let insertPosidion = '.in-index .content-wrapper.container:eq(1)'
        if ($('.type-product')[0]) {
            insertPosidion = '.overflow .model-select .h3'
        }

        const section = $('<section>', {
            id: 'model-selector'
        }).insertAfter(insertPosidion)
        const container = $('<div>', {
            class: 'model-selector container',
        }).appendTo(section)
        if ($('.in-index')[0]) {
            $('<h2>').text('Obchod pro tvoje Auto').appendTo(container)
        }
        const choiceWrap = $('<div>').addClass('modl-selector-wrap').appendTo(container)
        const znacka = `
        <div class="surcharge-list brands dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_znacka[0] + `</option>
                </select>
            </div>
        </div>
        `

        const model = `
        <div class="surcharge-list models dm-selector">
          
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_model[0] + `</option>
                </select>
            </div>
        </div>
        `

        const rocnik = `
        <div class="surcharge-list years dm-selector">
            
            <div class='selector'>
                <select required="required">
                    <option class='notselect'>` + cstm_rocnik[0] + `</option>
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

        const cars = setupData.cars;

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


        $('.btn.choice-Model').on('click', function() {

            const Brand = $('.surcharge-list.brands.dm-selector select').val()
            const Model = $('.surcharge-list.models.dm-selector select').val()
            const Year = $('.surcharge-list.years.dm-selector select').val()
            console.log(Brand + ' ' + Model + ' ' + Year)
            sessionStorage.setItem('model', Brand + ' ' + Model + ' ' + Year)

            if ($('.in-index')[0]) {
                window.location.href = '/rozcestnik/'
            } else {
                location.reload();
            }
        })
    }

    function initSignpost() {
        const model = sessionStorage.getItem('model')
        $('section#Model-selecte .model span').text(model)
    }


    function initProduct() {
        const model = sessionStorage.getItem('model')

        if (model != null) {
            $('<div>', {
                class: 'model',
                text: 'Pro auto ' + model,

            }).insertAfter('.availability-value')
        } else {
            const modelWrap = $('<div>', {
                class: 'choice-model'
            }).insertAfter('.availability-value')
            $('<div>', {
                class: 'button btn select-model',
                text: 'Zvolte model',
            }).appendTo(modelWrap)
        }




        priplatky()

        $('.button.btn.select-model').on('click', function() {
            const overflow = $('<div>', {
                class: 'overflow',
                style: 'position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;'

            }).appendTo('body')

            const popup = $('<div>', {
                class: 'model-select',
                style: 'position: relative; background-color: #fff; padding: 20px;'
            }).appendTo(overflow)

            $('<div>', {
                class: 'h3',
                text: 'Vyberte model',
            }).appendTo(popup)
            initModelSelect()
        })


        $('select.parameter-id-38.surcharge-parameter').val('248').trigger('change');
    }

    function priplatky() {
        if ($(".type-detail").length) {
            const optionWrap = $('<div>', {
                    id: 'options-wrap'
                }).insertAfter('table.detail-parameters')
                // $('table.detail-parameters').hide()
            let orders = 0
            $('.detail-parameters .variant-list select').each(function() {

                orders += 1
                const position = this
                createOptions(position, orders)
            })
            $('.detail-parameters .surcharge-list select').each(function() {
                const value = $(this).attr('data-parameter-id')
                console.log(value)
                if (value == 22) return
                orders += 1
                const position = this
                createOptions(position, orders)
            })


            $('.button.option-button').on('click', function() {
                $('body').removeClass('disabled-add-to-cart')
                const value = $(this).attr('data-value')
                const vatiant = $(this).attr('data-variant')

                console.log(value + '/' + vatiant)
                $('.parameter-id-' + vatiant).val(value)
                shoptet.surcharges.updatePrices()
            })

            // $(".surcharge-list td option").each(function() {
            //     var defoption = $(this).html()

            //     let newtxt = defoption.replace(" +€0", '');
            //     newtxt = newtxt.replace(" +0 Kč", '');
            //     newtxt = newtxt.replace(" +0 €", '');
            //     $(this).text(newtxt)
            // });

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



    function createOptions(position, orders) {

        let name = $(position).parents('.variant-list').find('th').text().trim()
        if (name == '') {
            name = $(position).parents('.surcharge-list').find('th').text().trim().replace('?', '')
        }
        let optPosition = '#options-wrap'
        if (orders == 4) {

            const wrapOwerflow = $('<div>', {
                class: 'pop-ower'
            }).appendTo('#options-wrap')
            const popup = $('<div>', {
                class: 'pop-up-options',
            }).appendTo(wrapOwerflow)
            $('<div>', {
                class: 'close-btn',
                text: '+'
            }).appendTo(popup)
            $('<div>', {
                class: 'btn button-more',
                text: 'Něco navíc?'
            }).appendTo('#options-wrap')

        }
        if (orders > 3) {
            optPosition = '.pop-up-options'
        }


        $('.btn.button-more').on('click', function() {
            $('.pop-ower').addClass('show')
        })
        $('.close-btn').on('click', function() {
            $('.pop-ower').removeClass('show')
        })
        console.log(name)
        const options = $(position).find('option')
        console.log(options)
        const parameterId = $(position).attr('data-parameter-id')
        console.log(parameterId)

        const paramerer = $('<div>', {
            class: 'parameter-wrap parameter-' + parameterId
        }).appendTo(optPosition)
        $('<div>', {
            class: 'order',
            text: orders
        }).appendTo(paramerer)
        $('<div>', {
            class: 'h4 variant name',
            text: name

        }).appendTo(paramerer)
        const optionsWrap = $('<div>', {
            class: 'options-wrap'
        }).appendTo(paramerer)

        $(options).each(function() {
            const value = $(this).val()
            console.log(value)
            const textOption = $(this).text()
            if (value == '') return
            const optionButton = $('<div>', {
                class: 'button option-button',
                'data-value': value,
                'data-variant': parameterId
            }).appendTo(optionsWrap)
            $('<div>', {
                text: textOption,
                class: 'text'
            }).appendTo(optionButton)
            $('<img>', {
                alt: parameterId + '-' + value + '.jpg',
                src: '/user/documents/upload/assets/variants/' + parameterId + '-' + value + '.jpg?5',

            }).appendTo(optionButton)
        })
    }


    function googleReviews() {
        console.log('review')
        $("<section/>")
            .attr("id", "goggle-review-wrap")
            .appendTo(".model-selector.container");

        $("<section/>")
            .attr("id", "goggle-review-wrap")
            .insertBefore(".type-product footer");


        // $(
        //     '<div class="header-rewiew"><h3> Děkujeme za Vaše recenze</h3></div>'
        // ).appendTo("#goggle-review-wrap");

        const review = $("<div/>")
            .addClass("review-row")
            .appendTo("#goggle-review-wrap");

        $(`<div class="ti-widget-container"> <a href="#dropdown" class="ti-header source-Google" data-subcontent="1" data-subcontent-target=".ti-dropdown-widget"> <div class="ti-small-logo"> <img src="https://cdn.trustindex.io/assets/platform/Google/logo.svg" loading="lazy" alt="Google"  height="25"> </div><div class="review-stars"><ul><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li><li><i class="star"></i></li></ul></div> <div class="ti-mob-row"> <span class="nowrap"><strong>` +
            numberReviews + ` recenzí</strong></span> <span class="ti-arrow-down"></span> </div> </a> </div>`).appendTo(review);
        $("<div/>").attr("id", "google-reviews").appendTo(review);

        $(".js-navigation-container").insertAfter(".site-name");
        $(".contact-box.no-image").clone().appendTo(".top-navigation-menu");
        $('a.ti-header.source-Google').on('click', function() {
            createPopUp()
        })

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
    </div>`).appendTo('.model-selector.container');

        if ($(".ti-reviews-container-wrapper").length == 0) {
            return;
        }

        // Find a placeID via https://developers.google.com/places/place-id
        $(".ti-reviews-container-wrapper").googlePlaces({
            placeId: "ChIJcRYHIStjj4wRIHx41hbkAtc", // Zadej své Place ID
            header: "", // HTML/text nad recenzemi
            footer: `<a href="https://search.google.com/local/reviews?placeid=ChIJcRYHIStjj4wRIHx41hbkAtc" target="_blank" class="more-reviews-button">Show More Reviews</a>`, // Odkaz na více recenzí
            maxRows: 5, // max. počet recenzí k zobrazení (Google API omezuje na 5)
            minRating: 3, // minimální hodnocení recenzí
            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            textBreakLength: "90", // délka textu recenze
            shortenNames: true, // zkrácení jmen
            moreReviewsButtonLabel: 'Více recenzí',
            showProfilePicture: true, // zobrazení profilové fotografie
        });
        $('a.ti-close-lg').on('click', function() {
            $('.ti-dropdown-widget').remove()
        })
    }