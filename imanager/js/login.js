$(function(){
    $('#btnLogin').click(function(){
        var userName = $('#userName').val();
        var userPwd = $('#userPwd').val();
        $('.loading').addClass('focus');
        $('.loading').html('请稍后，正在努力中。');
        $.ajax({
            type:'POST',
            url:'http://localhost/IManagerService/WSL/User.ashx?action=verify',
            data:'name='+userName+'&pwd='+userPwd+'&type=M',
            async:true, // 默认值
            contentType:'application/x-www-form-urlencoded', // 默认值
            processData:true, // 默认值
            success:function(data){
                var objData = eval('('+data+')');
                if (objData.Success){
                    $.cookie('hsitv_user', userName);
                    window.location.href = 'index.htm';
                }
                else{$('.loading').html('<font color="red">'+objData.Message+'</font>');}
            },
            error:function(error){
                console.log(error);
            }
         });
    });
});