// 判断值是否是数字（整型值）
function valueisNumber(val){
    if (parseInt(val).toString()=="NaN"){return false;}
    else{return true;}
}
//获取url中的参数
function getUrlParam(name){
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return decodeURIComponent(r[2]); return null;
}