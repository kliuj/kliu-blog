define(function(require, exports, module){
	var self,
		_ = require('underscore'),
		$ = require('jquery');
	var user = function(){
		
	}
	user.prototype = {
		init:function(){
			self = this;
			self.bind();
		},
		//首次渲染html内容
		sendPost:function(){
			
			var qiao ={}
			// qiniu
			qiao.qiniu = {
			    ak : '807xoSLjCXmFj4SqWOpaqlW9iKgn-fE5fcEbuhh6',
			    sk : 'SND7GNymedqGDAGiVgcW7C_RNLPqQEeaGBSiRv4s',
			    pr : 'http://7xl3r9.com1.z0.glb.clouddn.com/',
			    scope : 'kliu',
			};
			qiao.qiniu.deadline = function(){
			    return Math.round(new Date().getTime() / 1000) + 3600;
			};
			qiao.qiniu.genScope = function(src){
			    var scope = qiao.qiniu.scope;
			    if(src){
			        var ss = src.split('.');
			        qiao.qiniu.file = qiao.qiniu.uid() + '.' + ss[ss.length - 1];
			        scope = scope + ':' + qiao.qiniu.file;
			    }
			    
			    return scope;
			};
			qiao.qiniu.uid = function(){
			    return Math.floor(Math.random()*100000000+10000000).toString();
			};
			qiao.qiniu.uptoken = function(src) {
			    //SETP 1
			    var putPolicy = '{"scope":"' + qiao.qiniu.genScope(src) + '","deadline":' + qiao.qiniu.deadline() + '}';
			
			    //SETP 2
			    var encoded = qiao.encode.base64encode(qiao.encode.utf16to8(putPolicy));
			
			    //SETP 3
			    var hash = CryptoJS.HmacSHA1(encoded, qiao.qiniu.sk);
			    var encoded_signed = hash.toString(CryptoJS.enc.Base64);
			
			    //SETP 5
			    var upload_token = qiao.qiniu.ak + ":" + qiao.encode.safe64(encoded_signed) + ":" + encoded;
			    return upload_token;
			};
			qiao.qiniu.url = function(key){
			    return qiao.qiniu.pr + qiao.qiniu.file;
			};
				
		},
		pageAjax:function(callback){
			
		},
		bind:function(){
			
						
		}
	}
	
	module.exports = user
})
