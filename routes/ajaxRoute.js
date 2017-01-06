/*
 * 异步接口
 */

var crypto = require('crypto');
var Travel = require('../models/travel.js');
var Blog = require('../models/blog.js');
var User = require('../models/user.js');
var user = new User();

module.exports = function(app) {
	//异步文章接口
	//全部预览
	app.get('/query/blog', function(req, res) {
			var blog = new Blog();
			var name = req.query.name,//用户名。用于查找个人文档
				type = req.query.type,//文档类型
				index = req.query.index,//页码
				len = req.query.num;//每页几条数据由前台控制
				orderby =  req.query.orderby;//排序规则
			blog.get(name, index,len,type,orderby,function(err, docs) {
				if (err) {
					res.json({
						success: 1,
						data: '',
						msg:err
					});
				}
				// 封装 posts 为 Post 对象，增加分页功能，每页10条数据
				/*var blogs = {blogList:[],num:''};
				blogs.num = docs.length;
				var num = Math.min(index*len , docs.length);
				for(var i = (index -1)*len ;i < num ;i++){
					var doc = docs[i],
					    blog = {
					    	_id:doc._id,
					    	sum:doc.sum,
					    	title:doc.title,
					    	type:doc.type,
					    	user:doc.user,
					    };
					blogs.blogList.push(blog)
				}*/
				res.json({
					success: 0,
					data: docs,
					msg:'success'
				})
			});
		})
	//游记异步接口
	app.post("/query/blogDetail",function(req,res){
		var blog = new Blog();
		blog.getDetail(req.body.detailId,function(err,data){
			if (err) {
				//req.flash('error', err);
				res.json({
					success: 1,
					data: '',
					msg:err
				});
			}
			res.json({
				success: 0,
				data: data,
				msg:'success'
			})
		})
	})
	app.get("/query/blogDetail",function(req,res){
		var blog = new Blog();
		blog.getDetail(req.query.detailId,function(err,data){
			if (err) {
				//req.flash('error', err);
				res.json({
					success: 1,
					data: '',
					msg:err
				});
			}
			res.json({
				success: 0,
				data: data,
				msg:'success'
			})
		})
	})
	//删除单个文章
	app.post('/delete/blogList',function(req,res){
		if(req.body.delName != req.session.user.name &&  req.session.user.name != "kailiu"){
		//增加判断，如果不是当前登录用户或者管理员，其他人不能删除别人的内容	
			 res.json({
					success:2,
					data:'',
					msg:'非法操作'
				})
			return false 
		}
		var blog = new Blog();
		blog.deleteList(req.body.delId,function(err,data){
			if(err){
				res.json({
					success:1,
					data:'',
					msg:err
				})
			}
			res.json({
				success:0,
				data:data,
				msg:'success'
			})
		})
	});
	//获取最近访客
	app.get('/latest/visitor',function(req,res){
		user.getVisitor(req.session.user.name,function(err,data){
			if(err){
				res.json({
					success:1,
					data:'',
					msg:err
				})
			}
			res.json({
				success:0,
				data:data,
				msg:'success'
			})
		})
	})
};