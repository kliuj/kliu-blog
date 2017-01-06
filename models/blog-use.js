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
 */
var orderRule = function(group){
	//要进行int整形比较，防止有误差
	var orderStr = '';
	switch (group) {
		case 1:
			orderStr = {time: -1};
			break
		case 2:
			orderStr = {time: 1};
			break
		case 3:
			orderStr = {sum: -1};
			break
		case 4:
			orderStr = {sum: 1 };
			break	
	}
	return orderStr;
}
var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

//open一次  就不关闭了。由于mongod  close时候可能会导致多次请求出问题，
//mongodb.openCalled 可以检查 数据库有没有被打开
function openData(callback){
	mongodb.open(function(err, db) {
		if (err) {
			openData()
		}
		callback && callback()
	})
}
openData()


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
		function saveBlog(){
			//读取posts集合
			mongodb.collection('blogs', function(err, collection) {
				if (err) {
					return callback(err)
				}
				
				//为user属性添加索引
				collection.ensureIndex('user');
				//写入post文档
				collection.insert(blog, {
					safe: true
				}, function(err, blog) {
					callback(err, blog);
				})
			})
		}
		if(!mongodb.openCalled){
			openData(saveBlog)
		}
		
		
	},
	//查询
	get: function(username, index ,len,type,orderby,callback) {
			function queryList(){
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
				//读取posts集合
				mongodb.collection('blogs', function(err, collection) {
					if (err) {
						return callback(err)
					}
					collection.find(query).sort(orderStr).toArray(function(err, docs) {
						if (err) {
							callback(err, null);
						}
						
						//直接分割数组  异步还是不要这样，节省空间有许多不需要的数据，比如blogs
	//						blogs.blogList = docs.slice((index -1)*len,index*len);
						callback(null, docs);
					})
				})
			}
			if(!mongodb.openCalled){
				openData(queryList)
			}
			
			
		},
	//获取内容详细，每次获取的时候增加一次点击次数	
	getDetail:function(did,callback){
		function queryDetail(){
			mongodb.collection("blogs",function(err,collection){
				if(err){
					return callback(err)
				}
				try{
					var query  ={
						_id:new ObjectID(did)
					}
				}
				catch(e){
					//需要在catch里面的try 抛出回调。不可用直接在catch里面 return 回调
					try{
						return callback(e)
					}catch(e){
						
					}
					
				}
				collection.find(query).sort({
					time:-1
				}).toArray(function(err,docs){
					if(err){
						return callback(err,null)
					}
					// 封装 posts 为 Post 对象 docs是一个数组对象
					var clickSum = parseInt(docs[0].sum || 0) +1;
					docs.sum = clickSum;
					var blogs = docs;
					callback(null, blogs);
					//更新数据点击量
					var updateStr = {$set: { 'sum' : clickSum }};
					collection.update(query, updateStr, function(err, result) {
						
					})
				})
			})
		}
		if(!mongodb.openCalled){
				openData(queryDetail)
			}
	},
		//删除
	deleteList: function(id,callback) {
		function deleteOne(){
			//读取posts集合
			mongodb.collection('blogs', function(err, collection) {
				if (err) {
					return callback(err)
				}
				collection.remove({
					_id: new ObjectID(id)
				}, {
					
				}, function(err,object) {
					if(err){
						callback(err)
					}
					callback(null,"删除成功")
				})
			})
		}
		if(!mongodb.openCalled){
			openData(deleteOne)
		}
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
			mongodb.collection('blogs', function(err, collection) {
				if(err){
					return callback(err)
				}
				collection.find(q).sort({
					time:-1
				}).toArray(function(err,docs){
					if(err){
						return callback(err,null)
					}
					// 封装 posts 为 Post 对象
					var blogs = {next:'',blogList:[],prev:'',num:''};
					/*docs.forEach(function(doc, index) {
						var blog = new Blog(doc.user, doc.title, doc.blog,doc.time, doc._id);
						blogs.blogList.push(blog)
					});*/
					blogs.blogList = docs.slice((pageIndex-1)*5 ,pageIndex*5);
					blogs.num = Math.ceil(docs.length/5);
					if(pageIndex > 1){
						blogs.prev = pageIndex - 1;
					}
					if(pageIndex < blogs.num){
						blogs.next = pageIndex + 1;
					}
					
					callback(null, blogs);
				})
			})
		}
		if(!mongodb.openCalled){
			openData(queryA)
		}
	}
}