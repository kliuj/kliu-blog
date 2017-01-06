define(function(require, exports, module){
	var self,
		$ = require('jquery'),
		_ = require('underscore');
	var travel = function(){
		this.tpl = '<div class="ctd_head">\
						<div class="ctd_head_mask">\
						</div>\
						<div class="ctd_head_left">\
							<p>\
								<i class="ico_jh"></i>更新时间：\
								<%= data.time.substr(0,10)%> <span class="gltextdown_blk"></span>\
							</p>\
							<h2><%= data.title%></h2>\
						</div>\
						<div class="ctd_head_right">\
							<a class="user_img" title="<%=data.user%>" target="_blank" href="/card/<%=data.user %>" rel="nofollow">\
								<img src="http://lwons.com:3000/img/userIcon.gif"></a>\
							<p>\
								<a id="authorDisplayName" title="<%=data.user%>" target="_blank" href="/card/<%=data.user %>" rel="nofollow">\
									<%=data.user%>\
								</a>\
							</p>\
						</div>\
						<div style="clear:both"></div>\
					</div>\
					<div class="ctd_main">\
						<div class="ctd_content">\
						<%=data.blog%>\
						</div>\
					</div>';
	}
	travel.prototype = {
		init:function(){
			self = this;
			self.sendData()
		},
		sendData:function(){
			$.ajax({
				url:'/query/blogDetail',
				type:'post',
				data:{detailId:$("#detailId").val()},
				success:function(data){
					$(".spinner").remove();
					if(data.success == 0){
						var _json = data.data;
						$("#userName").html(_json.user);
						$("#travelName").html(_json.title);
						//点赞数目
						$("#praise").html(_json.praise);
						var _html = _.template(self.tpl)({data:_json})
						$(".tdetail").append(_html);
					}else{
						$(".tdetail").append("<div>您查找的文章不存在或已被删除！</div>")
					}
					
				},
				error:function(){
					
				}
			})
		}
	}
	
	module.exports = travel
})
