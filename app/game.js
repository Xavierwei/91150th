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
        // time for speed up to config.maxSpeed
        , speedUpDuration : 4000
        , speedCallBack  : null
        , maxSpeed : 400
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
        var _disDuration = 6 / 1000;
        var _winWdth = window.innerWidth;
        var _animate = null;
        var _robotAnimate = null;

        var startSpeedExchange = function( cb ){
            stopSpeedExchange( true );
            status.robotDistance = 3;
            speedExchange( cb );
        }
        var speedExchange = function( cb ){
            // for debug
            var fpsStartTime = +new Date();
            var fpsTimes = 0;
            var $fp = $('#fps');

            _caTimer = setTimeout(function(){
                // if game over
                if( status.speed == 0 && status.gameStatus == GAME_OVER ){
                    stopSpeedExchange();
                    return;
                }
                _caTimes++;
                var spx =  Math.abs( _caDis[0] - _caLastDis[0] );
                var spy =  Math.abs( _caDis[1] - _caLastDis[1] );
                var speed = Math.round( spx + spy ) / _winWdth;

                // for debug
                var lastSpeed = 0;
                _caSpeeds += speed;
                if( _caTimes % _caCollectTimes == 0 ){
                    var mouseSpeed = Math.min( _caSpeeds / _caCollectTimes  , 1 );

                    if( _animate ){
                        // if game over , stop the car , reset the durations
                        if( status.gameStatus == GAME_OVER ){
                            mouseSpeed = 0;
                            _animate.duration = config.duration * 2;
                        }
                        _animate.turnTo( [ mouseSpeed * config.maxSpeed ] );
                    } else {
                        _animate = new Animate( [0] , [ mouseSpeed * config.maxSpeed ] , config.duration , '' , function(arr){
                            ////////////////////////////// for debug
                            fpsTimes++;
                            if( new Date() - fpsStartTime > 1000 ){
                                $fp.html('fps:' + fpsTimes );
                                fpsStartTime = new Date();
                                fpsTimes = 0;
                            }

                            ////////////////////////////// for debug
                            status.speed = ~~arr[0];
                            // count the distance of car
                            status.distance += status.speed * _disDuration;

                            if( status.speed - lastSpeed > 40 ){
                                debugger;
                            }
                            lastSpeed = status.speed;
                            cb && cb( status );
                        });
                    }
                    // count robot
                    var tmp = _caTimes > 20 ? 0.4 + Math.random() * 0.4 : 2;
                    // if game is over, reset the roboto speed and animation duration
                    if( status.gameStatus == GAME_OVER ){
                        tmp = 0;
                        _robotAnimate.duration = config.duration * 2;
                    }

                    if( _robotAnimate ){
                        _robotAnimate.turnTo( [ tmp * config.maxSpeed ] );
                    } else {
                        _robotAnimate = new Animate( [10] , [ tmp * config.maxSpeed ] , config.duration / 2 , '' , function(arr){
                            status.robotSpeed = ~~arr[0];
                            // count the distance of car
                            status.robotDistance += status.robotSpeed * _disDuration;
                        });
                    }
                    _caSpeeds = 0;
                }

                _caLastDis = _caDis.concat([]);

                _caTimer = setTimeout( arguments.callee , _caDur );
            } , _caDur);
        }

        var stopSpeedExchange = function( clearAnimate ){
            clearTimeout( _caTimer );
            if( _animate ){
                _animate.pause();
                // . why set to null ? , for restart game
                if( clearAnimate )
                    _animate = null;
            }
            if( _robotAnimate ){
                _robotAnimate.pause();
                if( clearAnimate )
                    _robotAnimate = null;
            }
        }

        return {
            start: startSpeedExchange
            , play: speedExchange
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
    // set game starttime value
    // bind mousemove event listener
    // set interval to count the car speed
    // change game status
    var play = function(){
        if( status.gameStatus == GAME_PLAYING ) return;
        if( status.gameStatus == GAME_PAUSE ){
            status.startTime = + new Date();
        }
        // add event listener
        document.addEventListener( 'mousemove' , speedExchange.move , false );
        // speed exchange fn
        speedExchange.play( config.speedCallBack );
        // change status
        status.gameStatus = GAME_PLAYING;
    }

    // count the game time
    // change game status to GAME_PAUSE
    // pause all animate , timeout and interval
    // remove the mousemove event listener
    var pause = function(){
        if( status.gameStatus != GAME_PLAYING )
            return;
        // count the last duration
        status.time += + new Date() - status.startTime;
        status.gameStatus = GAME_PAUSE;
        speedExchange.stop();
        document.removeEventListener('mousemove' , speedExchange.move , false);
    }
    // game over , remove mousemove event listener
    // set game status to GAME_OVER
    // count the game time
    var over = function(){
        if( status.gameStatus != GAME_PLAYING ){
            return;
        }
        status.time += + new Date() - status.startTime;
        status.gameStatus = GAME_OVER;
        // speedExchange.stop();
        document.removeEventListener('mousemove' , speedExchange.move , false);
    }
    // delete all animate
    // clear all setInterval
    // clear all setTimeout
    var reset = function(){
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
        // pause all the animate , interval and timeout
        speedExchange.stop();
    }

    extend( exports , {
        setConfig : setConfig
        , reset   : reset
        , start   : start
        , play  : play
        , pause : pause
        , over  : over
    } );
});