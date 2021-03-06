(function($){
    $.fn.extend({
        slideTab: function(options){
            var op = $.extend({
                activeClass: 'on', // 导航指示圆点活跃class name
                header$: '.hd', // tab header
                content$: '.bd', // tab content
                currentIndex: 0, // 默认的当前位置索引。0是第一个; currentIndex:1 时，相当于从第2个开始执行
                delayTime: 400, // 效果持续时间
                onSwitchSlide: null
            }, options);
            
            return this.each(function () {
                var slideId = Math.round(Math.random()*10000000),
                    $box = $(this).attr('data-slide-tab-id', slideId),
                    $content = $box.find(op.content$),
                    $contentUl = $content.children('ul'),
                    $header = $box.find(op.header$),
                    $headerUl = $header.children('ul');

                var $tabs = $headerUl.children(),
                    tabW = 0, // sildeTab .hd li 单个宽度
                    headerUlW = 0; // header ul width

                $tabs.each(function(index){
                    var _tabW = $(this).width(true);
                    if (tabW < _tabW) tabW = _tabW;
                    headerUlW += _tabW;
                });

                var $slides = $contentUl.children();

                var currentIndex = op.currentIndex,
                    count = $tabs.size();
                if ($slides.size() == 0) {
                    var slidesHtml = '';

                    $tabs.each(function(index){
                        slidesHtml += '<li></li>';
                    });

                    $contentUl.html(slidesHtml);
                    $slides = $contentUl.children();
                }

                var contentW = $content.width(), // sildeTab .bd 容器宽度
                    slideW = $slides.width(true), // sildeTab .bd li 单个面板宽度
                    contentUlW = 0;
                $slides.each(function(index){
                    var _slideW = $(this).width(true);
                    if (slideW < _slideW) slideW = _slideW;
                    contentUlW += _slideW;
                });

                function switchTab(scollCurrent){
                    var $tab = $tabs.removeClass(op.activeClass).eq(currentIndex).addClass(op.activeClass);

                    if (scollCurrent) {
                        var leftPos = -currentIndex*tabW,
                            headerW = $header.width(),
                            centerPos = (headerW - tabW + (tabW - $tab.width()))/2;
                        if (centerPos > 0) {
                            leftPos += centerPos;

                            if (leftPos > 0) leftPos = 0;
                            else if (leftPos < (headerW-headerUlW)) leftPos = headerW-headerUlW;
                        }
                        $headerUl.animate({x:leftPos}, op.delayTime, 'ease');
                    }

                }

                function switchSlide(){
                    var $slide = $slides.eq(currentIndex);
                    var leftPos = -currentIndex*slideW,
                        centerPos = ($header.width() - slideW + (slideW - $slide.width()))/2;
                    if (centerPos > 0) {
                        leftPos += centerPos;
                    }
                    $contentUl.animate({x:leftPos}, op.delayTime, 'ease');

                    // 添加当前activeClass
                    $contentUl.find(':scope>li').removeClass(op.activeClass).eq(currentIndex).addClass(op.activeClass);

                    if (op.onSwitchSlide) {
                        var $tab = $tabs.eq(currentIndex),
                            _href = $tab.attr('data-href'),
                            _params = _href.getParams();
                        if (_href && !$tab.attr('data-loaded')) {
                            $.ajax({
                                type: 'GET',
                                url: _href,
                                data: _params,
                                success: function(_tpl) {
                                    $tab.attr('data-loaded', 1);
                                    var $img = $tab.find('img');
                                    if ($img.size()>0) {
                                        _params.img_src = $img.attr('src');
                                    }
                                    op.onSwitchSlide.call($slide, _tpl, _params);
                                },
                                error: dwz.ajaxError
                            });
                        }

                    }
                }

                if (count > 0) {
                    $headerUl.css({'width':headerUlW + 'px'});
                    // $contentUl.css({'width':contentUlW + 'px'});
                    $header.scroll({scrollX:true, scrollY:false, scroll$:':scope > ul', stopPropagationEvents:true});
                    switchTab();
                    switchSlide();

                    // tabs touch 事件
                    $tabs.each(function (index) {
                        var $tab = $(this);
                        $tab.touchwipe({
                            data: index,
                            touch: function (event, pos) {
                                currentIndex = pos.data;
                                switchTab(true);
                                switchSlide();
                            }
                        });
                    });


                    $contentUl.touchwipe({
                        stopPropagationEvents:true,
                        direction: 'horizontal',

                        touchstart: function (pos, event) {
                        },
                        touchmove: function (pos, event) {
                            var index = op.loop ? 1 : 0;
                            $contentUl.translateX((-currentIndex*slideW-pos.dx)+'px');
                        },
                        touchend: function (pos, event) {

                            if (pos.dx > 40) {
                                if (currentIndex < count - 1) {
                                    currentIndex++;
                                    switchTab(true);
                                    if ($.slideMedia) { $.slideMedia.play(); }
                                }
                            } else if (pos.dx < - 40){
                                if (currentIndex > 0) {
                                    currentIndex--;
                                    switchTab(true);
                                    if ($.slideMedia) { $.slideMedia.play(); }
                                }
                            }

                            switchSlide();
                        }
                    });
                }



            });
        }
    });
})(dwz);