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
    /*
     * Animate Class
     * {@param originNumArr} 需要变化的初始化数据
     * {@param targetNumArr} 数据的最终值
     * {@param speed} 动画持续时间
     * {@param easing} 动画特效
     * {@param step} 动画每一步需要执行的了函数，主要用于更新元素的样式值，其第一个参数是个数组，数组里为数据变化的当前值
     * {@param callback} 动画结束时的回调函数
     */
    var Animate = function(originNumArr,targetNumArr,speed,easing,step,callback){
        this.queue = [];
        this.duration = speed;
        this.easing = easing;
        this.step = step;
        this.callback = callback;
        for (var i = 0; i < originNumArr.length; i++){
            this.queue.push(new Animate.fx(originNumArr[i],targetNumArr[i]));
        }
        // begin animation
        this.begin();
    }

    Animate.prototype = {
        begin: function(){
            if(this._t) return ;
            var that = this;
            this.startTime = +new Date();
            // loop
            this._t = setInterval(function(){
                var dur = +new Date() - that.startTime;
                var queue = that.queue;
                if(dur > that.duration){
                    that.end();
                    // end Animate
                    return;
                }
                var easing = Animate.easing[that.easing] || Animate.easing.linear,
                    currValues = [];
                for (var i = 0,len = queue.length; i < len; i++){
                    currValues.push(queue[i].update(dur,that.duration,easing));
                }
                // run step to update
                that.step(currValues);
            },13);
        },
        // go to end of the animation
        end: function(){
            clearInterval(this._t);
            var queue = this.queue,
                currValues = [];
            for (var i = 0,len = queue.length; i < len; i++){
                currValues.push(queue[i].target);
            }
            this.step(currValues);
            // call callback function
            this.callback && this.callback();
        },
        turnTo: function( targetNumArr ){
            clearInterval(this._t);
            var that = this;
            // reset queue
            this.startTime = + new Date();
            for (var i = 0,len = that.queue.length; i < len; i++){
                that.queue[i] = new Animate.fx(that.queue[i].current,targetNumArr[i]);
            }
            // reset interval
            this._t = setInterval(function(){
                var dur = +new Date() - that.startTime;
                var queue = that.queue;
                if(dur > that.duration){
                    that.end();
                    // end Animate
                    return;
                }
                var easing = Animate.easing[that.easing] || Animate.easing.linear,
                    currValues = [];
                for (var i = 0,len = queue.length; i < len; i++){
                    currValues.push(queue[i].update(dur,that.duration,easing));
                }
                // run step to update
                that.step(currValues);
            } , 13);
        }
    }
    //
    Animate.fx = function(origin,target){
        this.origin = origin;
        this.target = target;
        this.dist = target - origin;
    }
    Animate.fx.prototype = {
        update: function(n,duration,easing){
            var pos = easing(n/duration, n , 0 ,1 , duration);
            this.current = this.origin + this.dist * pos;
            return this.current;
        }
    }
    // easing
    Animate.easing = {
        linear: function( p, n, firstNum, diff ) {
            return firstNum + diff * p;
        },
        swing: function( p, n, firstNum, diff ) {
            return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
        }
    };





    // --------------------private var-----------------------------------
    var status = {
        speed       : 0
        , duration  : 2000
        , animate   : null
        , speedCallBack  : null
        , distance  : 0
    }

    // --------------------private var end-------------------------------

    // private function
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
    var _caAnimate = null;
    var MAX_SPEED = 400;
    var winWdth = window.innerWidth;
    var speedExchange = function( cb ){
        _caTimer = setInterval(function(){
            _caTimes++;
            var spx = ( _caDis[0] - _caLastDis[0] );
            var spy = ( _caDis[1] - _caLastDis[1] );
            var speed = Math.round( Math.sqrt(spx * spx + spy * spy) ) / winWdth;

            _caSpeeds += speed;
            if( _caTimes % _caCollectTimes == 0 ){
                var mouseSpeed = Math.min( _caSpeeds / _caCollectTimes  , 1 );

                if( status.animate ){
                    //status.animate.duration =  mouseSpeed * MAX_SPEED > status.speed ?
                      //  status.duration : 2 * status.duration;
                    status.animate.turnTo( [ mouseSpeed * MAX_SPEED ] );
                } else {
                    status.animate = new Animate( [0] , [ mouseSpeed * MAX_SPEED ] , status.duration , '' , function(arr){
                        status.speed = ~~arr[0];
                        cb && cb( status.speed );
                    });
                }
                _caSpeeds = 0;
            }

            _caLastDis = _caDis.concat([]);
        } , _caDur);
    }

    var stopSpeedExchange = function(){
        clearInterval( _caTimer );
    }

    var M = require('../app/motion-blur');

    var gameStatus = 0;
    var GAME_PLAYING = 1;
    var GAME_PAUSE = 2;
    var GAME_OVER = 3;


    var $counter = $('#counter');
    var $startBtn = $('#start-btn')
        .click(function(){
            var t = this;
            var i = 0;
            // motion blur
            new Animate( [ 0 ] , [ 140 ] , 300 , '' , function( arr ){
                M.motionBlur( t , ~~arr[ 0 ] );
                i++;
                $(t).css('opacity', Math.pow(1/i, 1/4));
            } , function(){
                // hide start btn
                $(t).hide();
                ready();
            } );
        });
    var counter = function( callback ){
        var $nums = $counter.find('.num');
        var len = $nums.length - 1;
        var showNum = function( ){
            if( len == 0 ) {
                // TODO start the game
                callback && callback();
                return;
            };
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
        }

        showNum();
    }

    var setConfig = function( cfg ){
        extend( status , cfg );
    }
    // ready for game , at this status , you should do follow list:
    // 1.reset cars position
    // 2.counter the seconds
    // 3.driver car to the right position
    var ready = function( cfg ){
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
            counter( start );
        });

        // 1. reset cars
        var $cars = $('.main-cars img')
            .each(function(){
                $(this)
                    .css('left' , - $(this).width())
                    .animate({
                        left : 0
                    } , 1000 + 1000 * Math.random() , '' , function(){

                    });
            });
    }
    // export interface
    var start = function( cfg ){
        // add event listener
        document.addEventListener('mousemove' , mousemoveEvent , false);
        // speed exchange fn
        speedExchange( status.speedCallBack );
        // change status
        gameStatus = GAME_PLAYING;
    }
    var play = function(){
        if( gameStatus == GAME_PLAYING ) return;
        lastPostion = null;
        // add event listener
        document.addEventListener('mousemove' , mousemoveEvent , false);
        // speed exchange fn
        speedExchange( status.speedCallBack );
        // change status
        gameStatus = GAME_PLAYING;
    }

    var pause = function(){
        gameStatus = GAME_PAUSE;
        stopSpeedExchange();
        document.removeEventListener('mousemove' , mousemoveEvent , false);
    }
    var over = function(){
        gameStatus = GAME_OVER;
        document.removeEventListener('mousemove' , mousemoveEvent , false);
    }

    extend( exports , {
        setConfig : setConfig
        , start   : start
        , play  : play
        , pause : pause
        , over  : over
    } );
});