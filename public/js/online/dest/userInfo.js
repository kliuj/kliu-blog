!function(t){function o(n){if(i[n])return i[n].exports;var r=i[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,o),r.loaded=!0,r.exports}var i={};return o.m=t,o.c=i,o.p="",o(0)}({0:function(t,o,i){t.exports=i(17)},17:function(t,o,i){var n;n=function(t,o,n){var r,e=i(!function(){var t=new Error('Cannot find module "underscore"');throw t.code="MODULE_NOT_FOUND",t}()),a=i(!function(){var t=new Error('Cannot find module "jquery"');throw t.code="MODULE_NOT_FOUND",t}()),s=function(){this.tpl='<%_.each(data,function(item,i){ %>							<a href="/card/<%=item.visitorName%>" title="<%=item.visitorName%>"><img src="<%=item.visitorImg || /img/userIcon.gif%>"></a>						<%})%>'};s.prototype={init:function(){r=this,r.sendPost()},sendPost:function(){a.ajax({url:"/latest/visitor",type:"get",success:function(t){var o=e.template(r.tpl)({data:t.data.visitor});a(".visitor").html(o)}})},pageAjax:function(t){},bind:function(){}},n.exports=s}.call(o,i,o,t),!(void 0!==n&&(t.exports=n))}});