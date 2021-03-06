/**
 * Created by zhanghuihua on 2016/12/19.
 */

$.navTab = {
    config: {
        box$: '#nav-tab',
        items$: '#nav-tab > .tab-bar > [tabid]',
        contents$: '#nav-tab > .tab-content',
        activeClass: 'active',
        cachedClass: 'cached',
        openIndex: -1
    },
    $box: null,
    _currentIndex: 0,

    init: function(options) {
        var op = $.extend($.navTab.config, options);

        this.$box = $($.navTab.config.box$);
        this.getTabs().each(function(index) {
            var $tabItem = $(this).hrefFix(),
                href = $tabItem.attr('data-href'),
                url = href && href.startsWith('#') ? '' : href;

            $tabItem.click(function(event) {
                var args = event.data;
                args.loaded = $tabItem.attr('data-loaded'); //navTab页面缓存
                args.refresh = $tabItem.attr('data-refresh') == 'true';
                $.navTab.open(args);

                event.preventDefault();
            }, { index: index, tabid: $tabItem.attr('tabid'), url: url });
        });

        if (op.openIndex >= 0) {
            $.navTab._open(op.openIndex);

            // 加载openIndex页面
            var hash = location.hash;
            if (!hash || hash.split(';').length === 3) { // 没有hash 或者是navView
                var $tabItem = this.getTabs().eq(op.openIndex),
                    href = $tabItem.attr('data-href'),
                    url = href && href.startsWith('#') ? '' : href;

                $.navTab.open({
                    index: op.openIndex,
                    tabid: $tabItem.attr('tabid'),
                    url: url
                });
            }
        }

        // navTab禁用浏览器历史记录，绑定事件处理空hash时关闭navView
        if (!op.history) {
            $(window).on('hash.empty', function(event) {
                if ($.dialog && $.dialog.isOpen) {
                    $.dialog.close();
                } else {
                    if ($.navView) $.navView.close(false);
                }
            });
        }

    },
    getBox: function() {
        return this.getPanels().eq(this._currentIndex);
    },
    _open: function(index) {
        var op = $.navTab.config,
            $items = this.getTabs(),
            $contents = this.getPanels();

        for (var i = 0; i < $items.size(); i++) {
            if (i == index) {
                $items.eq(i).addClass(op.activeClass).removeClass(op.cachedClass);
                $contents.eq(i).addClass(op.activeClass).removeClass(op.cachedClass);
            } else {
                $items.eq(i).addClass(op.cachedClass).removeClass(op.activeClass);
                $contents.eq(i).addClass(op.cachedClass).removeClass(op.activeClass);
            }
        }

        this._currentIndex = index;
    },
    /**
     * interceptor：拦截器如果存在，并返回false时open失效
     * callback：回调函数如果存在，加载完页面执行回调函数，回调函数中$panel.html(html).initUI();
     * @param args {tabid:'', index:-1, external:false, type:'GET', url:'', data:{}, interceptor: function(){}, callback: function(){}}
     */
    open: function(args) {
        var index = args.index >= 0 ? args.index : this._indexTabId(args.tabid);

        if (-1 == index) return;

        if (!args.interceptor) {
            args.interceptor = dwz.getUrlInterceptor(args.url);
        }
        // 拦截器，用于验证登入跳转和绑定跳转等
        if (args.interceptor && args.interceptor.call(this.getPanels(index), args.url) === false) {
            return false;
        }

        if (this._currentIndex != index) { this._open(index); }

        if (args.url) {

            if (!args.loaded || args.refresh) this.load(args);

            if (args.history && $.history && args.tabid) {
                setTimeout(function() {
                    var hash = args.tabid + ';' + args.url;
                    $.history.add(hash, function(args) {
                        $.navTab.open(args);
                    }, { index: index, url: args.url, loaded: true }); //tabid这里不能写，否则可能死循环
                }, 10);
            }
        }

        if ($.dialog && $.dialog.isOpen) {
            $.dialog.close();
        } else {
            if ($.navView) $.navView.close(false);
        }
    },
    /**
     *
     * @param args {tabid:'', index:-1, external:false, type:'GET', url:'', data:{}, callback: function(){}}
     */
    load: function(args) {
        var op = $.extend({ type: 'GET', external: false, type: 'GET', url: '', data: {}, callback: null }, args),
            openIndex = op.index >= 0 ? op.index : this._indexTabId(op.tabid),
            $panel = this.getPanels().eq(openIndex),
            $tabItem = this.getTabs().eq(openIndex);

        if (op.external) {
            this.loadExternal(op.url);
            return;
        }

        $.ajax({
            type: op.type,
            url: op.url,
            data: op.data,
            success: function(html) {
                $panel.triggerPageClear().find(dwz.config.pageClear$).triggerPageClear();

                if (!op.callback) {
                    op.callback = dwz.getUrlCallback(op.url);
                }

                if (op.callback) {
                    op.callback.call($panel, html, $.extend(op.url.getParams(), op.data));
                } else {
                    $panel.html(html);
                    $panel.initUI();
                }

                $tabItem.attr('data-loaded', 1); //navTab页面缓存

            },
            error: dwz.ajaxError
        });
    },
    reload: function(url) {
        this.load({ index: $.navTab._currentIndex, url: url });
    },
    loadExternal: function($panel, url) {
        var ih = this.$box.get(0).offsetHeight;
        $panel.html($.config.frag["external"].replaceAll("{url}", url).replaceAll("{{height}}", ih + "px"));
    },
    _indexTabId: function(tabid) {
        if (!tabid) return -1;
        var iOpenIndex = -1;
        this.getTabs().each(function(index) {
            if ($(this).attr("tabid") == tabid) { iOpenIndex = index; return; }
        });
        return iOpenIndex;
    },
    isOpen: function(tabid) {
        var index = this._indexTabId(tabid);
        return index === this._currentIndex;
    },
    getTabs: function() {
        return this.$box.find(this.config.items$);
    },
    getPanels: function() {
        return this.$box.find(this.config.contents$);
    }
};