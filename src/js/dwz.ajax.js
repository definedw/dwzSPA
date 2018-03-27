/**
 * @author z@j-ui.com
 *
 */


dwz.extend({
	ajaxError:function(xhr, ajaxOptions, thrownError){
		if ($.alert) {
			// $.alert.error("<div>Http status: " + xhr.status + " " + xhr.statusText + "</div>"
			// 	+ "<div>ajaxOptions: "+ajaxOptions + "</div>"
			// 	+ "<div>thrownError: "+thrownError + "</div>"
			// 	+ "<div>"+xhr.responseText+"</div>");
            $.alert.error('网络异常，请稍后再试！');
		} else {
			// alert("Http status: " + xhr.status + " " + xhr.statusText + "\najaxOptions: " + ajaxOptions + "\nthrownError:"+thrownError + "\n" +xhr.responseText);
			alert('网络异常，请稍后再试！');
		}
	},
	ajaxDone:function(json){
		if(json[dwz.config.keys.statusCode] == dwz.config.statusCode.error) {
			if(json[dwz.config.keys.message] && $.alert) $.alert.error(json[dwz.config.keys.message]);
		} else if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok){
			if(json[dwz.config.keys.message] && $.alert) $.alert.success(json[dwz.config.keys.message]);

			if ("redirect" == json.callbackType && json.forwardUrl) {
				setTimeout(function(){
					window.location = json.forwardUrl;
				}, 1500);
			}
		} 
	},
	checkAjaxLogin: function(json){
		if (json[dwz.config.keys.statusCode] != dwz.config.statusCode.ok) {
//          $.alert.error(json[dwz.config.keys.message]);
			if (window.plus) plus.nativeUI.toast("用户登入");
			
            if (json[dwz.config.keys.statusCode] == 301) {
                $.dialog.open({
                    url: 'tpl/login.html?dwz_callback=loginRender',
                    rel: 'login',
                    pop: 'login'
                });
                throw json.message + " 请重新登录";
            }
        }
		return true;
	}
});

/**
 * 普通ajax表单提交
 * @param {Object} form
 * @param {Object} callback
 */
function validateCallback(form, callback, _data) {
	var $form = $(form);

	if (!$form.valid()) { return false; }

	var data = $form.serializeArray();
	if (_data) {
		if ($.isFunction(_data)) {
			_data = _data(form, $form);
			$.each(_data, function(index){
				data.push(this);
			});
		} else {
			data.push({name:'_data', value: JSON.stringify(_data)});
		}
	}

	$.ajax({
		global:true,
		type: form.method || 'POST',
		url:$form.attr("action"),
		data:data,
		dataType:"json",
		cache: false,
		success: callback || dwz.ajaxDone,
		error: dwz.ajaxError
	});

	return false;
}
/**
 * 带文件上传的ajax表单提交
 * @param {Object} form
 * @param {Object} callback
 */
function iframeCallback(form, callback){
	var $form = $(form), $iframe = $("#callbackframe");
	if(!$form.valid()) {return false;}

	if ($iframe.size() == 0) {
		$('body').append('<iframe id="callbackframe" name="callbackframe" src="about:blank" style="display:none"></iframe>');
		$iframe = $("#callbackframe");
	}

	form.target = "callbackframe";

	_iframeResponse($iframe, callback || dwz.ajaxDone);
}
function _iframeResponse($iframe, callback){
	var iframe = $iframe.get(0), $document = $(document);

	$document.trigger("ajaxStart");

	var _onload = function(event){
		$iframe.off("load", _onload);
		$document.trigger("ajaxStop");

		if (iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" || // For Safari
			iframe.src == "javascript:'<html></html>';") { // For FF, IE
			return;
		}

		var doc = iframe.contentDocument || iframe.document;

		// fixing Opera 9.26,10.00
		if (doc.readyState && doc.readyState != 'complete') return;
		// fixing Opera 9.64
		if (doc.body && doc.body.innerHTML == "false") return;

		var response;

		if (doc.XMLDocument) {
			// response is a xml document Internet Explorer property
			response = doc.XMLDocument;
		} else if (doc.body){
			try{
				response = iframe.contentDocument.body.innerText;
				response = $.parseJSON(response);
			} catch (e){ // response is html document or plain text
				response = doc.body.innerText;
			}
		} else {
			// response is a xml document
			response = doc;
		}

		callback(response);
	};

	$iframe.on("load", _onload);
}

/**
 *
 * {"statusCode":"200", "message":"操作成功", "navTabId":"", "forwardUrl":"", "callbackType":"closeCurrent"}
 * {"statusCode":"300", "message":"操作失败"}
 * {"statusCode":"301", "message":"会话超时"}
 *
 */
