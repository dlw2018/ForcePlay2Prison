function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=role',
        rownumbers: true,
        idField:'code',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'code',title:'代码',width:100},
            {field:'name',title:'名称',width:100},
            {field:'permissions',title:'权限项',width:250}
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
            handler:remove
        }]
    });
}
var saveType,saveParams;
var primaryCode = '';
function add(){
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增角色');
    saveType = 'add';
    saveParams = '?action=role_append';
}
function edit(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        if (ckItems.length>1){$.messager.alert('提示','你想一起么，不行的。','warning');}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',ckItems[0]);
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑角色');
            saveType = 'edit';
            saveParams = '?action=role_update';
            primaryCode = ckItems[0].code;
        }
    }
}
function remove(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        $.messager.confirm('提示','确定要删除么？',function(r){
            if (r){
                primaryCode = '';
                for(var i=0;i<ckItems.length;i++){
                    primaryCode += "'"+ckItems[i].code+"',";
                }
                primaryCode = primaryCode.substring(0,primaryCode.length-1);
                saveType = 'remove';
                saveParams = '?action=role_remove';
                save();
            }
        });
    }
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var roleCode = $('#code').val();
        var roleName = $('#name').val();
        var rolePermissions = $('#permissions').val();
        if (roleCode=='' || roleName=='' || rolePermissions==''){$.messager.alert('提示','角色的代码、名称和权限项为必填（选）项。','warning');}
        else{
            saveFlag = true;
            saveData = 'pcode='+primaryCode+'&code='+roleCode+'&name='+roleName+'&permissions='+rolePermissions;
        }
    }
    else if (saveType=='remove'){
        saveFlag = true;
        saveData = 'pcode='+primaryCode;
    }
    else{$.messager.alert('提示','操作未定义。','warning');}
    if (saveFlag){
        $.ajax({
            type:'POST',
            url:'http://localhost/IManagerService/WSL/Config.ashx'+saveParams,
            data:saveData,
            async:true, // 默认值
            contentType:'application/x-www-form-urlencoded', // 默认值
            processData:true, // 默认值
            success:function(result){
                var objResult = eval('('+result+')');
                if (objResult.Success){
                    $('#dlg').dialog('close');
                    $('#dg').datagrid('uncheckAll');
                    $('#dg').datagrid('reload');
                }
                else{$.messager.alert('提示',objResult.Message,'warning');}
            },
            error:function(error){
                console.log(error);
            }
         });
    }   
}
function cancel(){$('#dlg').dialog('close');}
$(function(){
    initDatagrid();
});