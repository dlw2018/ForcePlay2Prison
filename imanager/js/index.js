var sideMenuData = [];
// 获取侧栏菜单
function getSideMenuData(){
    try{
        var sideMenuUrl;
        var userName = $.cookie('hsitv_user');
        if (userName=='superman'){sideMenuUrl='json/admin_sidemenu.json';}
        else{sideMenuUrl='http://localhost/IManagerService/WSL/User.ashx?action=menu&name='+userName;}
        $.ajax({
            type: "GET",
            url: sideMenuUrl,
            async: false,
            success: function(data){
                if (userName=='superman'){ sideMenuData = data;}
                else{sideMenuData = eval('('+data+')');} 
            },
            error:function(){console.log("ajax请求发生异常。");}
        });
    }
    catch(ex){console.log(ex.Message);} 
}
function userInfo(){
    try{
        var userName = $.cookie('hsitv_user');
        var apiUrl = 'http://localhost/IManagerService/WSL/User.ashx?action=info&name='+userName;
        $.ajax({
            type: "GET",
            url: apiUrl,
            async: false,
            success: function(data){
                var userData = eval('('+data+')');
                $.cookie('hsitv_role', userData.Data.RoleCode);
                $.cookie('hsitv_permissions',userData.Data.Permissions);
                $.cookie('hsitv_unit',userData.Data.UnitID);
            },
            error:function(){console.log("ajax请求发生异常。");}
        });
    }
    catch(ex){console.log(ex.Message);}
}
// 选择事件实现方法
function sideSelect(item){
    addTab(item.text,item.hyperlink);
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
// 入口方法
pageValidate();
// 页面鉴权
function pageValidate(){
    var userName = $.cookie('hsitv_user');
    if (typeof(userName)=='undefined'){window.location.href = 'login.htm';}
    else{
        // 获取用户信息
        userInfo();
        // 初始化左侧菜单
        getSideMenuData();
    }
}
// 修改密码对话框
function updatePwd(){
    $('#dlgPwd').dialog('open').dialog('center');
}
// 退出登录
function logout(){
    $.removeCookie('hsitv_user');
    window.location.href = "login.htm";
}