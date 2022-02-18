function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=user',
        rownumbers: true,
        idField:'id',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'id',title:'标识',width:80},
            {field:'name',title:'名称',width:150},
            {field:'roleCode',title:'角色',width:100,formatter:function(value,row,index){
                return row.roleName;
            }},
            {field:'userType',title:'类型',width:100,formatter:function(value,row,index){
                if (value=='M'){return '后台';}
                else if (value=='F'){return '前端';}
                else{return '未知';}
            }},
            {field:'menus',title:'菜单项',width:250},
            {field:'unitID',title:'单位',width:250,formatter:function(value,row,index){
                return row.unitName;
            }},
            {field:'createTime',title:'创建时间',width:120},
            {field:'modifyTime',title:'修改时间',width:120}
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
    $('#name').textbox('readonly',false);
    $('#pwd').passwordbox('enable');
    $('#unitID').combobox('enable');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增用户');
    saveType = 'add';
    saveParams = '?action=user_append';
}
function edit(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        if (ckItems.length>1){$.messager.alert('提示','你想一起么，不行的。','warning');}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',ckItems[0]);
            $('#name').textbox('readonly',true);
            $('#pwd').passwordbox('disable');
            $('#unitID').combobox('disable');
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑用户');
            saveType = 'edit';
            saveParams = '?action=user_update';
            primaryCode = ckItems[0].id;
        }
    }
    else{}
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
                saveParams = '?action=user_remove';
                save();
            }
        });
    }
    else{}
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add'){
        var userName = $('#name').val();
        var userPwd = $('#pwd').val();
        var roleCode = $('#roleCode').val();
        var userType = $('#userType').val();
        var userMenu = $('#menus').val();
        var userUnit = $('#unitID').val();
        if (userName=='' || userPwd=='' || roleCode=='' || userType=='' || userMenu=='' || userUnit==''){$.messager.alert('提示','用户信息不完整，请检查。','warning');}
        else{
            saveFlag = true;
            saveData = 'name='+userName+'&pwd='+userPwd+'&role='+roleCode+'&type='+userType+'&menu='+userMenu+'&unit='+userUnit;
        }
    }
    else if (saveType=='edit'){
        var userName = $('#name').val();
        var roleCode = $('#roleCode').val();
        var userType = $('#userType').val();
        var userMenu = $('#menus').val();
        if (userName=='' || roleCode=='' || userType=='' || userMenu==''){$.messager.alert('提示','用户信息不完整，请检查。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+primaryCode+'&name='+userName+'&role='+roleCode+'&type='+userType+'&menu='+userMenu;
        }
    }
    else if (saveType=='remove'){
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