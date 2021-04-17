var ck_role_value = $.cookie('prison_role_value');
var ck_role_permission = $.cookie('prison_role_permission');
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=permission_info', 
    method:'GET',
    loadMsg:'正在加载中...', 
    remoteSort:false,  
    idField:'PermissionID', 
    singleSelect:false, // 是否单选 
    // rownumbers:true, // 行号 
    columns:[[
        {field:'PermissionID',hidden:true},
        {field:'PermissionName',title:'权限名',width:100},
        {field:'PermissionValue',title:'权限值',width:100},
        {field:'PermissionSort',title:'顺序',width:100},
        {field:'CreateTime',title:'创建时间',width:150}
    ]],
    frozenColumns:[[ 
        {field:'ck',checkbox:true} 
    ]], 
    toolbar:[{ 
        text:'添加', 
        iconCls:'icon-add', 
        handler:append
    },'-',{ 
        text:'修改', 
        iconCls:'icon-edit', 
        handler:edit
    },'-',{ 
        text:'删除', 
        iconCls:'icon-remove', 
        handler:removeit
    }], 
}); 
function verifyPermission(opt){
    var verifyState = false;
    if (ck_role_value>=9){
        if (ck_role_permission.indexOf(opt)>=0){verifyState = true;}
    }
    return verifyState;
}
var url;
function append(){
    if (verifyPermission("C")){
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增权限');
        $('#fm').form('clear');
        url = 'http://localhost/PrisonService/WSL/User/Handler.ashx?action=c_permission';
    }
    else{$.messager.alert('操作提示','角色或权限受限。','warning');}
}
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑权限');
		$('#fm').form('load',checkedItems[0]);
		url = 'http://localhost/PrisonService/WSL/User/Handler.ashx?action=u_permission&pid='+checkedItems[0].PermissionID;
    }
}
function save(){
    $('#fm').form('submit',{
        url:url,
        onSubmit:function(){
            return $(this).form('validate');
        },
        success:function(result){
            var result = eval('('+result+')');
            if (result.Success){
                $('#dlg').dialog('close');      // close the dialog.
                $('#dg').datagrid('clearChecked');
                $('#dg').datagrid('reload');    // reload the dialog data.
            }else{$.messager.show({title:'温馨提示',msg:result.Message});}
        }
    });
}
function removeit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要删除的条目。'});}
    else{
        var pids=[];
        for (var i=0;i<checkedItems.length;i++){
            var objPid={};
            objPid.pid = checkedItems[i].PermissionID;
            pids.push(objPid);
        }
        var jsonPIds = JSON.stringify(pids);
        $.messager.confirm('删除确认','您确定要删除所选的条目么？',function(r){
            if (r){
                url = "http://localhost/PrisonService/WSL/User/Handler.ashx?action=d_permission";
                $.post(url,jsonPIds,function(result){
					if (result.Success){
                        $('#dg').datagrid('clearChecked');
						$('#dg').datagrid('reload');
					} else {
						$.messager.show({title:'温馨提示',msg:result.Message});
					}
				},'json');
            }
        });
    }
}