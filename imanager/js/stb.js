var ck_itv_unit = $.cookie('hsitv_unit');
function initDatagrid(){
    $('#dg').datagrid({
        method:'get',
        url:'http://localhost/IManagerService/WSL/Stb.ashx?action=stb&uid='+ck_itv_unit,
        rownumbers: true,
        idField:'stb_id',
        fitColumns:true, // 宽度自适应，默认false
        singleSelect:false, // 支持多选，默认false
        pagination:true, // 启用分页工具栏
        pageNumber:1, // 初始化页码
        pageSize:15, // 初始化页面尺寸
        pageList:[15,20,25], // 初始化页面尺寸的选择列表
        columns:[[
            {field:'stbID',title:'终端号',width:180},
            {field:'stbType',title:'类型',width:50},
            {field:'userName',title:'户主名',width:120},
            {field:'idcardNo',title:'身份证号',width:150},
            {field:'phone',title:'电话号码',width:80},
            {field:'address',title:'地址',width:150},
            {field:'village',title:'村（社区）名',width:100},
            {field:'villageCode',title:'村（社区）编码',width:100},
            {field:'town',title:'镇（街道）名',width:100},
            {field:'townCode',title:'镇（街道）编码',width:100},
            {field:'city',title:'市（区县）名',width:100},
            {field:'cityCode',title:'市（区县）编码',width:100}
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
var pid = '';
var pids = '';
function add(){
    $('#fm').form('clear');
    $('#dlg').dialog('open').dialog('center').dialog('setTitle','新增终端');
    saveType = 'add';
    saveParams = '?action=stb_append';
}
function edit(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        if (ckItems.length>1){$.messager.alert('提示','你想一起么，不行的。','warning');}
        else{
            $('#fm').form('clear');
            $('#fm').form('load',ckItems[0]);
            $('#dlg').dialog('open').dialog('center').dialog('setTitle','编辑终端');
            saveType = 'edit';
            saveParams = '?action=stb_update';
            pid = ckItems[0].stbID;
        }
    }
}
function remove(){
    var ckItems = $('#dg').datagrid('getChecked');
    if (ckItems && ckItems.length>0){
        $.messager.confirm('提示','确定要删除么？',function(r){
            if (r){
                pids = '';
                for(var i=0;i<ckItems.length;i++){
                    pids += "'"+ckItems[i].stbID+"',";
                }
                pids = pids.substring(0,pids.length-1);
                saveType = 'remove';
                saveParams = '?action=stb_remove';
                save();
            }
        });
    }
}
function save(){
    var saveData;
    var saveFlag = false;
    if (saveType=='add' || saveType=='edit'){
        var stbID = $('#stbID').val();
        var stbType = $('#stbType').val();
        var userName = $('#userName').val();
        var idcardNo = $('#idcardNo').val();
        var userPhone = $('#phone').val();
        var userAddress = $('#address').val();
        var villageName = $('#village').val();
        var villageCode = $('#villageCode').val();
        var townName = $('#town').val();
        var townCode = $('#townCode').val();
        var cityName = $('#city').val();
        var cityCode = $('#cityCode').val();
        if (stbID=='' || stbType==''){$.messager.alert('提示','终端号和类型为必填（选）项。','warning');}
        else{
            saveFlag = true;
            saveData = 'id='+pid+'&stbid='+stbID+'&type='+stbType+'&name='+userName+'&idcard='+idcardNo+'&phone='+userPhone+'&address='+userAddress+'&village='+villageName+'&vcode='+villageCode+'&town='+townName+'&tcode='+townCode+'&city='+cityName+'&ccode='+cityCode+'&uid='+ck_itv_unit;
        }
    }
    else if(saveType=='remove'){
        saveFlag = true;
        saveData = 'ids='+pids;
    }
    else{$.messager.alert('提示','操作未定义。','warning');}
    if (saveFlag){
        $.ajax({
            type:'POST',
            url:'http://localhost/IManagerService/WSL/Stb.ashx'+saveParams,
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
function cancel(){$('#dlg').dialog('close');}
$(function(){
    initDatagrid();
});