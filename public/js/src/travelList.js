define(function(require, exports, module){
	var self,
//		_ = require('underscore'),
		$ = require('jquery');
	var blogsList = function(){
		//标题list模版
		this.tpl='';
	}
	blogsList.prototype = {
		init:function(){
			self = this;
			self.bind();
			self.sendPost()
		},
		//绑定事件
		bind:function(){
			$("body").delegate(".tdelete","click",function(){
				if(confirm("确定删除吗？")){
					var _this = $(this), 
					dname = _this.attr("data-name"),
				    delId = _this.attr("data-id");
					$.ajax({
						type:"post",
						url:"/delete/blogList",
						data:{
							delId :delId,
							delName:dname
						},
						success:function(data){
							if(data.success == 0){
								window.location.reload();
							}else{
								alert(data.msg)
							}
						}
					});
				}
				
			})
		},
		sendPost:function(){
			
			
		}
		
	}
	
	module.exports = blogsList
})
