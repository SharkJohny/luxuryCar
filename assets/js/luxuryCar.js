jQuery(document).ready(function($) {
    intIndex()
    dinamicPictures()
    initHeader()
});

function intIndex() {

    $(".twentytwenty-container").twentytwenty({
        before_label: 'Befosre',
        after_label: 'Aftsser',
        move_slider_on_hover: true,

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