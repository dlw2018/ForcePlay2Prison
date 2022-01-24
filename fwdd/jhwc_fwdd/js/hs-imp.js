hs.onFocus = function(group, objid, objindex) {
    _Obj = objid
    console.log(group + '|' + objindex);
    switch (group) {
        case 0:
            hs.addClass($(objid), "focus");
            break;
        case 1:
            hs.addClass($(objid), "focus");
            // $("videoImg").style.display = "block";
            break;
        case 2:
            hs.addClass($(objid), "focus");
            break;
        case 3:
            hs.addClass($(objid), "focus");
            $("focusimg" + objindex).style.display = 'block'
            break;
        case 4:
            hs.addClass($(objid), "focus");
            break;
        case 5:
            hs.addClass($(objid), "focus");
            break;
        case 999:
            hs.addClass($(objid), "focus");
            break;
        default:
            break;
    }
};

hs.onBlur = function(group, objid, objindex) {
    switch (group) {
        case 0:
            hs.removeClass($(objid), "focus");
            break;
        case 1:
            hs.removeClass($(objid), "focus");
            // $("videoImg").style.display = "none";
            break;
        case 2:
            hs.removeClass($(objid), "focus");
            break;
        case 3:
            hs.removeClass($(objid), "focus");
            $("focusimg" + objindex).style.display = 'none'

            break;
        case 4:
            hs.removeClass($(objid), "focus");
            // $("btnImg").style.display = "none";
            break;
        case 5:
            hs.removeClass($(objid), "focus");
            break;
        case 999:
            hs.removeClass($(objid), "focus");
            break;
        default:
            break;
    }
};
var sid = ''

function doSelect(group, objindex, objid) {

    if (group == 1) {
        ifphone()
        if (ifs) {
            hs.initFocus('nav2_0')
            $("nav2_0").style.display = 'block';
            if (objindex == 0) {
                submit(11)
            }
            if (objindex == 1) {
                submit(12)
            }
            if (objindex == 2) {
                submit(13)
            }
            if (objindex == 3) {
                submit(14)
            }
            if (objindex == 4) {
                submit(15)
            }
            if (objindex == 5) {
                submit(16)
            }
        } else {
            console.log(123321)
            sid = $(objid).title
            console.log(sid)
            hs.initFocus('phone_box')
            $("nav3_0").style.display = 'block';

        }

    }
    if (group == 3) {
        if (objindex == 2) {
            hs.initFocus(hs.areaLastFocus[1].objid)
            $("nav3_0").style.display = 'none';
        }
        if (objindex == 1) {
            var phone = $('phone').innerHTML

            if (phoneFun(phone)) {
                console.log(sid)
                submit(sid, phone)
                if (submitis) {
                    $("nav3_0").style.display = 'none';
                    $("nav2_0").style.display = 'block';
                }
            } else {

            }

        }

    }
    // if (group == 2) {
    //     console.log(hs.areaLastFocus[1])
    //     hs.initFocus(hs.areaLastFocus[1].objid)

    //     $("nav2_0").style.display = 'none';
    // }
}