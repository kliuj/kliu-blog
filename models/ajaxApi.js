var mongodb = require('./db');

function AjaxPost(username, post, time, id) {
	this.user = username;
	this.post = post;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date()
	}
	this.id = id;
}
module.exports = AjaxPost;
AjaxPost.prototype = {
	//查询
	get: function(username, callback) {
			mongodb.open(function(err, db) {
				if (err) {
					return callback(err)
				}
				//读取posts集合
				db.collection('posts', function(err, collection) {
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
						var posts = [];
						docs.forEach(function(doc, index) {
							var post = new AjaxPost(doc.user, doc.post, doc.time, doc._id);
							posts.push(post)
						});
						callback(null, posts);
					})
				})
			})
		}
}