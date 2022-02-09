function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=unit',
        rownumbers: true,
        idField:'id',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'id',title:'标识',width:80},
            {field:'name',title:'名称',width:150},
            {field:'logo',title:'Logo',width:250},
            {field:'address',title:'地址',width:250}
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
function add(){
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增单位');
}
function edit(){}
function remove(){}
function save(){}
function cancel(){
    $('#dlg').dialog('close');
}
$(function(){
    initDatagrid();
});