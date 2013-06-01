define(function(require, exports, module) {
    var $ = require('jquery');
    $.fn.rotate = function( deg ){
        if( $.browser.msie && $.browser.version < 9 ){
            var $t = $( this );
            // use vml
            var vmlObj = $t.data('vml');
            if( !vmlObj ){
                vmlObj = $('<vml:image style="position:absolute;width:94px;height:94px;" class=vml src="./images/wheel-ie8.png" />')[0];
                $t.append(vmlObj);
                $t.data('vml' , vmlObj);
            }
            vmlObj.rotation = deg;
        }
    };

    $(function(){
        $('.end-wheel').rotate(40);
    });

});