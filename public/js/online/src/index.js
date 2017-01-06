define(function(require, exports, module){
	var self,
		_ = require('../lib/underscore.js'),
		$ = require('../lib/jquery.js');
		console.log($)
	var index = function(){
		this.tpl='<div class="blogLeft">\
					<ul class="blogUl">\
						<%_.each(data,function(item,i){ %>\
							<li>\
								<a \
								<%if(item.type == 5){%>\
									href="/travelDetail/d/<%= item._id%>"\
								<%}else{%>\
									href="/blog/d/<%= item._id%>"\
								<%}%>  class="title"><%=item.title%></a>\
								<a href="/card/<%= item.user%>" class="u"><%=item.user%></a>\
								<span class="infos"><%=item.sum%>读</span>\
							</li>\
						<% }) %>\
					</ul>\
				</div><div style="clear:both"></div>';
		this.init()
	}
	index.prototype = {
		init:function(){
			self = this;
			self.sendPost()
		},
		//首次渲染html内容
		sendPost:function(){
			//渲染热门区域
			self.pageAjax(3,$("#hot_recommend"),function(){
				$("#hot_recommend_load").remove();
			})
			//渲染最新区域
			self.pageAjax(1,$("#new_recommend"),function(){
				$("#new_recommend_load").remove();
			})
		},
		pageAjax:function(type,dom,callback){
			$.ajax({
				url:'/query/blog',
				type:'get',
				data:{name:'',index:1,num:5,type:'',orderby:type},
				success:function(data){
					//事件回调,首次加载处理的东西单独出来
					callback && callback(data)
					var _json = data.data.blogList;
					var _html = '';
					if(_json.length){
						_html = _.template(self.tpl)({data:_json});
					}
					dom.html(_html);
					dom.show();
				},
				error:function(){
					self.state = false;
				}
			})
		}
	}
	new index ()
})
