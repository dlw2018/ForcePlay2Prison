var ck_code = $.cookie('prison_code');
var ck_account = $.cookie('prison_account');
var ck_role_value = $.cookie('prison_role_value');
var batchID = getUrlParam('bid');
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cbanding&bid='+batchID+'&code='+ck_code, 
    method:'GET',
    loadMsg:'正在加载中...', 
    remoteSort:false,  
    idField:'ID', 
    singleSelect:true, // 是否单选 
    rownumbers:true, // 行号 
    columns:[[
        {field:'ID',hidden:true},
        {field:'BatchName',title:'分组名称',width:100},
        {field:'ContentID',title:'节目标识',width:50},
        {field:'ContentName',title:'节目名称',width:120},
        {field:'ContentType',title:'节目类型',width:50},
        {field:'ContentSort',title:'播放顺序',width:50,editor:{type:'text'}},
        {field:'CreateTime',title:'创建时间',width:100}
    ]],
    /*frozenColumns:[[ 
        {field:'ck',checkbox:true} 
    ]],*/
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
    },'-',{ 
        text:'返回', 
        iconCls:'icon-back', 
        handler:back
    }],
    onClickCell:onClickCell,
    onAfterEdit:onAfterEdit
}); 
function add(){}
function edit(){}
function removeit(){}
function back(){
    window.location.href = "qb_cbatch.htm";
}
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
    // window.alert("index="+index+",rows="+row.ID+",changes="+changes.ContentSort);
	var updated = $('#dg').datagrid('getChanges','updated');
	if (updated.length < 1) {
		editRow = undefined;
		$('#dg').datagrid('unselectAll');
		return;
	}
    else{
        if (editCellField=="ContentSort"){updateContentSort(index,row,changes);}
        else{} 
    }
}
function updateContentSort(index,row,changes){
    if (changes.ContentSort==undefined){return;}
    else{
        $.ajax({
			type:"POST",
			async:false,
			url:"http://localhost/PrisonService/WSL/Force/Handler.ashx?action=u_sort",
			data:{
				"pid":row.ID,
				"sort":changes.ContentSort,
				"code":ck_code
			},
			success:function(result){
                var result = eval('('+result+')');
				if(result.Success==true){$("#dg").datagrid('reload');}
                else{$.messager.show({title:'温馨提示',msg:result.Message});}
			}
		});
    }
}