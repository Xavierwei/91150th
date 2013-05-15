/*
 * jquery plugin for anination
 *  TODO  fade out
 */
!(function( $ ){
    var attrName = 'jq-effect';
    var animateClassName = 'jq-effect-running';
    var toJson = function(s){
            if(!s) return {};
            var arr = s.split(';') , result = {} , temp;
            for (var i = 0 , len = arr.length ; i<len;i++){
                temp = arr[i].split(':');
                result[temp[0]] = temp[1];
            }
            return result;
        }
    var effectHook = {
        'fadeUp' : function( pos ){
            return {
                opacity: 0,
                top : pos.top + pos.height
            }
        },
        "fadeLeft" : function( pos ){
            return {
                opacity: 0,
                left: pos.left + pos.width
            }
        },
        "fadeDown" : function( pos ){
            return {
                opacity: 0,
                top: pos.top - pos.height
            }
        },
        "fadeRight" : function( pos ){
            return {
                opacity: 0,
                left: pos.left - pos.width
            }
        }
    };
    var fMatch = /^([+-]?\d+%?)([ltrbwh])$/;
    var fCfg = {l:'left' , w: 'width' , h:'height' , t:'top' , r: 'right' , b:'bottom'};
    var initEffect = function( $dom , cb ) {
        var cfg = toJson( $dom.attr( attrName ) );

        var off = $dom.show().offset();
        var poff = $dom.offsetParent().offset();
        var pos = {
            left : off.left - poff.left,
            top : off.top - poff.top
        }
        $.extend( pos , {
            width : $dom.width(),
            height : $dom.height(),
            right : $dom.css('right'),
            bottom : $dom.css('bottom')
        } , true );

        // prepare animate config
        if( cfg.effect && effectHook[cfg.effect] ) {
            cfg.from = effectHook[cfg.effect]( pos );
        } else if ( cfg.from ) {
            var tmp = cfg.from.toLowerCase().split(/[, ]+/);
            cfg.from = {};
            $.each( tmp , function( i , v ){
                var t = null;
                if( t = v.match(fMatch) ){
                    cfg.from[ fCfg [ t [ 2 ] ] ] = t[1].match(/^\d+$/) ?
                         parseInt( t[1] ) : t[1];
                }
            } );
        }
        // run animate
        $dom.css( $.extend( cfg.from , { opacity: 0 } ) );

        var tar = { };
        $.each( cfg.from || [] , function( k , v ){
            tar[ k ] = pos [ k ];
        });
        $.extend( tar , {opacity:1} );
        $dom.delay( cfg.delay || 0 )
            .animate( tar
                , parseInt( cfg.duration ) || 500
                , cfg.easing
                , function(){
                    // remove added class name
                    $dom.removeClass( animateClassName );
                    // run callback
                    cb && cb.call(this);
                });

        // add animate class name
        setTimeout(function(){
            // add class name
            $dom.addClass( animateClassName );
        } , cfg.delay || 0 );
    }
    $.fn.effect = function( cb ){

        $(this).each(function(){
            initEffect( $( this )  , cb );
        });

        return this;
    }
})( window.jQuery );