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
    require('jquery.ani');
    require('jquery.easing');
    require('modernizr');


    // process bar
    var processBar = function ($proBar , $proMsg){
        var prog = 0,
            step = 0,
            stepAdd = 13,
            _timer = function(){
                if (prog >= 99) return false;
                stepAdd--;
                if (stepAdd < 2)stepAdd = 1;
                prog += stepAdd;
                step ++;
                $proMsg && $proMsg.html(prog+"%");
                $proBar.animate({width : prog + '%'}, step*30, null, _timer);
            };
        return {
            stop: function(){
                $proBar.stop(true);
                return this;
            },
            end: function(){
                $proMsg && $proMsg.html('100%');
                $proBar.stop(false , false).css('width' , '100%');
                return this;
            },
            start: function(){
                _timer();
                return this;
            },
            reset: function(){
                prog = 0;
                step = 0;
                stepAdd = 12;
                $proMsg && $proMsg.html('0%');
                $proBar.stop(true).css('width' , '0%');
                return this;
            }
        }
    };

    // loading bar
    var $loadingBar = processBar( $('#process-bar') , $('#process-num') )
        .start();

    // disabled contextmenu
    $(document).contextmenu(function(){return false;});

    // game logic application
    var game = require('../app/game');
    var M = require('../app/motion-blur');
    var A = require('../src/Animate');
    var Animate = A.Animate;
    var lastSpeed = 0;
    game.setConfig({
        duration  : 2000
        , speedCallBack  : function( speed ){
            if( lastSpeed != speed ){
                $('.board-l').html( speed );
                lastSpeed = speed;
            }
        }
    });

    var counter = function( callback ){
        var $nums = $counter.find('.num');
        var len = $nums.length - 1;
        ~(function showNum( ){
            if( len == 0 ) {
                // hide the counter panel
                $counter.fadeOut();
                game.start();
                return;
            }
            var $t = $nums.eq( len-- )
                .fadeIn();
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
        var $cars = $('.main-cars .car')
            .each(function(){
                // 3.driver car to the right position
                $(this)
                    .css('left' , - $(this).width())
                    .animate({
                        left : 0
                    } , 1000 + 1000 * Math.random() , '' , function(){

                    });
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
        } , function(){
            $cbg.attr('src' , $cbg.attr('osrc'));
            // counter nums
            counter();
        });
    }

    var $counter = $('#counter');
    var $startBtn = $('#start-btn')
        .click(function(){
            var t = this;
            var i = 0;
            // motion blur
            new Animate( [ 0 ] , [ 140 ] , 300 , '' , function( arr ){
                M.motionBlur( t , ~~arr[ 0 ] );
                i++;
                $(t).css( 'opacity' , Math.pow( 1 / i , 1 / 4 ) );
            } , function(){
                // hide start btn
                $(t).hide();
                ready();
            } );
        });

    // click share btn to pause the game
    var i = 0;
    $('#share-btn')
        .click(function(){
            i++;
            game[ i % 2 ? 'play' : 'pause' ]();
        });
});