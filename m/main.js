/*
 * main model
 */
define(function(require, exports, module) {
    var selectTag = function($list , cb , selectClass , eventType){
        selectClass = selectClass || 'selected';
        eventType = eventType || 'click';
        $list.on( eventType , function(ev){
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
    if(!navigator.userAgent.toLowerCase().match(/iphone/i))
    {
        $('body').addClass('andriod');
    }

    document.ontouchmove = function(e){
        e.preventDefault();
        setTimeout( function () {
            window.scrollTo( 0, 1 );
        }, 0 );
    }

    $(window).on('touchstart', function(){
        setTimeout( function () {
            window.scrollTo( 0, 1 );
        }, 0 );

    });

    $(window).on('resize', function(){
        if (($(this).height() > 600 && (window.orientation == 90 || window.orientation == -90)) || !navigator.userAgent.toLowerCase().match(/iphone/i)) {
            $('body').height('100%');
        } else {
            var height = $(window).height();
            $('body').height(height+125);
        }
        setTimeout( function () {
            window.scrollTo( 0, 1 );
        }, 0 );

    });
    $(window).resize();

    $(window).on('orientationchange', function(){
        if(window.orientation == 0)
        {
            $('meta[name=viewport]').attr('content', 'initial-scale=0.5,user-scalable=yes,maximum-scale=0.5,width=device-width');
        }
        else
        {
            $('meta[name=viewport]').attr('content', 'initial-scale=0.5,user-scalable=yes,maximum-scale=0.5,width=960');
        }
    });
    $(window).trigger('orientationchange');

    var eventName = 'touchstart';
    // ---------------------------------------------------------
    // tap nav
    // ---------------------------------------------------------
    // slide down
    $('#J_nav').on( "click" , function(e){
        e.preventDefault();
      $(this).prev().css('top' , -10);
        setTimeout( function () {
            window.scrollTo( 0, 1 );
        }, 0 );
      // TODO ..pause the game
      pause();
    });
    // slide up
    $('#J_nav-up').on( eventName , function(){
      $(this).closest('.nav-b ').css('top' , -300 );
      goon();
    });
    // click share btn
//    $('#J_share').on( eventName , function(){
//      $(this).closest('.nav-main').css('margin-left' , "-100%");
//    });

    $('#J_nav-back').on( eventName , function(){
      $(this).closest('.nav-b ').find('.nav-main').css('margin-left' , "0");
    })

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

    // game logic application
    var game = require('../m/game');
    //var M = require('../app/motion-blur');
    var A = require('../src/Animate');
    var Animate = A.Animate;
    //var isSupportCanvas = M.isSupportCanvas;
    // save the game status
    var gStatus = game.status;
    var winWidth = $(window)
                    .resize(function(){
                        winWidth = $(this).width();
                    }).width();
    var screenWidth = screen.width;
    var GAME_MAX_SPEED = 312;
    var GAME_MAX_DISTANCE = 400;
    var p1 , p2 , p , l , dur , rl , lastl;
    var robotStartDistancePercent = 1 / 6;

    var maxDur = 0;
    var isBigThan100 = false;

    var minLeft = 36;
    game.setConfig({
        duration  : 2000
        , maxSpeed : GAME_MAX_SPEED
        , minRobotSpeed  : 100
        , robotStartDistance : GAME_MAX_DISTANCE / 2
        , onreset : function(){
            maxDur = 0;
            isBigThan100 = false;
        }
        , speedCallBack  : function( status ){
            // render car speed
            $speeds[0].className = 'speed0' + ~~ (status.speed / 100 );
            $speeds[1].className = 'speed1' + ~~ (status.speed / 10 % 10 );
            $speeds[2].className = 'speed2' + ~~ (status.speed % 10 );


            // l = 0;
            // because , before start the game , the robot car should run first
            // For a reason , we set the robot car , has run the 1/6 of all the
            // distane .
            //var robotDistance = status.robotDistance + robotStartDistancePercent * GAME_MAX_DISTANCE;
            var robotDistance = status.robotDistance + GAME_MAX_DISTANCE / 2;
            dur = robotDistance - status.distance;

            maxDur = Math.max( maxDur , dur );
            p1 = maxDur / GAME_MAX_DISTANCE;
            p = dur / GAME_MAX_DISTANCE;



            //rl = 10 * p * GAME_MAX_DISTANCE + winWidth / 2;
            rl =  - (  status.speed - 100 ) / ( GAME_MAX_SPEED - 100) * car2width / 2 - 85
                     + winWidth / 2 ;
            if( status.speed > 100 )
              isBigThan100 = true;

            if( isBigThan100 ){
              rl = Math.min( rl , winWidth / 2 - 120 );
            }
            if( lastl ){
                rl = rl + ( lastl - rl ) * 9 / 10;
            }
            lastl = rl;

            if( status.result == -1 )
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
            // p2 = Math.min( Math.max( ( p1 - p ) * 300 + 21  , 21 ) , 300 / 2 + 21 ) - 21 ;

            // ugly
            /* if( status.distance < 200 ){
              p2 = status.distance / GAME_MAX_DISTANCE * 300 ;
            } else {
              var _tmp = Math.min( Math.max( ( p1 - p ) * 300 + 21  , 21 ) , 300 / 2 + 21 ) - 21 ;
              p2 = _tmp + ( p2 - _tmp ) * 0.995;
            }
            */

            p2 = Math.min( Math.max( ( p1 - p ) * 300 + minLeft  , minLeft ) , 300 / 2 + minLeft ) - minLeft ;
            $carDot.css('left' , minLeft + Math.min( p2  , 300 / 2 ) );
            // change robot dot position

            // if game is not over
            //if( status.result == -1 )
              //$robotDot.css( 'left' , Math.max( 300 / 2 + 21 ,
               // Math.max( 0 , Math.min( p , 1 )* 279 ) + 21 ) );

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
                    var isWin = time >= .3 * 60 * 1000;
                    game.over( isWin );

                    var r = {};
                    $.extend( r , status );
                    // gameOver( r , isWin );
                    // if speed less than 20 , move the dot to right quickly
                    if( status.result !=-1 ){
                      $cars.eq(1)
                        .animate({
                          marginLeft: winWidth / 2
                        } , 1000 );
                      $robotDot.animate({
                        left: 300
                      } , 1000 , '' , function(){
                        gameOver( r , isWin );
                      });
                    }
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
            var item = data;
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
        // slideup nav panel
        $('#J_nav-up').trigger( eventName );

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

                // fille the form
                $('#G_fill-form').on( 'click' , function(){
                    $(this).closest('.result-con')
                        .find('.result-form-suc')
                        .hide()
                        .end()
                        .find('.result-form')
                        .fadeIn();
                });
                var validateConfig = {
                    rules: {
                        email: {
                            required: true,
                            email: true
                        },
                        tel: {
                            required: true,
                            number: true
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
                        tel: "请输入正确的手机号",
                        code: "请输入正确的邮编",
                        address: "请输入地址"
                    },
                    submitHandler: function (form) {
                        $('.btn-submit').fadeOut();
                        $.ajax({
                            url: "../data/public/index.php/home/register",
                            dataType: "JSON",
                            type: "POST",
                            data: $(form).serialize(),
                            success: function(res){

                                $('.btn-submit').fadeIn();
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
                                    var _name = res.data.attributes.name;
                                    var _uid = res.data.attributes.uid;
                                    $.ajax({
                                        url: "../data/public/index.php/home/record",
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
                                        .filter('.result-form-suc2')
                                        .fadeIn();
                                }
                                else
                                {
                                    if(res.code == 500){
                                        if(res.error == 'exist')
                                        {
                                            $('.result-form-exist').fadeIn();
                                        }
                                    }

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

                      $resultPanel.find('.btn-gallery')
                      .click(function(){
                          $resultPanel
                              .trigger('close');
                          showPanel(panelConfigs['gallery-panel']);
                      });
                });
            },
            onShow: function( $resultPanel ){
                var isWin = panelData.isWin;
                var result = panelData.result;
                $resultPanel.find('.result-con')
                    .children()
                    .hide()
                    .filter( isWin ? '.result-form-suc' : '.result-failure')
                    .fadeIn();

                var _time = result.time;
                var m = ~~ ( _time / 1000 / 60 );
                var s = ~~ ( _time / 1000 % 60 );
                var ss = ~~ ( _time % 1000 / 10 );
                var shareCopy = '%e6%88%91%e5%88%9a%e5%8f%82%e5%8a%a0%e4%ba%86%e4%bf%9d%e6%97%b6%e6%8d%b7911%e4%ba%94%e5%8d%81%e5%91%a8%e5%b9%b4%e7%9a%84%e7%89%b9%e5%88%ab%e6%b4%bb%e5%8a%a8%ef%bc%8c%e8%bf%bd%e9%80%90%e4%ba%86'+ ~~result.distance / 1000 +'%e5%85%ac%e9%87%8c%ef%bc%8c%e7%94%a8%e6%97%b6'+m+':'+s+':'+ss+"%ef%bc%8c%e4%bd%a0%e4%b9%9f%e6%9d%a5%e8%af%95%e8%af%95%e5%90%a7! ";
                $('#share_sina').attr('href','http://v.t.sina.com.cn/share/share.php?title='+shareCopy+'&url=http://50years911.porsche-events.cn%2f&pic=http://50years911.porsche-events.cn/91150th.jpg');
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
                var _date = new Date();
                var _month = _date.getMonth()+1;
                $('#ranking-month .btn').remove();
                for(var i = 6; i <= _month; i++)
                {
                    $('#ranking-month').append('<div data-month="'+i+'" class="btn">'+i+'月份<div class="btn-r"></div></div>');
                }
                $('#ranking-month .btn').last().addClass('selected');
                $('#ranking-month .btn').click(function(){
                    var _month = $(this).attr('data-month');
                    $('#ranking-month .btn').removeClass('selected');
                    $(this).addClass('selected');
                    $.ajax({
                        url: "../data/public/index.php/home/getrecord",
                        data: {'m':_month},
                        dataType: "JSON",
                        success: function(res){
                            _renderList( res.data );
                        }
                    });
                });
                $.ajax({
                    url: "../data/public/index.php/home/getrecord",
                    data: {'m':_month},
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
            init: function(){
              $('.rule-content-link').click(function(){
                $('.r-close').click();
                showPanel( panelConfigs['ranking-panel'] , panelData );
              });
            },
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
                // init tabs
                selectTag($('#gallery-mask').find('.btn1') , function(){
                    var index = $(this).index();
                    // show gallery photos
                    $('#gallery-mask').find('.photo-gallery,.video-gallery')
                        .hide()
                        .eq( index )
                        .fadeIn(refreshSlideStatus);
                } , 'selected' , eventName);
                var $fancybox = null;
                var tpl =  '<section class="fancy-slider-mask lpn-mask">\
                                <span class="lpn-ghost"></span>\
                                <div class="lpn-panel">\
                                    <div class="r-close"></div>\
                                    <div class="fancy-slider-wrap">\
                                        <div class="img-wrap clearfix"></div>\
                                        <div class="slider-left"></div>\
                                        <div class="slider-right"></div>\
                                        <a target="_blank" class="r-share"></a>\
                                        <div class="r-share-con btn-share-wrap">\
                                            <div class="r-share-inner">\
                                                <a href="" class="sina"><i></i></a>\
                                                <a href="" class="qqwb"><i></i></a>\
                                                <a href="" class="renren"><i></i></a>\
                                                <a href="" class="douban"><i></i></a>\
                                                <div class="r-share-close">关闭</div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </section>';
                var $thumbImg = null;
                var $imgWrap = null;
                var $currBigImgWrap = null;

                var showImage = function( $img ){
                    if( !$fancybox ){ // create $fancybox
                        var sharecopy = '%23911%e4%ba%94%e5%8d%81%e5%91%a8%e5%b9%b4%23+%e6%88%91%e6%ad%a3%e5%9c%a8%e6%b5%8f%e8%a7%88%e4%bf%9d%e6%97%b6%e6%8d%b7911%e4%ba%94%e5%8d%81%e5%91%a8%e5%b9%b4%e5%9b%be%e7%89%87%ef%bc%8c%e4%bd%a0%e4%b9%9f%e6%9d%a5%e7%9c%8b%e7%9c%8b%e5%90%a7%ef%bc%81';

                        $fancybox = $(tpl).appendTo( document.body )
                            .find('.r-close')
                            .on( eventName , function(){
                                $fancybox.fadeOut(function(){
                                    $imgWrap.css({
                                        left: 0,
                                        marginLeft: 0
                                    })
                                });
                                imagePairs = {};
                                $currBigImgWrap = null;
                            })
                            .end()
                            .find( '.slider-left' )
                            .on( eventName ,slideLeft )
                            .end()
                            .find( '.slider-right' )
                            .on( eventName ,slideRight )
                            .end()
                            .find( '.r-share' )
//                            .on( eventName , function(){
//                                var $shareCon = $fancybox.find(".r-share-con")
//                                    .fadeIn();
//                                // init all the link href
//                                // TODO....... share title
//                                var path = location.href.replace(/\/[^\/]*/ , '/');
//                                var pic = path + $currBigImgWrap.find('img').attr('src');
//                                var title = "";
//                                var url = "http://50years911.porsche-events.cn%2f";
//                                $shareCon.find('.sina')
//                                    .attr('href' , 'http://v.t.sina.com.cn/share/share.php?title='+title+'&url=' + url + '&pic=' + pic);
//                                $shareCon.find('.qqwb')
//                                    .attr('href' , 'http://v.t.qq.com/share/share.php?title='+title+'&url=' + url + '&pic=' + pic);
//                                $shareCon.find('.renren')
//                                    .attr('href' , 'http://share.renren.com/share/buttonshare.do?title='+title+'&link=' + url + '&pic=' + pic);
//                                $shareCon.find('.douban')
//                                    .attr('href' , 'http://shuo.douban.com/!service/share?name='+title+'&url=' + url + '&pic=' + pic);
//                            })
                            .attr('href' , 'http://v.t.sina.com.cn/share/share.php?title='+sharecopy+'&url=http://50years911.porsche-events.cn&pic=http://50years911.porsche-events.cn/' + $(this).attr('src'))
                            .end()
                            .find( '.r-share-close' )
                            .on( eventName , function(){
                                $fancybox.find(".r-share-con")
                                    .fadeOut();
                            })
                            .end();
                        $imgWrap = $fancybox.find('.img-wrap');


                        // init swip
                        initSwipEvent( $fancybox.find('.fancy-slider-wrap') ,
                            function( pxgeX , ev){
                                if( $(ev.target).hasClass('slider-right') || $(ev.target).hasClass('slider-left') )
                                    return false;
                                cacheData.startX = pxgeX;
                                cacheData.$dom = $imgWrap.addClass( noAni );
                                cacheData.left = parseInt( $imgWrap.css('left') ) || 0;
                            },
                            function( pageX ){
                                cacheData.lastX = pageX;
                                cacheData.$dom.css('left' ,
                                    cacheData.left + pageX - cacheData.startX );
                            },
                            function( pageX ){
                                cacheData.$dom.removeClass( noAni );
                                setTimeout(function(){
                                    // move too little
                                    if( Math.abs( cacheData.lastX - cacheData.startX ) < 20 ){
                                        cacheData.$dom.css("left" , cacheData.left );
                                    } else {
                                        if( cacheData.lastX > cacheData.startX )
                                            slideLeft();
                                        else
                                            slideRight();
                                    }
                                })
                            });
                    }
                    $fancybox.fadeIn();
                    $imgWrap.html('');

                    $thumbImg = $img;
                    var $bigImgWrap = bigImgLoad( $img , function(){
                        $bigImgWrap.appendTo( $imgWrap );
                        afterShowImg( $bigImgWrap );
                    } );
                }
                var getThumbPhotoWrap = function( $big ){
                    var index = $big.attr('index');
                    return $thumbImg.closest(".photo-gallery,.video-gallery")
                        .find('.photo')
                        .eq( index );
                }
                var afterShowImg = function( $big ){
                    $currBigImgWrap = $big;
                    var $photo = getThumbPhotoWrap($big);
                    // hide slide btns
                    $fancybox.find(".slider-left")
                        [ $photo.prev().length ?
                        "show" : "hide"]()
                        .end()
                        .find(".slider-right")
                        [ $photo.next().length ?
                        "show" : "hide"]();
                }
                var getNextImg = function(){
                    var $next = getThumbPhotoWrap($currBigImgWrap).next();
                    return $next.length ? $next.find('img') : null;
                }
                var getPrevImg = function(){
                    var $prev = getThumbPhotoWrap($currBigImgWrap).prev();
                    return $prev.length ? $prev.find('img') : null;
                }
                var bigImgLoad = function( $img , cb ){
                    return $('<div class="img-item"></div>').append(
                        $('<img/>')
                        .load( cb )
                        .attr( 'src' , $img.closest('a').attr('href') )
                        .css('height' , '100%' )
                        ).append(
                            // get desc cloned
                            $img.closest('.photo')
                            .find('.desc')
                            .clone()
                        )
                        .css('width' , winWidth )
                        .attr('index' , $img.closest('.photo').index());
                }
                var slideLeft = function(){
                    var index = $currBigImgWrap.index();
                    index += ( parseInt( $imgWrap.css('margin-left') ) || 0 ) / winWidth;
                    if( $currBigImgWrap.prev().length ){
                        $imgWrap.css({
                            'left': - ( index - 1 ) * winWidth
                        })
                        $currBigImgWrap =  $currBigImgWrap.prev();
                        afterShowImg( $currBigImgWrap );
                    } else {
                        var $img = getPrevImg();
                        if( $img ){
                            var $bigImgWrap = bigImgLoad( $img , function(){
                                var $imgs = $imgWrap.find( 'img' );
                                $imgWrap.css({
                                        'width': winWidth * ( $imgs.length + 1 )
                                        ,'margin-left': "-=" + winWidth
                                        ,'left': - ( index - 1 ) * winWidth
                                    })
                                    .prepend( $bigImgWrap );
                                afterShowImg( $bigImgWrap);
                            } );
                        } else {
                            $imgWrap.css({
                                'left': - index * winWidth
                            })
                        }
                    }
                }
                var slideRight = function(){
                    var index = $currBigImgWrap.index();
                    index += ( parseInt( $imgWrap.css('margin-left') ) || 0 ) / winWidth;
                    if( $currBigImgWrap.next().length ){
                        $imgWrap.css({
                            'left': - ( index + 1 ) * winWidth
                        })
                        $currBigImgWrap =  $currBigImgWrap.next();
                        afterShowImg( $currBigImgWrap );
                    } else {
                        var $img = getNextImg();
                        if( $img ){
                            var $bigImgWrap = bigImgLoad( $img , function(){
                                var $imgs = $fancybox.find( '.img-wrap img' );
                                $fancybox.find( '.img-wrap' )
                                    .css({
                                        'width': winWidth * ( $imgs.length + 1 )
                                        ,'left': - ( index + 1 ) * winWidth
                                    })
                                    .append( $bigImgWrap );
                                afterShowImg( $bigImgWrap);
                            } );
                        } else {
                            $imgWrap.css({
                                'left': - index * winWidth
                            })
                        }
                    }
                }
                $gallery.on('click' , '.photo a' , function(){
                    return false;
                });
                $gallery.on('click' , '.photo img' , function(){
                    showImage( $(this) );
                });


                // init slider
                var $inner = $('.photo-wrap-inner');
                var noAni = "no-animate";

                var _getMarginLeft = function( $dom ){
                    return -( ~~ ($dom.attr('index')) || 0 ) * ( 209 + 40 );
                }

                var initSwipEvent = function( $dom , touchStartFun , touchMoveFun , touchEndFun ){
                    var mevent = function( ev ){
                        if( touchStartFun( ev.originalEvent.targetTouches[0].pageX , ev ) === false )
                            return;
                        var moveEvent = function( pageX ){
                            touchMoveFun( pageX )
                        }
                        var endEvent = function(ev){
                            touchEndFun( );
                            $(document)
                              .off('.slide-drag');
                        }
                        // bind mouse move event
                        $(document)
                            .on('touchmove.slide-drag', function( ev ){
                              moveEvent( ev.originalEvent.targetTouches[0].pageX );
                            })
                            .on('touchend.slide-drag', endEvent )
                    }
                    $dom.on('touchstart' , function( ev ){
                        mevent( ev );
                    })
                }

                var cacheData = {};
                initSwipEvent( $inner ,
                    function( pxgeX ){
                        cacheData.startX = pxgeX;
                        cacheData.$gallery = $inner.children(':visible').addClass( noAni );
                        cacheData.marginLeft = _getMarginLeft( cacheData.$gallery );
                    },
                    function( pageX ){
                        cacheData.lastX = pageX;
                        cacheData.$gallery.css('margin-left' ,
                            cacheData.marginLeft + pageX - cacheData.startX );
                    },
                    function( pageX ){
                        cacheData.$gallery.removeClass( noAni );
                        setTimeout(function(){
                            // move too little
                            if( Math.abs( cacheData.lastX - cacheData.startX ) < 20 ){
                                cacheData.$gallery.css("marginLeft" , cacheData.marginLeft );
                            } else {
                                slideFunc( cacheData.lastX > cacheData.startX );
                            }
                        })
                    });

                var $left = $('.slide-left').on( eventName , function(){
                    slideFunc( true );
                } );
                var $right = $('.slide-right').on( eventName , function(){
                    slideFunc( false );
                } );
                var slideFunc = function( bLeft ){
                    var $gallery = $inner.children(':visible');
                    var index = ~~($gallery.attr('index') || 0);
                    var $photos = $gallery.find('.photo');

                    index = index + ( bLeft ? -3 : 3 );
                    index = Math.min( ~~( ($gallery.children().length - 1 ) / 3) * 3 ,  Math.max( index , 0 ) );
                    $gallery.attr( 'index' , index );
                    $gallery.css( 'marginLeft' , - index * ( 209 + 40 ) );
                    refreshSlideStatus();
                }
                var refreshSlideStatus = function(){
                    var $gallery = $inner.children(':visible');
                    var $photos = $gallery.find('.photo');
                    if( $photos.length <= 3 ){
                        // hide all sliders
                        $left.hide();
                        $right.hide();
                        return;
                    }
                    var index = ~~($gallery.attr('index') || 0);

                    $left[ index == 0 ? "hide" : "show" ]();
                    $right[ index >= $photos.length - 3 ? "hide" : "show" ]();
                }

                refreshSlideStatus();
            },
            onShow: function( $gallery ){
                //Pause the game
                pause();
                $gallery.fadeIn();
            }
        }
    }
    var gameOver = function( result , isWin){
        // show spirit panel
        showPanel( panelConfigs['spirit-panel'] , {result:result , isWin:isWin} );
        $('.follow_sina').fadeIn();

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
                $counter.find('.c-mouse,.c-mouse-text').animate({'margin-left':1000,'opacity':0},400,'easeOutQuart');
                $counter.find('.c-bg').delay(200).animate({'margin-left':1000,'opacity':0},400,'easeOutQuart',function(){
                    $(this).parent().hide();
                });
                $t.hide();
                callback && callback();
                return;
            }

            counterTimer = setTimeout(function(){
                $t.hide();
                showNum();
            } , 1000 );


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
        $dot.delay(delay)
            .fadeIn()
            .css('left' , 36 )
            .animate({
              'left': 300 / 2
            } , dur , 'easeInQuart');

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

        game.ready();
        $('.main-board').animate({left:'50%'},1000,'easeInOutQuart');
        // drive robot along

        // 2.counter the seconds
        // show counter btn
        resetCounter( function(){
            game.start( );
        } );

        // show car dot
        $carDot.show().css('left' , 36);
        _driveCarToSence( $cars.eq(1) );


        // pre motion road

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
            //.addClass('shake')
            .end()
            .find('.c-mouse-text')
            .css({
                opacity   : 1
                , marginLeft: 0
            });
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

        lastBgDistance = 0;
        currRoadIndex = 0;
        bgIndex = 0;
        $bg.css({
            'background-image': 'url(./images/' + bgConfig[bgIndex].src + ')',
            'background-position-x': 0
        });
        $road.css({
            'background-image': 'url(./images/' + roadConfig[currRoadIndex].src + ')',
            'background-position-x': 0
        });
        // reset road
        //motionRoad( 0 );
    }

    var goon = function(){
        if( gStatus.gameStatus != game.GAME_READY && gStatus.gameStatus != game.GAME_PAUSE ){
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
        if( gStatus.gameStatus == game.GAME_OVER
        || gStatus.gameStatus == game.GAME_NOT_START ) return;
        // hide the counter panel
        $counter.hide();
        // stop the counterTimer
        stopCounter();
        $('.icon-pause').fadeIn();
        $('.bg-pause').fadeIn();
        // pause the game
        if( gStatus.gameStatus == game.GAME_PLAYING || gStatus.gameStatus == game.GAME_READY  )
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

    var $startBtn = $('#start-btn')
        .click(function(){

            $(this).removeClass('animated');
            $(this).animate({'margin-left':2000,opacity:0},500,'easeInQuart',function(){
                $(this).hide();
                ready();
            });
           //$('.follow_sina').fadeOut();

            // run the robot car
            setTimeout(runRobot,2000);

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

    // init bgconfig width
    $.each( bgConfig , function( i ){
      $('<img/>')
        .load( function(){
          bgConfig[i].width = this.width;
        } )
        .attr('src' , './images/' + bgConfig[i].src );
    } );

    $.each( bgSenceConfig , function( i ){
      $('<img/>')
        .load( function(){
          bgSenceConfig[i].width = this.width;
        } )
        .attr('src' , './images/' + bgSenceConfig[i].src );
    } );

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
                $bg.css({
                    "background-image": 'url(./images/' + bgConfig[bgIndex].src + ')',
                    "background-position-x" : 0
                });
                // .. motion road ,
                // run motionRoad function, change the road to next type.
                motionRoad( status.speed == 0 ? 0 :
                            Math.min( motionValue + 5 , 20 ) , true );
            } , 1000 );
        } else {
            if( !changeSence ){
                $bg.css("background-position-x" ,  - ( status.distance - lastBgDistance ) * 1.2 + 'px');
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
        $road.css('background-position-x' , - status.distance * 150 % currRoadConfig.width + 'px' );
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
        //var motionCache = M.getMotionCache();
        currRoadIndex = bGetNext ? ++currRoadIndex % roadConfig.length : currRoadIndex;

        currRoadConfig = roadConfig[currRoadIndex];

        $road.css({
            'background-image': 'url(./images/' + currRoadConfig.src + ')',
            'background-position-x': 0
            });

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
        $.each(roadConfig , function( i ){
            var img = document.createElement('img');
            img.id = roadConfig[i].id;
            img.onload = function(){
                //cacheMotionBlur( img );
                roadConfig[i].width = this.width;
            }
            img.setAttribute( 'src' , './images/' + roadConfig[i].src );

            roadConfig[i].img = img;
        });
    })();

    // main board init
    !!(function(){
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

    window.readyForGame = true;
    $(window).on( 'game-start' , function(){
        $('.main-metas').animate({left:'50%'},500,'easeInOutQuart');
    });

   function showVideo( id , src , w , h ){
    src = src.replace(/\.[^.]+$/ , '.mp4');
    initVideo( id , src , w , h );
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
});

