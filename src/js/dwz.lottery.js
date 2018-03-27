/**
 * Created by zhanghuihua on 2018/2/28.
 */
(function($){
	$.fn.extend({
		rotateLottery: function(options){
			var op = $.extend({item$:'.prize', rotateBox$:'.circle-box', start$:'.start', startCls:'status-start', callback: null, gameId: null}, options);

			var _rotate = function($box, index, count){
				var lastRotate = $box.attr('data-rotate') ? parseInt($box.attr('data-rotate')) : 0;

				var boxDeg = -index / count * 360 - 180/count;
				$box.attr('data-rotate', boxDeg);

				$box.rotate({deg:(boxDeg + 1800) + 'deg', duration: 3000});
				$box.on('webkitTransitionEnd transitionend', function(){
					$box.off('webkitTransitionEnd transitionend');

					$.transition($box.get(0), { duration: 0 });
					var rotateStr = 'rotate(' + boxDeg + 'deg)';
					$box.css({'-webkit-transform': rotateStr, 'transform': rotateStr});

					if (op.callback) {
						op.callback.call($box, {index:index, count:count});
						$box.removeClass(op.startCls);
					}
				});
			};

			return this.each(function(){
				var $box = $(this),
					$rotateBox = $box.find(op.rotateBox$),
					$items = $rotateBox.find(op.item$),
					$start = $box.find(op.start$),
					count = $items.size();

				$start.touchwipe({
					touch: function(){
						if ($rotateBox.hasClass(op.startCls)) {return false;}
						//获取随机数
						// var index = parseInt(Math.random()*count);
						// _rotate($rotateBox, index, count);

                        $.ajax({
                            type: 'POST',
                            url: biz.server.getApi(biz.server.lottery),
                            dataType: "json",
                            data: {gameId: op.gameId, token: UserInfo.token},
                            cache: false,
                            global: false,
                            success: function (json) {
                                dwz.ajaxDone(json);
                                if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok){
                                    $rotateBox.addClass(op.startCls);
                                    console.log(json.data);
                                    var lotteryId = json.data.id;
                                    var index = 0;
                                    $.each($items, function (i) {
										var $this = $(this);
                                        var sn = $this.attr("data-sn");
                                        if(lotteryId == sn){
                                            index = i;
                                            console.log("index=" + index, "prizeId=" + sn);
                                            return false;
										}
                                    });
                                    if(index === 0){
                                        index = parseInt(Math.random() * count);
									}
                                    _rotate($rotateBox, index, count);
								}
                            },
                            error: biz.ajaxError
                        });
					}
				});
			});
		},

		eggLottery: function(options){
			var op = $.extend({item$:'.eggList .item', hammer$:'.hammer', currCls:'curr', callback: null}, options);

			return this.each(function(){
				var $box = $(this),
					$item = $box.find(op.item$),
					$hammer = $box.find(op.hammer$);

				$item.touchwipe({
					touch: function(){
						if ($item.hasClass(op.currCls)) {return false;}

						$item.addClass(op.currCls);
						$hammer.hide();

						if (op.callback) {
							setTimeout(function(){
								op.callback.call($item, $item.attr());
							}, 200);
						}
					}
				});

			});
		}
	});
})(dwz);
