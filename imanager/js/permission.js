function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=permission',
        rownumbers: true,
        idField:'code',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'code',title:'代码',width:100},
            {field:'name',title:'名称',width:100},
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
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增权限项');
    saveType = 'add';
    saveParams = '?action=permission_append';
}
function edit(){
    var rows = $('#dg').datagrid('getChecked');
    if (rows){
        if (rows.length>1){alert(rows.length);}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',rows[0]);
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑权限项');
            primaryCode = rows[0].code;
            saveType = 'edit';
            saveParams = '?action=permission_update';
        }
    }
}
function remove(){
    var rows = $('#dg').datagrid('getChecked');
    if (rows){
        $.messager.confirm('提示', '确定要删除吗？', function(r){
            if (r){
                primaryCode = '';
                for(var i=0;i<rows.length;i++){
                    primaryCode += "'"+rows[i].code+"',";
                }
                primaryCode = primaryCode.substring(0,primaryCode.length-1);
                saveType = 'remove';
                saveParams = '?action=permission_remove';
                save();
            }
            else{}
        });
    }
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var permissionCode = $('#code').val();
        var permissionName = $('#name').val();
        if (permissionCode=='' || permissionName==''){$.messager.alert('提示','权限的代码和名称为必填项。','warning');}
        else{
            saveFlag = true;
            saveData = 'pcode='+primaryCode+'&code='+permissionCode+'&name='+permissionName;
        }
    }
    else if (saveType=='remove'){
        if (primaryCode.length<=0){$.messager.alert('提示','请选择要删除的权限项。','warning');}
        else{
            saveFlag = true;
            saveData = 'pcode='+primaryCode;
        }
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
                    $('#dg').datagrid('unselectAll');
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