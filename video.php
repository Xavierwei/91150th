<!doctype html>
<html>
<head>
  <title>Video</title>
  <style type="text/css">
   body {background:#000;margin:0;padding:0;}
  </style>
</head>
<body>
<div id="FlashContent"></div>

<script type="text/javascript" src="./src/modernizr-2.5.3.min.js"></script>
<script type="text/javascript" src="./src/swfobject/swfobject.js"></script>
<script src="./lib/jquery/jquery-1.8.3.min.js"></script>
<script src="./lib/jquery/jquery-ui.min.js"></script>
<script src="src/jquery.video.js"></script>
<link rel="stylesheet" href="./css/jquery-ui.css" />
<link rel="stylesheet" href="./css/jquery.video.css" />
<script type="text/javascript">

    var _isIpad = (function(){
        return !!navigator.userAgent.toLowerCase().match(/ipad/i) ;
    })();
    function showVideo( id , src , w , h ){
        if( $('html.video').length > 0 ){
            src = src.replace(/\.[^.]+$/ , '.mp4');
            src2 = src.replace(/\.[^.]+$/ , '.webm');
            initVideo( id , src , w , h );
        } else {
            initFlash( id , src , w , h );
        }
    }
    var initVideo = function( id , src , w , h ){
        var $wrap = $( '#' + id );
        var $video = $('<video autoplay="autoplay" width="' + w + '" height="' + h + '" controls><source src="' + src2 + '" type="video/webm" /><source src="' + src + '" type="video/mp4" /></video>');
        $video.appendTo( $wrap );
        $('video').video({'autoPlay':true});
        function launchFullScreen(element) {
            if(element.requestFullScreen) {
                element.requestFullScreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            }
        }

        $('.ui-video-fullscreen').live('click',function(){
            console.log(11);
            launchFullScreen($('video')[0]);
        });
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
        flashvars.videoFilePath = "videos/video<?php print $_GET['id'];?>.flv";

        // player settings(if not defined then the player will have the default settings defined in AS)
        flashvars.settingsXMLFile = "settings.xml";


        swfobject.embedSWF("preview.swf"+cacheBuster, attributes.id, stageW, stageH, "9.0.124", "expressInstall.swf", flashvars, params, attributes);
    }


    showVideo( 'FlashContent' , "./videos/video<?php print $_GET['id'];?>.flv" , 720 , 406 );




</script>
</body>
</html>