/**
 * DWZ Mobile Framework: UI plugins
 * @author z@j-ui.com
 */

(function($){

	$.config.frag.external = '<iframe src="{url}" style="width:100%;height:{{height}};" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>';

	dwz.regPlugins.push(function($p){

		if ($.fn.touchSlide) $('div.slideBox', $p).each(function(){
			var $this = $(this);
			$this.touchSlide({
				loop: $this.attr('data-loop') !== 'false', // 循环播放
				autoPlay: $this.attr('data-auto-play') !== 'false', // 自动播放
				autoCss: false // js设置容器css
			});
		});

		if ($.navTab) {
			$('a[target=navTab]', $p).touchwipe({
				touch:function(event){
					var $link = $(this),url = $link.attr('data-href');
					var params = url.getParams();
					$.navTab.open({
						tabid: $link.attr('rel'),
						url: url,
						data: params
					});
					event.preventDefault();
				}
			}).hrefFix();
		}

		if ($.navView) {

			$('a[target=navView], li[target=navView]', $p).touchwipe({
				touch:function(event){
					var $link = $(this), url = $link.attr('data-href');
					var params = url.getParams();
					$.navView.open({
						url: url,
						rel: $link.attr('rel')||'_blank',
						data: params,
						external: $link.attr('data-external') || false
					});
					event.preventDefault();
				}
			}).hrefFix();

			$('div.nav-view .back-button', $p).click(function(event){
				$.navView.close(true, true);
				event.preventDefault();
			});
		}

		if ($.dialog) {

			$('a[target=dialog], li[target=dialog]', $p).touchwipe({
				touch:function(event){
					var $link = $(this);
					$.dialog.open({url: $link.attr('data-href'), pop:$link.attr('data-pop')||''});
					event.preventDefault();
				}
			}).hrefFix();

			$('img[target=dialog], a[target=dialog-pic]', $p).touchwipe({
				touch:function(event){
					var $img = $(this);
					$.dialog.open({url: $img.attr('data-href'), pop:'pic', data:{src:$img.attr('data-src') || $img.attr('src')}});
					event.preventDefault();
				}
			});

			$('#dialog .pop-down-close', $p).click(function(event){
				$.dialog.close();
				event.preventDefault();
			});

		}

		if ($.dropPanel) {
			$('a[target=dropPanel]', $p).touchwipe({
				touch:function(event){
					var $link = $(this);
					$.dropPanel.open({url: $link.attr('data-href')});
					event.preventDefault();
				}
			}).hrefFix();
		}

		if ($.alert) {
			$('a[target=alertDialog]', $p).touchwipe({
				touch:function(event){
					var $link = $(this);
					$.alert.openDialog($link.attr('data-href'));
					event.preventDefault();
				}
			}).hrefFix();

			$('#alertMsgBox .close', $p).click(function(event){
				$.alert.close();
				event.preventDefault();
			});

			$('#alertDialogBox .close', $p).click(function(event){
				$.alert.closeDialog();
				event.preventDefault();
			});
		}

		if ($.fn.toggleSelectRef) {
			$("select.toggleSelectRef", $p).each(function() {
				var $this = $(this).toggleSelectRef();
			});
		}

		$('input.dwz-disable-autofocus', $p).disableAutofocus();
	});



	$.fn.extend({
		disableAutofocus: function(){
			return this.each(function(){
				var $input = $(this);
				$input.attr('readonly', 'readonly');
				setTimeout(function(){$input.removeAttr('readonly');}, 500);
			});
		},

		redirect: function(){
			return this.each(function(){
				$(this).touchwipe({
					touch:function(event){
						var href = $(this).attr('href');
						if(href) window.location = href;
						event.preventDefault();
					}
				});
			});
		},
		activeClass: function(className){
			if (!className) className = 'active';

			return this.each(function(){
				var $this = $(this);

				if ($.event.hasTouch) {
					$this.on('touchstart', function(e){
						if ($.clickMedia) {$.clickMedia.prepare(e, true);}
						$this.addClass(className);
					});
					$this.on('touchmove', function(e){
						if ($.clickMedia) {$.clickMedia.prepare(e, false);}
					});
					$this.on('touchend', function(e){
						if ($.clickMedia) { $.clickMedia.play(true); }
						$this.removeClass(className);
					});
				} else {
					$this.on('mousedown', function(){
						if ($.clickMedia) { $.clickMedia.play(); }
						$this.addClass(className);
					});
					$this.on('mouseup', function(){ $this.removeClass(className); });
					$this.on('mouseout', function(){ $this.removeClass(className); });
				}

			});
		},

		checkboxRadio: function(){
			return this.each(function(){
				var $this = $(this),
					parent$ = $this.attr('data-checkbox-radio') || 'form',
					name = $this.attr('name');

				$this.on('change', function(event){
					if (this.checked) {
						var $parent = $this.parentsUntil(function(){
							return $(this).is(parent$);
						});

						$parent.find('input[name='+name+']').each(function(){
							if (event.target !== this) this.checked = false;
						});
					}
				});

			});
		},

		/**
		 * ref: 控制多个box使用|分隔
		 * refVal: 控制多个box使用"|"分隔；每个box控制多个value使用","分隔
		 * ctrShow: 默认false控制隐藏，为true时控制显示
		 * @param options
		 * @returns {*}
		 */
		toggleSelectRef: function(options){
			var op = $.extend({ref:"data-ref-box", refVal:"data-ref-val", ctrShow: "data-ctr-show"}, options);
			return this.each(function(){
				var $select = $(this);

				function _checkRefHide(refVal, ctrShow){
					var val = $select.val();

					if (ctrShow) {
						if (!val || val == refVal) return false;
						if (refVal){
							var aTmp = refVal.split(',');
							for (var i=0; i<aTmp.length; i++) {
								if (val == aTmp[i]) return false;
							}
						}

						return true;

					} else {
						if (!val || val == refVal) return true;
						if (refVal){
							var aTmp = refVal.split(',');
							for (var i=0; i<aTmp.length; i++) {
								if (val == aTmp[i]) return true;
							}
						}

						return false;
					}

				}
				function _toggle($ref, refVal, ctrShow){

					if(_checkRefHide(refVal, ctrShow)){
						var bParentRef = false;

						$ref.find(':input').filter(function(){
							var type = this.type;

							// Use .is( ":disabled" ) so that fieldset[disabled] works
							return this.name && !dwz( this ).is( ":disabled" )
								&& dwz.config.rsubmittable.test( this.nodeName )
								&& !dwz.config.rsubmitterTypes.test( type );
						}).each(function(){
							var $input = $(this);
							if ($input.get(0) == $select.get(0)) {
								bParentRef = true;
							} else {
								if ($input.is(':checkbox')) $input.attr('checked', false);
							}
						});

						if (!bParentRef) $ref.hide().find(':input').addClass('ignore');
					} else {
						$ref.show().find(':input').removeClass('ignore');
					}
				}

				function _toggleAll(){
					var refList = $select.attr(op.ref).split('|');
					var refValList = $select.attr(op.refVal).split('|');
					var ctrShow = $select.attr(op.ctrShow) || false;

					for (var i=0; i<refList.length; i++) {
						var $ref = $(refList[i]),
							refVal = refValList[i];
						_toggle($ref, refVal, ctrShow);
					}

				}
				_toggleAll();
				$select.change(_toggleAll);
			});
		}

	});

})(dwz);

