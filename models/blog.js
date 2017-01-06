/*
 * 文本数据类型比较简单，都放在同一个表里面
 * 表名 blogs
 * {
 * 	_id:569dd22fb687d43c2461faba  ObjectId 建议改造
 * 	blog ：内容  string
 *  time ：2016-01-19T06:05:35.947Z  DateTime  new Date()
 *  title :标题  string
 *  type  ：类型  int32类型
 *  user ：用户名
 * }
 * 在MongoDB中使用使用sort()方法对数据进行排序，
 * sort()方法可以通过参数指定排序的字段，
 * 并使用 1 和 -1 来指定排序的方式，其中 1 为升序排列，
 * 而-1是用于降序排列。
 * 排序规则:{
 * 	1：时间降叙  -1
 *  2 ：时间升叙 1
 *  3 ：阅读降序 -1
 *  4 ：阅读升叙 1
 * }
 * 基于mongoose改造mongod
 */
var orderRule = function(group){
	//要进行int整形比较，防止有误差
	var orderStr = '';
	switch (group) {
		case 1:
			orderStr = {time: -1};//时间降序  新---旧
			break
		case 2:
			orderStr = {time: 1};//时间升序
			break
		case 3:
			orderStr = {sum: -1};//阅读量降序
			break
		case 4:
			orderStr = {sum: 1 };//阅读量降序
			break	
	}
	return orderStr;
}
var mongoose = require('mongoose');
var db     = mongoose.createConnection('mongodb://127.0.0.1:27017/data'); 

// 链接错误
db.on('error', function(error) {
	console.log(error)
   db     = mongoose.createConnection('mongodb://127.0.0.1:27017/data'); 
});

//数据结构
function Blog(username, title, blog, type,time,id) {
	this.user = username;
	this.title= title;
	this.blog = blog;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date()
	}
	this.id = id;
	this.type = type;
}
// Schema 结构 骨架模版
var blogSchema = new mongoose.Schema({
    objId : {type : mongoose.Schema.ObjectId},
    blog:{type : String},
    sum:{type:Number},
    time     : {type : Date, default:  Date.now},
    title    : {type : String},
    type      : {type : Number},
    user:{type:String},
    praise:{type:Number}
});

// 添加 mongoose 静态方法，静态方法在Model层就能使用  直接调用blogModel.findbyObjId
blogSchema.statics = {
	//查询objectid需要用mongoose方法 populate对应到骨架的object
	findbyObjId : function(objId, callback) {
	    return this
	    .findOne({_id : objId}).populate('objId')
		.exec(callback)
	},
	updateById:function(objId,updateStr,callback){
		return this
	    .update({_id : objId},updateStr).populate('objId')
		.exec(callback)
	},
	deleteById:function(objId,callback){
		return this
		.remove({_id:objId}).populate('objId')
		.exec(callback)
	}
}

// model模型  直接使用blogModel方法
var blogModel = db.model('blogs', blogSchema);



module.exports = Blog;

Blog.prototype = {
	save: function(callback) {
		//存入mongodb的文档
		var blog = {
			user: this.user,
			title:this.title,
			blog: this.blog,
			time: this.time,
			type:parseInt(this.type), //存储时候做一次类型转化
			sum:0
		}
		var doc = new blogModel(blog);
		doc.save(function(err,data){
			if(err){
				return  callback(err)
			}
			callback(err, data);
		})
	},
	//查询
	get: function(username, index ,len,type,orderby,callback) {
			//排序规则	
			if(!orderby){
				orderby =1 ;
			}
			var orderStr = orderRule(parseInt(orderby));
			
			//查找user属性为username的文档，如果username是null则全部匹配
			var query = {};
			if (username) {
				query.user = username
			}
			if(type){
				query.type = parseInt(type) //查询时候做一次类型转化
			}
			//直接查询返回数据，不进行处理
			blogModel.find(query).sort(orderStr).exec(function(err, docs){
			    if(err) {
			        callback(err);	
			    } else {
			    	// 封装 posts 为 Post 对象，增加分页功能，每页10条数据
					var blogs = {blogList:[],num:''};
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
						    	time:doc.time
						    };
						blogs.blogList.push(blog)
					}
					callback(null, blogs);	
			    }
			})
		},
	//获取内容详细，每次获取的时候增加一次点击次数	
	getDetail:function(did,callback){
		blogModel.findbyObjId(did,function(err,docs){
				if(err){
					return  	callback(err) 
				}
				// 封装 posts 为 Post 对象 docs是一个数组对象
				var clickSum = parseInt(docs.sum || 0) +1;
				docs.sum = clickSum;
				docs.praise ++ ;
				var blogs = docs;
				callback(null, blogs);
				//更新点击次数，自增
				blogModel.updateById(did, {'$inc':{'sum':1}});
				blogModel.updateById(did, {'$inc':{'praise':1}})
			})
	},
		//删除
	deleteList: function(id,callback) {	
		blogModel.deleteById(id,function(err,data){
			if(err){
				return  callback(err)
			}
			callback(null,"删除成功")
		})
	},
	//模糊搜索
	queryAbout:function(str,pageIndex,callback){
		function queryA (){
			var q = {};    //定义空的查询对象
			if (str) {    //如果有搜索请求就增加查询条件
			    //用正则表达式得到的pattern对title属性进行模糊查询
			    //这里是搜集合里title属性包含str串的所有结果
			    //new RegExp("xxx","i")  i 表示不区分大小写
			    var pattern = new RegExp("^.*"+str+".*$","i");
			    q.title = pattern;
			}
			blogModel.find(q).sort({
					time:-1
			}).exec(function(err,docs){
				if(err){
					return callback(err)
				}
				callback(null, docs);
			})
		}
		queryA()
	}
}