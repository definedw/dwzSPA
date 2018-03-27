/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.dropPanel = {
    config: {
        box$: '#drop-panel',
        frag: '<div id="drop-panel" style="display: none;"><a href="javascript:$.dropPanel.close()" class="close">关闭</a></div>'
    },
    isOpen: false,
    $box: null,

    init: function(options) {
        $.extend($.dropPanel.config, options);

        $('body').append($.dropPanel.config.frag);
        this.$box = $($.dropPanel.config.box$);
    },
    open: function(options) {
        // default, pic, login
        var op = $.extend({ type: 'GET', url: '', callback: null }, options);
        var $box = this.$box;

        if (!op.interceptor) {
            op.interceptor = dwz.getUrlInterceptor(op.url);
        }
        // 拦截器，用于验证登入跳转和绑定跳转等
        if (op.interceptor && op.interceptor.call($box, op.url) === false) {
            return false;
        }

        $box.show().html('').translateY(-document.documentElement.clientHeight+'px');

        setTimeout(function(){$box.animate({y:0}, 500, 'ease');}, 200);

        if (op.url) {

            if (!op.callback) {
                op.callback = dwz.getUrlCallback(op.url);
            }

            var params = op.url.getParams();
            $.ajax({
                global: !op.callback,
                type: 'GET',
                url: op.url,
                data: params,
                success: function(html) {
                    $box.triggerPageClear().find(dwz.config.pageClear$).triggerPageClear();

                    if (op.callback) {
                        op.callback.call($box, html, $.extend(params, op.data));
                    } else {
                        $box.html(html).initUI();
                    }
                },
                error: dwz.ajaxError
            });

        }

        this.isOpen = true;
    },

    close: function() {
        var $box = this.$box;

        $box.triggerPageClear().find(dwz.config.pageClear$).triggerPageClear();

        $box.animate({y:-document.documentElement.clientHeight}, 500, 'ease', function(){
            $box.hide().html('');
        });

        this.isOpen = false;
    }
};