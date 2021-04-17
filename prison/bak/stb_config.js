$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    border:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/Stb/Handler.ashx?action=r_stb&code=1&style=easyui', 
    method:'GET',
    loadMsg:'正在加载中...',
    // sortName:'code', 
    // sortOrder:'desc', 
    remoteSort:false,  
    idField:'StbID', 
    singleSelect:false, // 是否单选 
    pagination:true, // 启用分页工具栏
    pageNumber:1, // 初始化页码
    pageSize:3, // 初始化页面尺寸
    pageList:[3,6,9], // 初始化页面尺寸的选择列表
    // rownumbers:true, // 行号 
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
$(function(){
    // Pagination设置
    var pn = $('#dg').datagrid().datagrid('getPager');
    pn.pagination({ 
        // beforePageText: '第', // 页数文本框前显示的汉字 
        // afterPageText: '页    共 {pages} 页', 
        displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录' 
    });
});
var url;
function append(){
	$('#dlg').dialog('open').dialog('center').dialog('setTitle','新增终端');
	$('#fm').form('clear');
    url = 'http://localhost/PrisonService/WSL/Stb/Handler.ashx?action=c_stb&code=1';
}
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑终端');
		$('#fm').form('load',checkedItems[0]);
		url = 'http://localhost/PrisonService/WSL/Stb/Handler.ashx?action=u_stb&stbid='+checkedItems[0].StbID;
    }
}
function save(){
    $('#fm').form('submit',{
        url: url,
        iframe: false,
        onSubmit: function(){
            return $(this).form('validate');
        },
        success: function(result){
            var result = eval('('+result+')');
            if (result.Success){
                $('#dlg').dialog('close');      // close the dialog.
                $('#dg').datagrid('clearChecked');
                $('#dg').datagrid('reload');    // reload the dialog data.
            } else {
                $.messager.show({title:'温馨提示',msg:result.Message});
            }
        }
    });
}
function removeit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要删除的条目。'});}
    else{
        var stbIds=[];
        for (var i=0;i<checkedItems.length;i++){
            var objStb={};
            objStb.stbid = checkedItems[i].StbID;
            stbIds.push(objStb);
        }
        var jsonStbIds = JSON.stringify(stbIds);
        $.messager.confirm('删除确认','您确定要删除所选的条目么？',function(r){
            if (r){
                url = "http://localhost/PrisonService/WSL/Stb/Handler.ashx?action=d_stb&code=1";
                $.post(url,jsonStbIds,function(result){
					if (result.Success){
                        $('#dg').datagrid('clearChecked');
						$('#dg').datagrid('reload');
					} else {
						$.messager.show({title: '温馨提示',msg: result.Message});
					}
				},'json');
            }
        });
    }
}