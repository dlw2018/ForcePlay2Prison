var ck_code = $.cookie('prison_code');
var ck_account = $.cookie('prison_account');
var ck_role_value = $.cookie('prison_role_value');
var batchID = 1;
$('#dg').datagrid({ 
    width:'100%', 
    height:'auto', 
    nowrap:false, 
    striped:true, 
    collapsible:false, // 是否可折叠的 
    fit:true, // 自动大小 
    fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=qb_list&code='+ck_code+'&bid='+batchID, 
    method:'GET',
    loadMsg:'正在加载中...', 
    remoteSort:false,  
    idField:'ID', 
    singleSelect:false, // 是否单选 
    rownumbers:true, // 行号 
    pagination:true, // 启用分页工具栏
    pageNumber:1, // 初始化页码
    pageSize:15, // 初始化页面尺寸
    pageList:[15,20,25], // 初始化页面尺寸的选择列表
    columns:[[
        {field:'ID',hidden:true},
        {field:'StbID',title:'终端号',width:150},
        {field:'State',title:'强播状态',width:100},
        {field:'ScheduleID',title:'排班标识',width:100},
        {field:'RuleTitle',title:'规则名称',width:120},
        {field:'BatchRegion',title:'分组区域',width:200}
    ]]
}); 
$(function(){
    // Pagination设置
    var pn = $('#dg').datagrid().datagrid('getPager');
    pn.pagination({displayMsg:'当前显示 {from} - {to} 条记录   共 {total} 条记录'});
});