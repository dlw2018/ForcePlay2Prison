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
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cbatch&code='+ck_code, 
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
        {field:'BatchName',title:'内容分组名称',width:150},
        {field:'BatchType',title:'内容分组类型',width:80,formatter:function(value,row,index){
            if (value=="SP"){return "视频";}
            else if (value=="ZB"){return "直播";}
            else if (value=="XX"){return "消息";}
            else{return "未知";}
        }},
        {field:'BatchMemo',title:'内容分组备注',width:150}
    ]],
    frozenColumns:[[ 
        {field:'ck',checkbox:true} 
    ]], 
    toolbar:[{ 
        text:'添加分组', 
        iconCls:'icon-add', 
        handler:add
    },'-',{ 
        text:'修改分组', 
        iconCls:'icon-edit', 
        handler:edit
    },'-',{ 
        text:'删除分组', 
        iconCls:'icon-remove', 
        handler:removeit
    },'-',{
        text:'分组内容',
        iconCls:'icon-standard-eye',
        handler:see
    },'-',{ 
        text:'添加视频', 
        iconCls:'icon-standard-film', 
        handler:addSP
    },'-',{ 
        text:'添加直播', 
        iconCls:'icon-standard-television', 
        handler:addZB
    },'-',{ 
        text:'添加消息', 
        iconCls:'icon-standard-page-white-text', 
        handler:addXX
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
var operateFrom,url,checkedCBatchID;
var checkedContentIDs = "";
var cbUrl;
function add(){
    $('#dlg_cb').dialog('open').dialog('center').dialog('setTitle','添加分组');
    $('#fm').form('clear');
    cbUrl = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c_cbatch';
}
function edit(){}
function removeit(){}
function saveCB(){
    var batch
}
function verifyContent2Batch(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title:'温馨提示',msg:'请选择您要添加的内容分组。'});return false;}
    else if (checkedItems.length>1){$.messager.show({title:'温馨提示',msg:'不能同时选择多个内容分组。'});return false;}
    else{
        operateFrom = "content";
        checkedCBatchID = checkedItems[0].ID;
        return true;
    }
}
function addSP(){
    if (verifyContent2Batch()){
        initContentGrid('SP');
        initContentGridPagination();
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','添加视频');
    }    
}
function addZB(){
    if (verifyContent2Batch()){
        initContentGrid('ZB');
        initContentGridPagination();
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','添加直播');
    }
}
function addXX(){}
function save(){
    if (operateFrom==""){}
    else{
        var checkedItems = $('#dg_content').datagrid('getChecked');
        for(var i=0;i<checkedItems.length;i++){checkedContentIDs+=checkedItems[i].ID+",";}
        checkedContentIDs = checkedContentIDs.substring(0,checkedContentIDs.length-1);
        var saveUrl = "http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c2b";
        $.ajax({
            type:"POST",
            async:false,
            url:saveUrl,
            data:{
                "bid":checkedCBatchID,
                "cids":checkedContentIDs,
                "code":ck_code
            },
            success:function(result){
                var objResult = eval('('+result+')');
                if(objResult.Success==true){
                    $('#dlg').dialog('close');
                    $('#dg_content').datagrid('clearChecked');
                    $('#dg_content').datagrid('reload'); 
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
function initContentGrid(_type){
    $('#dg_content').datagrid({ 
        width:'100%', 
        height:'auto', 
        nowrap:false, 
        striped:true, 
        collapsible:false, // 是否可折叠的 
        fit:true, // 自动大小 
        fitColumns:true, // 使列自动展开/折叠以适应数据网格的宽度
        url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=content&type='+_type+'&code='+ck_code, 
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
            {field:'ContentName',title:'节目名称',width:100}
        ]],
        frozenColumns:[[ 
            {field:'ck',checkbox:true} 
        ]], 
    });
}
function initContentGridPagination(){
    var pn = $('#dg_content').datagrid().datagrid('getPager');
    pn.pagination({ displayMsg:''});
}
function see(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length>0){
        var batchID = checkedItems[0].ID;
        window.location.href = "qb_cbanding.htm?bid="+batchID;
    }
    else{$.messager.alert('操作提示','查看分组内容前需要选择一个分组。','info');}
}