/*
 * main model
 */
define(function(require, exports, module) {

    // require jquery ani plugin
    require('jquery.fancybox');

    $('.photo').each(function(i){
        var left = (i%3)*360;
        var top = parseInt(i/3)*219;
        if(parseInt(i/3) == 1)
        {
            left -= 79;
        }
        $(this).css({left:left,top:top});
    });

    $('.photo a').fancybox({
        openMethod : 'dropIn',
        padding: 0,
        playSpeed: 2000,
        tpl: {
            wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><a target="_blank" class="fancybox-download"></a><div class="fancybox-share"></div><div class="fancybox-inner"></div></div></div></div>'
        },
        afterShow: function(){
            $('.fancybox-download').attr('href',$(this).attr('href'));
        }
    });

    (function ($, F) {
        F.transitions.dropIn = function() {
            var endPos = F._getPosition(true);
            endPos.opacity = 0;
            endPos.top = (parseInt(endPos.top, 10) - 400) + 'px';

            F.wrap.css(endPos).show().animate({
                top: '+=400px',
                opacity: 1
            }, {
                duration: F.current.openSpeed,
                complete: F._afterZoomIn
            });
        };

        F.transitions.dropOut = function() {
            F.wrap.removeClass('fancybox-opened').animate({
                top: '-=200px'
            }, {
                duration: F.current.closeSpeed,
                complete: F._afterZoomOut
            });
        };

    }(jQuery, jQuery.fancybox));
});
