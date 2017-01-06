/*global plupload */
/*global qiniu */
function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.file = file;

    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = $('#' + this.fileProgressID);


}


FileProgress.prototype.setComplete = function(up, info) {
    var td = this.fileProgressWrapper.find('td:eq(2)'),
        tdProgress = td.find('.progress');

    var res = $.parseJSON(info);
    var url = "http://7xq8iy.com1.z0.glb.clouddn.com/"+res.key;
    $("#imgPic").val(url);
	$("#head-pic").html('<img src="'+url+'" width="80" height="80">')
};


FileProgress.prototype.setStatus = function(status, isUploading) {
    if (!isUploading) {
        this.fileProgressWrapper.find('.status').text(status).attr('class', 'status text-left');
    }
};

