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
    url:'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=rule&code='+ck_code, 
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
        {field:'RuleTitle',title:'规则名称',width:150},
        {field:'ReturnType',title:'返回类型',width:80,formatter:function(value,row,index){
            if (value=="ZB"){return "直播";}
            else if (value=="SP"){return "视频";}
            else{return "点播";}
        }},
        {field:'ReturnCommand',title:'返回指令',width:150},
        {field:'AuditState',title:'审核状态',width:80,formatter:function(value,row,index){
            if (value=="D"){return "默认";}
            else if (value=="T"){return "成功";}
            else{return "失败";}
        }}
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
        if (newValue=="ZB"){content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=tv&code='+ck_code;}
        else{content_url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=cb_content&type=ym&code='+ck_code;}
        $('#ReturnCommand').combobox('clear');
        $('#ReturnCommand').combobox('reload', content_url);
    }
}
var url;
function add(){
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增规则');
    $('#fm').form('clear');
    url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=c_rule';
}
var beforeAuditState="D";
function edit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.show({title: '温馨提示',msg: '请选择您要编辑的条目。'});}
    else if (checkedItems.length>1){$.messager.show({title: '温馨提示',msg: '不能同时编辑多个条目。'});}
    else{
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑规则');
        $('#fm').form('load',checkedItems[0]);
        beforeAuditState = checkedItems[0].AuditState;
        url = 'http://localhost/PrisonService/WSL/Force/Handler.ashx?action=u_rule&pid='+checkedItems[0].ID;
    }
}
function removeit(){
    var checkedItems = $('#dg').datagrid('getChecked');
    if (checkedItems.length<=0){$.messager.alert('操作提示','请选择您要删除的条目。','info');}
    else{
        $.messager.confirm('删除确认','您确定要删除所选规则么？',function(r){
            if (r){
                var ids=[];
                for (var i=0;i<checkedItems.length;i++){
                    var objID = {};
                    objID.id = checkedItems[i].ID;
                    ids.push(objID);
                }
                $.ajax({
                    type:"POST", 
                    url:"http://localhost/PrisonService/WSL/Force/Handler.ashx?action=d_rule&code="+ck_code, 
                    data:JSON.stringify(ids), 
                    contentType:"application/json", 
                    // dataType:"json", 
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
function save(){
    var ruleTitle = $('#RuleTitle').val();
    var returnType = $('#ReturnType').combobox('getValue');
    var returnCmd = $('#ReturnCommand').combobox('getValue');
    var auditState = $('#AuditState').combobox('getValue');
    if (ruleTitle=="" || ruleTitle.length>32 || returnType=="" || returnCmd=="" || auditState==""){$.messager.alert('操作提示','不能为空值或长度超限。','warning');}
    else if ((ck_role_value<8 && auditState!='D') || (ck_role_value<8 && beforeAuditState!='D')){$.messager.alert('操作提示','角色受限，您无权变更审核状态。','info');}
    else{
        $.ajax({
            type:"POST",
            async:false,
            url:url,
            data:{
                "title":ruleTitle,
                "type":returnType,
                "cmd":returnCmd,
                "state":auditState,
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