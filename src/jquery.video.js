$.widget("ui.video", {
		// default options
		options: {
			volume: .5,
			fadeSpeed: 1000,
			fadeDelay: 2000,
			minHeight: 0,
			minWidth: 0,
			width: null,
			height: null,
			autoPlay: false,
			loop: false,
			autoBuffer: false
		},

		_create: function() {
			var self = this;

			var videoOptions = {
				width: Math.max( self.element.outerWidth() , self.options.minWidth ),
				height: Math.max( self.element.outerHeight() , self.options.minHeight ),
				autoplay: self.options.autoPlay,
				controls: false,
				loop: self.options.loop,
				autobuffer: self.options.autoBuffer
			};

			self.element.wrapAll( $('<div />',{'class': 'ui-video-widget'}) );

			/**
			 * @type {!Object}
			 * @private
			 */
			self._wrapperElement = self.element.parent();
			self._wrapperElement.width( self.element.outerWidth(true) );
			self._wrapperElement.height( self.element.outerHeight(true) );

			/**
			 * @type {!Object}
			 * @private
			 */
			self._oldVideoOpts = {};

			$.each( videoOptions , function( key, value) {
					if( value !== null ) {
						// webkit bug
						if( key == 'autoplay' && $.browser.webkit ) {
							value = false;
						}
						self._oldVideoOpts[key] = self.element.attr( key );
						self.element.attr( key, value );
					}
				}
			);

			var videoEvents = [
				"abort",
				"canplay",
				"canplaythrough",
				"canshowcurrentframe",
				"dataunavailable",
				"durationchange",
				"emptied",
				"empty",
				"ended",
				"error",
				"loadedfirstframe",
				"loadedmetadata",
				"loadstart",
				"pause",
				"play",
				"progress",
				"ratechange",
				"seeked",
				"seeking",
				"suspend",
				"timeupdate",
				"volumechange",
				"waiting",
				"resize"
			];

			$.each( videoEvents, function(){
					if( self["_event_" + this] ) {
						self.element.bind( 
							this + ".video", 
							$.proxy(self["_event_" + this],self) 
						);
					} else {
						self.element.bind( 
							this + ".video", 
							$.proxy(function(){
									console.log("event %s not implemented", this, arguments)
								},
								this
							) 
						);
					}
				}
			);

			self._createControls();

			self._wrapperElement.hover(
				$.proxy(self._showControls,self),
				$.proxy(self._hideControls,self)
			);

			/**
			 * @type {!Object}
			 * @private
			 */
			self._spinnerContainer = $('<div/>', {'class': 'ui-video-spinner-container'});

			/**
			 * @type {!Object}
			 * @private
			 */
			self._spinner = $('<div/>', {'class': 'ui-video-spinner'}).appendTo(self._spinnerContainer);

			self._controls
			.fadeIn(self.options.fadeSpeed)
			.delay(self.options.fadeDelay)
			.fadeOut(self.options.fadeSpeed);

			//self._volumeSlider.slider('value', self.options.volume * 100);

			// webkit bug
			if( self.options.autoPlay && $.browser.webkit ) {
				self.play();
			}
		},

		_createControls: function() {
			var self = this;

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._controls = $('<div/>', 
				{
					'class': 'ui-widget ui-widget-content ui-corner-all ui-video-control'
				}
			)
			.prependTo(self._wrapperElement)
			.position({
					'my': 'bottom',
					'at': 'bottom',
					'of': self.element,
					'offset': '0 -10',
					'collision': 'none'
				}
			);

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._fullScreen = $('<div/>',
				{
					'class': 'ui-video-fullscreen'
				}
			)
			.appendTo(self._controls)

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._currentProgressSpan = $('<span/>', 
				{
					'class': 'ui-video-current-progress', 'text': '00:00'
				}
			)
			.appendTo(self._progressDiv);

			$('<span/>',
				{
					'html': '/',
					'class': 'ui-video-progress-divider'
				}
			)
			.appendTo(self._progressDiv);

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._durationSpan = $('<span/>', 
				{
					'class': 'ui-video-length', 'text': '00:00'
				}
			)
			.appendTo(self._progressDiv);

			/**
			 * @type {!jQuery}
			 * @private
			 */

			self._muteIcon = $('<div/>', 
				{
					'class': 'ui-icon ui-icon-volume-on ui-video-mute'
				}
			)
			.appendTo(self._controls)
			.bind('click.video', $.proxy(self._mute,self));

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._playIcon = $('<div/>', 
				{
					'class': 'ui-icon ui-icon-play ui-video-play'
				}
			)
			.appendTo(self._controls)
			.bind('click.video', $.proxy(self._playPause,self));

			/**
			 * @type {!jQuery}
			 * @private
			 */
//			self._seekPrevIcon = $('<div/>',
//				{
//					'class': 'ui-icon ui-icon-seek-prev ui-video-seek-prev'
//				}
//			)
//			.appendTo(self._controls)
//			.bind('click.video', $.proxy(self.rewind,self));

			/**
			 * @type {!jQuery}
			 * @private
			 */
//			self._seekNextIcon = $('<div/>',
//				{
//					'class': 'ui-icon ui-icon-seek-next ui-video-seek-next'
//				}
//			)
//			.appendTo(self._controls)
//			.bind('click.video', $.proxy(self.forward,self));

			/**
			 * @type {!jQuery}
			 * @private
			 */
//			self._volumeSlider = $('<div/>',
//				{
//					'class': 'ui-video-volume-slider'}
//			)
//			.appendTo(self._controls)
//			.slider({
//					range: 'min',
//					animate: true,
//					stop: function( e, ui ) {
//						ui.handle.blur();
//					},
//					slide: function( e, ui ) {
//						self.volume.apply(self,[ui.value]);
//						return true;
//					}
//				}
//			);

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._scrubberSliderHover =  $('<div/>',
				{
					'class': 'ui-widget-content ui-corner-all ui-video-scrubber-slider-hover'
				}
			)
			.hide();

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._scrubberSlider = $('<div/>',
				{
					'class': 'ui-video-scrubber-slider'
				}
			)
			.appendTo(self._controls)
			.slider({
					range: 'min',
					animate: true,
					start: function( e, ui ) {
						if( self.element[0].readyState === HTMLMediaElement.HAVE_NOTHING ) {
							// We don't have any metadata, so scrubbing is not allowed
							return false;
						} else {
							self._scrubberSliderHover.fadeIn('fast');
							self._scrubberHoverUpdate.apply(self,[ui.handle, ui.value]);
							return true;
						}
					},
					stop: function( e, ui ) {

						ui.handle.blur();
						if( self._scrubberSliderHover.is(':visible') ) {
							self._scrubberSliderHover.fadeOut('fast');
						}

						if( self.element[0].readyState === HTMLMediaElement.HAVE_NOTHING ) {
							// We don't have any metadata, so scrubbing is not allowed
							return false;
						} else {
							// update the current timer as it seems not to be updated at all before starting playback
							self._currentProgressSpan.text(self._formatTime(self.element[0].duration * (ui.value/100)));
							return true;
						}
					},
					slide: function( e, ui ) {
						if( self.element[0].readyState === HTMLMediaElement.HAVE_NOTHING ) {
							// We don't have any metadata, so scrubbing is not allowed
							return false;
						} else {
							self._scrubberHoverUpdate.apply(self,[ui.handle, ui.value]);
							self.scrub.apply(self,[ui.value]);
							return true;
						}
					}
				}
			);

			self._scrubberSliderHover.appendTo(self._scrubberSlider);

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._scrubberSliderAbsoluteWidth = self._scrubberSlider.width();

			/**
			 * @type {!jQuery}
			 * @private
			 */
			self._bufferStatus = $('<div/>', 
				{
					'class': 'ui-video-buffer-status ui-corner-all'
				}
			).appendTo( self._scrubberSlider );


		},
		/** 
		 * @private
		 */
		_scrubberHoverUpdate: function( elem, value ) {
			var self = this;
			var duration = self.element[0].duration;

			self._scrubberSliderHover
			.text(self._formatTime(duration * (value/100)))
			.position({
					'my': 'bottom',
					'at': 'top',
					'of': elem,
					'offset': '0 -10',
					'collision': 'none'
				}
			);


		},
		/** 
		 * @private
		 */
		_playPause: function() {
			var self = this;
			if( self.element[0].paused ) {
				self.play();
			} else {
				self.pause();
			}
		},
		/** 
		 * @private
		 */
		_mute: function() {
			var self = this;
			var muted = self.element[0].muted = !self.element[0].muted;
			self._muteIcon.toggleClass('ui-icon-volume-on', !muted).toggleClass('ui-icon-volume-off', muted);
		},
		/** 
		 * @private
		 */
		_hideControls: function(){
			var self = this;
			self._controls
			.stop(true,true)
			.delay(self.options.fadeDelay)
			.fadeOut(self.options.fadeSpeed);
		},
		/** 
		 * @private
		 */
		_showControls: function(){
			var self = this;
			self._controls
			.stop(true,true)
			.fadeIn(self.options.fadeSpeed);
		},
		/** 
		 * @private
		 */
		_hideSpinner: function(){
			var self = this;
			if( self._spinnerId ) {
				clearInterval( self._spinnerId );
				self._spinnerId = null;
				self._spinnerContainer.fadeOut('fast').remove();
			}
		},
		/** 
		 * @private
		 */
		_showSpinner: function(){
			var self = this;
			if( ! self._spinnerId ) {
				self._spinner.css('left', 0);
				self._spinnerContainer
				.appendTo(self._wrapperElement)
				.position({
						'my': 'center',
						'at': 'center',
						'of': self.element,
						'collision': 'none'
					}
				).fadeIn('fast');
				var spinnerWidth = self._spinner.width();
				var _spinnerContainerWidth = self._spinnerContainer.width();
				self._spinnerId = setInterval(function(){
						var cur_left = Math.abs(self._spinner.position().left);

						self._spinner.css({'left': -((cur_left + _spinnerContainerWidth) % spinnerWidth) });

					},50);
			}
		},		

		/** 
		 * @private
		 */
		_formatTime: function( seconds ) {
			var m = parseInt(seconds / 60);
			var s = parseInt(seconds % 60);
			var sp = s >= 10 ? '' : '0';
			var mp = m >= 10 ? '' : '0';
			return mp + m + ":" + sp + s;
		},


		// Events 
		/** 
		 * @private
		 */
		_event_progress: function(e) {
			var self = this;
			var lengthComputable = e.originalEvent.lengthComputable,
			loaded = e.originalEvent.loaded,
			total = e.originalEvent.total;

			if( lengthComputable ) {
				var fraction = Math.max(Math.min(loaded / total,1),0);

				this._bufferStatus.width(Math.max(fraction * self._scrubberSliderAbsoluteWidth));
			}

		},
		/** 
		 * @private
		 */
		_event_seeked: function() {
			var self = this;
			self._hideSpinner();
		},
		/** 
		 * @private
		 */
		_event_canplay: function() {
			var self = this;
			self._hideSpinner();
		},
		/** 
		 * @private
		 */
		_event_loadstart: function() {
			var self = this;
			self._showSpinner();
		},
		/** 
		 * @private
		 */
		_event_durationchange: function() {
			var self = this;
			self._showSpinner();
		},
		/** 
		 * @private
		 */
		_event_seeking: function() {
			var self = this;
			self._showSpinner();
		},
		/** 
		 * @private
		 */
		_event_waiting: function() {
			var self = this;
			self._showSpinner();
		},
		/** 
		 * @private
		 */
		_event_loadedmetadata: function() {
			var self = this;
			self._durationSpan.text(self._formatTime(self.element[0].duration));
		},
		/** 
		 * @private
		 */
		_event_play: function() {
			var self = this;
			self._playIcon.addClass('ui-icon-pause').removeClass('ui-icon-play');
		},
		/** 
		 * @private
		 */
		_event_pause: function() {
			var self = this;
			self._playIcon.removeClass('ui-icon-pause').addClass('ui-icon-play');
		},

		/** 
		 * @private
		 */
		_event_timeupdate: function() {
			var self = this;
			if( ! self.element[0].seeking ) {
				var duration = self.element[0].duration;
				var currentTime = self.element[0].currentTime;
				self._scrubberSlider.slider(
					'value', 
					[(currentTime/duration)*100]
				);
				self._durationSpan.text(self._formatTime(duration));
				self._currentProgressSpan.text(self._formatTime(currentTime));
			}
		},

		/** 
		 * @private
		 */
		_event_resize: function() {
			var self = this;
			self._controls.position({
					'my': 'bottom',
					'at': 'bottom',
					'of': self.element,
					'offset': '0 -10',
					'collision': 'none'
				}
			);
			self._wrapperElement.width( self.element.outerWidth(true) );
			self._wrapperElement.height( self.element.outerHeight(true) );
		},

		// User functions

		play: function() {
			var self = this;
			self.element[0].play();
		},
		pause: function() {
			var self = this;
			self.element[0].pause();
		},
		mute: function() {
			var self = this;
			self.element[0].muted = true;
		},
		unmute: function() {
			var self = this;
			self.element[0].muted = false;
		},
		rewind: function() {
			var self = this;
			self.element[0].playbackRate -= 2;
		},
		forward: function() {
			var self = this;
			self.element[0].playbackRate += 2;
		},
		volume: function(vol) {
			var self = this;
			self.element[0].volume = Math.max(Math.min(parseInt(vol)/100,1),0);
		},
		scrub: function(pos){
			var self = this;
			var duration = self.element[0].duration;
			var pos = Math.max(Math.min(parseInt(pos)/100,1),0);
			self.element[0].currentTime = pos > 1 ? duration : duration * pos;
		},

		// The destroyer
		destroy: function() {
			var self = this;
			$.each( self._oldVideoOpts , function( key, value) {
					self.element.attr( key, value );
				}
			);

			self._controls.remove();
			self.element.unwrap();
			self.element.unbind( ".video" );
			$.Widget.prototype.destroy.apply(self, arguments); // default destroy
		}


	});

