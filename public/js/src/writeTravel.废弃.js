define(function(require, exports, module){
	var self,
		$ = require('jquery');
	var writeTravel = function(){
		
	}
	writeTravel.prototype = {
		init:function(){
			self = this;
			self.sendPost()
		},
		sendPost:function(){
			$("#formBtn").bind("click",function(){
				$("#tdetail").val($(".text-normal-div").html());
				$("#formWrite").submit();
			})
		}
	}
	
	module.exports = writeTravel
})
