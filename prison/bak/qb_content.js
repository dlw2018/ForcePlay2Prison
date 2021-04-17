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
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=content&code='+ck_code, 
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
        {field:'ContentName',title:'节目名称',width:100},
        {field:'ContentValue',title:'节目内容',width:160},
        {field:'ContentType',title:'节目类型',width:50,formatter: function(value,row,index){
            if (value=="SP"){return "视频";}
            else if (value=="ZB"){return "直播";}
            else if (value=="TP"){return "图片";}
            else if (value=="WZ"){return "文字";}
            else {return "未知";}
        }},
        {field:'ContentMemo',title:'备注信息',width:100},
        {field:'CreateTime',title:'创建时间',width:60}
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
    }]
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
function onContentTypeChange(newValue, oldValue){
    // alert('newValue='+newValue);
    if (newValue=='SP' || newValue=='ZB'){
        if ($('#te').css('display')=='block'){$('#te').hide();}
        if ($('#tb').css('display')=='none'){$('#tb').show();} 
    }
    else{
        if ($('#tb').css('display')=='block'){$('#tb').hide();} 
        if ($('#te').css('display')=='none'){$('#te').show();}
    }
}
function add(){
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增节目');
}
function edit(){}
function removeit(){}