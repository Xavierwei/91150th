seajs.config({
  // 加载 shim 插件
  plugins: ['shim'],
  // 配置 shim 信息，这样我们就可以通过 require('jquery') 来获取 jQuery
  shim: {
    // for jquery
    'jquery': {
        src: '../jquery/jquery-1.10',
        exports: 'jQuery'
    }
    ,'jquery.easing' : {
        src: '../../src/jquery-plugin/easing/jquery.easing.1.3',
        deps: ['jquery']
    }
    ,'jquery.uniform' : {
        src: '../../src/jquery-plugin/form/jquery.uniform.min',
        deps: ['jquery']
    }
    ,'jquery.validate' : {
        src: '../../src/jquery-plugin/validate/jquery.validate',
        deps: ['jquery']
    }
    ,'jquery.queryloader' :{
        src: '../../src/jquery-plugin/jquery.queryloader22',
        deps: ['jquery']
    }
    ,'jquery.ani' : {
        src: '../../src/jquery-plugin/ani/ani',
        deps: ['jquery.easing']
    }

    ,'jquery.mobile': {
        src: '../../m/src/jquery.mobile-1.3.0',
        deps: ['jquery']
    }
    ,'jquery.fancybox': {
        src: '../../src/jquery-plugin/slider/jquery.fancybox.pack',
        deps: ['jquery']
    }
    // for ie6 fix png
    ,'uglyFuckIe6' : {
        src: '../../src/DD_belatedPNG_0.0.8a-min',
        exports: 'DD_belatedPNG'
    }
    // for raphael
    ,'raphael': {
        src: '../raphael/raphael',
        exports: 'Raphael'
    }

    // for bootstrap
    ,'bootstrap': {
        src: '../raphael/raphael-min'
    }
	// for checking browser
	,'modernizr': {
        src: '../../src/modernizr-2.5.3.min',
		exports: 'modernizr'
    }
      // for checking browser
      ,'jquery.hoverIntent': {
          src: '../../src/jquery-plugin/jquery.hoverIntent.minified',
          exports: 'jquery.hoverIntent'
      }
    // for flash player
    ,'swfobject': {
      src: '../../src/swfobject/swfobject',
      exports: 'swfobject'
    }
  },
  alias : {
    'util' : '../src/util/util'
  }
});