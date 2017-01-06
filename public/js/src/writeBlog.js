define(function(require, exports, module){
	var self,
	    _ = require('underscore'),
		$ = require('jquery');
	var writeBlog = function(){
		
	}
	writeBlog.prototype = {
		init:function(){
			self = this;
			self.sendPost();
			self.editCode();
		},
		//表单验证
		checkForm:function(){
			var _checkDom = $(".check"),
				checkState = true;
			for(var i = 0 ;i< _checkDom.length;i++){
				var item  = _checkDom[i]
				var _val = $(item).val().replace(/\s*/g,"");
				if(!_val.length){
					var notice = $(item).attr("data-name");
					alert("请完善"+notice);
					checkState = false;
					return checkState;
				}
			}
			return checkState
		},
		sendPost:function(){
			$("#formBtn").bind("click",function(){
				$("#tdetail").val($(".text-normal-div").html());
				if(self.checkForm()){
					$("#formWrite").submit();
				}
			})
		},
		//插入代码内容
		editCode:function(){
			$("body").delegate(".daima","click",function(){
				$(".editCont").show()
			})
			$("body").delegate("#cancelBtn","click",function(e){
				self.closeCode()
			})
			$("body").delegate(".close","click",function(e){
				self.closeCode()
			})
			//确认按钮
			$("body").delegate("#confirmBtn","click",function(e){
				var codeValue = $(".editCont textarea").val();
				if(codeValue){
					$(".text-normal-div").append('<pre><code>'+codeValue+'</code></pre>');
					self.closeCode()
				}
			})
		},
		closeCode:function(){
			$(".editCont").hide();
			$(".editCont textarea").val("");
		}
	}
	
	module.exports = writeBlog
})
