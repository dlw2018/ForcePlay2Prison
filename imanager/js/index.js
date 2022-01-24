var sideMenuData = [];
// 获取侧栏菜单
function getSideMenuData(){
    try{
        var sideMenuUrl = "json/admin_sidemenu.json";
        $.ajax({
            type: "GET",
            url: sideMenuUrl,
            async: false,
            success: function(data){
                sideMenuData = data;
            },
            error:function(){console.log("ajax请求发生异常。");}
        });
    }
    catch(ex){console.log(ex.Message);} 
}
// 选择事件实现方法
function sideSelect(item){
    addTab(item.text,item.url);
}
// 新增标签页（选项卡）
function addTab(title, url){
	if ($('#tabs').tabs('exists', title)){
		$('#tabs').tabs('select', title);
	} else {
		var content = '<iframe scrolling="auto" frameborder="0" src="'+url+'" style="width:100%;height:100%;"></iframe>';
		$('#tabs').tabs('add',{
			title:title,
			content:content,
			closable:true
		});
	}
}
// 加载入口
getSideMenuData();
// 修改密码对话框
function updatePwd(){
    $('#dlgPwd').dialog('open').dialog('center');
}
// 退出登录
function logout(){
    // $.removeCookie('prison_account');
    window.location.href = "login.htm";
}