function navViewAjaxDone(json){
	dwz.ajaxDone(json);

	if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok){

		// 当前页面
		if ("closeCurrent" == json.callbackType) {
			$.navView.close(true, true);
		} else if ("forward" == json.callbackType) {
			$.navView.reload(json.forwardUrl);
		}

		if (json.navTabId){
			$.navTab.open({tabid:json.navTabId, url:json.forwardUrl});
		} else if (json.navViewId){
			$.navView.open({rel:json.navViewId, url:json.forwardUrl});
		}
	}
}

function dialogAjaxDone(json){
	dwz.ajaxDone(json);

	if (json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok){

		// 当前页面
		if ("closeCurrent" == json.callbackType) {
			$.dialog.close();
		} else if ("forward" == json.callbackType) {
			$.dialog.open({url:json.forwardUrl});
		}

		if (json.navTabId){
			$.navTab.open({tabid:json.navTabId, url:json.forwardUrl});
		} else if (json.navViewId){
			$.navView.open({rel:json.navViewId, url:json.forwardUrl});
		}
	}
}

function ajaxConfirm(params){
	var op = $.extend({msg:'', url:'', data:{}, success:dwz.ajaxDone}, params);
	$.alert.confirm(op.msg, {
		okCall: function(event){
			$.ajax({
				type:'post',
				url:op.url,
				data: op.data,
				dataType:'json',
				cache: false,
				success: op.success,
				error: dwz.ajaxError
			});
		}
	});
}

(function($){

	$.fn.extend({

		/**
		 * 表单验证
		 * @returns {boolean}
		 */
		valid: function(){
			var result = true, $form = this;

			this.find(':input').filter(function(){
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !dwz( this ).is( ":disabled" )
					&& dwz.config.rsubmittable.test( this.nodeName )
					&& !dwz.config.rsubmitterTypes.test( type );
			}).each(function(){
				var $input = $(this), val = $input.val(),
					required = this.required || $input.hasClass('required'), pattern = $input.attr('pattern'), errorMsg = $input.attr('data-error');

				if (!$input.hasClass('ignore')) {
					if (dwz.config.rcheckableType.test( this.type )) {
						if (!this.checked && required) {
							result = false;
						}
					} else if (!val && required) {
						result = false;
					} else if (pattern && !(new RegExp(pattern).test(val))) {
						result = false;
					}
				}

				if (!result && errorMsg && $.alert) {
					$.alert.error(errorMsg);
					return false;
				}
			});

			return result;
		},

		ajaxTodo: function(params){
			var op = $.extend({className:'active', disabledInvert:'disabled-invert', relCount$: 'data-rel-count'}, params);

			return this.each(function(){
				var $this = $(this).hrefFix(),
					$dataRel = $($this.attr(op.relCount$)),
					disabledInvert = $this.hasClass(op.disabledInvert);

				var changeRelCount = function(count){
					if ($dataRel.size()>0){
						var oldCount = parseInt($dataRel.text());
						if (oldCount + count >=0) {
							$dataRel.text(oldCount + count);
						}
					}

				}

				$this.touchwipe({
					touch:function(event){

						var url = $this.attr('data-href'),
							relCount = parseInt($this.attr('data-count') || 1);

						var beforeActive = $this.hasClass(op.className);

						if (url && url != 'javascript:') {
							$.ajax({
								type: 'POST',
								url:url,
								data: {'active': beforeActive ? 0 : 1},
								dataType:"json",
								cache: false,
								success: function(json){
									dwz.ajaxDone(json);

									if(json[dwz.config.keys.statusCode] == dwz.config.statusCode.ok){
										if (beforeActive && !disabledInvert) {
											$this.removeClass(op.className);
											changeRelCount(-relCount);
										} else {
											$this.addClass(op.className);
											changeRelCount(+relCount);
										}
									}

								},
								error: dwz.ajaxError
							});
						} else {
							if (beforeActive && !disabledInvert) {
								$this.removeClass(op.className);
								changeRelCount(-relCount);
							} else {
								$this.addClass(op.className);
								changeRelCount(+relCount);
							}
						}

						event.preventDefault();
						event.stopPropagation();
					}
				})

			});
		},

		bringBack: function(args){

			return this.each(function(){
				var $form = $(this);
				$form.find(":input").each(function(){
					var $input = $(this), inputName = $input.attr("name");

					for (var key in args) {
						if (key == inputName) {
							$input.val(args[key]);
							break;
						}
					}
				});
			});

		}
	});

})(dwz);
