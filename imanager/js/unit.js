function loadCKEditor() {
    if (!CKEDITOR.instances['logo']) {
        CKEDITOR.replace('logo',{height:200,toolbar:[['Image']],resize_enabled:false,filebrowserImageUploadUrl:'http://localhost/IManagerService/WSL/Image.ashx?action=ck&width=0'});
    } else {
        CKEDITOR.instances.logo.destroy();
        CKEDITOR.replace('logo',{height:200,toolbar:[['Image']],resize_enabled:false,filebrowserImageUploadUrl:'http://localhost/IManagerService/WSL/Image.ashx?action=ck&width=0'});
    }
}
function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Config.ashx?action=unit',
        rownumbers: true,
        idField:'id',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        columns:[[
            {field:'id',title:'标识',width:80},
            {field:'name',title:'名称',width:150},
            {field:'logo',title:'Logo',width:200},
            {field:'address',title:'地址',width:250},
            {field:'gid',title:'所属群组',width:150,formatter:function(value,row,index){
                return row.gname;
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
            handler:remove
        }]
    });
}
var saveType,saveParams;
var primaryCode = '';
function add(){
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增单位');
    CKEDITOR.instances.logo.setData('');
    saveType = 'add';
    saveParams = '?action=unit_append';
}
function edit(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        if (ckItems.length>1){$.messager.alert('提示','你想一起么，不行的。','warning');}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',ckItems[0]);
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑单位');
            var ckImage = CKEDITOR.instances.logo.getData();
            if (ckImage==''){CKEDITOR.instances.logo.setData(ckItems[0].logo);}
            saveType = 'edit';
            saveParams = '?action=unit_update';
            primaryCode = ckItems[0].id;
        }
    }
}
function remove(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        $.messager.confirm('提示','确定要删除么？',function(r){
            if (r){
                primaryCode = '';
                for(var i=0;i<ckItems.length;i++){
                    primaryCode += ckItems[i].id+",";
                }
                primaryCode = primaryCode.substring(0,primaryCode.length-1);
                saveType = 'remove';
                saveParams = '?action=unit_remove';
                save();
            }
        });
    }
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var unitName = $('#name').val();
        // var unitLogo = $('#logo').val();
        var unitLogo = encodeURIComponent(CKEDITOR.instances.logo.getData().replace(/</g,'&lt;').replace(/>/g,'&gt;'));
        var unitAddress = $('#address').val();
        var groupID = $('#gid').val();
        if (unitName==''){$.messager.alert('提示','单位名称为必填（选）项。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+primaryCode+'&name='+unitName+'&icon='+unitLogo+'&address='+unitAddress+'&gid='+groupID;
        }
    }
    else if(saveType=='remove'){
        saveFlag = true;
        saveData = 'ids='+primaryCode;
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
                    $('#dg').datagrid('uncheckAll');
                    $('#dg').datagrid('reload');
                }
                else{$.messager.alert('提示',objResult.Message,'warning');}
            },
            error:function(error){
                console.log(error);
            }
         });
    }   
}
function cancel(){
    $('#dlg').dialog('close');
}
$(function(){
    initDatagrid();
});