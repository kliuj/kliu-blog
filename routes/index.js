/*
 * GET home page.
 * num数字对应tab栏背景白色选中，
 * {
 *  1 首页 2登录 3注册 4 暂无 5 文章 6 游记 7暂无 
 * }
 * res.render比传参数
 * res.render('xxx',{
				title: 'xxx页面' //页面标题
				num: 4  // 是否选择顶部tab
			})
 * blogs类型{
 * 	1: 随笔 
 *  2：JavaScript
 *  3：nodeJS
 *  4：MongoDB
 * 	5：游记
 *  6：ejs
 * }
 */
//七牛图片管理
var qiniu = require('qiniu');
var config = require('../config.js');
qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;

var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);



var crypto = require('crypto');
var User = require('../models/user.js');
var Blog = require('../models/blog.js');
var Travel = require('../models/travel.js');
var url = require('url');



module.exports = function(app) {
	//去掉favicon干扰
	app.get('/favicon.ico',function(req,res){
		res.end()
	})
	app.get('/', function(req, res) {
		res.render('index', {
			title: '首页',
			name:'',
			showName:'false', 
			num: 1
		});
	});
	//app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: '注册账户',
			num: 3
		})
	});
	//app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {
			title: '登录',
			num: 2
		})
	});
	//app.get('/logout', checkNotLogin);
	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', '注销成功');
		res.redirect('/login');
	});
	//用户个人信息
	app.get('/writeBlog', checkNotLogin);
	app.get('/user',function(req,res){
		res.render('userInfo',{
			title: '我',
			num: 4
		})
	})
	app.get('/editUser',function(req,res){
		res.render('editUser',{
			title: '我',
			num: 4
		})
	})
	//更新个人信息
	app.post('/editUser',function(req,res){
		var sign = req.body.personSign,
			img = req.body.imgPic,
			id =req.session.user._id;
		var user = new 	User();
		user.update(id,img,sign,function(data){
			if(!data){
				req.session.user.sign = sign ;
				req.session.user.img = img;
				res.redirect('/user')
			}else{
				res.redirect('/404')
			}
		})
		
	})
	app.get('/card/:user',function(req,res){
		if(req.session.user && req.params.user == req.session.user.name){
			//自己信息页面重定向一次
			res.redirect('/user')
		}else{
			var user = new User();
			user.getCard(req.params.user,function(err,userData){
		        user.saveVisitor(req.params.user,req.session.user.name,req.session.user.img);
				res.render('cardInfo',{
					title: req.params.user,
					num: 4,
					userData:userData
				})
			})
			
		}
		
	})
	//post请求
	//app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		//检验用户两次输入的口令是否一致
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', '两次输入的口令不一致');
			return res.redirect('/reg');
		} //生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var newUser = new User(req.body.username, password);
	
		//检查用户名是否已经存在
		newUser.get(newUser.name, function(err, user) {
			if (user)
				err = 'Username already exists.';
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			//如果不存在则新增用户
			newUser.save(function(err, user) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success', '恭喜您，注册成功');
				res.redirect('/');
			});
		});
	});
	//app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		//生成口令的散列值
		var user = new 	User();
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		user.get(req.body.username, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', '用户口令错误');
				return res.redirect('/login');
			}
			//写入session数据
			req.session.user = {
	        	name:user.name,
	        	_id:user._id,
	        	password:user.password,
	        	sign:user.sign,
	        	img:user.img
	        };
			req.flash("success", '欢迎回来');
			res.redirect("/");
		})
	});
	//中间键统一判断是否已经登录
	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			//req.flash('error', '已登入');
			next();
			
		}else{
			return res.redirect('/login');
			
		}
		
	}
	//发布内容
	app.post('/writeBlog', checkNotLogin);
	app.post('/writeBlog', function(req, res) {
		var currentUser = req.session.user;
		var blog = new Blog(currentUser.name, req.body.ttile, req.body.tdetail,req.body.type);
		blog.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			}
			req.flash('success', '发表成功');
//			res.redirect('/u/' + currentUser.name);
			res.redirect('/blog/u/'+currentUser.name+'');
			
		});
	});
	
	//全部文章页面
	app.get('/blog', function(req, res) {
		res.render('gotoBlog', {
			title: '文章',
			name:'',
			showName:'false',
			type:'',
			num: 5
		});
	})
	app.get('/blog/:type', function(req, res) {
		res.render('gotoBlog', {
			title: '文章',
			name:'',
			showName:'false',
			type:req.params.type,
			num: 5
		});
	})
	app.get('/blog/u/:user', function(req, res) {
		var user = new User();
		user.get(req.params.user, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			res.render('gotoBlog', {
				title: user.name,
				name:user.name,
				showName:'true',
				type:'',
				num: 5
			});
		});
	});
	app.get('/blog/d/:detailId', function(req, res) {
		res.render("blogDetail",{
			title: '文章',
			num: 5,
			detailId:req.params.detailId
		})
	});
		//删除id
	app.post('/delete', function(req, res) {
		var post = new Post('', '', '', req.body.id);
		post.delete(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			}
			req.flash('success', '删除成功');
			res.redirect('/blog');
		})
	})
	//获取全部travels
	app.get('/travels',function(req,res){
		var blog = new Blog();
		blog.get('',1,5,5,1,function(err,travels){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('travel', {
				title: '游记',
				travels:travels,
				showName:false,
				theName:'',
				num: 6
			})
		})
		
	})
	app.get('/travels/:type',function(req,res){
		var blog = new Blog();
		blog.get('',1,5,5,1,function(err,travels){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('travel', {
				title: '游记',
				travels:travels,
				showName:false,
				theName:'',
				num: 6
			})
		})
		
	})
	//个人的所有游记
	app.get('/travels/u/:username',function(req,res){
		var blog = new Blog();
		var user = new User();
		user.get(req.params.username, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			//传入用户名，页码，每页多少条，文章类型进行查找
			blog.get(req.params.username,1,5,5,1,function(err,travels){
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('travel', {
					title: '游记',
					travels:travels,
					showName:true,
					theName:'',
					num: 6
				})
			})
		});
		
		
	})
	//单个内容详细
	app.get('/travelDetail/d/:detailId',function(req,res){
		res.render("travelDetail",{
			title: '游记',
			num: 6,
			detailId:req.params.detailId
		})
	})
	
	//文章
	app.get('/writeBlog', checkNotLogin);
	app.get('/writeBlog',function(req,res){
		res.render('writeBlog',{
			title:"发布新文章",
			placeholder:"文章标题要言简意赅",
			num:5
		})
	})
	//模糊搜索
	
	
	//模糊搜索 暂只能时间先后排序
	app.get('/search',function(req,res){
		var arg =  url.parse(req.url,true).query,
			about = arg.q,
			pageIndex = parseInt(arg.page || 1);
		var blog = new Blog();
		blog.queryAbout(about,pageIndex,function(err,docs){
			if(err){
				res.render('search', {
					title: about,
					data:{blogList:[]},
					num: 4
				})
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
			res.render('search', {
				title: about,
				pageIndex:pageIndex,
				data:blogs,
				num: 4
			})
		})
	})
	
	
	//七牛图片存储
	app.get('/uptoken', function(req, res, next) {
	    var token = uptoken.token();
	    res.header("Cache-Control", "max-age=0, private, must-revalidate");
	    res.header("Pragma", "no-cache");
	    res.header("Expires", 0);
	    if (token) {
	        res.json({
	            uptoken: token
	        });
	    }
	});
	
	app.post('/downtoken', function(req, res) {
	
	    var key = req.body.key,
	        domain = req.body.domain;
	
	    //trim 'http://'
	    if (domain.indexOf('http://') != -1) {
	        domain = domain.substr(7);
	    }
	    //trim 'https://'
	    if (domain.indexOf('https://') != -1) {
	        domain = domain.substr(8);
	    }
	    //trim '/' if the domain's last char is '/'
	    if (domain.lastIndexOf('/') === domain.length - 1) {
	        domain = domain.substr(0, domain.length - 1);
	    }
	
	    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
	    var deadline = 3600 + Math.floor(Date.now() / 1000);
	
	    baseUrl += '?e=' + deadline;
	    var signature = qiniu.util.hmacSha1(baseUrl, config.SECRET_KEY);
	    var encodedSign = qiniu.util.base64ToUrlSafe(signature);
	    var downloadToken = config.ACCESS_KEY + ':' + encodedSign;
	
	    if (downloadToken) {
	        res.json({
	            downtoken: downloadToken,
	            url: baseUrl + '&token=' + downloadToken
	        })
	    }
	});
	app.get("/catalogue",function(req,res){
		res.render("catalogue",{
			title:"学习目录",
			num:4
		})
	})
	//批量更新数据测试
	app.get('/data/update',function(req,res){
		var travel = new Travel();
		travel.update(function(err){
			if(err){
				res.redirect('/')
			}
			res.redirect('/travels')
			
		})
	})
};