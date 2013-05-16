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

    var game = require('../app/game');
    game.setConfig({
        duration  : 2000
        , speedCallBack  : function( speed ){
            $('.board-l').html( speed );
        }
    });

});