/*
data.dolist = [{
    id : 'id',
    pixData: {pixData},
    radius: [1,2,3,4,5,6,7]
},{
    id : 'id',
    pixData: {},
    radius: [1,2,3,4,5,6,7]
}]

// only cache the array data

result = {
    'pix-%radius%-%offset%-%id%': [],
    'pix-%radius%-%offset%-%id%': [],
    'pix-%radius%-%offset%-%id%': []
}
 */
onmessage = function( ev ){
    var dolist = ev.data.dolist
     ,  result = {}
     ,  data
     ,  radius
     ,  pixData
     ,  key
     ,  pixArr;
    for (var i = dolist.length - 1; i >= 0; i--) {
        data = dolist[ i ];

        radius = isArray( data.radius ) ? data.radius : [ data.radius ] ;
        pixData = data.pixData;
        newPixData = data.newPixData;
        for (var j = radius.length - 1; j >= 0; j--) {
            pixArr = motionBlur( pixData , radius[j] );
            // save to result
            key = [ 'pix' , radius[j] , data.offset || 0 , data.id ].join('-');

            for( var k = 0 ; k < pixArr.length ; k ++ ){
                newPixData.data[k] = pixArr[k];
            }
            result[ key ] = newPixData;
        };
    };

    postMessage( result );
}

function clone( pixes ){
    return new Array( pixes.data.length );
}


var typeobj = {};
function isArray( d ){
    return typeobj.toString.call(d) == '[object Array]';
}

function motionBlur( pixes , radius , offset  ){

    offset = offset || 0;
    var result = clone( pixes );
    if( radius == 0 ) {
        for (var i = 0 , len = pixes.data.length ; i < len; i++) {
            result[ i ] = pixes.data[ i ];
        }

        return result;
    }
    var r = radius;
    var lhalf = Math.floor( r / 2 ) + offset;
    var rhalf = r - lhalf;
    var m = pixes.height;
    var n = pixes.width;
    var first , total , curr , k , imgMatrix;

    for(var  i = 0 ; i < m ; i ++ ){
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
            total = [ total[0] -
            first[0] +
            curr[0] ,
                total[1] - first[1] + curr[1] ,
                total[2] - first[2] + curr[2] ,
                total[3] - first[3] + curr[3] ];

            len = imgMatrix.length;
            result[ k ] = ( total[ 0 ] / len ) | 0;
            result[ k + 1 ] = ( total[ 1 ] / len ) | 0;
            result[ k + 2 ] = ( total[ 2 ] / len ) | 0;
            result[ k + 3 ] = ( total[ 3 ] / len ) | 0;
        }
    }

    return result;
}