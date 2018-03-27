/**
 * Created by zhanghuihua on 26/12/2017.
 */
$.baseMedia = {
	media: null,
	init: function(url){
		if (!this.media) {
			this.media = new Media(url,
				function() {
					console.log("playAudio():Audio Success");
				},
				function(err) {
					console.log("playAudio():Audio Error: " + err);
				}
			)
		}
	},
	play: function(checkTouch) {
		if (this.media) {
			this.media.play();
		}
	}
};

$.slideMedia = $.extend({}, $.baseMedia);

$.clickMedia = $.extend({}, $.baseMedia, {

	prepare: function(event, isTouchStart) {
		if (event.touches.length == 1) {
			this.endX = event.touches[0].pageX;
			this.endY = event.touches[0].pageY;
			if (isTouchStart) {
				this.startX = this.endX;
				this.startY = this.endY;
			}
		}
	},
	play: function(checkTouch) {
		if ($.clickMedia.media) {
			if (checkTouch) {
				if (Math.abs(this.startX - this.endX) < 10 && Math.abs(this.startY - this.endY) < 10) {
					$.clickMedia.media.play();
				}
			} else {
				$.clickMedia.media.play();
			}
		}
	}
});