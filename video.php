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

<script type="text/javascript" src="./lib/jquery/jquery-1.10.js"></script>
<script type="text/javascript" src="./src/swfobject/swfobject.js"></script>
<script type="text/javascript">

    var _isIpad = (function(){
        return !!navigator.userAgent.toLowerCase().match(/ipad/i) ;
    })();
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
        flashvars.videoFilePath = "videos/video<?php print $_GET['id'];?>.flv";

        // player settings(if not defined then the player will have the default settings defined in AS)
        flashvars.settingsXMLFile = "settings.xml";


        swfobject.embedSWF("preview.swf"+cacheBuster, attributes.id, stageW, stageH, "9.0.124", "expressInstall.swf", flashvars, params, attributes);
    }


    showVideo( 'FlashContent' , "./videos/video<?php print $_GET['id'];?>.flv" , 720 , 406 );




</script>
</body>
</html>