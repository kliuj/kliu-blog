define(function(require, exports, module){
	var self,
		_ = require('underscore'),
		$ = require('jquery');
	var blogsList = function(){
		this.load='<div class="spinner">\
					  <div class="bounce1"></div>\
					  <div class="bounce2"></div>\
					  <div class="bounce3"></div>\
					</div>';
		this.userName = $("#username").val();
		this.blogName = $("#blogname").val();
		this.showName = $("#showName").val();
		//标题list模版
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
								<%if((userName == item.user && showName == "true") || userName =="kailiu" ){%>\
									<span class="infos blogDel" data-id="<%= item._id%>" data-name="<%= item.user%>">删除</span>\
								<%}%>\
								<span class="infos"><%=item.sum%>读</span>\
								<span class="infos"><%=timeFormat(item.time)%></span>\
							</li>\
						<% }) %>\
					</ul>\
				</div><div style="clear:both"></div>';
		this.pageNum ='';//总页数
		this.pageIndex = 1 ;//存储页码
		this.pageLen = 5;//每页条数，接口太慢了
		this.state = false;//分页按钮状态
		this.sortNum = 1;//默认时间降序  新---旧
	}
	blogsList.prototype = {
		init:function(){
			self = this;
			self.sendPost();
			self.deleteBlog();
			self.sort()
		},
		//时间转化
		timeFormat:function(value){
			return value.split("T")[0] +"-"+value.split("T")[1].substr(0,8) 
		},
		//首次渲染html内容
		sendPost:function(){
			self.pageAjax(function(data){
				$("#num").html(data.data.num);
				self.pageNum = Math.ceil(data.data.num/self.pageLen);
				if(self.pageNum  > 1){
					var pageList = '<li data-id="0" id="prev"><a  href="javascript:void(0)" >Prev</a></li>\
										<li class="active"><a href="javascript:void(0)" id="active">1</a></li>\
									<li><a href="javascript:void(0)" id="next" data-id="2">Next</a></li>';
					$("#pageList").html(pageList);
					$("#totalPage").html(self.pageNum);
					$(".pagination").show();
					self.bindPage();
				}
			})
			
		},
		//接口事件
		pageAjax:function(callback){
			$.ajax({
				url:'/query/blog',
				type:'get',
				data:{name:self.blogName,index:self.pageIndex,num:self.pageLen,type:GS.type,orderby:self.sortNum},
				beforeSend:function(){
					//添加loading缓冲
					$(".blogs").html(self.load);
				},
				success:function(data){
					
					//事件回调,首次加载处理的东西单独出来
					callback && callback(data)
					var _json = data.data.blogList;
					var _html = '';
					if(_json.length){
						_html = _.template(self.tpl)({data:_json,userName:self.userName,showName:self.showName,timeFormat:self.timeFormat});
					}else{
						_html = '<p style="margin-left:20px">这个人有点懒，一篇都木有</p>';
					}
					$(".blogs").html(_html);
					
				},
				error:function(){
					self.state = false;
				}
			})
		},
		//分页事件
		bindPage:function(){
			//下一页
			$("body").delegate("#next","click",function(){
				if(self.state) return false;
				self.state = true;
				var _id =parseInt($("#next").attr("data-id"));
				if(self.pageNum  >=  _id){
					self.pageIndex ++;	
					self.pageAjax(function(){
						$("#prev").attr("data-id",self.pageIndex - 1);
						$("#active").html(self.pageIndex )
						//页码递增
						
						$("#next").attr("data-id",self.pageIndex + 1)
						self.state = false;
					})
				}else{
					alert("已经是最后一页了");
					self.state = false;
				}
			})
			$("body").delegate("#prev","click",function(){
				if(self.state) return false;
				self.state = true;
				var _id = parseInt($("#prev").attr("data-id"));
				if(_id > 0){
					self.pageIndex --;	
					self.pageAjax(function(){
						$("#prev").attr("data-id",self.pageIndex - 1);
						$("#active").html(self.pageIndex)
						//页码递增
						
						self.state = false;
						$("#next").attr("data-id",self.pageIndex + 1)
					})
				}else{
					alert("已经是第一页了");
					self.state = false;
				}
			})
		},
		//删除事件
		deleteBlog:function(){
			$("body").delegate(".blogDel","click",function(){
				if(confirm("您真的确定删除此条文章，一旦删除，无法恢复哦？")){
					var _this = $(this),
						delId = _this.attr("data-id"),
						delName = _this.attr("data-name");
					$.ajax({
						type:"post",
						url:"/delete/blogList",
						data:{
							delId:delId,
							delName:delName
						},
						success:function(data){
							if(data.success == 0){
								//直接刷新
								window.location.reload();
								//self.sendPost();
							}else{
								alert(data.msg)
							}
						}
					});	
					
				}
			})
		},
		//排序
		sort:function(){
			//时间
			function changeSort(_this,sortValue){
				//初始化页码
				self.pageIndex = 1;
				sortValue = parseInt(sortValue);
				if(_this.hasClass("current")){
					
					switch (sortValue){
						case 1:
						  	self.sortNum = 2;//时间降序
						  	break;
						case 2:
						  	self.sortNum = 1;//时间升序
						  	break;
						case 3:
						  	self.sortNum = 4;//点击量降序
						  	break;
						case 4:
						  	self.sortNum = 3;//点击量升序
						  	break;  	
					}
					_this.find("i").toggleClass("up");
				}else{
					//如果有选中的样式，说明是改变当前的升降序，需要改变当前的sortNum
					//没有被选中的样式则说明直接选择当前作为排序
					$(".sort").removeClass("current");
					_this.addClass("current");
					self.sortNum = sortValue;
				}
				_this.attr("data-sort",self.sortNum);
				self.pageAjax(function(){
					_this.attr("active",'');
					
				})
			}
			//时间
			$("body").delegate("#time","click",function(){
				var _this = $(this);
				if(_this.attr("active")) return false;
				//状态码，防止重复点击
				_this.attr("active","actived");
				var sortValue = _this.attr("data-sort");
				changeSort(_this,sortValue)
			})
			//阅读量
			$("body").delegate("#view","click",function(){
				var _this = $(this);
				if(_this.attr("active")) return false;
				//状态码，防止重复点击
				_this.attr("active","actived");
				var sortValue = _this.attr("data-sort");
				changeSort(_this,sortValue)
			})
		}
	}
	
	module.exports = blogsList
})
