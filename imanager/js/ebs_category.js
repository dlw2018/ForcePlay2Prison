var ck_itv_unit = $.cookie('hsitv_unit');
function initDatagrid(){
    $('#tg').treegrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Ebs.ashx?action=category&uid='+ck_itv_unit,
        rownumbers: true,
        idField:'id',
        treeField:'cname',
        fitColumns:true, // 宽度自适应，默认false
        columns:[[
            {field:'cname',title:'类别名',width:180},
            {field:'ename',title:'类别名（英）',width:180},
            {field:'shour',title:'几时开始',width:80},
            {field:'sminute',title:'几分开始',width:80},
            {field:'ehour',title:'几时结束',width:80},
            {field:'eminute',title:'几分结束',width:80},
            {field:'ctype',title:'所属类型',width:80,formatter: function(value,row,index){
                if (value=='DC'){return '点餐';}
                else if (value=='GW'){return '点餐';}
                else{return '未知';}
            }},
            {field:'pid',title:'父类ID',width:80},
            {field:'ctime',title:'创建时间',width:150}
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
var saveType,saveParams,parentID;
var primaryCode = 0;
function add(){
    var row = $('#tg').treegrid('getSelected');
    if (row){parentID = row.id;}
    else{parentID = 0;}
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增类别项');
    CKEDITOR.instances.cimage.setData('');
    saveType = 'add';
    saveParams = '?action=category_append';
}
function edit(){}
function remove(){}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var chineseName = $('#cname').val();
        var englishName = $('#ename').val();
        var imgUrl = encodeURIComponent(CKEDITOR.instances.cimage.getData().replace(/</g,'&lt;').replace(/>/g,'&gt;'));
        var startHour = $('#shour').val();
        var startMinute = $('#sminute').val();
        var endHour = $('#ehour').val();
        var endMinute = $('#eminute').val();
        var categoryType = $('#ctype').val();
        if (chineseName=='' || categoryType==''){$.messager.alert('提示','类别名称和类型为必填（选）项。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+primaryCode+'&cname='+chineseName+'&ename='+englishName+'&cimage='+imgUrl+'&shour='+startHour+'&sminute='+startMinute+'&ehour='+endHour+'&eminute='+endMinute+'&ctype='+categoryType+'&pid='+parentID+'&uid='+ck_itv_unit;
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
            url:'http://localhost/IManagerService/WSL/Ebs.ashx'+saveParams,
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
function cancel(){
    var row = $('#tg').treegrid('getSelected');
    if (row){$('#tg').treegrid('unselect',row.id);}
    $('#dlg').dialog('close');
}
function loadCKEditor() {
    if (!CKEDITOR.instances['cimage']) {
        CKEDITOR.replace('cimage',{height:200,toolbar:[['Image']],resize_enabled:false,filebrowserImageUploadUrl:'http://localhost/IManagerService/WSL/Image.ashx?action=ck&width=0'});
    } else {
        CKEDITOR.instances.cimage.destroy();
        CKEDITOR.replace('cimage',{height:200,toolbar:[['Image']],resize_enabled:false,filebrowserImageUploadUrl:'http://localhost/IManagerService/WSL/Image.ashx?action=ck&width=0'});
    }
}
$(function(){
    initDatagrid();
});
