new fObject(1, 0, "nav1_0", null, "nav1_2", null, 'nav1_1');
new fObject(1, 1, "nav1_1", null, "nav1_3", "nav1_0", null);
new fObject(1, 2, "nav1_2", "nav1_0", "nav1_4", null, "nav1_3");
new fObject(1, 3, "nav1_3", "nav1_1", "nav1_5", "nav1_2", null);
new fObject(1, 4, "nav1_4", "nav1_2", null, null, "nav1_5");
new fObject(1, 5, "nav1_5", "nav1_3", null, "nav1_4", null);
new fObject(2, 0, "nav2_0", null, null, null, null);

new fObject(3, 0, "phone_box", null, "submits", null, null);
new fObject(3, 1, "submits", "phone_box", null, null, "offs");
new fObject(3, 2, "offs", "phone_box", null, "submits", null);
hs.fObjCommit();
var _Obj = ''
hs.addEvenToList(hs.defaultBackCode, function() {
    console.log(_Obj)
    if (hs.focObj.group == 3 && hs.focObj.objindex == 0) {
        if ($("phone").innerText != "请输入手机号")
            if (_Obj == "phone_box") {
                iptValue = $("phone").innerText;
                iptValue = iptValue.substring(0, iptValue.length - 1);
                $("phone").innerText = iptValue;
                phone = iptValue;
            }
        if (iptValue.length == 0) {
            $("phone").innerText = "请输入手机号";
        }

    } else if (hs.focObj.group == 2) {
        console.log(13121312)
        hs.initFocus(hs.areaLastFocus[1].objid)

        $("nav2_0").style.display = 'none';

        $("nav3_0").style.display = 'none';
    }else {
        hs.memoryO.goBack();
    }
})

// var api_url = "http://21.254.52.106/UTLService/UIL/Fwdd/Handler.ashx"
var api_url = "http://21.254.52.106/UTLService2/UIL/Fwdd/Handler.ashx"

// submit()
var stbid = hs.mw.getSTBID();
console.log(stbid)
var sumbitis = '';

function submit(sid, phone) {
    if (phone) {
        var data = "action=insert2&stbid=" + stbid + "&phone=" + phone + "&pid=10&sid=" + sid + "&code=88";
    } else {
        var data = "action=insert2&stbid=" + stbid + "&pid=10&sid=" + sid + "&code=88";
    }

    hs.ajax.post(api_url, data, function(res) {
            res = hs.json.parse(res);
            console.log(res)
            submitis = res.Success
        }, 0,
        function(msg) {

        }, 3000);
}
var ifs = ''

function phoneFun(phones) {
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(phones)) {
        console.log('手机号格式不正确')
        return false;
    } else {
        console.log('手机号格式正确')
        return true;
    }
}

function ifphone() {
    var data = api_url + "?action=phone&stbid=" + stbid + "&code=88"
    hs.ajax.get(data, function(res) {
            var res = hs.json.parse(res)
            console.log(res.Success)
            ifs = res.Success
        }, 0,
        function(msg) {

        }, 3000)
}
var phone = '';

hs.addEvenToList(hs.defaultNumberCode, function(keyCode) {
    console.log(111)
    if (hs.focObj.group == 3 && hs.focObj.objindex == 0) {
        phone += keyCode.toString();
        console.log(phone.toLowerCase())
        $('phone').innerHTML = phone.toLowerCase();
    }
});


var initFo = 'nav1_0';
hs.load(function() {
    // startMidea()
    var flag = hs.memoryO.initMemoryO();
    if (flag && hs.memoryO.backObj.fObjectArr) {
        for (var i = 0; i < hs.memoryO.backObj.fObjectArr.length; i++) {
            hs.initFocus(hs.memoryO.backObj.fObjectArr[i]);
        }
    } else {
        hs.initFocus(initFo);
    }
}, true);