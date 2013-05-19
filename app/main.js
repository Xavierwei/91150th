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
        onLoading : function( percentage ){
            $probar.css( 'width' , percentage + '%' );
            $pronum.html( percentage + '%' );
        },
        onComplete: function(){
            $('#loading-mask')
                .animate({
                    top : '-100%'
                } , 2000 , 'easeOutElastic' , function(){
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
            } , 2000 , 'easeOutElastic' , function(){
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
    // cache last speed
    // reduce HTMLElement change times
    var lastSpeed = 0;
    // cache last motion arguments
    // reduce the Consume of image motion
    var lastMotionValue = -1;
    var motionValue = 0;
    var motionTimes = 0;
    var winWidth = $( window ).width();
    var GAME_MAX_SPEED = 400;
    var GAME_MAX_DISTANCE = 4000;
    var p1 , p2 , p , l ;
    game.setConfig({
        duration  : 2000
        , speedCallBack  : function( status ){
            // render car speed

            if( lastSpeed != status.speed ){
                $speeds[0].className = 'speed0' + ~~ (status.speed / 100 );
                $speeds[1].className = 'speed1' + ~~ (status.speed / 10 % 10 );
                $speeds[2].className = 'speed2' + ~~ (status.speed % 10 );
                lastSpeed = status.speed;
            }

            l = ~~ ( status.speed / GAME_MAX_SPEED * 200 );
            // change car position
            $cars.eq(0)
                .css('left' , l );
            // change car wheels
            $car1Wheels.rotate( status.distance * 40 );

            // TODO.. move bg
            $bg[0].style.marginLeft = - status.distance / 3 % 500 + 'px';
            /*stop( true , false )
                .animate({
                    marginLeft: - status.distance / 20
                });
            */
            // change car dot position
            p1 = 6 + status.speed / GAME_MAX_SPEED * 12;
            $carDot.css('left' , p1 + '%');

            // .. motion road ,
            motionValue = ~~ ( status.speed / 20 ) * 5 ;
            if( lastMotionValue != motionValue ){

                M.motionBlur( $road[0] , status.speed == 0 ? 0 :
                        Math.min( motionValue + 3 , 30 ) , 0 , true );
                lastMotionValue = motionValue;
                motionValue = 0;
            }

            // move the road
            var canvas = $road[0].previousSibling;
            if( canvas && canvas.tagName == 'CANVAS' ){
                canvas.style.marginLeft = - status.distance * 100 % 500 + 'px';
            }
             //.. judge if game over
            if( status.gameStatus != 3 ){
                p = ( status.robotDistance - status.distance ) / GAME_MAX_DISTANCE;
                p2 = p1 + p * 88 ;
                // change robot car position
                $cars.eq(1)
                    .css({
                        left: l + Math.min( 4 * p * GAME_MAX_DISTANCE  ,  winWidth )
                    });
                $car2Wheels.rotate( status.robotDistance * 40 );
                // change robot dot position
                $robotDot.css('left' , Math.min( p2 , 94 ) + '%' );
                //TODO.. change bar background

                // show time
                var time = status.time + ( +new Date() - status.startTime );
                var m = ~~ ( time / 1000 / 60 );
                var s = ~~ ( time / 1000 % 60 );
                var ss = ~~ ( time % 1000 / 100 );
                $timeBoard.html([ m > 9 ? m : '0' + m ,
                     s > 9 ? s : '0' + s ,
                     ss ].join(':'));
                if( status.distance > status.robotDistance
                    ||  status.robotDistance - status.distance > GAME_MAX_DISTANCE ){
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
                game.start();
                return;
            }
            setTimeout( function(){
                new Animate( [ 0 ] , [ 100 ] , 200 , '' , function( arr ){
                    M.motionBlur( $t[0] , ~~arr[ 0 ] );
                } , function(){
                    $t.hide();
                    showNum();
                });
            } , 800 );
        })();
    }
    // ready for game , at this status , you should do follow list:
    // 1.reset cars position
    // 2.counter the seconds
    // 3.driver car to the right position
    var ready = function(  ){
        // 1. reset cars
        $cars.show()
            .each(function( index ){
            // 3.driver car to the right position
            var delay = 1000 * Math.random();
            var dur = 1000 + 500 * Math.random();
            $(this)
                .removeClass( animateClass )
                .css('left' , - $(this).width())
                .delay( delay )
                .animate({
                    left : 0
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

        });
        // 2.counter the seconds
        // show counter btn
        $counter.show();
        // add shake effect to mouse
        $counter.find('.c-mouse')
            .addClass('shake');

        var $cbg = $counter.find('.c-bg');

        M.motionBlur( $cbg[0] , 140 );
        new Animate( [ 140 ] , [ 0 ] , 300 , '' , function( arr ){
            M.motionBlur( $cbg[0] , ~~arr[ 0 ] );
            // fix for last motion bugs, when
            if( ~~arr[ 0 ] < 2 ){
                setTimeout(function(){
                    M.motionBlur( $cbg[0] , 0 );
                } , 18 );
            }
        } , function(){
            $cbg.attr('src' , $cbg.attr('osrc'));
            // counter nums
            counter();
        });
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
        // TODO ..5. reset bar

        // reset road
        M.motionBlur( $road[0] ,  0  , 0 , true );
        // reset board
        $speedBoard.html('000');
        $timeBoard.html('00:00:0');
        // reset bg
        $bg.remove( animateClass )
            .css( 'marginLeft' , 0 )
            .addClass( animateClass );
    }

    var lockClass = '__disabled__';
    var animateClass = 'css-animate';

    var $cars = $('.main-cars .car');
    var $car1Wheels = $cars.eq(0).find('.front-wheel,.end-wheel');
    var $car2Wheels = $cars.eq(1).find('.front-wheel,.end-wheel');
    var car1width = $cars.eq(0).width() , car2width = $cars.eq(1).width();
    // hide the car
    $cars.hide();

    var $speedBoard = $('#speed-board');
    var $speeds = $speedBoard.find('em');
    var $timeBoard = $('#time-board');
    var $road = $('#road');
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

    // save road cache
    !(function(){
        var motionStart = 3 , motionMax = 30 , motionStep = 3;
        var currMotion = motionStart;
        var $tmpNode = $road.clone();
        $tmpNode.load(function(){
            if( currMotion + motionStep <= motionMax )
                M.motionBlur( this , currMotion , 0 , false , true );
            currMotion += motionStep;
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