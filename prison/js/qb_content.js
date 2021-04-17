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
        {field:'ContentName',title:'节目名称',width:120},
        {field:'ContentValue',title:'节目内容',width:160,hidden:true},
        {field:'ContentType',title:'节目类型',width:50,formatter: function(value,row,index){
            if (value=="SP"){return "视频";}
            else if (value=="ZB"){return "直播";}
            else if (value=="TP"){return "图片";}
            else if (value=="XX"){return "消息";}
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
        if ($('#te').css('display')=='block'){
            $('#te').hide();
        }
        if ($('#tb').css('display')=='none'){$('#tb').show();} 
    }
    else{
        if ($('#tb').css('display')=='block'){$('#tb').hide();} 
        if ($('#te').css('display')=='none'){
            var objTE;
            try{objTE= $('#te2').texteditor('options');}
            catch{objTE = null;}
            if (!objTE){createTextEditor();}
            $('#te').show();
        }
    }
}
var url;
function add(){
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增节目');
    $('#fm').form('clear');
    url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c_content';
}
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑节目');
        $('#fm').form('load',checkedItems[0]);
        if (checkedItems[0].ContentType=="XX"){$('#te2').texteditor('setValue',checkedItems[0].ContentValue);}
        url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=u_content&pid='+checkedItems[0].ID;
    }
}
function removeit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.alert('操作提示','请选择您要删除的条目。','info');}
    else{
        $.messager.confirm('删除确认','您确定要删除所选节目么？',function(r){
            if (r){
                var ids="";
                for (var i=0;i<checkedItems.length;i++){
                    ids+=checkedItems[i].ID+","
                }
                ids = ids.substring(0,ids.length-1);
                $.ajax({
                    type:"POST", 
                    async:false,
                    url:"http://localhost/PrisonService/WSL/Force/Handler.ashx?action=d_content", 
                    data:{
                        "ids":ids,
                        "code":ck_code
                    },  
                    success:function(result){ 
                        var objResult = eval('('+result+')');
                        if(objResult.Success){
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
        });
    }
}
function createTextEditor(){
    $('#te2').texteditor({
        title:'节目内容',
        width:646,
        height:210,
        toolbar:['bold','italic','-','justifyleft','justifycenter','justifyright','justifyfull','-','insertorderedlist','insertunorderedlist']
    });
}
function save(){
    var contentName = $('#ContentName').textbox('getValue');
    var contentType = $('#ContentType').combobox('getValue');
    var contentValue;
    if (contentType=="SP" || contentType=="ZB"){contentValue = $('#ContentValue').textbox('getValue');}
    else{contentValue = $('#te2').texteditor('getValue');}
    var contentMemo = $('#ContentMemo').textbox('getValue');
    if (contentName=="" || contentName.length>128 || contentType=="" || contentValue=="" || contentMemo.length>64){$.messager.alert('操作提示','不能为空值或长度超限。','warning');}
    else{
        $.ajax({
            type:"POST",
            async:false,
            url:url,
            data:{
                "name":contentName,
                "value":encodeURIComponent(contentValue),
                "type":contentType,
                "memo":contentMemo,
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