/**
 * Module dependencies.
 */
//日志log
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {
	flags: 'a'
});
var errorLogfile = fs.createWriteStream('error.log', {
	flags: 'a'
});
//
var express = require('express'),
	cors = require('cors'),
	ajaxRoutes = require('./routes/ajaxRoute.js'),
	ajaxMobile = require('./routes/ajaxMobile.js'),
	routes = require('./routes/index.js');
var util = require('util');
var app = module.exports = express.createServer();
//var MongoStore = require('connect-mongo');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
// Configuration

app.configure(function() {
	app.use(express.logger({
		stream: accessLogfile
	}));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: settings.cookieSecret,
		key: settings.db, //cookie name
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 30
		}, //30 days
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({
			db: settings.db,
			host: settings.host,
			port: settings.port
		})
	}));
	app.configure('production', function() {
		app.error(function(err, req, res, next) {
			var meta = '[' + new Date() + '] ' + req.url + '\n';
			errorLogfile.write(meta + err.stack + '\n');
			next();
		});
	});
	app.use(express.router(routes)); //自动解析url
	app.use(express.router(ajaxRoutes)); //异步url
	app.use(express.router(ajaxMobile));
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res) {
		res.status(400);
		res.render('404', {
	        title: 'No Found',
	        num:4
	    })
	});
	//cors跨域
	app.use(cors());
});

app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});


// 注册视图助手
app.dynamicHelpers({
	//用户信息
	user: function(req, res) {
		if(req.session.user){
			return req.session.user;
		}else{
			return {name:''}
		}
		
	},
	//错误提示
	error: function(req, res) {
		var err = req.flash('error');
		if (err.length)
			return err;
		else
			return null;
	},
	//成功提示
	success: function(req, res) {
		var succ = req.flash('success');
		if (succ.length) {
			return succ;
		} else {
			return null;
		}
	},
	//文章类型名
	blogType:function(){	
		var type = ['全部','随笔','JavaScript','NodeJS','MongoDB','游记','Ejs','CSS','HTML'] ;
		return type
	}
})


if (!module.parent) {
	app.listen(3000);
	console.log("Express server listening on port %d in %s mode", app.address().port,
		app.settings.env);
}