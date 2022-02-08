function initTreeGrid(){
    $('#tg').treegrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=menu',
        idField:'id',
        treeField:'name',
        fitColumns:true,
        showFooter:true,
        rownumbers: true,
        columns:[[
            {field:'name',title:'名称',width:150},
            {field:'iconCls',title:'图标',width:120,formatter: function(value,row,index){
                return '<i class="'+value+'"></i>';
            }},
            {field:'hyperlink',title:'链接地址',width:150},
            {field:'sequence',title:'顺序',width:80},
            {field:'pid',title:'父标识',width:100}
        ]]
    });
}
var saveType,saveParams;
var menuID = 0;
// 新增
function add(){
    var row = $('#tg').treegrid('getSelected');
    var parentID;
    if (row){parentID = row.id;}
    else{parentID = 0;}
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增菜单');
    // $('#pid').val(parentID);
    $('#pid').textbox('setValue',parentID);
    saveType = "add";
    saveParams = '?action=menu_append';
}
// 编辑
function edit(){
    var row = $('#tg').treegrid('getSelected');
    if (row){
        $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑菜单');
        $('#fm').form('load',row);
        menuID  = row.id;
        saveType = "edit";
        saveParams = '?action=menu_update';
    }
}
// 删除
function remove(){
    var row = $('#tg').treegrid('getSelected');
    if (row){
        $.messager.confirm('提示', '确定要删除吗？', function(r){
            if (r){
                menuID  = row.id;
                saveType = "remove";
                saveParams = '?action=menu_remove';
                save();
            }
            else{
                var row = $('#tg').treegrid('getSelected');
                if (row){$('#tg').treegrid('unselect',row.id);}
            }
        });
    }
}
// 取消
function cancel(){
    var row = $('#tg').treegrid('getSelected');
    if (row){$('#tg').treegrid('unselect',row.id);}
    $('#dlg').dialog('close');
}
// 保存
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var menuName = $('#name').val();
        var menuClass = $('#iconCls').val();
        var menulink = $('#hyperlink').val();
        var menuSequence = $('#sequence').val();
        var menuPID = $('#pid').val();
        if (menuName=='' || menulink==''){$.messager.alert('提示','菜单的标题和链接地址为必填项。','warning');}
        else {
            saveFlag = true;
            saveData = 'id='+menuID+'&name='+menuName+'&class='+menuClass+"&url="+menulink+"&seq="+menuSequence+"&pid="+menuPID;
        }
    }
    else if (saveType=='remove'){
        if (menuID<=0){$.messager.alert('提示','请选择要删除的菜单项。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+menuID;
        }
    }
    else{$.messager.alert('提示','操作未定义。','warning');}
    if (saveFlag){
        $.ajax({
            type:'POST',
            url:'http://localhost/IManagerService/WSL/Config.ashx'+saveParams,
            data:saveData,
            async:true, // 默认值
            contentType:'application/x-www-form-urlencoded', // 默认值
            processData:true, // 默认值
            success:function(result){
                var objResult = eval('('+result+')');
                if (objResult.Success){
                    $('#dlg').dialog('close');
                    $('#tg').treegrid('unselectAll');
                    $('#tg').treegrid('reload');
                }
                else{$.messager.alert('提示',objResult.Message,'warning');}
            },
            error:function(error){
                console.log(error);
            }
         });
    }
}
// 类似onload()加载
$(function(){
    initTreeGrid();
});