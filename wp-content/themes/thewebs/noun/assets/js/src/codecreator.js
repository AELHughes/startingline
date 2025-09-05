// Custom JS
"use strict";
var n = jQuery.noConflict();
jQuery(window).on('load', function () {
    jQuery(".pageloader").fadeOut("slow");
});

// footer toggle

    jQuery(document).ready(function () {
        "use strict";
        FooterToggleBar();

        // Append CSS styles to the head
        var css = '<style>\
        footer .widget .wp-block-heading {\
            cursor: pointer; /* Add cursor pointer */\
        }\
        footer .widget .toggled-off ul, footer .widget .toggled-off .wp-block-gallery, footer .widget .toggled-off p, footer .widget .toggled-off form{\
            opacity: 0; /* Start with opacity 0 */\
            max-height: 0; /* Start with 0 max-height */\
            overflow: hidden; /* Hide content */\
            transition: opacity 0.7s ease-in-out, max-height 0.7s ease-in-out; /* Transition for opacity and max-height */\
        }\
        footer .widget .toggled-on ul, footer .widget .toggled-on .wp-block-gallery, footer .widget .toggled-on p, footer .widget .toggled-on form{\
            opacity: 1; /* Start with opacity 0 */\
            max-height: 1000px; /* Start with 0 max-height */\
            transition: opacity 0.7s ease-in-out, max-height 0.7s ease-in-out; /* Transition for opacity and max-height */\
        }\
        </style>';
        jQuery('head').append(css);
    });

    function toggleFunction() {
        var parent = jQuery(this).parent();
        parent.toggleClass('toggled-on toggled-off');
    }

    function FooterToggleBar() {
        if (window.innerWidth < 720) {
            jQuery('footer .widget .wp-block-heading').parent().removeClass('toggled-on').addClass('toggled-off');
            jQuery('footer .widget .wp-block-heading').off("click").on("click", toggleFunction);
        } else {
            jQuery('footer .widget .wp-block-heading').parent().removeClass('toggled-off').addClass('toggled-on');
            jQuery('footer .widget .wp-block-heading').off("click");
        }
    }

    window.addEventListener("resize", function () {
        FooterToggleBar();
    });

// End footer toggle