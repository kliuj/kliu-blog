define(function(require, exports, module){
	var self,
		_ = require('underscore'),
		$ = require('jquery');
	var userInfo = function(){
		this.tpl='<%_.each(data,function(item,i){ %>\
						<a href="/card/<%=item.visitorName%>" title="<%=item.visitorName%>"><img src="<%=item.visitorImg || /img/userIcon.gif%>"></a>\
					<%})%>'
	}
	userInfo.prototype = {
		init:function(){
			self = this;
			self.sendPost();
		},
		//首次渲染html内容
		sendPost:function(){
			$.ajax({
				url:'/latest/visitor',
				type:'get',
				success:function(data){
					var _html = _.template(self.tpl)({data:data.data.visitor});
					$(".visitor").html(_html)
				}
			})
				
		},
		pageAjax:function(callback){
			
		},
		bind:function(){
			
						
		}
	}
	
	module.exports = userInfo
})
