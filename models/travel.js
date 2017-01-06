var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Travel(username, title, detail,time, id,grouptype,titleImg) {
	this.user = username;
	this.title = title;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date()
	}
	this.detail = detail;
	this.id = id;
}
module.exports = Travel;
Travel.prototype = {
	save: function(callback) {
		//存入mongodb的文档
		var travel = {
			user: this.user,
			title: this.title,
			detail:this.detail,
			time: this.time
		}
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err)
			}
			//读取posts集合
			db.collection('travel', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err)
				}
				//为user属性添加索引
				collection.ensureIndex('user');
				//写入post文档
				collection.insert(travel, {
					safe: true
				}, function(err, post) {
					mongodb.close();
					callback(err, post);
				})
			})
		})
	},
	//查询
	getAll: function(username, index ,len,type, callback) {
			mongodb.open(function(err, db) {
				if (err) {
					return callback(err)
				}
				//读取posts集合
				db.collection('blogs', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err)
					}
					//查找user属性为username的文档，如果username是null则全部匹配
					var query = {};
					if (username) {
						query.user = username
					}
					collection.find(query).sort({
						time: -1
					}).toArray(function(err, docs) {
						mongodb.close();
						if (err) {
							callback(err, null);
						}
						// 封装 posts 为 Post 对象
						var travels = {data:[],num:''};
						docs.forEach(function(doc, index) {
							var travel = new Travel(doc.user, doc.title, '',doc.time, doc._id);
							travels.data.push(travel)
						});
						console.log(docs)
						travels.num = docs.length;
						callback(null, travels);
					})
				})
			})
		},
	//异步返回detail信息	
	getDetail:function(id,callback){
		mongodb.open(function(err,db){
			if(err){
				return callback(err)
			}
			db.collection('travel',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err)
				}
				//查找id
				var query = {};
				
				if (id) {
					try{
						query._id = new ObjectID(id)
					}catch(e){
						mongodb.close();
						try{
							return callback("id不存在")
						}catch(e){}
					}
				}else{
					mongodb.close()
					return callback("id不存在")
				}
				collection.find(query).sort({
					time: -1
				}).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						callback(err, null);
					}
					// 封装 posts 为 Post 对象
					var travels = [];
					
					docs.forEach(function(doc, index) {
						var travel = new Travel(doc.user, doc.title, doc.detail,doc.time, doc._id);
						travels.push(travel)
					});
					callback(null, travels);
				})
			})
		})
		
	},
		//删除
	deleteList: function(id,callback) {
		mongodb.open(function(err, db) {
				if (err) {
					mongodb.close();	
					return callback(err)
				}
				
				//读取posts集合
				db.collection('travel', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err)
					}
					
					collection.remove({
						_id: new ObjectID(id)
					}, {
						
					}, function(err,object) {
//						mongodb.close() 
						if (err) {
							callback(err, null);
						}
						callback(null,"删除成功")
					})
				})
			})
	},
	//批量更新修改数据
	update:function(callback){
		mongodb.open(function(err,db){
			if (err) {
				mongodb.close();	
				return callback(err)
			}
			db.collection('blogs',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err)
				}
				var num = 1;
				var updateStr = {$set: {praise: num}};
				collection.update({}, updateStr, {multi: true},function(err){
					if(err){
							 callback(err)
						}
						 callback(null)
				})
			})
		})
	}
}