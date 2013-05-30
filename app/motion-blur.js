define(function( require , exports , model ){
    /*
     * 动感模糊
     */
    function motionBlur( pixes , newPix , radius , offset , startline ,  cb ){
        if( radius == 0 ) {
            for (var i = 0 , len = pixes.data.length ; i < len; i++) {
                newPix.data[ i ] = pixes.data[ i ];
            }
            cb && cb( newPix );
            return;
        }
        startline = startline || 0;
        offset = offset || 0;
        var r = radius;
        var lhalf = Math.floor( r / 2 ) + offset;
        var rhalf = radius - lhalf;
        var m = pixes.height;
        var n = pixes.width;
        var first , total , curr , k , imgMatrix;
        var time = +new Date();

        for(var  i = startline ; i < m ; i ++ ){

            if( new Date() - time  > 13 ){
                setTimeout(function(){
                    motionBlur( pixes , newPix , radius , offset , i ,  cb );
                }, 13 );
                return;
            }
            // reset
            imgMatrix = [];
            total = [ 0 , 0 , 0 , 0 ];
            for (var j = 0 ; j < rhalf ; j ++ ){
                k = ( i * n + j ) * 4;
                imgMatrix.push( [pixes.data[ k ] , pixes.data[ k + 1 ] , pixes.data[ k + 2 ] , pixes.data[ k + 3 ]] );
                total = [total[0] + pixes.data[ k ] ,
                    total[1] + pixes.data[ k + 1 ] ,
                    total[2] + pixes.data[ k + 2 ] ,
                    total[3] + pixes.data[ k + 3 ]];
            }

            for (var j = 0 ,  len , t ; j < n ; j ++ ){

                if( j >= lhalf ){
                    first = imgMatrix.shift();
                } else {
                    first = [0 ,0 ,0 ,0];
                }
                k = ( i * n + j ) * 4;
                t = k + rhalf * 4;
                if( j + rhalf < n && t >= 0 ){
                    curr = [ pixes.data[ t ] , pixes.data[ t + 1 ] , pixes.data[ t + 2 ] , pixes.data[ t + 3 ] ];
                    imgMatrix.push( curr );
                } else {
                    curr = [ 0 , 0 , 0 , 0 ];
                }
                total = [ total[0] - first[0] + curr[0] ,
                    total[1] - first[1] + curr[1] ,
                    total[2] - first[2] + curr[2] ,
                    total[3] - first[3] + curr[3] ];

                len = imgMatrix.length;
                newPix.data[ k ] = ~~ total[ 0 ] / len;
                newPix.data[ k + 1 ] = ~~ total[ 1 ] / len;
                newPix.data[ k + 2 ] = ~~ total[ 2 ] / len;
                newPix.data[ k + 3 ] = ~~ total[ 3 ] / len;
            }
        }
        cb && cb( newPix );
    }

    var getImageCanvas = function( img ){
        var canKey = 'can-' + img.id;

        if( cache[ canKey ] )
            return cache[ canKey ] ;
        var canvas = document.createElement('canvas');
        // append to document
        img.nextSibling ? img.parentNode.insertBefore( canvas , img ) :
            img.parentNode.appendChild( canvas );

        canvas.id = 'can-' + img.id;
        if( img.width && img.height ){
            renderCanvasWidthAndHeight();
        } else {
            img.addEventListener( 'load' , renderCanvasWidthAndHeight , false );
        }
        function renderCanvasWidthAndHeight( ){
            canvas.width = img.width;
            canvas.height = img.height;
            img.style.display = 'none';
        }

        cache[ canKey ] = canvas;
        return canvas;
    }
    var getImageData = function( img ){
        var id = img.id;
        var pixData = cache[ id ];
        if( !pixData ){
            can.width = img.width;
            can.height = img.height;
            ctx.drawImage( img , 0 , 0 );
            pixData = ctx.getImageData( 0 , 0 , img.width , img.height );
            cache[ id ] = pixData;
            cache[ 'src-' + id ] = img.getAttribute('src');
        }
        return pixData;
    }


    var can = null;
    var ctx = null;
    // Detect canvas support
    var isSupportCanvas = (function(){
        can = document.createElement('canvas');
        ctx = can.getContext ? can.getContext('2d') : false;
        return !!ctx;
    })();


    var cache = {};

    exports.motionBlur = function( img , radius , offset , useCanvas , onlyCache ){
        if( !isSupportCanvas ) return;

        offset = offset || 0;
        // get image id
        var id = img.getAttribute('id');
        if( !id ){
            id = 'can-img-' + ( +new Date());
            img.setAttribute( 'id' , id );
        }
        // get pixdata
        var pixData = getImageData( img );
        var newData = ctx.createImageData( pixData.width , pixData.height );
        var pixCacheKey = [ 'pix' , radius  , offset , id ].join('-');
        var callback = function( newData ){
            cache[ pixCacheKey ] = newData;
            // if onlyCache return directly
            if( onlyCache ) return;
            if( typeof useCanvas === 'object' &&
                useCanvas.tagName == 'CANVAS' ){
                var w = useCanvas.width;
                var h = useCanvas.height;
                var iw = newData.width;
                var ih = newData.height;
                var tmpctx = useCanvas.getContext('2d');
                for( var i = 0 ; i < w ; i += iw ){
                    for (var j = 0 ; j < h; j += ih) {
                        tmpctx.putImageData( newData , i , j );
                    }
                }
                useCanvas.getContext('2d').putImageData( newData , 0 , 0 );
            } else if ( useCanvas ){
                var tCan = getImageCanvas( img );
                tCan.getContext('2d').putImageData( newData , 0 , 0 );
            } else {
                can.width = newData.width;
                can.height = newData.height;
                ctx.putImageData( newData , 0 , 0 );
                img.setAttribute( 'osrc' , cache[ 'src-' + id ] );
                img.setAttribute( 'src' , can.toDataURL() );
            }
        }

        // get from cache
        if( cache[ pixCacheKey ] ){
            callback( cache[ pixCacheKey ] );
        } else {
            // motion blur image
            motionBlur( pixData , newData , radius , offset , 0 , callback );
        }
    }

    exports.isSupportCanvas = isSupportCanvas;
    exports.getMotionCache = function(){
        return cache;
    }
});