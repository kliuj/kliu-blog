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
	app.get('/mobile/blog', function(req, res) {
		var blog = new Blog();
		var name = req.query.name,//用户名。用于查找个人文档
			type = req.query.type,//文档类型
			index = req.query.index,//页码
			len = req.query.num;//每页几条数据由前台控制
			orderby =  req.query.orderby;//排序规则
		blog.get(name, index,len,type,orderby,function(err, blogs) {
			if (err) {
				res.json({
					success: 1,
					data: '',
					msg:err
				});
				return false;
			}
			res.json({
				success: 0,
				data: blogs,
				msg:'success'
			})
		});
	});
	//app登录
	app.post('/mobile/login',function(req,res){
		var md5 = crypto.createHash('md5');
		//这里的password必须是string类型
		var password = md5.update(req.body.password).digest('base64');
		user.get(req.body.username, function(err, user) {
			if(err){
				res.json({
					success: 1,
					data: '',
					msg:'系统出错'
				})
				return false;
			}
			if (!user) {
				res.json({
					success: 2,
					data: '',
					msg:'用户不存在'
				})
				return false;
			}
			if (user.password != password) {
				res.json({
					success: 3,
					data: '',
					msg:'密码不正确'
				})
				return false;
			}
			res.json({
				success: 0,
				data: user,
				msg:'success'
			})
		})
	});
	//app搜索
	//模糊搜索 暂只能时间先后排序
	app.get('/mobile/search',function(req,res){
		var about = req.query.q,
			pageIndex = parseInt(req.query.page || 1);
		var blog = new Blog();
		blog.queryAbout(about,pageIndex,function(err,docs){
			if(err){
				res.json({
					success: 1,
					data: {
						data:''
					},
					msg:'没有搜索到相关结果，换个关键词试试！'
				})
				return false;
			}
			// 封装 posts 为 Post 对象
			var blogs = {next:'',blogList:[],prev:'',num:''};
			blogs.blogList = docs.slice((pageIndex-1)*5 ,pageIndex*5);
			blogs.num = Math.ceil(docs.length/5);
			if(pageIndex > 1){
				blogs.prev = pageIndex - 1;
			}
			if(pageIndex < blogs.num){
				blogs.next = pageIndex + 1;
			}
			var newData =[];
			blogs.blogList.forEach(function(item){
				var blog = {
					_id:item._id,
					user:item.user,
					title:item.title
				}
				newData.push(blog)
			})
			res.json({
				success: 0,
				data: {
					data:newData,
					prev:blogs.prev,
					next:blogs.next
				},
				msg:'success'
			})
		})
	});
	//发布文章
	app.post("/mobile/publish",function(req,res){
		var currentUser = req.body.user;
		var blog = new Blog(currentUser, req.body.ttile, req.body.tdetail,req.body.type);
		blog.save(function(err,data) {
			if (err) {
				res.json({
					success: 1,
					data:err,
					msg:'发布失败'
				})
				return false;
			}
			//返回id
			res.json({
				success: 0,
				data:data,
				msg:'success'
			})
			
		});
	});
	//app注册
	app.post("/mobile/reg",function(req,res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var newUser = new User(req.body.username, password);
	
		//检查用户名是否已经存在
		newUser.get(newUser.name, function(err, user) {
			if (user){
				res.json({
					success: 1,
					data:err,
					msg:'用户名已经存在'
				})
				return false;
			}
			if (err) {
				res.json({
					success: 2,
					data:err,
					msg:'网络故障'
				})
				return false;
			}
			//如果不存在则新增用户
			newUser.save(function(errReg, userInfo) {
				if (errReg) {
					res.json({
						success: 2,
						data:errReg,
						msg:'网络故障'
					})
					return false;
				}
				res.json({
					success: 0,
					data:userInfo,
					msg:'注册成功'
				})
			});
		});
	});
	//app修改个人签名
	app.post("/mobile/updateInfo",function(req,res){
		var id = req.body.uid,
			sign = req.body.sign;
		user.updateSign(id,sign,function(err,data){
			if(err){
				res.json({
					success: 1,
					data:err,
					msg:'网络故障'
				})
				return false;
			}
			res.json({
				success: 0,
				data:data,
				msg:'success'
			})
		})
	});
	//app存储图片
	app.post("/mobile/updateImg",function(req,res){
		var id = req.body.id,
			img = req.body.img;
		user.updateImg(id,img,function(err,data){
			if(err){
				res.json({
					success: 1,
					data:err,
					msg:'网络故障'
				})
				return false;
			}
			res.json({
				success: 0,
				data:data,
				msg:'success'
			})
		})
	})
};