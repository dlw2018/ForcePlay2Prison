$(function(){
    $("#btnSubmit").on("click",function(){
        var userAccount = $("#userAcct").val();
        var userPassword = $("#userPwd").val();
        var errorMessage = "";
        if (!/^[a-zA-Z0-9_-]{8,24}$/.test(userAccount)) {
            errorMessage = "账号至少8位，由字母，数字，下划线或减号组成。";
        }
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,24}$/.test(userPassword)){
            errorMessage = "密码至少包含大小写字母、数字且不少于8位。";
        }
        else{}
        if (errorMessage!=""){
            $.messager.show({title: '温馨提示',msg: errorMessage});
            return;
        }
        $('#fm').form('submit', {
            url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=login',
            onSubmit: function(){
                // do some check
                // return false to prevent submit;
            },
            success:function(data){
                var objData = eval('(' + data + ')');
                if (objData.Success){
                    // 写入cookie.
                    $.cookie('prison_account', userAccount);
                    window.location.href = "index.htm";
                }
                else{$.messager.show({title: '温馨提示',msg: objData.Message});}
            }
        });
    });
    $("#btnReset").on("click",function(){
        $("#fm").form('clear');
    });
});