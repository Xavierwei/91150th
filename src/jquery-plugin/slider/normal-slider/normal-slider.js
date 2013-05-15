/*
 * jquery slider plugin
 *
 */
!(function( $ ){

    var defaultConfig = {
        width: 100,
        height: 200,
        wrap: '#slide-wrap',
        thumbShowNum : 5
    }

    $.fn.slider = function ( cfg ) {
        // combine cfg
        cfg = $.extend( {} , defaultConfig , cfg );
        // render
    };
})(window.jQuery);