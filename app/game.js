/*
 * car game
 */
define(function( require , exports , model ){
    var extend = function( o1 , o2 ){
        o1 = o1 || {};
        o2 = o2 || {};
        for( var i in o2 ){
            o1[ i ] = o2 [ i ];
        }
        return o1;
    }
    var A = require('../src/Animate');
    var Animate = A.Animate;
    // --------------------private var-----------------------------------
    var config = {
        // time for reduce speed
        duration  : 2000
        // time for speed up to MAX_SPEED
        , speedUpDuration : 10000
        , speedCallBack  : null
    }
    // save the game status
    // so that , user can pause the game ,
    // and return to the last status of the game
    var status = {
        // speed of current car
        speed       : 0
        , robotSpeed: 0
        // total time of the game
        , time      : 0
        // total distance of the game
        , distance  : 0
        // the start time of the game
        , startTime : 0
        // robot distamce
        , robotDistance : 0
        // status of game, playing or pause or over
        , gameStatus : 0
    }
    var GAME_PLAYING = 1;
    var GAME_PAUSE = 2;
    var GAME_OVER = 3;

    // --------------------private var end-------------------------------

    // private function
    var speedExchange = (function(){

        var __lp = null;
        var mousemoveEvent = function( ev ){
            if( !__lp ){
                __lp = [ ev.pageX , ev.pageY ];
                return;
            }
            _caDis[0] += Math.abs( ev.pageX - __lp[0] );
            _caDis[1] += Math.abs( ev.pageY - __lp[1] );
            __lp = [ ev.pageX , ev.pageY ];
        }


        // speed exchange
        var _caTimes = 0;
        var _caCollectTimes = 10;
        var _caTimer = null;
        var _caDur = 70;
        // save the distance of the mouse moved
        var _caDis = [ 0 , 0 ];
        // last detect distance of the mouse
        var _caLastDis = _caDis.concat([]);
        var _caSpeeds = 0;
        var MAX_SPEED = 400;
        var _disDuration = 7 / 1000;
        var _winWdth = window.innerWidth;
        var _animate = null;
        var _robotAnimate = null;
        var speedExchange = function( cb ){
            _caTimer = setInterval(function(){
                _caTimes++;
                var spx = ( _caDis[0] - _caLastDis[0] );
                var spy = ( _caDis[1] - _caLastDis[1] );
                var speed = Math.round( Math.sqrt(spx * spx + spy * spy) ) / _winWdth;

                _caSpeeds += speed;
                if( _caTimes % _caCollectTimes == 0 ){
                    var mouseSpeed = Math.min( _caSpeeds / _caCollectTimes  , 1 );

                    if( _animate ){
                        //status.animate.duration =  mouseSpeed * MAX_SPEED > status.speed ?
                         //   status.speedUpDuration * mouseSpeed  : status.duration;
                        _animate.turnTo( [ mouseSpeed * MAX_SPEED ] );
                    } else {
                        _animate = new Animate( [0] , [ mouseSpeed * MAX_SPEED ] , config.duration , '' , function(arr){
                            status.speed = ~~arr[0];
                            // count the distance of car
                            status.distance += status.speed * _disDuration;
                            cb && cb( status.speed );
                        });
                    }
                    // count robot
                    var tmp = 0.6 + Math.random() * 0.4;
                    if( _robotAnimate ){
                        _robotAnimate.turnTo( [ tmp * MAX_SPEED ] );
                    } else {
                        _robotAnimate = new Animate( [0] , [ tmp * MAX_SPEED ] , config.duration , '' , function(arr){
                            status.robotSpeed = ~~arr[0];
                            // count the distance of car
                            status.robotDistance += status.robotSpeed * _disDuration;
                        });
                    }
                    _caSpeeds = 0;
                }

                _caLastDis = _caDis.concat([]);
            } , _caDur);
        }

        var stopSpeedExchange = function(){
            clearInterval( _caTimer );
            _animate.pause();
            _robotAnimate.pause();

            // console.log status
            console.log( status );
        }

        return {
            start: speedExchange
            , stop: stopSpeedExchange
            , move: mousemoveEvent
        }
    })();

    var setConfig = function( cfg ){
        extend( config , cfg );
    }

    // export interface
    var start = function( ){
        // reset status
        extend( status  , {
            speed       : 0
            , robotSpeed: 0
            , time      : 0
            , distance  : 0
            , startTime : 0
            , robotDistance : 0
            , gameStatus : 0
        });
        // record start time
        status.startTime = + new Date();
        // add event listener
        document.addEventListener('mousemove' , speedExchange.move , false);
        // speed exchange fn
        speedExchange.start( config.speedCallBack );
        // change status
        status.gameStatus = GAME_PLAYING;
    }
    var play = function(){
        if( status.gameStatus == GAME_PLAYING ) return;
        if( status.gameStatus == GAME_PAUSE ){
            status.startTime = + new Date();
        }
        // add event listener
        document.addEventListener( 'mousemove' , speedExchange.move , false );
        // speed exchange fn
        speedExchange.start( config.speedCallBack );
        // change status
        status.gameStatus = GAME_PLAYING;
    }

    var pause = function(){
        if( status.gameStatus != GAME_PLAYING )
            return;
        // count the last duration
        status.time += + new Date() - status.startTime;
        status.gameStatus = GAME_PAUSE;
        speedExchange.stop();
        document.removeEventListener('mousemove' , speedExchange.move , false);
    }
    var over = function(){
        if( status.gameStatus != GAME_PLAYING ){
            return;
        }
        status.time += + new Date() - status.startTime;
        status.gameStatus = GAME_OVER;
        document.removeEventListener('mousemove' , speedExchange.move , false);
    }

    extend( exports , {
        setConfig : setConfig
        , getStatus: function(){
            return status;
        }
        , start   : start
        , play  : play
        , pause : pause
        , over  : over
    } );
});