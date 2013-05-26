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
        , robotStartDistance: 0
        , speedCallBack  : null
        , maxSpeed : 400
        , minRobotSpeed: 200
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
        // game result
        // -1 : game is running
        // 0  : failure
        // 1  : success
        , result : -1
    }
    var GAME_READY = 0;
    var GAME_PLAYING = 1;
    var GAME_PAUSE = 2;
    var GAME_OVER = 3;


    var __gameControll = {
        overMiniTime : 6000,
        overMaxDuration : 6000,
        // slow to game over false
        overStartTime : 0,
        overDuration : 0,

        // to let the robot slow
        over200Times : 4,
        over200StartTime: 0,
        over200Duration: 0
    }
    // --------------------private var end-------------------------------

    // private function
    var speedExchange = (function(){

        var __lp = null;
        var _mousemoveEvent = function( ev ){
            if( !__lp ){
                __lp = [ ev.pageX , ev.pageY ];
                return;
            }
            _caDis[0] += Math.abs( ev.pageX - __lp[0] );
            _caDis[1] += Math.abs( ev.pageY - __lp[1] );
            __lp = [ ev.pageX , ev.pageY ];

            ev.preventDefault();
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
        var _roSpeeds = 0;
        var _disDuration = 12 / 1000;
        var _winWdth = window.innerWidth;
        window.addEventListener('resize' , function(){
            _winWdth = window.innerWidth;
        });
        var _animate = null;
        //var _robotAnimate = null;

        var _startSpeedExchange = function( cb ){
            _stopSpeedExchange( true );
            _speedExchange( cb );
        }

        // for debug
        var _dfpsStartTime;
        var _dfpsTimes = 0;
        var _d$fp = $('#fps');
        /*
        var __robotExchange = function( cb ){

            var speed = _roSpeeds / _caCollectTimes;
            // if game is over, reset the roboto speed and animation duration
            if( status.gameStatus == GAME_OVER ){
                speed = 0;
                _robotAnimate.duration = config.duration * 1.5;
            }

            if( _robotAnimate ){
                _robotAnimate.turnTo([ status.gameStatus == GAME_OVER ? 0 :
                    speed * ( config.maxSpeed - config.minRobotSpeed )  + config.minRobotSpeed ] );
            } else {
                _robotAnimate = new Animate( [0] , [ config.maxSpeed ] , config.duration , '' , function(arr){

                    status.robotSpeed = ~~arr[0];
                    // count the distance of car
                    status.robotDistance += status.robotSpeed * _disDuration;
                    cb && cb();
                });
            }
        }
        */
        var __gameOverControll = function(){
            // game contoll , after 6000ms , controll the game
            if( _getPlayTime() > __gameControll.overMiniTime ){
                // 1.game over contorll
                if( status.speed < 20 ){
                    if( __gameControll.overStartTime == 0  )
                        __gameControll.overStartTime = + new Date();
                } else {
                    // reset over controll
                    __gameControll.overStartTime = 0;
                    __gameControll.overDuration = 0;
                }

                if( __gameControll.overStartTime
                    && + new Date() - __gameControll.overStartTime + __gameControll.overDuration > __gameControll.overMaxDuration ){
                    console.log( + new Date() - __gameControll.overStartTime + __gameControll.overDuration);
                    // game over
                    status.result = 0;
                }
            }
        }
        var __bRobotControll = false;
        var __addRobotSpeed = false;
        var __gameRobotControll = function( robotSpeed ){

            var duration = status.robotDistance - status.distance;
            // we need to controll the two car duration less then 30
            // && duration > 30
            if( status.speed > 200 ){
                if( __gameControll.over200StartTime == 0  )
                    __gameControll.over200StartTime = + new Date();
            } else {
                // reset robot controll
                __gameControll.over200StartTime = 0;
                __gameControll.over200Duration = 0;
            }

            if( !__bRobotControll // if current loop is not in controll status
                && __gameControll.over200Times // and has times to controll
                && __gameControll.over200StartTime // and start to count the speed > 200 time
                && + new Date() - __gameControll.over200StartTime + __gameControll.over200Duration > 2000 // and speed duratin more then 5000ms
                && duration > 80 ){ // and the two cars' duration is more than 80
                // start to controll the robot speed
                console.log(' start to controll robot ' , duration , __gameControll );
                __bRobotControll = true;
                __gameControll.over200Times--;
            }

            // if current status is in __bRobotControll  and the user car's speed
            // is more than 200
            // start to controll
            if( status.speed > 150
                && __bRobotControll
                && duration > 80 ){
                robotSpeed = 50;
            }
            if( duration <= 80 ){
                // need to speed the robot
                if( __gameControll.over200Times > 0 && __bRobotControll ){
                    __addRobotSpeed = true;
                    // speed 1s
                    setTimeout(function(){
                        __addRobotSpeed = false;
                    } , 200 );
                }
                __bRobotControll = false;
                // reset robot controll
                __gameControll.over200StartTime = 0;
                __gameControll.over200Duration = 0;
            }
            if( __addRobotSpeed ){
                robotSpeed *= 5;
            }

            if( status.time + ( + new Date() - status.startTime ) < 5000){
                robotSpeed *= 2;
            }
            return robotSpeed;
        }

        var __carExchange = function( cb ){
            var mouseSpeed = Math.min( _caSpeeds / _caCollectTimes  , 1 );
            var robotSpeed = _roSpeeds / _caCollectTimes;
            if( _animate ){
                // if game over , stop the car , reset the durations
                if( status.gameStatus == GAME_OVER ){
                    mouseSpeed = 0;
                    robotSpeed = 0;
                    _animate.duration = config.duration * 1.5;
                } else {
                    mouseSpeed = mouseSpeed * config.maxSpeed;
                    robotSpeed = robotSpeed * ( config.maxSpeed - config.minRobotSpeed )  + config.minRobotSpeed;
                }

                // game over controll
                __gameOverControll();

                // game robot controll
                robotSpeed = __gameRobotControll( robotSpeed );

                _animate.turnTo( [ mouseSpeed ,  robotSpeed ] );
            } else {
                _animate = new Animate( [ 0 , 0 ] , [ mouseSpeed * config.maxSpeed , config.maxSpeed ] , config.duration , '' , function(arr){
                    ////////////////////////////// for debug
                    _dfpsTimes++;
                    if( new Date() - _dfpsStartTime > 1000){
                        //_d$fp.html('fps:' + _dfpsTimes );
                        _dfpsStartTime = new Date();
                        _dfpsTimes = 0;
                        //_d$fp.show().prepend('status.distance :  '  + status.distance + '<br/>');
                    }
                    ////////////////////////////// for debug
                    status.speed = ~~arr[0];
                    // count the distance of car
                    status.distance += status.speed * _disDuration;


                    status.robotSpeed = ~~arr[1];
                    // count the distance of car
                    status.robotDistance += status.robotSpeed * _disDuration;
                    cb && cb( status );
                });
            }
        }
        /*
        var __myCarExchange = function( cb ){
            var mouseSpeed = Math.min( _caSpeeds / _caCollectTimes  , 1 );

            if( _animate ){
                // if game over , stop the car , reset the durations
                if( status.gameStatus == GAME_OVER ){
                    mouseSpeed = 0;
                    _animate.duration = config.duration * 1.5;
                }
                _animate.turnTo( [ mouseSpeed * config.maxSpeed ] );
            } else {
                _animate = new Animate( [ 0 ] , [ mouseSpeed * config.maxSpeed ] , config.duration , '' , function(arr){
                    ////////////////////////////// for debug
                    _dfpsTimes++;
                    if( new Date() - _dfpsStartTime > 1000 ){
                        _d$fp.html('fps:' + _dfpsTimes );
                        _dfpsStartTime = new Date();
                        _dfpsTimes = 0;
                    }

                    ////////////////////////////// for debug
                    status.speed = ~~arr[0];
                    // count the distance of car
                    status.distance += status.speed * _disDuration;

                    cb && cb( status );
                });
            }
        }
        */
        var _speedExchange = function( myCarCb ){
            _dfpsStartTime = + new Date();
            _dfpsTimes = 0;
            _caTimer = setTimeout(function(){
                // if game over
                if( status.speed == 0 && status.gameStatus == GAME_OVER ){
                    _stopSpeedExchange();
                    return;
                }

                var spx =  Math.abs( _caDis[0] - _caLastDis[0] );
                var spy =  Math.abs( _caDis[1] - _caLastDis[1] );
                var speed = Math.round( spx + spy ) / _winWdth * 1.5;
                // count robot
                // var tmp = _caTimes > 50 ? 0.4 + Math.random() * 0.5 : 2 ;
                var tmp = Math.random();

                _caSpeeds += speed;
                _roSpeeds += tmp;
                _caTimes++;
                if( _caTimes % _caCollectTimes == 0 ){
                    //__myCarExchange( myCarCb );
                    //__robotExchange( );
                    __carExchange( myCarCb );
                    _caSpeeds = 0;
                    _roSpeeds = 0;
                }

                _caLastDis = _caDis.concat([]);

                _caTimer = setTimeout( arguments.callee , _caDur );
            } , _caDur);
        }

        var _stopSpeedExchange = function( clearAnimate ){
            clearTimeout( _caTimer );
            if( _animate ){
                _animate.pause();
                // . why set to null ? , for restart game
                if( clearAnimate )
                    _animate = null;
            }
            /*if( _robotAnimate ){
                _robotAnimate.pause();
                if( clearAnimate )
                    _robotAnimate = null;
            }*/

        }

        return {
            start: _startSpeedExchange
            , play: _speedExchange
            , stop: _stopSpeedExchange
            , move: _mousemoveEvent
        }
    })();

    var setConfig = function( cfg ){
        extend( config , cfg );
    }
    var _isIpad = (function(){
        return !!navigator.userAgent.toLowerCase().match(/ipad/i);
    })();

    // bind document touchmove event, prevent to move the page
    if( _isIpad ){
        document.addEventListener( 'touchmove' , function(ev){ev.preventDefault();} , false );
    }

    var _bindEvent = function(){
        var event = _isIpad ? 'touchmove' : 'mousemove';
        document.addEventListener( event , speedExchange.move , false );
    }
    var _removeEvent = function(){
        var event = _isIpad ? 'touchmove' : 'mousemove';
        document.removeEventListener( event , speedExchange.move , false );
    }

    var _getPlayTime = function(){
        return + new Date() - status.startTime + status.time;
    }

    // export interface
    var start = function( ){
        // reset status
        extend( status  , {
             speed       : 0
             , time      : 0
             , distance  : 0
             , startTime : 0
             , gameStatus : 0
             , robotSpeed: 0
             , robotDistance : 0
             , result    : -1
        });
        // record start time
        status.startTime = + new Date();
        // add event listener
        _bindEvent();
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
        _bindEvent();
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
        _removeEvent();


        // stop game controll
        if( _getPlayTime() > __gameControll.overMiniTime ){
            // 1.game over contorll
            if( __gameControll.overStartTime ){
                __gameControll.overDuration += +new Date() - __gameControll.overStartTime;
                __gameControll.overStartTime = 0;
            }
        }
    }
    // game over , remove mousemove event listener
    // set game status to GAME_OVER
    // count the game time
    var over = function( isWin ){
        if( status.gameStatus != GAME_PLAYING ){
            return;
        }
        status.time += + new Date() - status.startTime;
        status.gameStatus = GAME_OVER;
        status.result = isWin + 0;
        _removeEvent();
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
            , result    : -1
        });

        // reset game controll
        extend( __gameControll  , {
            // slow to game over false
            overStartTime : 0,
            overDuration : 0,

            // to let the robot slow
            over200StartTime: 0,
            over200Duration: 0
        } );
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
        , GAME_PLAYING : GAME_PLAYING
        , GAME_PAUSE : GAME_PAUSE
        , GAME_OVER : GAME_OVER
        , GAME_READY : GAME_READY
    } );
});