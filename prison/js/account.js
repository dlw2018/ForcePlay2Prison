var ck_code = $.cookie('prison_code');
var ck_account = $.cookie('prison_account');
var ck_role_value = $.cookie('prison_role_value');
var roleData;
if (ck_role_value<8){$.messager.alert('温馨提示','账户角色或权限受限','info');}
else{
    $('#dg').datagrid({ 
        width:'100%', 
        height:'auto', 
        nowrap:false, 
        striped:true, 
        collapsible:false, // 是否可折叠的 
        fit:true, // 自动大小 
        fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
        url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=persons&code='+ck_code, 
        method:'GET',
        loadMsg:'正在加载中...', 
        remoteSort:false,  
        idField:'ID', 
        singleSelect:false, // 是否单选 
        // rownumbers:true, // 行号 
        columns:[[
            {field:'ID',hidden:true},
            {field:'Account',title:'账号',width:100},
            {field:'Password',title:'密码',width:100,formatter:function(value,row,index){
                if (value!=""){return '********';}
                else{return value;} 
            }},
            {field:'Nickname',title:'昵称',width:100},
            {field:'RoleName',title:'角色名',width:150}
        ]],
        frozenColumns:[[ 
            {field:'ck',checkbox:true} 
        ]], 
        toolbar:[{ 
            text:'添加', 
            iconCls:'icon-add', 
            handler:add
        },'-',{ 
            text:'修改', 
            iconCls:'icon-edit', 
            handler:edit
        },'-',{ 
            text:'删除', 
            iconCls:'icon-remove', 
            handler:removeit
        }]
    }); 
    getRoleData();
}
var url;
function add(){
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增账户');
    $('#fm').form('clear');
    url = 'http://localhost/PrisonService/WSL/User/Handler.ashx?action=c_person';
}
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑终端');
		$('#fm').form('load',checkedItems[0]);
		url = 'http://localhost/PrisonService/WSL/User/Handler.ashx?action=u_person&pid='+checkedItems[0].ID;
    }
}
function removeit(){}
function save(){
    var userAccount = $("input[name='Account']").val();
    var userPwd = $("input[name='Password']").val();
    var userNickname = $("input[name='Nickname']").val();
    var roleID = $('#RoleName').combobox('getValue');
    if (!valueisNumber(roleID)){
        for(var i=0;i<roleData.length;i++){
            if (roleData[i].text==roleID){
                roleID = roleData[i].id;
                break;
            }
        }
    }
    var errorMessage = "";
    if (!/^[a-zA-Z0-9_-]{8,24}$/.test(userAccount)){errorMessage = "账号至少8位，由字母，数字，下划线或减号组成。";}
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,24}$/.test(userPwd)){errorMessage = "密码至少包含大小写字母、数字且不少于8位。";}
    else if (userNickname.length>32){errorMessage = "昵称长度超限。";}
    else if (!roleID){errorMessage = "未对账号选择角色。";}
    else{}
    if (errorMessage!=""){
        $.messager.show({title:'温馨提示',msg:errorMessage});
        return;
    }
    $.ajax({
        type:"POST",
        async:false,
        url:url,
        data:{
            "acct":userAccount,
            "pwd":userPwd,
            "nname":userNickname,
            "rid":roleID,
            "code":ck_code
        },
        success:function(result){
            var objResult = eval('('+result+')');
            if(objResult.Success==true){
                $('#dlg').dialog('close');
                $('#dg').datagrid('clearChecked');
                $('#dg').datagrid('reload'); 
                $.messager.alert('温馨提示','操作成功。','info');
            }
            else{$.messager.alert('操作提示',objResult.Message,'warning');}
        },
        error:function(error){
            console.log(error);
        }
    });
}
function getRoleData(){
    $.ajax({
        type:"GET",
        async:false,
        url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=role_data&code='+ck_code,
        success:function(result){
            var objResult = eval('('+result+')');
            if(objResult.Success==true){roleData = objResult.Data.Items;}
            else{roleData = [];}
        },
        error:function(error){
            console.log(error);
        }
    });
}