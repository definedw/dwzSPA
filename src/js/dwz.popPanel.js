/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.popPanel = {
    config: {
        zIndex: 970,
        boxId: 'pop_panel',
        frag: '<div id="#boxId#" class="unitBox" style="display:none; z-index:#zIndex#"></div>'
    },

    box: null,
    isOpen: false,

    init: function (options) {
        var op = $.extend(this.config, options);
        if (!this.box){
            $('body').append(op.frag.replaceAll('#boxId#', op.boxId).replaceAll('#zIndex#', op.zIndex));

            this.box = $("#"+op.boxId);
        }
    },

    open: function (options) {
        if ($.popPanel.isOpen) return;
        $.popPanel.isOpen = true;

        this.init();
        var op = $.extend({type: 'GET', url: '', callback: null}, this.config, options)
        var $box = this.box;
        $box.show().translateY(document.documentElement.clientHeight + 'px');
        setTimeout(function() {
            $box.animate({ y: 0 }, 500, 'ease', function() {

            });
        }, 200);


        if (!this.chart && op.url) {

            var _params = op.url.getParams();
            $.ajax({
                type: op.type,
                url: op.url,
                data: _params,
                success: function(html) {
                    if (op.callback) {
                        op.callback.call($box, html, _params);
                    }
                },
                error: dwz.ajaxError
            });

        }
    },

    close: function () {
        var $box = this.box;
        $box.animate({ y: document.documentElement.clientHeight }, 500, 'ease', function() {
            $box.hide();
            $.popPanel.isOpen = false;
        });
    }
};