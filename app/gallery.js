/*
 * main model
 */
define(function(require, exports, module) {

    // require jquery ani plugin
    require('jquery.queryloader');
    require('jquery.easing');
    require('modernizr');

    $('.photo').each(function(i){
        var left = (i%3)*360;
        var top = parseInt(i/3)*219;
        if(parseInt(i/3) == 1)
        {
            left -= 79;
        }
        $(this).css({left:left,top:top});
    });
});