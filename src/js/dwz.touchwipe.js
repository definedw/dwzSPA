/**
 * $(document).touchwipe({
 *      wipeLeft:function(){ alert("向左滑动了")},
 *      wipeRight:function(){alert("向右滑动了")},
 *      touch: function(event, pos){}
 * });
 */
(function($) {

	$.fn.extend({
		touchwipe: function(settings) {
			var config = {
				min_move_x: 30,
				min_move_y: 30,
				wipeLeft: function(pos, event){},
				wipeRight: function(pos, event){},
				wipeUp: function(pos, event){},
				wipeDown: function(pos, event){},
				touch: null,
				touchstart: null,
				touchmove: null, // touchmove事件触发scroll
				touchend: null,
				direction: 'vertical', // 允许滚动方向：vertical, horizontal, all
				preventDefaultEvents: false,
				stopPropagationEvents: false,
				data: null	// 自定义参数
			};

			if (settings) $.extend(config, settings);

			return this.each(function() {
				var $me = $(this);
				var startX=0, startY=0,
					endX=0, endY=0,
					isMoving = false,
					directionStart = null; // 滚动开始方向：vertical, horizontal

				var maxMove = {dx:0, dy:0};

				function cancelTouch() {
					this.removeEventListener('touchmove', onTouchMove);
					isMoving = false;
				}

				function onTouchMove(e) {

					if(isMoving) {
						var pos = {
							startX:startX,
							startY:startY,
							x:e.touches[0].pageX,
							y:e.touches[0].pageY
						};
						pos.dx = startX - pos.x;
						pos.dy = startY - pos.y;

						endX = pos.x;
						endY = pos.y;

						if (!directionStart) { // 判断开始滚动方向
							directionStart = Math.abs(pos.dx) > Math.abs(pos.dy) ? 'horizontal' : 'vertical';
						}

						if (Math.abs(pos.dx) > maxMove.dx) {
							maxMove.dx = pos.dx;
						}
						if (Math.abs(pos.dy) > maxMove.dy) {
							maxMove.dy = pos.dy;
						}

						if (config.touchmove) { // 滚动处理函数
							if (config.direction == directionStart || config.direction == 'all') {
								config.touchmove.call(this, pos, e);
							}

						} else {
							if(Math.abs(pos.dx) >= config.min_move_x) {
								cancelTouch(); // touch完成取消touch事件
								if(pos.dx > 0) {
									config.wipeLeft.call(this, pos, e);
								} else {
									config.wipeRight.call(this, pos, e);
								}
							} else if(Math.abs(pos.dy) >= config.min_move_y) {
								cancelTouch(); // touch完成取消touch事件
								if(pos.dy > 0) {
									config.wipeDown.call(this, pos, e);
								} else {
									config.wipeUp.call(this, pos, e);
								}
							}
						}

					}
				}

				function onTouchStart(e) {
					directionStart = null;

					if(config.preventDefaultEvents) {
						e.preventDefault();
					}

					if(config.stopPropagationEvents) {
						e.stopPropagation();
					}

					if (e.touches.length == 1) {
						startX = endX = e.touches[0].pageX;
						startY = endY = e.touches[0].pageY;
						isMoving = true;
						this.addEventListener('touchmove', onTouchMove, false);
					}

					if (config.touchstart) {
						var pos = {
							x:startX,
							y:startY
						};
						config.touchstart.call(this, pos, e);
					}
				}

				function onTouchEnd(e) {

					if (config.touchend) {
						var pos = {
							x:startX,
							y:startY,
							dx:startX - endX,
							dy:startY - endY
						};

						config.touchend.call(this, pos, e);
					}

					// 判断非滑动操作触发touch
					if (Math.abs(maxMove.dx) < 18 && Math.abs(maxMove.dy) < 18) {
						if (config.touch) config.touch.call(this, e, {x:startX,y:startY, data:config.data});
					}

					if (config.touchmove) cancelTouch(); // touch完成取消touch事件
					maxMove = {dx:0, dy:0};
				}

				// 禁止重复绑定touch事件
				if (config.touch && $me.attr('dwz-event-touchwipe-touch')) {
					return;
				}
				if (config.touch) {
					$me.attr('dwz-event-touchwipe-touch', 'touch');
				}

				if ('ontouchstart' in window) {
					// 处理滑动事件
					this.addEventListener('touchstart', onTouchStart, false);

					// 处理touch
					this.addEventListener('touchend', onTouchEnd, false);
				} else {
					if (config.touch) this.addEventListener('click', config.touch, false);
				}
			});

		}

	});


})(dwz);