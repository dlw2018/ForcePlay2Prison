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
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=schedule&code='+ck_code, 
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
        {field:'StartDate',title:'开始日期',width:80},
        {field:'StartHour',title:'开始小时',width:80},
        {field:'StartMinute',title:'开始分钟',width:80},
        {field:'Duration',title:'持续时长（分）',width:80},
        {field:'PlayType',title:'播放类型',width:80},
        {field:'ContentBID',title:'内容分组名称',width:100},
        {field:'RuleID',title:'规则名称',width:100}
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
var content_url;
function onReturnTypeChange(newValue,oldValue){
    if (newValue!=oldValue){
        if (newValue=="ZB"){content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=zb&code='+ck_code;}
        else if (newValue=="SP"){content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=sp&code='+ck_code;}
        else if (newValue=="XX"){content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=xx&code='+ck_code;}
        else{content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=ym&code='+ck_code;}
        $('#ContentBID').combobox('clear');
        $('#ContentBID').combobox('reload', content_url);
    }
}
var url;
function add(){
    $('#RuleID').combobox('clear');
    $('#RuleID').combobox('reload', 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=gz&code='+ck_code);
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增排班');
    $('#fm').form('clear');
    url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c_rule';
}
function edit(){}
function removeit(){}
function save(){
    var startDate = $('#StartDate').val();
    var startHour = $('#StartHour').val();
    var startMinute = $('#StartMinute').val();
    var playDuration = parseInt($('#Duration').val());
    var playType = $('#PlayType').combobox('getValue');
    var contentBID = $('#ContentBID').combobox('getValue');
    var ruleID = $('#RuleID').combobox('getValue');
    if (startHour<0 || startMinute<0 || playDuration<0){$.messager.alert('操作提示','部分选项未做选择或输入。','warning');}
    else{
        $.ajax({
            type:"POST",
            async:false,
            url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c_schedule',
            data:{
                "date":startDate,
                "hour":startHour,
                "minute":startMinute,
                "duration":playDuration,
                "type":playType,
                "bid":contentBID,
                "rid":ruleID,
                "code":ck_code
            },
            success:function(result){
                var objResult = eval('('+result+')');
                if(objResult.Success==true){
                    $('#dlg').dialog('close');
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
}
function formatDate(date){
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
}