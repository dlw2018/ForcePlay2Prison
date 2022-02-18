function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=group',
        rownumbers: true,
        idField:'id',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'id',title:'标识',width:80},
            {field:'name',title:'名称',width:150},
            {field:'shareCode',title:'共享代码',width:100},
            {field:'address',title:'地址',width:200},
            {field:'createTime',title:'创建时间',width:150}
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
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增群组');
    saveType = 'add';
    saveParams = '?action=group_append';
}
function edit(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        if (ckItems.length>1){$.messager.alert('提示','你想一起么，不行的。','warning');}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',ckItems[0]);
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑群组');
            saveType = 'edit';
            saveParams = '?action=group_update';
            primaryCode = ckItems[0].id;
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
                    primaryCode += ckItems[i].id+",";
                }
                primaryCode = primaryCode.substring(0,primaryCode.length-1);
                saveType = 'remove';
                saveParams = '?action=group_remove';
                save();
            }
        });
    }
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var groupName = $('#name').val();
        var shareCode = $('#shareCode').val();
        var groupAddress = $('#address').val();
        if (groupName==''){$.messager.alert('提示','群组名称为必填项。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+primaryCode+'&name='+groupName+'&scode='+shareCode+'&address='+groupAddress;
        }
    }
    else if(saveType=='remove'){
        saveFlag = true;
        saveData = 'ids='+primaryCode;
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