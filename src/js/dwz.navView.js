/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.navView = {
    config: {
        zIndexStart: 100,
        idStart: 'nav-view-',
        frag: '<div id="#boxId#" class="nav-view view-container pane box-shadow unitBox" style="display: none; z-index:#zIndex#">\
            <div class="header">\
                <div class="header-background"></div>\
                <div class="toolbar statusbar-padding">\
                    <button class="bar-button back-button"><i class="icon icon-back"></i></button>\
                </div>\
            </div>\
            <div class="content"></div>\
        </div>'
    },
    $list: [],

    init: function(options) {
        $.extend($.navView.config, options);
    },

    /**
     *
     * interceptor：拦截器如果存在，并返回false时open失效
     * callback：回调函数如果存在，加载完页面执行回调函数，回调函数中$box.html(html).initUI();
     *
     */
    open: function(options) {
        var op = $.extend({ boxId: '', rel: '_blank', wipeClose: false, history: true, external: false, type: 'GET', url: '', data: {}, interceptor: null, callback: null }, options),
            boxId = op.boxId || $.navView.config.idStart + op.rel,
            zIndex = $.navView.config.zIndexStart + $.navView.$list.length;
        var $box = $('#' + boxId);

        if (!op.interceptor) {
            op.interceptor = dwz.getUrlInterceptor(op.url);
        }
        // 拦截器，用于验证登入跳转和绑定跳转等
        if (op.interceptor && op.interceptor.call($box, op.url, op.data) === false) {
            return false;
        }

        var isTopBox = false,
            size = this.$list.length;
        if (size > 0 && $box.size() > 0) {
            var $current = this.$list[size - 1];

            isTopBox = $box.get(0) === $current.get(0);
        }

        if ($box.size() == 0) {
            $('body').append($.navView.config.frag.replaceAll('#boxId#', boxId).replaceAll('#zIndex#', zIndex));

            $box = $('#' + boxId).initUI();

            // 支持向右滑动返回
            if (op.wipeClose) {
                $box.touchwipe({
                    wipeRight: function(pos, event) {
                        $.navView.close(true, true);
                    },
                    min_move_x: 100
                });
            }

            this.$list.push($box);
        }

        if (!isTopBox) {
            // rel相同放到$list最后面
            var $list = this.$list,
                $last = $list[size - 1];
            if (size > 0 && $box.get(0) !== $list[size - 1].get(0)) {
                for (var index = 0; index < size - 1; index++) {
                    if ($box.get(0) === $list[index].get(0)) {
                        $list[index] = $last;
                        $list[size - 1] = $box;
                    }
                }

                //初始化z-index
                for (var index = 0; index < size; index++) {
                    $list[index].css({ 'z-index': $.navView.config.zIndexStart + index });
                }
            }

            $box.show().translateX(document.documentElement.clientWidth + 'px');
            setTimeout(function() {
                $box.translateX('0px', 500, 'ease');
            }, 200);
        }

        if (op.url) {
            if (op.external) {
                this.loadExternal(op.url);
                return;
            }

            $.ajax({
                type: op.type,
                url: op.url,
                data: op.data,
                success: function(html) {
                    $box.triggerPageClear().find(dwz.config.pageClear$).triggerPageClear();

                    if (!op.callback) {
                        op.callback = dwz.getUrlCallback(op.url);
                    }

                    if (op.callback) {
                        op.callback.call($box, html, $.extend(op.url.getParams(), op.data));
                    } else {
                        $box.html(html).initUI();
                    }
                },
                error: dwz.ajaxError
            });

            var hash = 'navView;' + op.rel + ';' + op.url;
            if ($.history && op.history) $.history.add(hash, function(url) {
                if ($.dialog && $.dialog.isOpen) {
                    $.dialog.close({ popHistory: false });
                } else {
                    $.navView.close(true);
                    $.navView.open({ url: url, rel: op.rel, history: false });
                }
            }, op.url);
        }

    },
    reload: function(url) {
        var $box = this.$list[this.$list.length - 1];
        this.open({ boxId: $box.attr('id'), url: url, history: false });
    },
    loadExternal: function(url) {
        var $box = this.$list[this.$list.length - 1];

        // if (window.plus) {
        //     var $header = $box.find('.header');
        //     var ih = $header.size()>0 ? $header.get(0).offsetHeight : 0;
        //     $box.externalWebview = plus.webview.open( url, 'external'+(new Date().getTime()), {bottom: ih+'px'} );
        // } else {
            var $content = $box.find('.content');
            var ih = $content.get(0).offsetHeight;
            $content.html($.config.frag["external"].replaceAll("{url}", url).replaceAll("{{height}}", ih + "px"));
        // }
    },
    close: function(popHistory, local) {
        var size = this.$list.length;
        if (size <= 0) return;

        var $box = this.$list[size - 1];
        this.$list.pop();

        if ($.history && popHistory) {
            $.history.pop(local);
        }

        $box.animate({ x: document.documentElement.clientWidth }, 500, 'ease', function() {
            // if (window.plus && $box.externalWebview) {
            //     plus.webview.close($box.externalWebview);
            //     $box.externalWebview = null;
            // }

            $box.triggerPageClear().find(dwz.config.pageClear$).triggerPageClear();
            $box.remove();
        });
    },
    getBox: function() {
        return this.$list.length > 0 ? this.$list[this.$list.length - 1] : null;
    }
};