var ck_prison_code = $.cookie('prison_code');
var ck_prison_rolevalue = $.cookie('prison_role_value');
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    border:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 
    url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=role_info&value='+ck_prison_rolevalue+'&code='+ck_prison_code, 
    method:'GET',
    loadMsg:'正在加载中...',
    remoteSort:false,  
    idField:'RoleID', 
    singleSelect:true, // 是否单选
    rownumbers:true, // 行号 
    columns:[[
        {field:'RoleID',hidden:true},
        {field:'RoleName',title:'角色名',width:100},
        {field:'RoleValue',title:'角色值',width:100},
        {field:'RoleMenu',title:'菜单项',width:150,editor:{type:'combotree',options:{valueField:'id',textField:'text',url:'http://localhost/PrisonService/WSL/Menu/Handler.ashx?action=cb_sidemenu&code='+ck_prison_code,method:'get',required:true,multiple:true}}},
        {field:'RolePermission',title:'权限项',width:150,editor:{type:'combobox',options:{valueField:'value',textField:'text',url:'http://localhost/PrisonService/WSL/User/Handler.ashx?action=permission',method:'get',required:true,multiple:true}}}
    ]],
    toolbar:[{ 
        text:'添加', 
        iconCls:'icon-add'
        // handler:append
    },'-',{ 
        text:'修改', 
        iconCls:'icon-edit' 
        // handler:edit
    },'-',{ 
        text:'删除', 
        iconCls:'icon-remove'
        // handler:removeit
    }],
    onClickCell:onClickCell,
    onAfterEdit:onAfterEdit
}); 
// 追加编辑单个单元格方法
$.extend($.fn.datagrid.methods, {
    editCell: function(jq,param){
        return jq.each(function(){
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));//获取列
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                if (fields[i] != param.field){
                    // 如果不是选中的单元格则editor置空
                    col.editor = null;
                }
            }
            $(this).datagrid('beginEdit', param.index);
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    }
});
var editIndex = undefined;
var editCellField = undefined;
function endEditing(){
	if (editIndex==undefined){return true}
	if ($('#dg').datagrid('validateRow', editIndex)){
		$('#dg').datagrid('endEdit', editIndex);
		editIndex = undefined;
		return true;
	}else{
		return false;
	}
}
function onClickCell(index, field){
    if (endEditing()){ //如果编辑列返回undefined 
        $('#dg').datagrid('selectRow', index)
                .datagrid('editCell', {index:index,field:field});
        editIndex = index;
        editCellField = field;
    }
}
function onAfterEdit(index,row,changes){
    // window.alert("index="+index+",rows="+row.RoleID+",changes="+changes.RolePermission);
	var updated = $('#dg').datagrid('getChanges','updated');
	if (updated.length < 1) {
		editRow = undefined;
		$('#dg').datagrid('unselectAll');
		return;
	}
    else{
        if (editCellField=="RoleMenu"){updateRoleMenu(index,row,changes);}
        else if (editCellField=="RolePermission"){updateRolePermission(index,row,changes);}
        else{}
    }
}
function updateRoleMenu(index,row,changes){
    if (changes.RoleMenu==undefined){return;}
    else{
        $.ajax({
			type:"POST",
			async:false,
			url:"http://localhost/PrisonService/WSL/User/Handler.ashx?action=role_umenu",
			data:{
				"rid":row.RoleID,
				"mids":changes.RoleMenu,
				"code":ck_prison_code
			},
			success:function(result){
                var result = eval('('+result+')');
				if(result.Success==true){$("#dg").datagrid('reload');}
                else{$.messager.show({title:'温馨提示',msg:result.Message});}
			}
		});
    }
}
function updateRolePermission(index,row,changes){
    if (changes.RolePermission==undefined){return;}
    else{
        $.ajax({
			type:"POST",
			async:false,
			url:"http://localhost/PrisonService/WSL/User/Handler.ashx?action=role_upermission",
			data:{
				"rid":row.RoleID,
				"pvalues":changes.RolePermission,
				"code":ck_prison_code
			},
			success:function(result){
                var result = eval('('+result+')');
				if(result.Success==true){$("#dg").datagrid('reload');}
                else{$.messager.show({title:'温馨提示',msg:result.Message});}
			}
		});
    }
}