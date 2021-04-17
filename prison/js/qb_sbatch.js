var ck_code = $.cookie('prison_code');
var ck_account = $.cookie('prison_account');
var ck_role_value = $.cookie('prison_role_value');
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=sbatch&code='+ck_code, 
    method:'GET',
    loadMsg:'正在加载中...', 
    remoteSort:false,  
    idField:'ID', 
    singleSelect:false, // 是否单选 
    // rownumbers:true, // 行号 
    pagination:true, // 启用分页工具栏
    pageNumber:1, // 初始化页码
    pageSize:15, // 初始化页面尺寸
    pageList:[15,20,25], // 初始化页面尺寸的选择列表
    columns:[[
        {field:'ID',hidden:true},
        {field:'BatchTitle',title:'分组名称',width:100},
        {field:'BatchRemark',title:'分组描述',width:100}
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
        handler:removeit
    },'-',{ 
        text:'查看', 
        iconCls:'icon-standard-eye', 
        handler:view
    },'-',{ 
        text:'绑定', 
        iconCls:'icon-standard-attach', 
        handler:banding
    }]
}); 
$(function(){
    // Pagination设置
    var pn = $('#dg').datagrid().datagrid('getPager');
    pn.pagination({displayMsg:'当前显示 {from} - {to} 条记录   共 {total} 条记录'});
});
function add(){
    // var checkedItems = $('#dg').datagrid;
}
function edit(){}
function removeit(){}
function view(){}
function initStbTree(){
    $('#stbTree').tree({
        url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=stree&code='+ck_code,
        method:'get',
        animate:true,
        checkbox:true,
        onBeforeExpand:function(node){
            var parentNode = $('#stbTree').tree('getParent',node.target);
            if (parentNode){
                $('#stbTree').tree('options').url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=stree&code='+ck_code+'&pid='+parentNode.id;
            }
            else{}
        }
    });
}
var checkedItems;
function banding(){
    checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.alert('温馨提示','请选择一个终端分组名。','warning');}
    else if (checkedItems.length>1){$.messager.alert('温馨提示','不能同时绑定多个终端分组。','warning');}
    else{
        initStbTree();
        $('#ruleBatch').combobox('clear');
        $('#ruleBatch').combobox('reload', 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=gz&code='+ck_code);
        $('#dlgBanding').dialog('open').dialog('center').dialog('setTitle','终端绑定');
    }
}
function saveBanding(){
    var stbIds = getChecked();
    if (stbIds==''){$.messager.alert('温馨提示','强播需要有对象，所以得选他（终端）。','warning');return;}
    var ruleID = $('#ruleBatch').combobox('getValue');
    if (ruleID==''){$.messager.alert('温馨提示','强播需要有规则，所以得选他（规则）。','warning');return;}
    $.ajax({
        type:"POST",
        async:false,
        url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=sbanding',
        data:{
            "bid":checkedItems[0].ID,
            "sids":stbIds,
            "rid":ruleID,
            "code":ck_code
        },
        success:function(result){
            var objResult = eval('('+result+')');
            if(objResult.Success==true){
                $('#dlgBanding').dialog('close');
                $('#dg').datagrid('clearChecked');
                $('#dg').datagrid('reload'); 
                $.messager.alert('温馨提示','操作成功。','info');
            }
            else{$.messager.alert('操作提示',objResult.Message,'warning');}
        },
        error:function(error){
            console.log(error);
        }
    });
}
function getChecked(){
    var nodes = $('#stbTree').tree('getChecked');
    var s = '';
    for(var i=0; i<nodes.length; i++){
        if ($('#stbTree').tree('isLeaf', nodes[i].target)){
            if (s != '') s += ',';
            s += nodes[i].id;
        }
        else{}
    }
    return s;
}