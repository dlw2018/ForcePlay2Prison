var ck_prison_code = $.cookie('prison_code');
var ck_prison_account = $.cookie('prison_account');
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=person&acct='+ck_prison_account+'&code='+ck_prison_code, 
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
        text:'修改昵称', 
        iconCls:'icon-edit', 
        handler:edit
    }]
}); 
var url;
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $("#dlgNName").dialog('open').dialog('center');
		$('#fm').form('load',checkedItems[0]);
		url = 'http://localhost/PrisonService/WSL/User/Handler.ashx?action=u_nname&pid='+checkedItems[0].ID;
    }
}
function save(){
    var newNickname = $("input[name='Nickname']").val();
    if (newNickname==""){$.messager.alert('操作提示','昵称不能为空。','warning');}
    else{
        $("#dlgNName").dialog('close');
        $.ajax({
			type:"POST",
			async:false,
			url:url,
			data:{"nname":newNickname},
			success:function(result){
                var result = eval('('+result+')');
				if(result.Success==true){
                    $('#dg').datagrid('clearChecked');
                    $('#dg').datagrid('reload');
                    $.messager.alert('操作提示','昵称修改成功。','info');
                }
                else{$.messager.alert('操作提示',result.Message,'warning');}
			},
            error:function(error){
                console.log(error);
            }
		});
    }
}