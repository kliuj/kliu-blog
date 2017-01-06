$(document).ready(function(){
	console.log(11)
	$("#submitBtn").bind("click",function(){
		$("#post").val($(".divC").html())
		$("#sayForm").submit()
	})
	
})
