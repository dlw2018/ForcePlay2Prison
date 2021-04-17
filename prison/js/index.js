var sideMenuData;
var ck_user_acct;
function getSideMenuData(){
    try{
        var ck_role_id = $.cookie('prison_role_id');
        var ck_prison_code = $.cookie('prison_code');
        var sideMenuApi = "http://localhost/PrisonService/WSL/Menu/Handler.ashx?action=sidemenu&rid="+ck_role_id+"&code="+ck_prison_code;
        $.ajax({
            type: "GET",
            url: sideMenuApi,
            async: false,
            success: function(data){
                var objSideMenu = eval("("+data+")");
                if (objSideMenu.Success){sideMenuData = objSideMenu.Data.Items;}
                else{sideMenuData = null;}
            },
            error:function(){console.log(objSideMenu.Message);}
        });
    }
    catch(ex){console.log(ex.Message);} 
}
function sideSelect(item){
    addTab(item.text,item.url);
}
function addTab(title, url){
	if ($('#tabs').tabs('exists', title)){
		$('#tabs').tabs('select', title);
	} else {
		var content = '<iframe scrolling="auto" frameborder="0"  src="'+url+'" style="width:100%;height:100%;"></iframe>';
		$('#tabs').tabs('add',{
			title:title,
			content:content,
			closable:true
		});
	}
}
function logout(){
    $.removeCookie('prison_account');
    window.location.href = "login.htm";
}
function userInfo(){
    $.ajax({
        async:false,
        url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=info&userAcct='+ck_user_acct,
        type:'GET',
        success:function(data){
            var objUser = eval("("+data+")");
            if (objUser.Success){
                $.cookie('prison_role_id', objUser.Data.RoleID);
                $.cookie('prison_role_value', objUser.Data.RoleValue);
                $.cookie('prison_role_permission',objUser.Data.RolePermission);
                $.cookie('prison_code', objUser.Data.MFCode);
                if (objUser.Data.UserNickname){$("#un").text(objUser.Data.UserNickname);}
                else{$("#un").text(objUser.Data.UserAccount);}
            }
            else{$.messager.show({title: '温馨提示',msg: objData.Message});}
        }
    });
}
// 页面鉴权
function pageValidate(){
    var account = $.cookie('prison_account');
    ck_user_acct = account;
    if (typeof(account)=="undefined"){window.location.href = "login.htm";}
    else{
        // 获取用户信息
        userInfo();
        // 初始化左侧菜单
        getSideMenuData();
    }
}
pageValidate();
function updatePwd(){
    $("#dlgPwd").dialog('open').dialog('center');
}
// 保存密码
function savePwd(){
    var oldPwd = $("input[name='oldPwd']").val();
    var newPwd = $("input[name='newPwd']").val();
    var newPwd2 = $("input[name='newPwd2']").val();
    if (oldPwd==newPwd){$.messager.alert('操作提示','旧密码不能与新密码相同。','warning');}
    else if (newPwd!=newPwd2){$.messager.alert('操作提示','新密码两次输入不一致。','warning')}
    else{
        $("#dlgPwd").dialog('close');
        $.ajax({
			type:"POST",
			async:false,
			url:"http://localhost/PrisonService/WSL/User/Handler.ashx?action=u_pwd",
			data:{
				"acct":ck_user_acct,
				"pwd":oldPwd,
				"npwd":newPwd
			},
			success:function(result){
                var result = eval('('+result+')');
				if(result.Success==true){$.messager.alert('操作提示','密码修改成功。','info');}
                else{$.messager.alert('操作提示',result.Message,'warning');}
			},
            error:function(error){
                console.log(error);
            }
		});
    }
}