
function User(name,password,pic,sign) {
  this.name = name;
  this.password = password;
  this.pic = pic;
  this.sign = sign;
};
var mongoose = require('mongoose');
var db     = mongoose.createConnection('mongodb://127.0.0.1:27017/data'); 
var fs = require('fs');
// 链接错误
db.on('error', function(error) {
	console.log(error)
   db     = mongoose.createConnection('mongodb://127.0.0.1:27017/data'); 
});
// Schema 结构 骨架模版 返回数据也是按照这个结构对应的字段
var userSchema = new mongoose.Schema({
    objId : {type : mongoose.Schema.ObjectId},
    name:{type : String},
    pic:{type:String},
    time     : {type : Date, default:  Date.now},
    password    : {type : String},
    sign      : {type : String},
    img      : {type : String}
});

userSchema.statics = {
		//更新用户信息
		updateInfo:function(oid,setStr,callback){
				return this
				.update({_id:oid},setStr).populate("objId")
				.exec(callback)
		}
}
// model模型  直接使用userModel方法
var userModel = db.model('users', userSchema);

module.exports = User;

//存储用户信息
User.prototype ={
	save: function (callback) {
		  //要存入数据库的用户文档
		  var user = {
		    name: this.name,
		    password: this.password,
		    img:'',
		    sign:''
		  };
		  //打开数据库
		  var userInfo = new userModel(user);
		  userInfo.save(function(err,data){
				if(err){
					return callback(err)
				}
				callback(err, data);
			})
		},
		//读取个人用户信息，判断密码在获取数据之后进行
		get : function(name, callback) {
			//读取 users 集合
			userModel.findOne({name:name},function(err,doc){
						if (err) {
		          return callback(err);//失败！返回 err 信息
		        }
		        callback(null, doc);//成功！返回查询的用户信息
			})
		},
		//更新用户信息online
		update:function(id,img,sign,callback){
			var setStr = {
				 		$set : { "sign" : sign,"img" : img}
				 };
			userModel.updateInfo(id,setStr,function(err,data){
				 callback(err,data)
			})
			
		},
		//手机上存储图片
		updateImg:function(id,img,callback){
			var base64Data = img.replace(/\s/g,"+");
			 	base64Data = img.replace(/^data:image\/\w+;base64,/, "");
			var dataBuffer = new Buffer(base64Data, 'base64');
		  // write buffer to file
		  fs.writeFile( './public/userImg/' + "img"+id+".jpg", dataBuffer, function(err,data) {
					if(err){
					  callback(err);
					}else{
					  img = __dirname + "eg.jpg"
					  callback('','http://lwons.com:3000/userImg/' + "img"+id+".jpg") 
					}
			});
		},
		//手机上更新签名
		updateSign:function(id,sign,callback){
			var setStr = {
				 		$set : { "sign" : sign}
				 };
			userModel.updateInfo(id,setStr,function(err,data){
				 callback(err,data)
			})
			
		},
		//读取他人用户信息
		getCard : function(name, callback) {
		  //打开数据库
		  //读取 users 集合
		  userModel.findOne({name:name},function(err,user){
						if (err) {
		          return callback(err);//失败！返回 err 信息
		        }
		        callback(null, {img:user.img,sign:user.sign});//成功！返回查询的用户信息
			})
		},
		//保留最近访问的用户信息
		saveVisitor:function(name,visitorName,visitorImg){
				//用户名，访问者，访问者图片
				var query ={
					 		name: name
					 }
				//$push	添加一个元素
				//$pull	从一个数组中移除匹配的元素。
				//先删除再添加，确保顺序最前且不重复
				var delStr = {
					 		'$pull' : { "visitor" : {
					 			visitorName:visitorName,
					 			visitorImg:visitorImg
					 		}}
					 }; 
				 var setStr = {
					 		'$push' : { "visitor" : {
					 			visitorName:visitorName,
					 			visitorImg:visitorImg
					 		}}
					 };
				function savePeo(query){
				//	userModel.update(query,delStr);
					userModel.update(query,setStr);
				}
				savePeo(query)
					 
		},
		//读取访客用户信息
		getVisitor : function(name, callback) {
		  //打开数据库
		  //读取 users 集合
		  userModel.findOne({name:name},function(err,user){
		  	if(err){
		  		return 	callback(err)
		  	}
		  	 var userInfo={
	        	visitor:user.visitor
	        }
	        callback(null, userInfo);//成功！返回查询的用户信息
		  })
		},
}