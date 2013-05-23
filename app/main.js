/*
 * main model
 */
define(function(require, exports, module) {
    var selectTag = function($list , cb , selectClass , eventType){
        selectClass = selectClass || 'selected';
        eventType = eventType || 'click';
        $list[eventType](function(ev){
            $list.removeClass(selectClass);
            $(this).addClass(selectClass);
            cb && cb.call(this , $(this));
        });
    };
    // require jquery ani plugin
    require('jquery.queryloader');
    require('jquery.easing');
    require('modernizr');

    // extend jquery
    $.fn.rotate = function( deg ){
        deg = 'rotate(' + deg + 'deg)';
        $( this )
            .css({
                '-webkit-transform' : deg,
                   '-moz-transform' : deg,
                    '-ms-transform' : deg,
                     '-o-transform' : deg,
                        'transform' : deg
            });
        return this;
    }

    // loading bar
    var $probar = $('#process-bar');
    var $pronum = $('#process-num');
    var $videoPanel = $('#video-mask');
    // query loading
    $(document.body).queryLoader2({
        minimumTime: 1000,
        onLoading : function( percentage ){
            $probar.css( 'width' , percentage + '%' );
            $pronum.html( percentage + '%' );
        },
        onComplete: function(){
            $('#loading-mask')
                .animate({
                    top : '-100%'
                } , 3000 , 'easeOutElastic' , function(){
                    $(this).hide();
                    initVideoPlay();
                });
        }
    });

    // bind skip event
    $videoPanel.find('.video-skip')
        .click(function(){
            $videoPanel.animate({
                top: '-100%'
            } , 3000 , 'easeOutElastic' , function(){
                $videoPanel.hide();
            });
        });
    var initVideoPlay = function(){
        // TODO... start to play video

    }

    var $resultPanel = $('#result-mask');
    $resultPanel.find('.r-close')
        .click(function(){
            $resultPanel.animate({
                top: '-100%'
            } , 2000 , 'easeOutElastic' , function(){});
        })
        .end()
        .find('.r-again')
        .click(function(){
            $resultPanel.animate({
                top: '-100%'
            } , 2000 , 'easeOutElastic' , function(){
                //... go to ready status
                $(this).css('top' , 0)
                    .hide();

            });
            reset();
        });
    // TODO.. init share button

    // disabled contextmenu
    // $(document).contextmenu(function(){return false;});

    // game logic application
    var game = require('../app/game');
    var M = require('../app/motion-blur');
    var A = require('../src/Animate');
    var Animate = A.Animate;

    var winWidth = $(window).width();
    var screenWidth = screen.width;
    var GAME_MAX_SPEED = 400;
    var GAME_MAX_DISTANCE = 4000;
    var p1 , p2 , p , l , dur , rl ;

    game.setConfig({
        duration  : 2000
        , speedCallBack  : function( status ){
            // render car speed
            $speeds[0].className = 'speed0' + ~~ (status.speed / 100 );
            $speeds[1].className = 'speed1' + ~~ (status.speed / 10 % 10 );
            $speeds[2].className = 'speed2' + ~~ (status.speed % 10 );

            l = 0;
            dur = status.robotDistance - status.distance;
            p = dur / GAME_MAX_DISTANCE;

            // change car position
            // GAME_PLAYING  and GAME_OVER all need to modify the car position
            // and car wheel blur status
            if( status.gameStatus == 1 || status.gameStatus == 3 ){
                l = ( winWidth - car1width ) / 2 + ~~ ( status.speed / GAME_MAX_SPEED * 100 );
                $cars.eq(0)
                    .stop( true , false )
                    .css('left' , l )
                    [ status.speed > 30 ? 'addClass' : 'removeClass' ]('wheelblur');
                // change car wheels
                $car1Wheels.rotate( status.distance * 80 );
            }

            // change robot car position

            // need to reduce car2width for first starting
            if( status.gameStatus == 0 ){
                rl = l + Math.min( 10 * Math.sqrt( Math.abs(p) ) * GAME_MAX_DISTANCE  , 2 * screenWidth ) - car2width ;
            } else {
                rl = l + 10 * p * GAME_MAX_DISTANCE;
            }
            $cars.eq(1)
                .stop( true , false )
                .css({
                    left: rl
                })
                [ status.robotSpeed > 30 ? 'addClass' : 'removeClass' ]('wheelblur');
            $car2Wheels.rotate( status.robotDistance * 80 );

            // change car dot position
            p1 = 6 + status.speed / GAME_MAX_SPEED * 3;
            p2 = p1 + p * 88 ;
            $carDot.css('left' , p1 + '%');
            // change robot dot position
            $robotDot.css('left' , Math.min( p2 , 94 ) + '%' );

            //  move bg and motion road
            moveBgAndMotionRoad( status );

            // change bar background
            $bar[0].className = 'b-bar' + ( dur < GAME_MAX_DISTANCE * 0.4 ? 0 :
                    dur < GAME_MAX_DISTANCE * 0.65 ? 1 :
                    dur < GAME_MAX_DISTANCE * 0.9 ? 2 : 3 ) ;
            // show time
            if( status.gameStatus != 3 && status.gameStatus != 0 ){
                var time = status.time + ( +new Date() - status.startTime );
                var m = ~~ ( time / 1000 / 60 );
                var s = ~~ ( time / 1000 % 60 );
                var ss = ~~ ( time % 1000 / 100 );
                $timeBoard.html([ m > 9 ? m : '0' + m ,
                     s > 9 ? s : '0' + s ,
                     ss ].join(':'));
                if( status.distance > status.robotDistance
                    ||  dur > GAME_MAX_DISTANCE ){
                    gameOver( status );
                }
            }
        }
    });

    var gameOver = function( result ){
        game.over();
        var tHtml = $timeBoard.html() + result.time % 10;
        $resultPanel.find('.r-text')
            .html('本次游戏<br/>时间 ' + tHtml + '<br/>共计追逐距离 ' + ~~result.distance + 'm' )
            .end()
            .fadeIn();
    }
    var counter = function( callback ){
        var $nums = $counter.find('.num');
        var len = $nums.length;
        ~(function showNum( ){
            var $t = $nums.eq( --len )
                .fadeIn();
            if( len == -1 ){
                // hide the counter panel
                $counter.fadeOut();
                game.start( true );
                return;
            }
            // reset nums
            M.motionBlur( $t[0] , 0 );
            setTimeout( function(){
                new Animate( [ 0 ] , [ 100 ] , 200 , '' , function( arr ){
                    M.motionBlur( $t[0] , ~~arr[ 0 ] );
                } , function(){
                    $t.hide();
                    // when count to four,  start the robot
                    // and drive 'my car' to the sence
                    //if( len == 5 ){
                    //    game.start();
                    //}
                    if( len == 4 ){
                        // drive ’my car ‘ to sence
                        _driveCarToSence( $cars.eq(0) , 0 );
                    }
                    showNum();
                });
            } , 800 );
        })();
    }

    var _driveCarToSence = function( $car , index ){
        var delay = 1000 * Math.random();
        var dur = 1000 + 500 * Math.random();
        $car.show()
            .css('left' , - $(this).width())
            .delay( delay )
            .animate({
                left : (winWidth - ( index == 0 ? car1width : car2width ) ) / 2
            } , dur , 'easeOutQuart' , function(){

            });

        // run car dot
        var $dot = index == 0 ? $carDot : $robotDot;
        $dot.show()
            .css( 'left' , 0 )
            .delay( delay )
            .animate({
                left : '6%'
            } , dur , 'easeOutQuart');
        var $wheels = index == 0 ? $car1Wheels : $car2Wheels;
        setTimeout( function(){
            new Animate([ - 2*360 - 360 * Math.random() ] , [ 0 ] , dur , 'easeOutQuart' , function( arr ){
                $wheels.rotate( arr[0] );
            });
        } , delay );
    }
    // ready for game , at this status , you should do follow list:
    // 1.reset cars position
    // 2.counter the seconds
    // 3.driver car to the right position
    var ready = function(  ){
        // 1. drive robot to sence
        //_driveCarToSence( $cars.eq(1) , 1 );
        // drive robot along
        $cars.eq(1).show().css('left' , - car2width);
        $robotDot.show().css('left' , '6%');
        game.start();
        // 2.counter the seconds
        // show counter btn
        $counter.show();
        // add shake effect to mouse
        $counter.find('.c-mouse')
            .addClass('shake');

        var $cbg = $counter.find('.c-bg');

        new Animate( [ 140 ] , [ 0 ] , 300 , '' , function( arr ){
            M.motionBlur( $cbg[0] , ~~ arr[ 0 ] , 0 , true );
        } , function(){
            // $cbg.attr('src' , $cbg.attr('osrc'));
            // counter nums
            counter();
        });


        // pre motion road
        if( !$roadCan )
            $roadCan = $('<canvas>')
                .attr({
                    id: 'can-road'
                    , width: screenWidth
                    , height: 256
                })
                .insertBefore($road.hide());
        motionRoad( 0 );
    }
    var reset = function(){
        // reset the game
        game.reset();
        // ..1. reset start btn
        $startBtn.attr('src' , $startBtn.attr('osrc'))
            .css('opacity' , 1)
            .removeClass( lockClass )
            .show();
        // ..2. reset ready panel
        $counter.hide()
            .attr('src' , $startBtn.attr('osrc'));
        // ..3. reset cars position
        $cars.hide()
            .each(function( i ){
                $(this).css( 'left' , i == 0 ? -car1width : -car2width );
            });
        // ..4. reset car dots position
        $carDot.add( $robotDot )
            .hide();
        // ..5. reset bar
        $bar[0].className = 'b-bar0';


        // reset speed board
        $speeds[0].className = 'speed00';
        $speeds[1].className = 'speed10';
        $speeds[2].className = 'speed20';
        $timeBoard.html('00:00:0');
        // reset bg
        $bg.css( 'marginLeft' , 0 )
            .attr(bgConfig[0].src);
        lastBgIndex = 0;
        lastBgDistance = 0;

        // reset road
        motionRoad( 0 );

    }

    var lockClass = '__disabled__';

    var $cars = $('.main-cars .car');
    var $car1Wheels = $cars.eq(0).find('.front-wheel,.end-wheel');
    var $car2Wheels = $cars.eq(1).find('.front-wheel,.end-wheel');
    var car1width = $cars.eq(0).width() , car2width = $cars.eq(1).width();

    var $speedBoard = $('#speed-board');
    var $bar = $('#b-bar');
    var $speeds = $speedBoard.find('em');
    var $timeBoard = $('#time-board');
    var $road = $('#road');
    var $roadCan = null;
    var $bg = $('#bg');
    var $carDot = $('#car-dot');
    var $robotDot = $('#robot-dot');
    var $counter = $('#counter');
    var $startBtn = $('#start-btn')
        .click(function(){
            var $t = $( this );
            if( $t.hasClass( lockClass ) ) return;
            $t.addClass( lockClass );
            var i = 0;
            // motion blur
            new Animate( [ 0 ] , [ 140 ] , 300 , '' , function( arr ){
                M.motionBlur( $t[0] , ~~arr[ 0 ] );
                i++;
                $t.css( 'opacity' , Math.pow( 1 / i , 1 / 4 ) );
            } , function(){
                // hide start btn
                $t.hide()
                    .addClass( lockClass );;
                ready();
            } );
        });


    /*
     * bg config
     */
    var bgConfig = [{
        src: 'bg1.jpg',
        width: 3005
    },{
        src: 'bg2.jpg',
        width: 3172
    },{
        src: 'bg3.jpg',
        width: 3521
    }];
    var bgSenceConfig = [{
        src: 'bg1-2.jpg',
        width: 3377
    } , {
        src: 'bg2-3.jpg',
        width: 3004
    } , {
        src: 'bg3-1.jpg',
        width: 3071
    }];
    var lastBgIndex = 0;
    var lastBgDistance = 0;
    // cache last motion arguments
    // reduce the Consume of image motion
    var lastMotionValue = -1;
    var motionValue = 0;
    var changeSence = false;
    var $senceBg = null;
    var moveBgAndMotionRoad = function( status ){
        var bgIndex = 0 , mod = bgConfig[0].width + bgConfig[1].width + bgConfig[2].width - 3 * winWidth;
        if( status.distance % mod < bgConfig[0].width - winWidth ){
            bgIndex = 0;
        } else if (status.distance % mod < bgConfig[0].width + bgConfig[1].width - 2 * winWidth){
            bgIndex = 1;
        } else {
            bgIndex = 2;
        }

        motionValue = ~~ ( status.speed / 20 ) * 3 ;
        if( lastBgIndex != bgIndex && !changeSence){
            changeSence = true;
            var animateTime = 1000;
            // create sence
            if( !$senceBg ){
                $senceBg = $('<div></div>')
                    .css({
                        position: 'absolute'
                        , zIndex: 1000
                        , bottom: $bg.css('bottom')
                    })
                    .insertBefore( $bg );
            }
            var totalWidth = bgConfig[lastBgIndex].width + bgSenceConfig[lastBgIndex].width + bgConfig[bgIndex].width;
            $senceBg.html('')
                .append(
                    $('<img />')
                    .attr('src' , './images/' + bgConfig[lastBgIndex].src )
                )
                .append(
                    $('<img />')
                    .attr('src' , './images/' + bgSenceConfig[lastBgIndex].src )
                )
                .append(
                    $('<img />')
                    .attr('src' , './images/' + bgConfig[bgIndex].src )
                )
                .css({
                    width: totalWidth
                    , left: - ( bgConfig[lastBgIndex].width - winWidth )
                })
                .show()
                .animate({
                    left: - ( bgConfig[lastBgIndex].width + bgSenceConfig[lastBgIndex].width )
                } , 2000 , '' , function(){
                    changeSence = false;
                    $(this).hide();
                    lastBgDistance = status.distance;
                    lastBgIndex = bgIndex;

                    $bg[0].setAttribute( 'src' , './images/' + bgConfig[bgIndex].src );
                    $bg[0].style.marginLeft = '0px';
                    // .. motion road ,
                    // run motionRoad function, so that it will change the road right now.
                    motionRoad( status.speed == 0 ? 0 :
                                Math.min( motionValue + 3 , 30 ) );
                });
        } else {
            if( !changeSence ){
                $bg[0].style.marginLeft = - ( status.distance - lastBgDistance ) % mod + 'px';
            }
            // .. motion road ,
            if( lastMotionValue != motionValue ){
                motionRoad( status.speed == 0 ? 0 :
                        Math.min( motionValue + 3 , 30 ) );

                lastMotionValue = motionValue;
                motionValue = 0;
            }
        }

        // move the road
        $roadCan[0].style.marginLeft = - status.distance * 100 % currRoadConfig.width + 'px';
    }
    /*
     * motion the road, dur to the game status and radius
     */
    var roadConfig = [{
        id: 'road-1'
        , src: 'road-1.png'
        , width: 0
        , img: null
    } , {
        id: 'road-2'
        , src: 'road-2.png'
        , width: 0
        , img: null
    } , {
        id: 'road-3'
        , src: 'road-3.png'
        , width: 0
        , img: null
    }];

    var currRoadConfig = roadConfig[0];
    var motionRoad = function( radius ){
        // city road
        var motionCache = M.getMotionCache();
        var index = lastBgIndex;

        currRoadConfig = roadConfig[index];
        var canvas = $roadCan[0];
        var width = ( Math.ceil( screenWidth / currRoadConfig.width ) + 1 ) * currRoadConfig.width;
        // reset road width and height
        canvas.width = width;
        M.motionBlur( currRoadConfig.img , radius , 0 , canvas );
    }
    // save road cache
    !(function(){

        var motionStart = 3 , motionMax = 30 , motionStep = 3;
        var cacheMotionBlur = function( img ){
            for (var i = motionStart; i <= 30; i+=motionStep ) {
                (function( radius ){
                    setTimeout( function(){
                        M.motionBlur( img , radius , 0 , false , true );
                    } , radius * 200 );
                })(i);
            };
        }
        $.each(roadConfig , function( i ){
            var img = document.createElement('img');
            img.id = roadConfig[i].id;
            img.onload = function(){
                cacheMotionBlur( img );
                roadConfig[i].width = this.width;
            }
            img.setAttribute( 'src' , './images/' + roadConfig[i].src );

            roadConfig[i].img = img;
        });
    })();


    // click share btn to pause the game
    var i = 0;
    $('#share-btn')
        .click(function(){
            game[ i % 2 ? 'play' : 'pause' ]();
            i++;
        });
});