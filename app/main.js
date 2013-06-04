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
    var format = function( string , obj ){
        return string.replace(/#\{(.*?)\}/g , function($0 , $1){
            return obj[$1] === undefined || obj[$1] === false ? "" : obj[$1];
        });
    };
    // require jquery ani plugin
    require('jquery.hoverIntent');
    require('jquery.finger');
    // require('jquery.queryloader');
    // require('jquery.easing');
    // require('modernizr');
    // require('swfobject');

    // extend jquery
    if( !$.browser ){
        $.browser = (function(){
            var exp = /(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase());
            var r = {};
            if( exp ){
                r[ exp[1] ] = 1;
                r['version'] = exp[2];
            }
            return r;
        })();
    }
    $.fn.rotate = function( deg ){
        if( $.browser.msie && $.browser.version < 9 ){
            var $t = $( this );
            // use vml
            var vmlObj = $t.data('vml');
            if( !vmlObj ){
                vmlObj = $('<vml:image style="position:absolute;width:94px;height:94px;" class=vml src="./images/wheel-ie8.png" />')[0];
                $t.append(vmlObj);
                $t.data('vml' , vmlObj);
            }
            vmlObj.style.cssText = 'position:absolute;width:94px;height:94px;rotation:' + deg;
        } else {
            deg = 'rotate(' + deg + 'deg)';
            $( this )
            .css({
                '-webkit-transform' : deg,
                   '-moz-transform' : deg,
                    '-ms-transform' : deg,
                     '-o-transform' : deg,
                        'transform' : deg
            });
        }
        return this;
    }
    $.fn.translate = function( dis ){
        dis = 'translate(' + dis + 'px)';
        $( this )
            .css({
                '-webkit-transform' : dis,
                   '-moz-transform' : dis,
                    '-ms-transform' : dis,
                     '-o-transform' : dis,
                        'transform' : dis
            });
        return this;
    }

    var _isIpad = (function(){
        return !!navigator.userAgent.toLowerCase().match(/ipad/i) ;
    })();

    var _fixIpad = function(){
        // fix ipad , it would scroll body left
        if( _isIpad ){
            $(document.body).animate({
                scrollLeft: 0
            }, 500 );
        }
    }


    // loading bar
    var $videoPanel = $('#video-mask');

    // bind skip event
    $videoPanel.find('.video-skip')
        .click(function(){
            $videoPanel.find('.lpn-panel').animate({'margin-top':-300,opacity:0},500,'easeInQuart',function(){
                $videoPanel.hide();
                $videoPanel.find('*').remove();
                $('.main-metas').animate({left:'50%'},500,'easeInOutQuart', function(){
                    _fixIpad();
                });
                //$('#login-mask').show();
                //$('.lpn-register').css({'margin-left':-600,opacity:0,display:'inline-block'}).animate({'margin-left':0,opacity:1},600,'easeOutQuart');
            });

            //$('.main-metas').animate({left:'50%'},500,'easeOutQuart');
        });

    /*
    var initSliderBtn = function( $slider , $list , min , max ){
        $slider// when start to drag
            .on('mousedown' , function( ev ){
                _slideMousedown.call( this , $slider , $list , min , max , ev );
            })
            .on('touchstart' , function( ev ){
                _slideMousedown.call( this , $slider , $list , min , max , ev );
            });


        $list
            .mousewheel(function(event, delta, deltaX, deltaY){
                var $con = $(this);
                var scrollTop = $con.scrollTop();
                var height = $list.height();
                var conHeight = $list[0].scrollHeight;
                if( delta > 0 ) {// up
                    scrollTop -= height * 5 / 10;
                } else { //down
                    scrollTop += height * 5 / 10;
                }
                var top = min + ( ( conHeight - height <= 0 ) ? 0 : ( max - min ) * scrollTop / ( conHeight - height ) );
                $slider
                    .stop( true , false )
                    .animate({
                        'top': Math.max( Math.min( top , max ) , min )
                    } , 500 );
                // change the scroll value
                $con.stop( true , false )
                    .animate({
                        scrollTop: scrollTop
                    } , 500 );
            });

        if( _isIpad ){ // bind touch move event
            var py ;
            $list
                .on('touchstart' , function( ev ){
                    py = ev.originalEvent.pageY;
                })
                .on('touchmove' , function( ev ){
                    var dis = ev.originalEvent.pageY - py;
                    var scrollTop = $(this).scrollTop();
                    var height = $list.height();
                    var conHeight = $list[0].scrollHeight;

                    scrollTop = Math.max( Math.min( scrollTop - dis , conHeight - height ) , 0 );
                    $(this).scrollTop( scrollTop );

                    var top = min + ( ( conHeight - height <= 0 ) ? 0 : ( max - min ) * scrollTop / ( conHeight - height ) );
                    // move the slider
                    $slider
                        .stop( true , false )
                        .animate({
                            'top': Math.max( Math.min( top , max ) , min )
                        } , 500 );
                });
        }
    }
    var _slideMousedown = function( $slider , $list , min , max , ev ){
        var slider = this
         , off = $slider.offsetParent().offset();
        var $con = $list;
        var height = $con.height();
        var conHeight = $con.find('table').height();
        var moveEvent = function( pageY ){
            var value = Math.max( Math.min( pageY - off.top , max ) , min );
            slider.style.top = value + 'px';
            // change the scroll value
            $con.scrollTop( ( conHeight - height ) * ( value - min ) / ( max - min )  );
        }
        var endEvent = function(ev){
                $(this)
                    .off('.slide-drag');
            }
        // bind mouse move event
        $(document)
            .on('mousemove.slide-drag', function( ev ){
                moveEvent( ev.pageY );
            })
            .on('touchmove.slide-drag', function( ev ){
                moveEvent( ev.originalEvent.pageY );
            })
            .on('touchend.slide-drag', endEvent )
            .on('mouseup.slide-drag', endEvent );
    }
    */
    var _slideMousedown = function( $slider , $list , min , max , maxValue ){
          var slider = this
           , off = $slider.offsetParent().offset();
          var $con = $list;

          var moveEvent = function( pageX ){
              var value = Math.max( Math.min( pageX - off.left , max ) , min );
              slider.style.left = value + 'px';
              // change the scroll value
              $con.css('marginLeft' ,  - maxValue * ( value - min ) / ( max - min )  );
          }
          var endEvent = function(ev){
                  $(this)
                      .off('.slide-drag');
              }
          // bind mouse move event
          $(document)
              .on('mousemove.slide-drag', function( ev ){
                  moveEvent( ev.pageX );
              })
              .on('touchmove.slide-drag', function( ev ){
                  moveEvent( ev.originalEvent.pageX );
              })
              .on('touchend.slide-drag', endEvent )
              .on('mouseup.slide-drag', endEvent );
      }

      /*var initSliderBtn = function( $sliderWrap , $sliderBtn , $slider ){
        $sliderBtn// when start to drag
          .on('mousedown' , function( ev ){
              _slideMousedown.call( this , $sliderWrap );
          })
          .on('touchstart' , function( ev ){
              _slideMousedown.call( this , $sliderWrap );
          });
      }
      */
      var initSliderBtn = function( $slider , $list , min , max , maxValue){
          $slider// when start to drag
              .on('mousedown' , function( ev ){
                  _slideMousedown.call( this , $slider , $list , min , max , maxValue );
              })
              .on('touchstart' , function( ev ){
                  _slideMousedown.call( this , $slider , $list , min , max , maxValue );
              });

          if( _isIpad ){ // bind touch move event
              var px , marginLeft = 0;
              $list
                  .on('touchstart' , function( ev ){
                      px = ev.originalEvent.pageX;
                      marginLeft = parseInt( $(this).css('marginLeft') );
                  })
                  .on('touchmove' , function( ev ){
                      var dis = ev.originalEvent.pageX - px;
                      var mleft = marginLeft + dis;

                      mleft = - Math.min( maxValue , Math.abs( Math.min( mleft, 0 ) ) );

                      $(this).css('marginLeft' , mleft);

                      var left = min + ( max - min ) * - mleft / maxValue ;

                      // move the slider
                      $slider
                          .stop( true , false )
                          .animate({
                              'left': Math.max( Math.min( left , max ) , min )
                          } , 500 );
                  });
          } else {
            seajs.use('jquery.mousewheel' , function(){
              $list
                .mousewheel(function(event, delta, deltaX, deltaY){
                    var $con = $(this);
                    var marginLeft = parseInt( $con.css('marginLeft') );
                    var width = $con.width();
                    var photoLen = 357;
                    var maxWidth = maxValue + width;
                    if( delta > 0 ) {// up
                      marginLeft += photoLen;
                    } else {
                      marginLeft -= photoLen;
                    }

                    marginLeft = - Math.min( maxValue , Math.abs( Math.min( marginLeft, 0 ) ) );
                    /*
                    var scrollTop = $con.scrollTop();
                    var height = $list.height();
                    var conHeight = $list[0].scrollHeight;
                    if( delta > 0 ) {// up
                        scrollTop -= height * 5 / 10;
                    } else { //down
                        scrollTop += height * 5 / 10;
                    }
                    var top = min + ( ( conHeight - height <= 0 ) ? 0 : ( max - min ) * scrollTop / ( conHeight - height ) );
                    */
                    var left = min + ( ( maxWidth - width <= 0 ) ? 0 : ( max - min ) * -marginLeft / ( maxWidth - width ) )
                    $slider
                        .stop( true , false )
                        .animate({
                            'left': Math.max( Math.min( left , max ) , min )
                        } , 500 );
                    // change the scroll value
                    $con.stop( true , false )
                        .animate({
                            marginLeft: marginLeft
                        } , 500 );
                });
            });
          }
      }

    // disabled contextmenu
    $(document).contextmenu(function(){return false;});
    // disabled scroll the body
    $(document).scroll(function(){return false;});

    // game logic application
    var game = require('../app/game');
    var M = require('../app/motion-blur');
    var A = require('../src/Animate');
    var Animate = A.Animate;
    var isSupportCanvas = M.isSupportCanvas;
    // save the game status
    var gStatus = null;
    var winWidth = $(window)
                    .resize(function(){
                        winWidth = $(this).width();
                    }).width();
    var screenWidth = screen.width;
    var GAME_MAX_SPEED = 312;
    var GAME_MAX_DISTANCE = 4000;
    var p1 , p2 , p , l , dur , rl , lastl;
    var robotStartDistancePercent = 1 / 6;
    game.setConfig({
        duration  : 2000
        , maxSpeed: GAME_MAX_SPEED
        , minRobotSpeed  : 150
        , speedCallBack  : function( status ){
            gStatus = status;
            // render car speed
            $speeds[0].className = 'speed0' + ~~ (status.speed / 100 );
            $speeds[1].className = 'speed1' + ~~ (status.speed / 10 % 10 );
            $speeds[2].className = 'speed2' + ~~ (status.speed % 10 );

            // l = 0;
            // because , before start the game , the robot car should run first
            // For a reason , we set the robot car , has run the 1/6 of all the
            // distane .
            //var robotDistance = status.robotDistance + robotStartDistancePercent * GAME_MAX_DISTANCE;
            var robotDistance = status.robotDistance;
            dur = robotDistance - status.distance;
            p = dur / GAME_MAX_DISTANCE;

            // change car position
            // GAME_PLAYING  and GAME_OVER all need to modify the car position
            // and car wheel blur status
            //if( status.gameStatus == game.GAME_PLAYING || status.gameStatus == game.GAME_OVER ){
                //l = ( winWidth - car1width ) / 2 + ~~ ( status.speed / GAME_MAX_SPEED * 100 );
                //l = ( winWidth - car1width ) / 2;
                //$cars.eq(0)
                    //.stop( true , false )
                    //.css('left' , l )
                //    [ status.speed > 30 ? 'addClass' : 'removeClass' ]('wheelblur');
                // change car wheels
                //$car1Wheels.rotate( status.distance * 80 );
            //}

            // change robot car position

            // need to reduce car2width for first starting
            /*if( status.gameStatus == game.GAME_READY ){
                rl = - car2width / 2 + Math.min( 10 * Math.sqrt( Math.abs(p) ) * GAME_MAX_DISTANCE  , 2 * screenWidth );
            } else {
                var _tmpRl = - car2width / 2 + 20 * p * GAME_MAX_DISTANCE;
                rl = _tmpRl + ( rl - _tmpRl ) * 9 / 10;
            }
            */

            //rl = 10 * p * GAME_MAX_DISTANCE + winWidth / 2;
            rl =  - (  status.speed - 100 ) / ( GAME_MAX_SPEED - 100) * car2width / 2 - 85
                     + winWidth / 2 ;
            if( lastl ){
                rl = rl + ( lastl - rl ) * 9 / 10;
            }
            lastl = rl;
            $cars.eq(1)
                //.stop( true , false )
                .css({
                    marginLeft: rl
                })
                [ status.robotSpeed > 30 ? 'addClass' : 'removeClass' ]('wheelblur');
            $car2Wheels.rotate( robotDistance * 80 );

            // change car dot position
            //p1 = 6 + status.speed / GAME_MAX_SPEED * 3;
            //p2 = p1 + p * 88 ;
            //$carDot.css('left' , p1 + '%');
            // change robot dot position

            $robotDot[0].style.marginLeft = Math.max( 0 , Math.min( p , 1 ) * 279 ) + 'px';

            //  move bg and motion road
            moveBgAndMotionRoad( status );

            // change bar background
            $bar[0].className = 'b-bar' + ( dur < GAME_MAX_DISTANCE * 0.4 ? 0 :
                    dur < GAME_MAX_DISTANCE * 0.65 ? 1 :
                    dur < GAME_MAX_DISTANCE * 0.9 ? 2 : 3 ) ;
            // $bar[0].className = 'b-bar' + ( status.speed < 100 ? 3 : 0 );
            // show time
            if( status.gameStatus == game.GAME_PLAYING ){
                var time = status.time + ( +new Date() - status.startTime );
                var m = ~~ ( time / 1000 / 60 );
                var s = ~~ ( time / 1000 % 60 );
                var ss = ~~ ( time % 1000 / 100 );
                $timeBoard.html([ m > 9 ? m : '0' + m ,
                     s > 9 ? s : '0' + s ,
                     ss ].join(':'));
                if( dur > GAME_MAX_DISTANCE
                    // or the game is not running ,this used to computer controll the game
                    || status.result !=-1 ){
                    var isWin = status.result !=-1 ? status.result :
                        time >= 0.6 * 60 * 1000;
                    gameOver( status , isWin );
                }
            }
        }
    });


    var _getRankList = function( month ){
        // Get list
        $.ajax({
            url: "data/public/index.php/home/getrecord",
            data: {month: month},
            dataType: "JSON",
            success: function(res){
                _renderList( res.data );
            }
        });
    }
    var _renderList = function( dataArr ){
        var aHtml = ['<div class="r-list-l"><table><tbody>'];
        var tpl = '<tr><td>#{i}</td><td>#{n}</td><td>#{t}</td><td>#{d}</td></tr>';

        $.each( dataArr , function( i , data ){
            var item = data.original;
            var time = item.time;
            var m = ~~ ( time / 1000 / 60 );
            var s = ~~ ( time / 1000 % 60 );
            var ss = ~~ ( time % 1000 / 10 );
            var str = [ m > 9 ? m : '0' + m ,
                 s > 9 ? s : '0' + s ,
                 ss ].join(':');

            aHtml.push( format( tpl , {
                i   : i + 1
                , n : item.name
                , t : str
                , d : parseInt(item.distance) + 'm'
            } ) );
            if( i == 4 ){
                aHtml.push('</tbody></table></div><div class="r-list-r"><table><tbody>');
            }
            if( i == 9 ){
                return false;
            }
        } );

        aHtml.push('</tbody></table></div>');

        $('#ranking-mask').find('.r-list')
            .html( aHtml.join('') );
    }

    /*
     * id  :
     * init: function( $panel ){}
     * onShow:
     * onAfterShow:
     * onAfterCLose:
     * noBgClose: true | false
     */
    var panelData = {};
    var showPanel = function( cfg , data ){
        panelData = data;
        var $panel = $( '#' + cfg.id );
        if( !$panel.length ){
            // add file from template
            $(document.body).append( $('#' + cfg.id + '-tpl').html() );
            $panel = $( '#' + cfg.id );

            var closePanel = function(){
                if( !cfg.noShowAnimate ){
                    $panel.find('.lpn-panel').animate({
                        height: 0
                    } , 600 , 'easeOutQuart' , function(){
                        var $t = $(this);
                        $panel.fadeOut(function(){
                            $panel.hide();
                            $t.height('auto');
                            if( cfg.onAfterCLose )
                                cfg.onAfterCLose( $panel );
                        });
                    });
                } else {
                    $panel.fadeOut(function(){
                        $panel.hide();
                            if( cfg.onAfterCLose )
                                cfg.onAfterCLose( $panel );
                        });
                }
            }
            $panel.on('close' , closePanel );

            $panel.click(function(e){ // click itself to close the panel
                if( e.target == this && !cfg.noBgClose ){
                    closePanel();
                }
            })
            .find('.r-close,.close') // click close btn
            .click( closePanel );


            if( cfg.init ){
                cfg.init( $panel );
            }
        }

        $panel.css('opacity' , 1).hide().fadeIn();

        if( cfg.onShow )
            cfg.onShow( $panel );

        if( !cfg.noShowAnimate ){
            var height = $panel.find('.lpn-panel').height();
            $panel.find('.lpn-panel').css('height', 0 ).animate({height:height},500,'easeInQuart' , function(){
                if( cfg.onAfterShow ) cfg.onAfterShow( $panel );
            });
        } else {
            if( cfg.onAfterShow ) cfg.onAfterShow( $panel );
        }
    }

    var panelConfigs = {
        'result-panel' : {
            id: 'result-mask',
            noBgClose: true,
            onAfterCLose: function(){
                reset();
            },
            init: function( $resultPanel ){
                var validateConfig = {
                    rules: {
                        email: {
                            required: true,
                            email: true
                        },
                        tel: {
                            required: true
                        },
                        name: "required",
                        code: {
                            required: true,
                            number: true
                        },
                        address: "required"
                    },
                    messages: {
                        email: "请输入正确的邮箱",
                        name: "请输入姓名",
                        code: "请输入正确的邮编",
                        address: "请输入地址"
                    },
                    submitHandler: function (form) {
                        $.ajax({
                            url: "data/public/index.php/home/register",
                            dataType: "JSON",
                            type: "POST",
                            data: $(form).serialize(),
                            success: function(res){
                                if(res.code == 200){
                                    var result = panelData.result;
                                    //result.time = 8338367;
                                    //result.result = 3;

                                    // Save record
                                    var _time = result.time;
                                    var _distance = result.distance;
                                    var m = ~~ ( _time / 1000 / 60 );
                                    var s = ~~ ( _time / 1000 % 60 );
                                    var ss = ~~ ( _time % 1000 / 10 );
                                    // 0 : failure
                                    // 1 : success
                                    var _status = result.result;
                                    var _name = $('#username').val();
                                    var _uid = res.data.attributes.uid;
                                    $.ajax({
                                        url: "data/public/index.php/home/record",
                                        dataType: "JSON",
                                        type: "POST",
                                        data: {uid:_uid, time:_time,distance:_distance,status:_status,name:_name},
                                        success: function(res){

                                        }
                                    });
                                    $(form)
                                        .parent()
                                        .children()
                                        .hide()
                                        .filter('.result-form-suc')
                                        .fadeIn();
                                }
                            }
                        });
                        return false;
                    }
                };

                seajs.use('jquery.validate' , function(){
                  $resultPanel
                      .find('.btn-again')
                      .click(function(){
                          $resultPanel
                              .trigger('close');
                      })
                      .end()
                      .find('.btn-submit')
                      .click(function(){
                          $('.result-form').submit();
                      })
                      .end()
                      .find('.result-form').validate(validateConfig);
                });
            },
            onShow: function( $resultPanel ){
                var isWin = panelData.isWin;
                var result = panelData.result;
                $resultPanel.find('.result-con')
                    .children()
                    .hide()
                    .filter( isWin ? '.result-tit,.result-form' : '.result-failure')
                    .fadeIn();

                var _time = result.time;
                var m = ~~ ( _time / 1000 / 60 );
                var s = ~~ ( _time / 1000 % 60 );
                var ss = ~~ ( _time % 1000 / 10 );
                var shareCopy = '我在911五十周年的竞速游戏中追逐了'+ ~~result.distance / 1000 +'公里，用时'+m+':'+s+':'+ss;
                $('#share_sina').attr('href','http://v.t.sina.com.cn/share/share.php?title='+shareCopy+'&url=http://50years911.porsche-events.cn%2f&pic=http://50years911.porsche-events.cn/91150th.jpg&appkey=2455498088');
                //$('#share_qzone').attr('href','http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=http://50years911.porsche-events.cn%2f&amp;amp;title='+shareCopy);
                //$('#share_kaixin').attr('href','http://www.kaixin001.com/repaste/share.php?rtitle=Fascination+Porsche+2013&rurl=http://50years911.porsche-events.cn%2f&rcontent='+shareCopy);
                $('#share_qq').attr('href','http://v.t.qq.com/share/share.php?title='+shareCopy+'&pic=http://50years911.porsche-events.cn/91150th.jpg')
                $('#share_renren').attr('href','http://share.renren.com/share/buttonshare.do?link=http://50years911.porsche-events.cn%2f&title='+shareCopy);
                $('#share_douban').attr('href','http://shuo.douban.com/!service/share?url=http://50years911.porsche-events.cn%2f&name='+shareCopy);
            },
            onAfterShow: function( $resultPanel ){
                var $times = $resultPanel
                    .find('.result-head span');
                var result = panelData.result;
                // count time
                new Animate([0] , [result.time] , 2000 , '' , function( arr ){
                    var time = arr[0] ;
                    var m = ~~ ( time / 1000 / 60 );
                    var s = ~~ ( time / 1000 % 60 );
                    var ss = ~~ ( time % 1000 / 10 );
                    var str = [ m > 9 ? m : '0' + m ,
                         s > 9 ? s : '0' + s ,
                         ss > 9 ? ss : '0' + ss].join('');
                    $times.each(function( i ,dom ){
                        this.className = 'time' + (i+1) + ' time' + (i%2?1:0) + str[i];
                    });
                });
            }
        },
        'ranking-panel' : {
            id: 'ranking-mask',
            onAfterCLose: function(){
                goon();
            },
            init: function( $rankingPanel ){
                $rankingPanel
                    .find('.r-head .btn') // click month to change the rank list
                    .click(function(){
                        // change style
                        $(this)
                            .siblings()
                            .removeClass('selected')
                            .end()
                            .addClass('selected');
                        // get month
                        var month = parseInt( $(this).text() );
                        // render list
                        _getRankList( month );
                    })
                    .end();
            },
            onShow: function( $rankingPanel ){
                pause();
                // Get list
                $.ajax({
                    url: "data/public/index.php/home/getrecord",
                    dataType: "JSON",
                    success: function(res){
                        _renderList( res.data );
                    }
                });
            }
        },
        'spirit-panel' : {
            id: 'spirit-mask',
            noBgClose: true,
            onAfterShow: function( $spiritPanel ){
                setTimeout(function(){
                    $spiritPanel.trigger('close');
                } , 3000 );
            },
            onAfterCLose: function(){
                showPanel( panelConfigs['result-panel'] , panelData );
            }
        },
        'rule-panel' : {
            id: 'rule-mask',
            onShow: function(){
              pause();
            },
            onAfterCLose: function(){
              goon();
            }
        },
        'gallery-panel' :{
            id: 'gallery-mask',
            noShowAnimate: true,
            onAfterCLose: function(){
                goon();
            },
            init: function( $gallery ){
                // Gallery
                // require jquery ani plugin
                seajs.use( 'jquery.fancybox' , function(){

                    // init tabs
                     selectTag($('#gallery-mask').find('.btn1') , function(){
                        var index = $(this).index();
                        // show gallery photos
                        $('#gallery-mask').find('.photo-gallery,.video-gallery')
                            .hide()
                            .eq( index )
                            .fadeIn()
                            .end() //show sliders
                            .end()
                            .find('.photo-slider,.video-slider')
                            .hide()
                            .eq( index )
                            .fadeIn();
                    });


                    var $photoGallery = $('#gallery-mask').find('.photo-gallery');
                    var $photos = $photoGallery.find('.photo');
                    var len = $photos.length;
                    // init slider
                    initSliderBtn( $('#gallery-mask').find('.photo-slider .slider-btn') ,
                     $('#gallery-mask').find('.photo-gallery') , 0 , 1024 ,
                     Math.max( Math.ceil( len / 2) - 3 , 0 ) * 357 );

                    $photos.each( function( i ){
                      var half = Math.ceil( len / 2 );
                      var left = ( i % half ) * 360;
                      var top = parseInt( i / half ) * 219;
                      if( i >= half ){
                          left -= 79;
                      }
                      $(this).css({left:left,top:top});
                    } );

                    var $videoGallery = $('#gallery-mask').find('.video-gallery');
                    var $vphotos = $videoGallery.find('.photo');
                    var vlen = $vphotos.length;

                     initSliderBtn( $('#gallery-mask').find('.video-slider .slider-btn') ,
                     $('#gallery-mask').find('.video-gallery') , 0 , 1024 ,
                     Math.max( Math.ceil( vlen / 2) - 3 , 0 ) * 357 );

                    $vphotos.each( function( i ){
                      var half = Math.ceil( vlen / 2 );
                      var left = ( i % half ) * 360;
                      var top = parseInt( i / half ) * 219;
                      if( i >= half ){
                          left -= 79;
                      }
                      $(this).css({left:left,top:top});
                    } );

                    $vphotos.find('a').fancybox({
                        width: 720,
                        height: 405,
                        type: 'iframe',
                        iframe: {scrolling:'no'},
                        openMethod : 'dropIn',
                        padding: 0
                    });

                    $photos.find('a').fancybox({
                      openMethod : 'dropIn',
                      padding: 0,
                      tpl: {
                          wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><a target="_blank" class="fancybox-download"></a><div class="fancybox-share"><div class="fancybox-share-list"></div></div><div class="fancybox-inner"></div></div></div></div>'
                      },
                      afterShow: function(){
                        var picurl = $(this).attr('href');
                        $('.fancybox-download').attr('href',picurl.replace('jpg','zip'));
                        $('.fancybox-share-list').append('<a target="_blank" href="http://v.t.sina.com.cn/share/share.php?title=911%2050th&amp;pic=http://50years911.porsche-events.cn/'+picurl+'&amp;appkey=2455498088" title="分享到新浪微博" class="sina"></a>' +
                            '<a target="_blank" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=http://50years911.porsche-events.cn%2f&amp;amp;title=911%2050th&amp;pic=http://50years911.porsche-events.cn/'+picurl+'" title="分享到QQ空间" class="qzone"></a>' +
                            '<a target="_blank" href="http://www.kaixin001.com/repaste/share.php?rtitle=Fascination+Porsche+2013&amp;amp;rurl=http://50years911.porsche-events.cn%2f&amp;amp;rcontent=911%2050th&amp;pic=http://50years911.porsche-events.cn/'+picurl+'" title="分享到开心网" class="kaixing"></a>' +
                            '<a target="_blank" href="http://v.t.qq.com/share/share.php?title=911%2050th&amp;&amp;pic=http://50years911.porsche-events.cn/'+picurl+'" title="分享到QQ微博" class="qqwb"></a>' +
                            '<a target="_blank" href="http://share.renren.com/share/buttonshare.do?link=http://50years911.porsche-events.cn%2f&amp;title=911%2050th&amp;pic=http://50years911.porsche-events.cn/'+picurl+'" title="分享到人人网" class="renren"></a>' +
                            '<a target="_blank" href="http://t.sohu.com/third/post.jsp?&amp;url=http://50years911.porsche-events.cn%2f&amp;title=911%2050th&amp;pic=http://50years911.porsche-events.cn/'+picurl+'" title="分享到搜狐微博" class="tt"></a>');

                            if(_isIpad){
                                $('.fancybox-share-list').appendTo('.fancybox-outer');
                                $('.fancybox-share-list').append('<div class="share-close"></div>')
                            }
                            $('.fancybox-share').on('touchend',function(e){
                                e.preventDefault();
                                $('.fancybox-share-list').fadeIn();
                            });
                            $('.share-close').click(function(){
                                $('.fancybox-share-list').fadeOut();
                            });

                      }

                    });

                    (function ($, F) {
                        F.transitions.dropIn = function() {
                            var endPos = F._getPosition(true);
                            endPos.opacity = 0;
                            endPos.top = (parseInt(endPos.top, 10) - 400);

                            F.wrap.css(endPos).show().animate({
                                top: endPos.top + 400,
                                opacity: 1
                            }, {
                                easing: 'easeOutQuart',
                                duration: 800,
                                complete: F._afterZoomIn
                            });
                        };

                        F.transitions.dropOut = function() {
                            F.wrap.removeClass('fancybox-opened').animate({
                                top: '-=200'
                            }, {
                                duration: F.current.closeSpeed,
                                complete: F._afterZoomOut
                            });
                        };

                    }(jQuery, jQuery.fancybox));
                });
            },
            onShow: function( $gallery ){
                //Pause the game
                pause();
                $gallery.fadeIn();
            }
        }
    }
    var gameOver = function( result , isWin){
        game.over( isWin );

        var r = {};
        $.extend( r , result );
        // show spirit panel
        showPanel( panelConfigs['spirit-panel'] , {result:r , isWin:isWin} );

        // Save record
        var _time = result.time;
        var _distance = result.distance;
        var m = ~~ ( _time / 1000 / 60 );
        var s = ~~ ( _time / 1000 % 60 );
        var ss = ~~ ( _time % 1000 / 10 );
        // 0 : failure
        // 1 : success
        var _status = result.result;
        var _name = $('#username').val();

//        $.ajax({
//            url: "data/public/index.php/home/record",
//            dataType: "JSON",
//            type: "POST",
//            data: {month:_time,distance:_distance,status:_status,name:_name},
//            success: function(res){
//
//            }
//        });
    }

    var counterTimer = null;
    var counterAnimate = null;
    var counter = function( callback ){
        stopCounter();
        // hide all num first
        var $nums = $counter.find('.num').hide();
        var len = $nums.length;
        ~(function showNum( ){
            var $t = $nums.eq( --len )
                .fadeIn();
            if( len == -1 ){
                // hide the counter panel
                $counter.find('.c-mouse').animate({'margin-left':1000,'opacity':0},400,'easeOutQuart');
                $counter.find('.c-bg').delay(200).animate({'margin-left':1000,'opacity':0},400,'easeOutQuart',function(){
                    $(this).parent().hide();
                });
                $t.hide();
                callback && callback();
                return;
            }
            M.motionBlur( $t[0] , 0 );
            counterTimer = setTimeout( function(){
                counterAnimate = new Animate( [ 0 ] , [ 100 ] , 200 , '' , function( arr ){
                    M.motionBlur( $t[0] , ~~arr[ 0 ] );
                } , function(){
                    $t.hide();
                    showNum();
                });
            } , 800 );
        })();
    }

    var stopCounter = function(){
        clearTimeout( counterTimer );
        if( counterAnimate )counterAnimate.pause();
    }

    var _driveCarToSence = function( $car ){
        var index =  $cars.index( $car[0] );
        var dur = 3500 ;
        var delay = 0;//Math.random() * 1000;
        var w = $car.width();
        var marginLeft = - w / 2;
        if(index == 1)
            marginLeft =  winWidth ;
        $car.show()
            .css('margin-left' , - w - winWidth)
            .delay( delay )
            .animate({
                'margin-left' : marginLeft
            } , dur , 'easeInQuart');

        // run car dot
        var $dot = index == 0 ? $carDot : $robotDot;
        var marginLeft = index == 0 ? '20px' : '0';
        $dot.delay(delay)
            .fadeIn()
            .css('marginLeft' , marginLeft );

        var $wheels = index == 0 ? $car1Wheels : $car2Wheels;
        // run the wheel
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

        $('.main-board').animate({left:'50%'},1000,'easeInOutQuart');
        // drive robot along

        // 2.counter the seconds
        // show counter btn
        resetCounter( function(){
            game.start( );
        } );
        // when count to four,  start the robot
        // set robot car in the middle of the page
        /*
        $cars.eq(1)
            .fadeIn()
            .css({
                'margin-left' : - car2width / 2
            });
        setTimeout( function(){
            $robotDot.show().css('left' , '6%');
            game.start();
        } , 3000 );
        */
        // drive ’my car ‘ to sence
        //_driveCarToSence( $cars.eq(0) );
        // show car dot
        $carDot.show().css('marginLeft' , 21);
        _driveCarToSence( $cars.eq(1) );


        // pre motion road
        if( !_isIpad && isSupportCanvas){
            if( !$roadCan )
                $roadCan = $('<canvas>')
                    .attr({
                        id: 'can-road'
                        , width: screenWidth
                        , height: 256
                    })
                    .insertBefore($road.hide());
        }
        motionRoad( 0 );
    }
    var resetCounter = function( cb ){
        $counter.show()
            .find('.c-bg')
            .css({
                  opacity   : 1
                , marginLeft: 0
                })
            .end()
            .find('.c-mouse')
            .css({
                  opacity   : 1
                , marginLeft: 0
            })
            .addClass('shake');

        counter( cb );
    }
    var reset = function(){
        // reset the game
        game.reset();
        // ..1. reset start btn
        $startBtn//.attr('src' , $startBtn.attr('osrc'))
            .animate({
                    opacity : 1
                ,   marginLeft: 0
            })
            .removeClass( lockClass )
            .show();
        // ..2. reset ready panel
        $counter.hide();
        // ..3. reset cars position
        $cars.hide();
        // ..4. reset car dots position
        $carDot.add( $robotDot )
            .hide();
        // ..5. reset bar
        $bar[0].className = 'b-bar0';
        //$('.main-board').animate({left:'-50%'});

        // reset speed board
        $speeds[0].className = 'speed00';
        $speeds[1].className = 'speed10';
        $speeds[2].className = 'speed20';
        $timeBoard.html('00:00:0');
        // reset bg
        $bg.css( 'marginLeft' , 0 )
            .attr('src' , './images/' + bgConfig[0].src);
        lastBgDistance = 0;

        currRoadIndex = 0;
        bgIndex = 0;
        // reset road
        motionRoad( 0 );
        gStatus = null;
        //ready();
    }

    var goon = function(){
        if( !gStatus || gStatus && gStatus.gameStatus != game.GAME_PAUSE )
        {
            $('.bg-pause').fadeOut();
            return;
        }
        //1. show ready panel
        // 2.counter the seconds
        // show counter btn
        $('.icon-pause').fadeOut();
        $('.bg-pause').fadeOut();

        resetCounter( function() {
            game[ gStatus ? 'play' : 'start' ]( );
        });
    }

    var pause = function(){
        if( gStatus && gStatus.gameStatus == game.GAME_OVER  ) return;
        // hide the counter panel
        $counter.hide();
        // stop the counterTimer
        stopCounter();
        $('.icon-pause').fadeIn();
        $('.bg-pause').fadeIn();
        // pause the game
        if( gStatus && gStatus.gameStatus == game.GAME_PLAYING )
            game.pause();

        // show goon panel
        /*
        $goon.fadeIn()
            .css({'margin-left':0 , opacity: 1});
            */
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
    /*
    var $goon = $('#goon-btn')
        .click(function(){
            $(this).animate({'margin-left':2000,opacity:0},500,'easeInQuart',function(){
                $(this).hide();
                goon();
            });
        })
        .hover(function(){
            $(this).addClass('animated tada');
        },function(){
            $(this).removeClass('animated tada');
        });
    */
    var $startBtn = $('#start-btn')
        .click(function(){
//            var $t = $( this );
//            if( $t.hasClass( lockClass ) ) return;
//            $t.addClass( lockClass );
//            var i = 0;
//            // motion blur
//            new Animate( [ 0 ] , [ 140 ] , 300 , '' , function( arr ){
//                M.motionBlur( $t[0] , ~~arr[ 0 ] );
//                i++;
//                $t.css( 'opacity' , Math.pow( 1 / i , 1 / 4 ) );
//            } , function(){
//                // hide start btn
//                $t.hide()
//                    .addClass( lockClass );;
//                ready();
//            } );
            $(this).removeClass('animated');
            $(this).animate({'margin-left':2000,opacity:0},500,'easeInQuart',function(){
                $(this).hide();
                ready();
            });

            // run the robot car
            // setTimeout(runRobot,2000);

        })
        .hover(function(){
            $(this).addClass('animated tada');
        },function(){
            $(this).removeClass('animated tada');
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

    var bgIndex = 0;
    var lastBgDistance = 0;
    // cache last motion arguments
    // reduce the Consume of image motion
    var lastMotionValue = -1;
    var changeSence = false;
    var $senceBg = null;

    var moveBgAndMotionRoad = function( status ){

        var motionValue = ~~ ( status.speed / 20 ) * 5 ;
        if( ( status.distance - lastBgDistance ) * 1.2 + winWidth > bgConfig[ bgIndex ].width
         && !changeSence){
            changeSence = true;
            var lastBgIndex = bgIndex;
            var animateTime = 1000;
            bgIndex = ++bgIndex % bgConfig.length;
            // create sence
            if( !$senceBg ){
                $senceBg = $('<div></div>')
                    .css({
                        position: 'absolute'
                        , zIndex: 1000
                        , fontSize: '0px'
                        , lineHeight: '0px'
                        , bottom: $bg.css('bottom')
                    })
                    .insertBefore( $bg );
            }
            var totalWidth = bgConfig[lastBgIndex].width + bgSenceConfig[lastBgIndex].width + bgConfig[bgIndex].width;
            $senceBg
                .hide()
                .html('')
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
                } , 2000 , 'easeInCubic' , function(){
                    changeSence = false;
                    $(this).hide();

                    lastBgDistance = status.distance;
                });

            setTimeout(function(){
                // pre set bg
                $bg[0].setAttribute( 'src' , './images/' + bgConfig[bgIndex].src );
                $bg[0].style.marginLeft = '0px';
                // .. motion road ,
                // run motionRoad function, change the road to next type.
                motionRoad( status.speed == 0 ? 0 :
                            Math.min( motionValue + 5 , 20 ) , true );
            } , 1000 );
        } else {
            if( !changeSence ){
                $bg[0].style.marginLeft = - ( status.distance - lastBgDistance ) * 1.2 + 'px';
            }
            // .. motion road ,
            if( lastMotionValue != motionValue ){
                motionRoad( status.speed == 0 ? 0 :
                        Math.min( motionValue + 5 , 20 ) );

                lastMotionValue = motionValue;
                motionValue = 0;
            }
        }

        // move the road
        if( _isIpad || !isSupportCanvas ){
            $road[0].style.marginLeft = - status.distance * 150 % currRoadConfig.width + 'px';
        } else {
            $roadCan[0].style.marginLeft = - status.distance * 150 % currRoadConfig.width + 'px';
        }
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

    var currRoadIndex = 0;
    var currRoadConfig = roadConfig[0];
    var motionRoad = function( radius , bGetNext ){
        // city road
        var motionCache = M.getMotionCache();
        currRoadIndex = bGetNext ? ++currRoadIndex % roadConfig.length : currRoadIndex;

        currRoadConfig = roadConfig[currRoadIndex];

        var width = ( Math.ceil( screenWidth / currRoadConfig.width ) + 3 ) * currRoadConfig.width;
        if( _isIpad || !isSupportCanvas){
            $road.width( width );
            if( bGetNext ){
                $road.css('background-image' , 'url(./images/' + currRoadConfig.src + ')');
            }
            return;
        }
        var canvas = $roadCan[0];

        // reset road width and height
        canvas.width = width;
        M.motionBlur( currRoadConfig.img , radius , 0 , canvas );
    }


    var runRobot = function(){
        var time = 1000;
        // run robot car
        $cars.eq(1)
            .animate({
                marginLeft : winWidth
            } , time , 'easeInQuart' );

        // rotate the wheel
        new Animate([ 0 ] , [ 360 * 4 ] , time , 'easeInQuart' , function( arr ){
            $car2Wheels.rotate( arr[0] );
        } );

        // run the car dot
        $robotDot
            .animate({
                'marginLeft' : 235 * robotStartDistancePercent - 11
            } , time );
    }
    // save road cache
    !(function(){

        var motionStart = 5 , motionMax = 20 , motionStep = 5;
        var cacheMotionBlur = function( img ){
            for (var i = motionStart; i <= motionMax; i+=motionStep ) {
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
                if( !_isIpad && isSupportCanvas)
                    cacheMotionBlur( img );
                roadConfig[i].width = this.width;
            }
            img.setAttribute( 'src' , './images/' + roadConfig[i].src );

            roadConfig[i].img = img;
        });
    })();

    // main board init
    !!(function(){
        // 1.0   share btn
        // click share btn to pause the game
        var showShareBtns = function(){
            $shareBgR.stop( true , false )
                .animate({
                    right: -87
                } , 500 , 'easeOutQuart' , function(){
                    $shareCon.css('opacity' , 1).stop(true , false).fadeIn();
                    setTimeout(function(){
                        $shareBtn.stop(true , false).fadeOut();
                    } , 100);
                });
        }
        var hideShareBtns = function(){
            $shareCon.stop(true , false).fadeOut( function(){
                $shareBgR.stop( true , false )
                    .animate({
                        right: 10
                    } , 500 , 'easeOutQuart' , function(){
                        $shareBtn.stop(true , false).fadeIn();
                    } );
            });
        }
        var $shareBgR = $('#main-board-bg-r');
        var $shareBtn = $('#share-btn');
        var $shareCon = $('#share-con');
        $('#share-wrap')
            .hoverIntent(function(){
                pause();
                showShareBtns()
            } , function(){
                goon();
                hideShareBtns();
            });

        // 2. ranking panel
        // main panel click event init
        $('#ranking').click(function(){
            showPanel(panelConfigs['ranking-panel']);
        });

        // 3. rule panel
        $('#rule').click(function(){
            showPanel(panelConfigs['rule-panel']);
        });

        // 3. gallery panel
        $('#gallery').click(function(){
            showPanel(panelConfigs['gallery-panel']);
        });

    })();

    // user login
    /*
    $('#login-mask .login-local')
        .click(function(){
            $('.lpn-register').animate({'margin-left':600,opacity:0},500,'easeOutQuart',function(){
                $(this).hide();
                $('#login-mask .lpn-panel').css({'margin-left':-600,opacity:0,display:'inline-block'}).animate({'margin-left':0,opacity:1},500,'easeOutQuart');
            })
        });

    $('#login-mask .btn-back')
        .click(function(){
            $('#login-mask .lpn-panel').animate({'margin-left':-600,opacity:0},500,'easeOutQuart',function(){
                $(this).hide();
                $('#login-mask .lpn-register').css({display:'inline-block'}).animate({'margin-left':0,opacity:1},500,'easeOutQuart');
            })
        });

    $('.login-form').validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            name: "required"
        },
        messages: {
            email: "请输入正确的邮箱",
            name: "请输入用户名"
        },
        submitHandler: function (form) {
            var name = $(form).find('#uname').val();
            var email = $(form).find('#email').val();
            $.ajax({
                url: "data/public/index.php/home/register",
                dataType: "JSON",
                type: "POST",
                data: {name:name,email:email},
                success: function(res){
                    if(res.code == 200)
                    {
                        var username = res.data.original.name;
                        $('#username').val(username);
                        $('#login-status').html(username + ' <a href="javascript:void(0)" id="logout">退出</a>');
                        $('#login-mask .lpn-panel').animate({'margin-left':600,opacity:0},500,'easeOutQuart',function(){

                            $('#login-mask').hide();
                        });
                    }
                }
            });
            return false;
        }
    });
 */


  /*
    $('body').delegate('#logout','click',function(){
        $.ajax({
            url: "data/public/index.php/home/logout",
            success: function(res){
                location.reload();
            }
        });
    });
   */


   // render video
   var $videoPanel = $('#video-mask');
   window.readyForVideo = true;
   window.playfinished = function(){
      $videoPanel.find('.video-skip').click();
   }

   // bind play video event
   $(window).on( 'play-video' , function(){
      $('.main-com-logo').css({display:'block', opacity:0}).delay(100).animate({opacity:1},800,'easeOutQuart');
        $('.main-logo').delay(900).animate({left:0},400,'easeOutQuart');

        $videoPanel.delay(900).fadeIn(400);
        $videoPanel.find('.video-wrap').delay(1300).animate({height:359},400,'easeOutQuart');
        $videoPanel.find('.video-skip').css({display:'block',opacity:0}).delay(1700).animate({'opacity':0.7}).hover(function(){
            $(this).animate({'opacity':1});
        },function(){
            $(this).animate({'opacity':.7});
        });

        showVideo( 'FlashContent' , "./videos/en_desk.flv" , 720 , 305 );
   } );

   function showVideo( id , src , w , h ){
    if( _isIpad ){
      src = src.replace(/\.[^.]+$/ , '.mp4');
      initVideo( id , src , w , h );
    } else {
      initFlash( id , src , w , h );
    }
   }
   var initVideo = function( id , src , w , h ){
    var $wrap = $( '#' + id );
    var $video = $('<video width="' + w + '" height="' + h + '" controls><source src="' + src + '" type="video/mp4" /></video>');
    $video.appendTo( $wrap )
      .on('ended' , function(){
        window.playfinished();
      });
    $video[0].play();
   }
   var initFlash = function( wrapId , src , stageW , stageH ){
      // JAVASCRIPT VARS

      var cacheBuster = "?t=" + Date.parse(new Date());

      // PARAMS
      var params = {};
      params.allowfullscreen = "true";
      params.allowScriptAccess = "always";
      params.scale = "noscale";
      params.wmode = "transparent";
      //params.wmode = "transparent";

      // ATTRIBUTES
      var attributes = {};
      attributes.id = wrapId;


      /* FLASH VARS */
      var flashvars = {};

      // PLAYER DIMENSIONS inside the SWF
      // if this are not defined then the player will take the stage dimensions defined in the "JAVASCRIPT VARS" section above
      flashvars.componentW = stageW;
      flashvars.componentH = stageH;  // if controller under is set to true then you must change this variable(substract the controller height)

      // if you don't define these then the one defined in the XML file will be taken in consideration
      flashvars.previewFilePath = "video.jpg";
      flashvars.videoFilePath = "videos/en_desk.flv";

      // player settings(if not defined then the player will have the default settings defined in AS)
      flashvars.settingsXMLFile = "settings.xml";


      /** EMBED CODE **/
      seajs.use('swfobject' , function(){
        swfobject.embedSWF("preview.swf"+cacheBuster, attributes.id, stageW, stageH, "9.0.124", "expressInstall.swf", flashvars, params, attributes);
      });
    }

    $('body').nodoubletapzoom();


});
