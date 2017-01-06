define(function(require, exports, module){
	var self,
		$ = require('jquery');
	var mobile = function(){
	}
	mobile.prototype = {
		init:function(){
			self = this;
			self.mobileBind();
		},
		//手机端事件绑定
		mobileBind:function(){
			$("body").delegate(".mobileDown","click",function(){
				$(".nav li").toggle();
				$(".right-nav").toggle();
			})
		}
	}
	
	module.exports = mobile
})
