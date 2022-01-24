+function (f) {
    if (typeof f === 'function') {
        //
        f(window);
    }
}(function (v) {
    //  v 代表 window
    var unload_fun_list = [];
    var load_fun_list = [];
    var list = [];
    var focusList = [], blurList = [], beginAreaList = [], blurAreaList = [], selectList = [];
    var fObjList = [];
    var isTouchFlag = false;
    var clickFn = function () {
        if (isTouchFlag) {
            return;
        }
        var obj = _frameWork.objects[_frameWork.getId(this)];
        console.log('click:mouse ->' + obj.objid);
        _frameWork.areaLastFocus[obj.group] = null;
        _frameWork.initFocus(obj.objid);
        doSelect(obj.group, obj.objindex, obj.objid);
        _frameWork.execSelect(obj.group, obj.objid, obj.objindex);
    };
    var bindEvent = function () {
        if (window.addEventListener) {
            return function (target, evType, handler) {
                target.addEventListener(evType, handler);
            };
        } else if (window.attachEvent) {
            return function (target, evType, handler) {
                target.attachEvent('on' + evType, function () {
                    handler.call(target, window.event);
                });
            };
        } else {
            return function (target, evType, handler) {
                target['on' + evType] = handler;
            };
        }
    };
    var unbindEvent = function (target, evType, handle) {
        if (target.removeEventListener) {
            target.removeEventListener(evType, handle, false);
        } else if (target.detachEvent) {
            target.detachEvent('on' + evType, handle);
        } else {
            target['on' + evType] = null;
        }
    };
    var touch_even = function (element, callBack) {
        // 1. 定义一些必须的变量
        // 开始的时间
        var startTime = 0;
        // 标示 是否触发了 move事件
        var isMove = false;
        // 定义 最大的 延迟时间
        var maxTime = 250;

        var clientX_start, clientX_end;
        var clientY_start, clientY_end;

        bindEvent()(element, 'touchstart', function (event) {
            // console.log('touchmove-start');

            var event = event || window.event;
            clientX_start = event.touches[0].clientX;
            clientY_start = event.touches[0].clientY;

            clientX_end = clientX_start;
            clientY_end = clientY_start;

            // 记录开始时间
            startTime = Date.now();
            // 修正 我们标示变量的值
            isMove = false;
        });
        bindEvent()(element, 'touchmove', function (event) {
            // console.log("touchmove");
            var event = event || window.event;
            event.stopPropagation();
            callBack('move', event, {
                distanceX: event.touches[0].clientX - clientX_end,
                distanceY: event.touches[0].clientY - clientY_end
            });

            clientX_end = event.touches[0].clientX;
            clientY_end = event.touches[0].clientY;
            // console.log(event);
            isMove = true;
        });
        bindEvent()(element, 'touchend', function (event) {
            // console.log('touchmove-end');
            var distanceX = clientX_end - clientX_start;
            var distanceY = clientY_end - clientY_start;
            event = event || window.event;
            // console.log('distanceX:' + distanceX);
            // console.log('distanceY:' + distanceY);
            event.stopPropagation();
            //判断滑动方向
            if (Math.abs(distanceX) > Math.abs(distanceY) && distanceX > 0) {
                // console.log('往右滑动');
                callBack('move_r', event, distanceX);
            } else if (Math.abs(distanceX) > Math.abs(distanceY) && distanceX < 0) {
                // console.log('往左滑动');
                callBack('move_l', event, distanceX);
            } else if (Math.abs(distanceX) < Math.abs(distanceY) && distanceY < 0) {
                // console.log('往上滑动');
                callBack('move_t', event, distanceY);
            } else if (Math.abs(distanceX) < Math.abs(distanceY) && distanceY > 0) {
                // console.log('往下滑动');
                callBack('move_b', event, distanceY);
            } else {
                // console.log('点击未滑动');
                // 判断 延迟延迟的时间
                if ((Date.now() - startTime) > maxTime) {
                    // console.log('太长了,都属于长按了');
                    return;
                }
                callBack('click', event);
            }
        });
    };
    var cssText = function (el, value) {
        if (_frameWork.isString(value)) {
            if (el.style.cssText.length > 1) {
                el.style.cssText += value;
            } else {
                var style = value.split(';');
                for (var m = 0; m < style.length - 1; m++) {
                    var item = style[m].split(':');
                    // alert(item[0] + hs.trim(item[1]).length)
                    el.style[hs.trim(item[0])] = hs.trim(item[1]);
                }
            }
        }
    };

    var _frameWork = {
        /*核心参数*/
        evenStatus: -1,
        objects: {},
        focObj: null,
        areaLastFocus: {},
        prevFocObj: null,
        prevArea: null,
        focArea: null,
        direction: null,
        defaultUpCode: [1, 38],
        defaultDownCode: [2, 40],
        defaultLeftCode: [3, 37],
        defaultRightCode: [4, 39],
        defaultDoCode: [13],
        defaultBackCode: [8, 27, 45, 340],
        defaultNumberCode: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
        holdOldFoc: false,  //  是否保持旧焦点样式
        holdOldGroupObj: true,  // 是否调用旧区域对象
        /**
         * 描述：取消冒泡
         * @param e
         */
        stopBubble: function (e) {
            //如果提供了事件对象，则这是一个非IE浏览器
            if (e && e.stopPropagation)
            //因此它支持W3C的stopPropagation()方法
                e.stopPropagation();
            else
            //否则，我们需要使用IE的方式来取消事件冒泡
                window.event.cancelBubble = true;
        },
        /**
         * 描述：取消默认行为
         * @param e
         */
        preventDefault: function (e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        /**
         *  描述：清空list
         */
        clearList: function () {
            this.objects = {};
            this.areaLastFocus = {};
            this.focObj = {};
            this.focArea = null;
            this.prevFocObj = {};
            this.prevArea = null;
            this.direction = null;
            list = [];
            focusList = [];
            blurList = [];
            beginAreaList = [];
            blurAreaList = [];
            selectList = [];
            fObjList = [];
            this.defaultEvenFn();
        },
        /**
         * 描述：简单清空, 不包含已注册对象和相关区域信息
         */
        clearSList: function () {
            this.areaLastFocus = {};
            list = [];
            beginAreaList = [];
            blurAreaList = [];
            fObjList = [];
            this.defaultEvenFn();
        },
        /**
         * 描述：初始化默认事件: 上/下/左/右/确定/返回
         */
        defaultEvenFn: function () {
            this.addEvenToList(this.defaultUpCode, function () {
                _frameWork.up();
            });
            this.addEvenToList(this.defaultDownCode, function () {
                _frameWork.down();
            });
            this.addEvenToList(this.defaultLeftCode, function () {
                _frameWork.left();
            });
            this.addEvenToList(this.defaultRightCode, function () {
                _frameWork.right();
            });
            this.addEvenToList(this.defaultDoCode, function () {
                _frameWork.doSelect();
            });
            this.addEvenToList(this.defaultBackCode, function () {
                _frameWork.memoryO.goBack();
            });
        },
        /**
         *  描述：初始化默认上事件
         */
        defaultUpFn: function () {
            this.addEvenToList(this.defaultLeftCode, function () {
                _frameWork.up();
            });
        },
        /**
         *  描述：初始化默认下事件
         */
        defaultDownFn: function () {
            this.addEvenToList(this.defaultRightCode, function () {
                _frameWork.down();
            });
        },
        /**
         *  描述：初始化默认左事件
         */
        defaultLeftFn: function () {
            this.addEvenToList(this.defaultLeftCode, function () {
                _frameWork.left();
            });
        },
        /**
         *  描述：初始化默认右事件
         */
        defaultRightFn: function () {
            this.addEvenToList(this.defaultRightCode, function () {
                _frameWork.right();
            });
        },
        /**
         *  描述：初始化默认返回事件
         */
        defaultBackFn: function () {
            this.addEvenToList(this.defaultBackCode, function () {
                _frameWork.memoryO.goBack();
            });
        },
        /**
         *  描述：初始化默认确定事件
         */
        defaultDoFn: function () {
            this.addEvenToList(this.defaultDoCode, function () {
                _frameWork.doSelect();
            });
        },
        /**
         * 描述：获焦处理
         * @param _group Array
         * @param _fn 参数:group, objid, objindex
         */
        addFocus: function (_group, _fn) {
            this.addEvenToList(_group, _fn, focusList);
        },
        /**
         *  描述：进入下个区域之前回调函数
         * @param _group Array
         * @param _fn 参数:group, objid, objindex
         */
        addBeginArea: function (_group, _fn) {
            this.addEvenToList(_group, _fn, beginAreaList);
        },
        /**
         *  描述：失焦处理
         * @param _group Array
         * @param _fn 参数:group, objid, objindex
         */
        addBlur: function (_group, _fn) {
            this.addEvenToList(_group, _fn, blurList);
        },
        /**
         *  描述：离开区域前的回调函数
         * @param _group Array
         * @param _fn 参数:group, objid, objindex
         */
        addBlurArea: function (_group, _fn) {
            this.addEvenToList(_group, _fn, blurAreaList);
        },
        /**
         *  描述：确定键处理函数
         * @param {array} _group
         * @param {function} _fn 参数:group, objid, objindex
         */
        addSelect: function (_group, _fn) {
            this.addEvenToList(_group, _fn, selectList);
        },
        /**
         * 描述：是否含有某个样式
         * @param {object} obj
         * @param {string} c_name
         * @returns {boolean}
         */
        hasClass: function (obj, c_name) {
            var oldClass = obj.className;
            var reg = new RegExp(' ' + c_name + ' ', 'g');
            return reg.test(' ' + oldClass + ' ');
        },
        /**
         * 描述：添加样式
         * @param obj 对象
         * @param c_name 样式名
         */
        addClass: function (obj, c_name) {
            if (this.hasClass(obj, c_name)) {
                return;
            }
            var oldClass = obj.className;
            var newClass = (oldClass + ' ' + c_name).replace(/(^\s*)|(\s*$)/g, '');
            obj.className = newClass;
        },
        /**
         * 描述：删除样式
         * @param obj
         * @param c_name
         */
        removeClass: function (obj, c_name) {
            var oldClass = obj.className;
            var reg = new RegExp(c_name, 'g');
            var newClass = oldClass.replace(reg, '').replace(/(^\s*)|(\s*$)/g, '');
            obj.className = newClass;
        },
        /**
         *  描述：定位焦点
         * @param objid
         * @param holdObject 可选参数:holdOldGroupObj(是否保留区域)/holdOldFoc(是否保留上个焦点样式)
         */
        initFocus: function (objid, holdObject) {
            if (objid == '' || objid == null || this.isDomExist(objid)) {
                console.log('ERROR:hs.initFocus(' + objid + '),objid is not defined!');
                return;
            }
            this.doFocus(objid, holdObject);
        },
        doFocus: function (jdomid, holdObject) {
            if (jdomid == null) return;
            var newObj = this.objects[jdomid];
            if (!newObj) {
                console.log('ERROR : ' + jdomid + '未注册FObject对象!');
                return;
            }
            if (holdObject) {
                if (holdObject.holdOldGroupObj) this.holdOldGroupObj = holdObject.holdOldGroupObj;
                if (holdObject.holdOldFoc) this.holdOldFoc = holdObject.holdOldFoc;
            }

            var area = newObj.group;

            this.prevFocObj = this.focObj;

            if (this.focObj != null) {
                if (!this.holdOldFoc) {
                    if (typeof this.focObj.doBlur == 'function') this.focObj.doBlur();
                    this.execBlur(this.focObj.group, this.focObj.objid, this.focObj.objindex);
                } else {
                    this.holdOldFoc = false;
                }
                if (this.focObj.group !== area) {
                    this.prevArea = this.focObj.group;
                    if (typeof this.onBlurArea == 'function') this.onBlurArea(this.focObj);
                    this.execBlurArea(this.focObj.group, this.focObj.objid, this.focObj.objindex);
                }
            }

            var isAreaLastFocus = (this.holdOldGroupObj && typeof (this.areaLastFocus[area]) != 'undefined') && (this.areaLastFocus[area] != null) && (this.prevFocObj != null) && (area != this.prevFocObj.group)

            if (this.focObj == null || this.focObj.group !== area) {
                var obj = isAreaLastFocus ? this.areaLastFocus[area] : newObj;
                if (typeof this.onBeginArea == 'function') this.onBeginArea(obj);
                this.execBeginArea(obj.group, obj.objid, obj.objindex);
            }

            this.focArea = area;

            //this.focObj 新焦点
            if (isAreaLastFocus) {
                this.focObj = this.areaLastFocus[area];
                if (typeof this.areaLastFocus[area].doFocus == 'function') this.areaLastFocus[area].doFocus();
                this.execFocus(this.areaLastFocus[area].group, this.areaLastFocus[area].objid, this.areaLastFocus[area].objindex);
            } else {    //当区域对象无 or 不需要记忆区域的时候
                this.focObj = newObj;
                this.areaLastFocus[newObj.group] = this.focObj;
                if (typeof this.focObj.doFocus == 'function') this.focObj.doFocus();
                this.execFocus(this.focObj.group, this.focObj.objid, this.focObj.objindex);
                this.holdOldGroupObj = true;
            }

        },
        execFocus: function (group, objid, objindex) {
            this.initExec(group, objid, objindex, focusList);
        },
        execBlur: function (group, objid, objindex) {
            this.initExec(group, objid, objindex, blurList);
        },
        execBeginArea: function (group, objid, objindex) {
            this.initExec(group, objid, objindex, beginAreaList);
        },
        execBlurArea: function (group, objid, objindex) {
            this.initExec(group, objid, objindex, blurAreaList);
        },
        execSelect: function (group, objid, objindex) {
            this.initExec(group, objid, objindex, selectList);
        },
        initExec: function (group, objid, objindex, _list) {
            for (var k = 0; k < _list.length; k++) {
                if ((typeof _list[k].key) == 'number') {
                    if (_list[k].key === group) {
                        _list[k].action(group, objid, objindex);
                    }
                } else {
                    for (var m = 0; m < _list[k].key.length; m++) {
                        if (_list[k].key[m] === group) {
                            _list[k].action(group, objid, objindex);
                            return;
                        }
                    }
                }
            }
        },
        up: function () {
            if (this.focObj == null || this.focObj.up == null) {
                console.log('ERROR : doUp error!')
                return;
            }
            this.direction = 1;
            var up = this.focObj.up;

            if (typeof (up) == 'function') {
                this.focObj.doUp();
                return;
            }

            if (this.isDomExist(up)) {
                console.log('ERROR:UP ' + up + ' Not Found');
                return;
            }
            this.doFocus(up);
        },
        down: function () {
            if (this.focObj == null || this.focObj.down == null) {
                console.log('ERROR : doDown error!')
                return;
            }
            this.direction = 2;
            var down = this.focObj.down;

            if (typeof (down) == 'function') {
                this.focObj.doDown();
                return;
            }
            if (this.isDomExist(down)) {
                console.log('ERROR:DOWN ' + down + ' Not Found');
                return;
            }

            this.doFocus(down);
        },
        left: function () {
            if (this.focObj == null || this.focObj.left == null) {
                console.log('ERROR : doLeft error!')
                return;
            }
            this.direction = 3;
            var left = this.focObj.left;

            if (typeof (left) == 'function') {
                this.focObj.doLeft();
                return;
            }
            if (this.isDomExist(left)) {
                console.log('ERROR:LEFT ' + left + ' Not Found');
                return;
            }
            this.doFocus(left);
        },
        right: function () {
            if (this.focObj == null || this.focObj.right == null) {
                console.log('ERROR : doRight error!')
                return;
            }
            this.direction = 4;
            var right = this.focObj.right;

            if (typeof (right) == 'function') {
                this.focObj.doRight();
                return;
            }
            if (this.isDomExist(right)) {
                console.log('ERROR:RIGHT ' + right + ' Not Found');
                return;
            }
            this.doFocus(right);
        },
        doSelect: function () {
            if (!this.focObj) {
                console.log('ERROR : doSelect error!')
                return;
            }
            this.focObj.doSelect();
            this.execSelect(this.focObj.group, this.focObj.objid, this.focObj.objindex);
        },
        add: function (fObject) {
            var oid = fObject.objid;
            if (this.isDomExist(oid)) {
                console.log('dom:' + oid + '未存在!');
                return;
            }
            this.objects[oid] = fObject;
            touch_even($(oid), function (type, event, distance) {
                isTouchFlag = true;
                console.log(type + ':touch->' + fObject.objid);
                if (type == 'move') {
                    if (typeof fObject.touchCallback == 'function') fObject.touchCallback(type, event, distance);
                }

                if (type == 'click') {
                    _frameWork.areaLastFocus[fObject.group] = null;
                    _frameWork.initFocus(fObject.objid);
                    doSelect(fObject.group, fObject.objindex, fObject.objid);
                } else if (type == 'move_l') {
                    if (distance < -400) {
                        _frameWork.memoryO.goBack();
                    } else {
                        if (typeof fObject.touchCallback == 'function') fObject.touchCallback(type, event, distance);
                    }
                } else if (fObject.touchCallback && typeof (fObject.touchCallback) == 'function') {
                    fObject.touchCallback(type, event, distance);
                }
            });

            //绑定事件前先解绑下, 防止事件多次重复绑定
            // unbindEvent($(oid), 'click', clickFn);
            // bindEvent()($(oid), 'click', clickFn);
        },
        /**
         * 描述：指定id元素是否不存在
         * @param objid
         * @returns {boolean}
         */
        isDomExist: function (objid) {
            return !$(objid);
        },
        /**
         * 描述：获取元素的id值
         * @param dom
         * @returns {string}
         */
        getId: function (dom) {
            if (dom) {
                return dom.getAttribute('id');
            } else {
                console.log('dom 为空');
            }
        },
        /**
         * 描述：焦点对象添加到hs
         */
        fObjCommit: function () {
            for (var i = 0; i < fObjList.length; i++) {
                _frameWork.add(fObjList[i]);
            }
            fObjList = [];
        },
        /**
         * 描述：获取指定元素的指定样式
         * @param ele
         * @param attr
         * @returns {*}
         */
        getStyle: function (ele, attr) {
            if (window.getComputedStyle) {
                return window.getComputedStyle(ele, null)[attr];
            }
            return ele.currentStyle[attr];
        },
        /**
         * 描述：浏览器的屏幕的宽度
         * @returns {number}
         */
        screenWidth: function () {
            return screen.width == 0 ? 1280 : screen.width;
        },
        /**
         * 描述：浏览器的屏幕的高度
         * @returns {number}
         */
        screenHeight: function () {
            return screen.height == 0 ? 720 : screen.height;
        },
        /**
         * 描述：窗口的文档显示区的宽度
         * @returns {number}
         */
        windowWidth: function () {
            if (window.innerWidth) {
                return window.innerWidth;
            } else if ((document.body) && (document.body.clientWidth)) {
                return document.body.clientWidth;
            }
        },
        /**
         * 描述：窗口的文档显示区的高度
         * @returns {number}
         */
        windowHeight: function () {
            if (window.innerHeight) {
                return window.innerHeight;
            } else if ((document.body) && (document.body.clientHeight)) {
                return document.body.clientHeight;
            }
        },
        /**
         * 描述：获取项目的全路径
         * @param projectName 当前项目名字
         * @returns {string}
         */
        getBaseUrl: function (projectName) {
            if (!projectName) {
                alert('缺少必要参数projectName');
            }
            return location.href.substring(0, location.href.indexOf(projectName)) + projectName + '/';
        },
        /**
         * 描述：将 Date 转化为指定格式的String
         * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
         * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
         * 例子：
         *  formatDate('yyyy-MM-dd hh:mm:ss.S', new Date()) ==> 2006-07-02 08:09:04.423
         *  formatDate('yyyy-M-d h:m:s.S', new Date())      ==> 2006-7-2 8:9:4.18
         * @param _fmt 'yyyy-MM-dd hh:mm:ss.S'
         * @param _date _date instanceof Date
         * @returns {(string|void | string | boolean)}
         */
        formatDate: function (_fmt, _date) {
            if (_date instanceof Date) {
                var o = {
                    'M+': _date.getMonth() + 1,
                    //月份
                    'd+': _date.getDate(),
                    //日
                    'h+': _date.getHours(),
                    //小时
                    'm+': _date.getMinutes(),
                    //分
                    's+': _date.getSeconds(),
                    //秒
                    'q+': Math.floor((_date.getMonth() + 3) / 3),
                    //季度
                    'S': _date.getMilliseconds() //毫秒
                };

                if (/(y+)/.test(_fmt)) {
                    _fmt = _fmt.replace(RegExp.$1, (_date.getFullYear() + '').substr(4 - RegExp.$1.length));
                }

                for (var k in o) {
                    if (new RegExp('(' + k + ')').test(_fmt)) {
                        _fmt = _fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                    }
                }

                return _fmt;
            } else {
                return '';
            }
        },
        /**
         * 描述：从秒转换到字符串
         * @param _second 大于0，小于一天（24小时）
         * @returns {string} 输出字符串格式为hh:mm:ss,小于0，或大于一天，则返回'00:00:00'
         */
        formatTime: function (_second) {
            if (typeof _second != 'number' || _second < 0 || _second >= 86400) {
                return '00:00:00';
            }

            var o = {
                'h+': parseInt(_second / 3600),
                'm+': parseInt(_second / 60 % 60),
                's+': _second % 60
            }

            var _fmt = 'hh:mm:ss';
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(_fmt)) {
                    _fmt = _fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                }
            }
            return _fmt;
        },
        /**
         * 描述：从hh:mm:ss格式字符串转换到数字秒
         * @param _stime hh:mm:ss格式字符串
         * @returns {number} 输出数字秒
         */
        formatToTime: function (_stime) {
            if (typeof _stime != 'string' || _stime.length != 8) {
                return 0;
            }

            var a = _stime.split(':');
            if (a.length != 3) {
                return 0;
            }
            var sum = parseFloat(a[0]) * 3600 + parseFloat(a[1]) * 60 + parseFloat(a[2]);
            try {
                return sum;
            } catch (e) {
                return 0;
            }
        },
        /**
         *  描述：直播构造函数, 需要对statusEven对象初始化对应事件, 注意获取时间的地址(timeUrl)是否修改
         */
        listenLive: function () {
            var _this = this;
            this.timeUrl = 'http://21.254.5.190/UnityService/WcfService.svc/GetDateTime?showStyle=40';
            this.nowTime = '';
            this.beforeTime = '';
            this.startTime = '';
            this.endTime = '';
            this.afterTime = '';
            this.playUrl = '';
            this.beforeImg = '';
            this.errorFlag = 0;
            this.intTime = null;
            this.delayTime = 30;
            this.isStart = false;   // 直播状态中的标识符
            this.isAfter = false;   // 回放状态中的标识符
            this.isBefore = false;  //  预热状态中的标识符
            this.execFlag = true;   //  状态中是否执行对应fn, 默认true
            this.status = 0;     // 状态 0 1 2 3
            this.statusEven = { //  状态事件对象
                beforeFn: function () {
                },   //  预热事件, 设置预热图
                startFn: function () {
                },    // 直播事件, 一般就是hs.mw.setMedia(), 有预热图的需要取消预热图
                afterFn: function () {
                },    // 回放事件, 一般就是hs.mw.setMedia(), 有预热图的需要取消预热图
                otherFn: function () {
                }      // 其他时间事件, 有预热图的需要取消预热图
            };
            this.formateTime = function (time) {
                return time.replace(' ', 'T').replace(/[-:]/g, '') + 'Z';
            };
            this.setMw = function () {
                /*当前时间减3分钟*/
                var sTimeL = _this.nowTime.split(' ')[0];
                var sTimeR = _frameWork.formatToTime(_this.nowTime.split(' ')[1]);
                sTimeR = parseInt(sTimeR) - _this.delayTime;
                var sTime = _this.formateTime(
                    sTimeL + ' ' + _frameWork.formatTime(sTimeR)
                );
                var eTime = _this.formateTime(_this.endTime);

                var url = _frameWork.locationUrl.setQueryString(_this.playUrl, "start-time", sTime)
                url = _frameWork.locationUrl.setQueryString(url, "stop-time", eTime)
                console.log(url)
                //  播放
                this.playUrl = url;
                if (typeof _this.statusEven.startFn == 'function') _this.statusEven.startFn();
            };
            this.setOldMw = function () {
                /* 开始时间 */
                var sTimeL = _this.startTime.split(' ')[0];
                // var sTimeR = parseInt(hs.formatToTime(startTime.split(" ")[1])) - 180 + delayTime;
                var sTimeR = parseInt(
                    _frameWork.formatToTime(_this.startTime.split(' ')[1])
                );
                var sTime = _this.formateTime(
                    sTimeL + ' ' + _frameWork.formatTime(sTimeR)
                );

                /* 结束时间 */
                var eTimeL = _this.endTime.split(' ')[0];
                // var eTimeR = parseInt(hs.formatToTime(endTime.split(" ")[1])) - 180;
                var eTimeR = parseInt(
                    _frameWork.formatToTime(_this.endTime.split(' ')[1])
                );
                var eTime = _this.formateTime(
                    eTimeL + ' ' + _frameWork.formatTime(eTimeR)
                );
                var url = _frameWork.locationUrl.setQueryString(_this.playUrl, "start-time", sTime)
                url = _frameWork.locationUrl.setQueryString(url, "stop-time", eTime)
                console.log('回放地址:' + url);
                //   播放
                this.playUrl = url;
                if (typeof _this.statusEven.afterFn == 'function') _this.statusEven.afterFn();
            };
            /**
             * 描述：获取直播流状态
             */
            this.getStatus = function () {
                _frameWork.ajax.get(timeUrl,
                    function (obj) {
                        obj = JSON.parse(obj);
                        // console.log(obj);
                        if (obj.Success == true) {
                            _this.nowTime = obj.Data.DateFormat;
                        }
                    }, 0, function (msg) {
                    }, 3000);
                //当前时间
                var nowTimeTemp = _this.nowTime;
                nowTimeTemp = parseInt(
                    this.formateTime(nowTimeTemp).replace(/[TZ]/g, '')
                );

                var tempBeforeTime = _this.beforeTime;
                tempBeforeTime = parseInt(
                    this.formateTime(tempBeforeTime).replace(/[TZ]/g, '')
                );

                //开始时间
                var startTimeTemp = _this.startTime;
                startTimeTemp = parseInt(
                    this.formateTime(startTimeTemp).replace(/[TZ]/g, '')
                );
                //结束时间
                var endTimeTemp = _this.endTime;
                endTimeTemp = parseInt(
                    this.formateTime(endTimeTemp).replace(/[TZ]/g, '')
                );


                var tempAfterTime = _this.afterTime;
                tempAfterTime = parseInt(
                    this.formateTime(tempAfterTime).replace(/[TZ]/g, '')
                );

                /*预热中 ,当前时间在开始时间和预热时间之间*/
                if (
                    (nowTimeTemp < startTimeTemp && nowTimeTemp >= tempBeforeTime) ||
                    _this.errorFlag === -1
                ) {
                    console.log('预热中');
                    this.status = 0;
                    if (!_this.execFlag) {
                        return;
                    }
                    _frameWork.mw.closeMedia();
                    if (typeof _this.statusEven.beforeFn == 'function') _this.statusEven.beforeFn();
                    _this.isStart = false;
                    _this.isAfter = false;
                    _this.isBefore = false;

                    /*直播中 ,当前时间在开始时间和结束时间之间*/
                } else if (nowTimeTemp >= startTimeTemp && nowTimeTemp <= endTimeTemp) {
                    console.log('直播中');
                    this.status = 1;
                    if (!_this.execFlag) {
                        return;
                    }
                    if (!_this.isStart) {
                        _frameWork.mw.closeMedia();
                        _this.setMw();
                        _this.isStart = true;
                        _this.isAfter = false;
                        _this.isBefore = false;
                    }
                    /* 直播后 ,当前时间在结束时间之后*/
                } else if (nowTimeTemp > endTimeTemp && nowTimeTemp <= tempAfterTime) {
                    console.log('回放中');
                    this.status = 2;
                    if (!_this.execFlag) {
                        return;
                    }
                    if (!_this.isAfter) {
                        _frameWork.mw.closeMedia();
                        _this.setOldMw();
                        _this.isAfter = true;
                        _this.isStart = false;
                        _this.isBefore = false;
                    }
                } else {
                    console.log('其他时间');
                    this.status = 3;
                    if (!_this.execFlag) {
                        return;
                    }
                    if (!_this.isBefore) {
                        _frameWork.mw.closeMedia();
                        if (typeof _this.statusEven.otherFn == 'function') _this.statusEven.otherFn();
                        _this.isBefore = true;
                        _this.isStart = false;
                        _this.isAfter = false;
                    }
                }
            };
            /**
             * 描述：开始监听直播,设置相关参数
             * @param parame {beforeTime/startTime/endTime/afterTime/playUrl/beforeImg/errorFlag/delayTime/execFlag}
             */
            this.start = function (parame) {
                _this.beforeTime = parame.beforeTime;
                _this.startTime = parame.startTime;
                _this.endTime = parame.endTime;
                _this.afterTime = parame.afterTime;
                _this.playUrl = parame.playUrl;
                _this.beforeImg = parame.beforeImg;
                _this.errorFlag = parame.errorFlag;
                _this.delayTime = parame.delayTime;
                _this.execFlag = parame.execFlag === undefined ? true : parame.execFlag;    // 处理多个直播时使用.

                _this.getStatus();

                if (!_this.intTime) {
                    _this.intTime = setInterval(function () {
                        // console.log(new Date())
                        _this.getStatus();
                    }, 10000);
                }
            };
            /**
             * 描述：设置execFlag为true,执行触发对应的事件
             */
            this.startExecFlag = function () {
                _this.execFlag = true;
                _this.getStatus()
            };
            /**
             * 描述：描述：设置execFlag为false,不执行触发对应的事件, 只获取对应的状态
             */
            this.closeExecFlag = function () {
                _this.execFlag = false
                _this.isStart = false;
                _this.isAfter = false;
                _this.isBefore = false;
            };
            /**
             * 描述：取消获取直播状态的定时器
             */
            this.destroyTime = function () {
                if (_this.intTime) {
                    clearInterval(_this.intTime);
                }
            };
        },
        /**
         * 接口描述：关闭直播广告,目前此方法只在茁壮中间件有效
         */
        stopAD: function () {
            if (_isIpanel()) {
                iPanel.setBootAdStatus(0);
            }
        },
        /**
         * 接口描述：页面跳转到一个指定的地址
         * @param _url 要跳转到的地址
         * @param flag 当没有returnUrl参数时是否添加,默认添加.
         */
        go: function (_url, flag) {
            var tab = flag !== false;
            if (tab && !this.locationUrl.getQueryString('returnUrl', _url)) {
                _url = this.locationUrl.setQueryString(_url, 'returnUrl', location.href)
            }
            window.location.href = _url;
        },
        /**
         * 接口描述：指定页面onload的处理方法
         * @param fn 需要处理的方法
         * @param isAdd 是否为添加方式,如果非添加方式，会清除前次添加的所有方法
         */
        load: function (fn, isAdd) {
            if (typeof fn === 'function') {
                if (typeof isAdd === 'boolean' && isAdd == false) {
                    load_fun_list = [];
                }

                load_fun_list.push(fn);
                window.onload = function () {
                    for (var i = 0; i < load_fun_list.length; i++) {
                        load_fun_list[i]();
                    }
                };
            }
        },
        /**
         * 接口描述：指定页面unload的处理方法
         * @param fn 需要处理的方法
         * @param isAdd 是否为添加方式,如果非添加方式，会清除前次添加的所有方法
         */
        unload: function (fn, isAdd) {
            if (typeof fn === 'function') {
                if (typeof isAdd === 'boolean' && isAdd == false) {
                    unload_fun_list = [];
                }

                unload_fun_list.push(fn);
                window.onunload = function () {
                    for (var i = 0; i < unload_fun_list.length; i++) {
                        unload_fun_list[i]();
                    }
                };
            }
        },
        /**
         * 接口描述：键盘事件监听后的默认处理, 不要手工调用.
         * @param key_code
         * @returns {number}
         */
        defaultFun: function (key_code) {
            var ret = 1;
            for (var k = 0; k < list.length; k++) {
                for (var m = 0; m < list[k].key.length; m++) {
                    if (list[k].key[m] == key_code) {
                        if (this.arrayIsContains(hs.defaultNumberCode, key_code) > -1) key_code -= 48;
                        list[k].action(key_code);
                        ret = 0;
                        break;
                    }
                }
            }
            return ret;
        },
        /**
         * 接口描述：增加对一组按键值的事件监听
         * @param _key  监听的按键值(数组形式)
         * @param _fun  触发的函数
         * @param _list 添加到指定的事件列表(可为空,即默认事列表)
         */
        addEvenToList: function (_key, _fun, _list) {
            var ls = _list || list;
            var isExist = false;
            var obj = {key: _key, action: _fun};
            for (var k = 0; k < _key.length; k++) {
                isExist = this.removeFromList(_key[k], obj, ls);
            }
            if (!isExist) {
                ls.push(obj);
            }
        },
        /**
         * 接口描述：在指定事件列表或者默认事件列表中删除指定按键值(数组形式)的处理.
         * @param _key
         * @param obj
         * @param _list
         * @returns {boolean}
         */
        removeFromList: function (_key, obj, _list) {
            // console.log(_key);
            var ls = _list || list;
            var isExist = false;
            for (var k = 0; k < ls.length; k++) {
                for (var m = 0; m < ls[k].key.length; m++) {
                    if (ls[k].key[m] == _key) {
                        ls.splice(k, 1, obj);
                        isExist = true;
                        break;
                    }
                }
            }
            return isExist;
        },
        /**
         *  描述: ajax构造函数.
         */
        AjaxObject: function () {
            var geturl1 = 'http://21.254.5.190/UnityService/WcfService.svc'; // 老图文接口前缀或者时间接口前缀
            var geturl2 = 'http://21.254.5.190/UTLService/UIL/Publish/Handler.ashx'; // 省网图文接口前缀
            var geturl3 = 'http://vas-add.wasu.cn/UTLService/UIL/Publish/Handler.ashx'; // 杭网图文接口前缀
            // 当@style=10：返回日期格式为：yyyy-MM-dd；
            // 当@style=11：返回日期格式：yyyy-MM-dd 星期一；
            // 当@style=20：返回日期格式：yyyy/MM/dd；
            // 当@style=21：返回日期格式：yyyy/MM/dd dddd；
            // 当@style=30：返回日期格式：yyyy年MM月dd日；
            // 当@style=31：返回日期格式：yyyy年MM月dd日 dddd。
            // 当@style=40：返回日期格式：2017-03-23 13:47:35；
            var geturl4 = 'http://21.254.5.190/UnityService/WcfService.svc/GetDateTime?showStyle=40';
            var ajaxUrl = '';
            var timeout = 500;
            var _t = null;
            var xmlhttp = null;
            var loadStuts = false;
            this.async = true;
            var that = this;

            var init = function (_url, _type, _timeout) {
                if (typeof _url == 'string') {
                    ajaxUrl = _url;
                }

                if (typeof _type == 'number') {
                    switch (_type) {
                        case 1:
                            ajaxUrl = geturl1 + ajaxUrl;
                            break;
                        case 2:
                            ajaxUrl = window.location.hostname === 'localhost' ? geturl2.replace('UTLService', 'UTLService2') + ajaxUrl : geturl2 + ajaxUrl;
                            break;
                        case 3:
                            ajaxUrl = geturl3 + ajaxUrl;
                            break;
                        case 4:
                            ajaxUrl = geturl4;
                            break;
                    }
                }

                if (typeof _timeout == 'number') {
                    timeout = _timeout;
                }

            };

            var destroy = function () {
                if (xmlhttp != null) {
                    xmlhttp.abort();
                    xmlhttp = null;
                }
                loadStuts = false;
            };
            var ajax_method = function (_method, _url, _data, _fun, _type, _err, _timeout) {
                if (typeof _method != 'string' || ('POST' != _method && 'GET' != _method)) {
                    _err('_method ERROR!');
                }
                init(_url, _type, _timeout);
                if (ajaxUrl) {
                    destroy();
                    xmlhttp = new XMLHttpRequest();

                    // 将 object 类型的参数转换为 key=value&key=value
                    if (typeof _data === 'object') {
                        var tempArr = []
                        for (var key in _data) {
                            var value = _method == 'GET' ? key + '=' + encodeURIComponent(_data[key]) : key + '=' + _data[key];
                            tempArr.push(value);
                        }
                        _data = tempArr.join('&')
                    }
                    if (xmlhttp != null) {
                        xmlhttp.open(_method, ajaxUrl, that.async);
                        if (that.async) {
                            setMyTimeOut(_err);
                            xmlhttp.onreadystatechange = function () {
                                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                    if (loadStuts) return;
                                    clearTimeOut();
                                    var str = xmlhttp.responseText;
                                    _fun(str);
                                }
                            };
                        }
                        if ('POST' == _method && _data != null) {
                            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                            xmlhttp.send(_data);
                        } else {
                            xmlhttp.send();
                        }

                        if (!that.async) {
                            var str = xmlhttp.responseText;
                            _fun(str);
                        }
                    } else {
                        _err('xmlhttp is null!');
                    }
                }
            };
            /**
             * 描述: get请求
             * @param _url  接口地址
             * @param _fun  返回结果的回调函数
             * @param _type 类型:1老图文接口前缀或者时间接口前缀2.省网图文接口前缀3.省网图文接口前缀
             * @param _err  err时的回调函数
             * @param _timeout 超时时间, post有效
             */
            this.get = function (_url, _fun, _type, _err, _timeout) {
                ajax_method('GET', _url, null, _fun, _type, _err, _timeout);
            };
            /**
             * 描述: post请求
             * @param _url  接口地址
             * @param _data 数据,可以是对象或者格式化后的字符串.
             * @param _fun  返回结果的回调函数
             * @param _type 类型:1老图文接口前缀或者时间接口前缀. 2.省网图文接口前缀. 3.省网图文接口前缀.
             * @param _err  err时的回调函数
             * @param _timeout 超时时间, post有效
             */
            this.post = function (_url, _data, _fun, _type, _err, _timeout) {
                ajax_method('POST', _url, _data, _fun, _type, _err, _timeout);
            };

            var setMyTimeOut = function (_err) {
                clearTimeOut();
                _t = setTimeout(function () {
                        dealErr(_err);
                    },
                    timeout);
            };

            var clearTimeOut = function (_err) {
                if (_t != null) {
                    clearTimeout(_t);
                }
            };

            var dealErr = function (_err) {
                if (loadStuts == false) {
                    loadStuts = true;
                    xmlhttp.abort();
                    _err('请求超时!');
                }
            };

        },
        xml: {
            /**
             * 描述: 将xml字符串转换成dom树
             * @param xmlFile
             * @returns {string} Document
             */
            loadXML: function (xmlFile) {
                var xmlDoc;
                if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
                    for (var i = 0; i < xmlDomVersions.length; i++) {
                        try {
                            xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                            xmlDoc.async = false;
                            xmlDoc.loadXML(xmlFile);
                            break;
                        } catch (e) {
                        }
                    }
                } else if (navigator.userAgent.indexOf('Firefox') > 0) { //火狐浏览器
                    xmlDoc = document.implementation.createDocument('', '', null);
                    xmlDoc.load(xmlFile);
                } else { //谷歌浏览器
                    var domParser = new DOMParser();
                    xmlDoc = domParser.parseFromString(xmlFile, 'text/xml');
                }
                return xmlDoc;
            }
        },
        /**
         * 视频和机顶盒参数相关
         */
        mw: {
            lpos: 1,
            tpos: 1,
            wpos: 1,
            hpos: 1,
            playurl: [],
            m_index: 0,
            isAddUnload: false,
            playType: "VOD",
            /**
             * 描述:判断中间件是否为茁壮提供
             * @returns {boolean}
             * @private
             */
            _isIpanel: function () {
                var appVersion = navigator.appVersion;
                if (appVersion.indexOf('iPanel') != -1) {
                    return !this._isEnRich();
                }
                return false;
            },
            /**
             * 描述: 判断中间件是否为影立驰提供
             * @returns {boolean}
             * @private
             */
            _isEnRich: function () {
                if ((typeof SysInfo != 'undefined') && (typeof SysInfo == 'object') && ('EnRich' == SysInfo.mdwName)) {
                    return true;
                }
                return false;
            },
            /**
             * 描述: 获取STBID
             * @returns {(string|number)}
             */
            getSTBID: function () {
                if (this._isIpanel()) {
                    return hardware.STB.serial;
                } else if (this._isEnRich()) {
                    return iPanel.getGlobalVar('X-TERMINAL-ID');
                } else {
                    return '1104002091800024C126B94A';
                }
            },
            /**
             * 描述: 获取硬件版本号
             * @returns {string}
             */
            getHV: function () {
                if (this._isIpanel()) {
                    return hardware.STB.hVersion;
                } else if (this._isEnRich()) {
                    return SysInfo.hardwareVersion;
                } else {
                    return '';
                }
            },
            /**
             * 描述: 获取软件版本号
             * @returns {string}
             */
            getSV: function () {
                if (this._isIpanel()) {
                    return hardware.STB.sVersion;
                } else if (this._isEnRich()) {
                    return SysInfo.softwareVersion;
                } else {
                    return '';
                }

            },
            /**
             * 描述: 关闭媒体
             */
            closeMedia: function () {
                try {
                    DVB.stopAV();
                    media.AV.stop(0);
                    media.AV.close();
                } catch (e) {
                    console.log(e);
                }
            },
            /**
             * 描述: 指定时间点进行定点播放
             * @param _press 指定的时间点，字符串类型hh:mm:ss
             * @returns {boolean}
             */
            seek: function (_press) {
                try {
                    if (typeof _press != 'string') {
                        console.log(" seek()：Parameter is string hh:mm:ss");
                        return false;
                    } else {
                        media.AV.seek(_press);
                        return true;
                    }
                } catch (e) {
                    console.log(e);
                    return false;
                }
            },

            /**
             * 描述: 暂停或重启当前播放
             * @returns {number}
             */
            pause: function () {
                try {
                    if (this.getStatus == "play") {
                        media.AV.pause();
                        return 1;
                    } else if (this.getStatus == "pause") {
                        media.AV.play();
                        return -1;
                    } else {
                        return 0;
                    }
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            },
            /*
               接口说明：
               功能：获取当前播放状态
               返回值：返回状态的字符串描述，
                       ＂play＂ :媒体正在播放中；
                       ＂pause＂ :媒体为暂停状态；
                       ＂forward＂: 媒体在快速前进；
                       ＂backward＂: 媒体在快速后退；
                       ＂repeat＂ :媒体重绕；
                       ＂slow＂ :媒体慢放；
                       ＂stop＂ :停止；
                       ＂unknown＂ :未知
                       影立驰中间件不支持，返回"unknown"
            */
            /**
             * 描述: 获取当前播放状态
             * 返回值：返回状态的字符串描述，
             *        ＂play＂ :媒体正在播放中；
             *        ＂pause＂ :媒体为暂停状态；
             *        ＂forward＂: 媒体在快速前进；
             *        ＂backward＂: 媒体在快速后退；
             *        ＂repeat＂ :媒体重绕；
             *        ＂slow＂ :媒体慢放；
             *        ＂stop＂ :停止；
             *        ＂unknown＂ :未知
             *        影立驰中间件不支持，返回"unknown"
             * @returns {(number|string|string|number)}
             */
            getStatus: function () {
                try {
                    if (this._isIpanel()) {
                        return media.AV.status;
                    } else {
                        return "unknown";
                    }
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            },
            /**
             * 描述: 获取当前资产总时长
             * @returns {number} 返回值为数字秒
             */
            getDuration: function () {
                try {
                    return media.AV.duration;
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            },
            /**
             * 描述: 获取当前播放时间点
             * @returns {number|*} 返回值单位为秒
             */
            getElapsed: function () {
                try {
                    return media.AV.elapsed;
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            },
            /**
             * 描述: 设置全屏播放.
             * @param _callback
             * @returns {boolean}
             */
            fullScreen: function (_callback) {
                try {
                    media.video.fullScreen();
                    if (typeof _callback == 'function') {
                        _callback();
                    }
                } catch (e) {
                    console.log(e);
                    return false;
                }
            },
            /**
             * 描述: 视频计时页面
             * @param playUrl   视频地址
             * @param id        栏目id
             * @param title     栏目title
             * @param module    模块
             * @param account   账号
             * @param domain    域名
             */
            goJSPlayPage: function (playUrl, id, title, module, account, domain) {
                domain = domain || 'http://21.254.5.190';
                account = account || '';
                _frameWork.go(domain + '/hsvod/vodplay2timer.htm?vod=' + encodeURIComponent(playUrl) + '&id=' + id +
                    '&title=' + title + '&type=V&module=' + module + '&account=' + account);
            },
            /**
             * 描述: 视频不计时页面
             * @param playUrl   视频地址
             * @param isSeek    是否记忆已播放时间
             * @param ret       返回地址
             * @param domain    域名
             */
            goPlayPage: function (playUrl, isSeek, ret, domain) {
                domain = domain || 'http://21.254.5.190';
                isSeek = isSeek || false;
                ret = ret || location.href;
                var url = domain + '/hsvod/vodplay.htm?vod=' + encodeURIComponent(playUrl);
                if (isSeek) {
                    url = _frameWork.locationUrl.setQueryString(url, 'seek', _frameWork.mw.getElapsed());
                }
                url = _frameWork.locationUrl.setQueryString(url, 'ret', ret);
                _frameWork.go(url);
            },
            /**
             * 描述: 监控视频页面
             * @param playUrl   视频地址
             * @param domain    域名
             */
            goMonitorPage: function (playUrl, domain) {
                domain = domain || 'http://21.254.5.190';
                _frameWork.go(domain + '/hsvod/vodplay2monitor.htm?vod=' + encodeURIComponent(playUrl));
            },
            /**
             *  描述：设置媒体并播放.
             * @param left_Media    左边距
             * @param top_Media     上边距
             * @param width_Media   视频宽度
             * @param height_Media  视频高度
             * @param _loadUrl  加载时候的图片地址
             * @param _onPlay   播放时候时的回调函数
             * @param _closeFun 播放结束时的回调函数
             * @param _errFun   连接失败、搜索失败、播放失败时的回调函数
             */
            setMedia: function (left_Media, top_Media, width_Media, height_Media, _loadUrl, _onPlay, _closeFun, _errFun) {
                try {
                    var _this = this;
                    //添加视频load图片
                    /*
                    //取消load , 部分机顶盒无5202 事件导致img无法删除
                    _loadUrl = _loadUrl || 'http://21.254.5.190/frame/img/loading.png';
                     if (_loadUrl) {
                         var videoNode = $('img_load');
                         _frameWork.removeElem(videoNode);
                         _frameWork.createElem('img',
                             {id:'img_load', src:_loadUrl,style:'position:absolute;left:'+ left_Media +'px;top:'+ top_Media +'px;width:'+ width_Media +'px;height:'+ height_Media +'px'});
                     }
                     */

                    // var hVersion = this.getHV();
                    // var sVersion = this.getSV();
                    // if (hVersion == '07109a00' && sVersion == '10571143') {
                    //     iPanel.debug('120E video()');
                    // } else {
                    //     iPanel.debug('hm3000');
                    // }

                    if (left_Media && top_Media && width_Media && height_Media) {
                        this.lpos = left_Media;
                        this.tpos = top_Media;
                        this.wpos = width_Media;
                        this.hpos = height_Media;
                    }

                    if (!this.isAddUnload) {
                        _frameWork.unload(function () {
                            _this.closeMedia();
                        }, true);
                        this.isAddUnload = true;
                    }

                    /*播放结束*/
                    _frameWork.addEvenToList([5210], function () {
                        _this.closeMedia();
                        if (_this.m_index < _this.playurl.length - 1) {
                            _this.m_index += 1;
                        } else {
                            _this.m_index = 0;
                        }
                        if (typeof _closeFun == 'function') {
                            _closeFun();
                        }
                        this.modeChange(_this.playurl[_this.m_index]);
                        media.AV.open(_this.playurl[_this.m_index], _this.getMediaType(_this.playurl[_this.m_index]));
                    });
                    /*打开成功*/
                    _frameWork.addEvenToList([5202], function () {
                        media.AV.play();
                        /*setTimeout(function () {
                            var videoNode = $('img_load');
                            _frameWork.removeElem(videoNode);
                        }, 500);*/
                        if (typeof _onPlay == 'function') {
                            _onPlay();
                        }
                    });
                    /*连接失败、搜索失败、播放失败*/
                    _frameWork.addEvenToList([5203, 5204, 5206], function (key_code) {
                        _this.closeMedia();
                        if (typeof _errFun == 'function') {
                            _errFun();
                        }
                    });
                    this.setPosition()
                    this.playVOD();
                } catch (e) {
                    console.log(e);
                }
            },
            getMediaType: function (url) {
                var gmt = "";
                var bmt = (url.match(/.*:\/\//) + "").replace(/:\/\//, "").toLowerCase();
                switch (bmt) {
                    case "ngod":
                    case "rtsp":
                        gmt = "VOD";
                        break;
                    case "c4cam_live":
                    case "https":
                    case "http":
                        gmt = "HTTP";
                        break;
                    case "delivery":
                        gmt = "DVB";
                        break;
                    case "udp":
                        gmt = "IP-UDP";
                        break;
                    case "igmp":
                        gmt = "LiveTV";
                        break;
                    case "file":
                        gmt = "FILE";
                        break;
                    default:
                        gmt = "Unknown";
                        break
                }
                console.log("getMediaType:" + bmt);
                console.log("getMediaType:" + gmt);
                return gmt
            },
            setPosition: function () {
                try {
                    media.video.setPosition(this.lpos, this.tpos, this.wpos, this.hpos);
                } catch (e) {
                    console.log(e);
                }
            },
            playVOD: function () {
                try {
                    if (!this.playurl instanceof Array) {
                        alert('playurl参数必须为数组!');
                        return;
                    }
                    if (this.playurl.length < 1) {
                        alert('尚未初始化playurl');
                        return;
                    }
                    this.closeMedia();
                    this.modeChange(this.playurl[this.m_index]);
                    media.AV.open(this.playurl[this.m_index], this.getMediaType(this.playurl[this.m_index]));
                } catch (e) {
                    console.log(e);
                }
            },
            modeChange: function (rtsp_url) {
                var serverModel = "IP";

                if (this._isIpanel()) {
                    if (typeof (rtsp_url) != 'undefined') {
                        if (rtsp_url.indexOf('isIpqam=1') != -1) {
                            serverModel = 'DVB';
                        } else {
                            serverModel = 'IP';
                        }
                    } else {
                        if (rtsp_url.indexOf(".ts") != -1) {
                            serverModel = "DVB"
                        } else {
                            serverModel = "IP"
                        }
                    }
                    try {
                        if (serverModel == 'IP') {
                            //机顶盒的厂商名称 只读属性；
                            var __providerName = hardware.STB.provider;
                            var ipanel_soft_version = iPanel.System.revision;
                            if (__providerName.indexOf('摩托') != -1 || ipanel_soft_version.indexOf('41506') != -1) {//第三方VOD的点播模式切换
                                VOD.changeServer('sihua_3rd', 'ip');
                            } else {
                                VOD.changeServer('isma_v2', 'ip');
                            }
                        } else {
                            VOD.changeServer('isma_v2', 'dvb');
                        }
                    } catch (e) {
                        console.log("error:" + e.message);
                    }
                }
            },
            /**
             * 描述: 根据站点id 获取视频相关信息
             * @param siteID
             * @param siteIndex
             * @param siteItem
             * @returns {Object} {pages: string, data: []}
             */
            getSiteInfo: function (siteID, siteIndex, siteItem) {
                var base_url = 'http://125.210.227.229/catalog';
                var content = {'data': [], 'pages': ''};
                var data = '<?xml version="1.0" encoding="UTF-8"?>'
                data += '<message module="CATALOG_SERVICE" version="1.0">' +
                    '<header component-type="REQUEST" action="REQUEST" component-id="catalog" sequence="100000001" command="RELATIVE_CONTENT_QUERY" version="2.0"/>' +
                    '<body>' +
                    '               <folders>' +
                    '                   <folder>' +
                    '<site-code>hzvsite</site-code>' +
                    '<code>' + siteID + '</code>' +
                    '<page-index>' + siteIndex + '</page-index>' +
                    '<page-items>' + siteItem + '</page-items>' +
                    '</folder>' +
                    '</folders>' +
                    '           </body>' +
                    '</message>';

                _frameWork.ajax.post('', 'url=' + base_url + '&data=' + encodeURIComponent(data.replace(/</ig, '&lt;').replace(/>/ig, '&gt;')) + '&method=soap', function (response) {
                    // console.log(response);
                    if (response.indexOf('未查询到任何内容信息') != -1) {
                        console.log('未查询到任何内容信息!');
                    } else {
                        var xmlDoc = _frameWork.xml.loadXML(response); //loadXML方法载入xml字符串
                        var elements = xmlDoc.getElementsByTagName('content');
                        var pages = xmlDoc.getElementsByTagName('contents')[0].getAttribute('total-pages');
                        for (var i = 0; i < elements.length; i++) {
                            var name = elements[i].getElementsByTagName('name')[0].firstChild.nodeValue;
                            var creatTime = elements[i].getElementsByTagName('creat-time')[0].firstChild.nodeValue;
                            var code = elements[i].getElementsByTagName('code')[0].firstChild.nodeValue;
                            var imgUrl = elements[i].getElementsByTagName('url').length > 1 ? elements[i].getElementsByTagName('url')[1].firstChild.nodeValue : null;
                            content.data.push({
                                'codeID': code,
                                'name': name,
                                'creatTime': creatTime,
                                'imgUrl': imgUrl,
                                'playUrl': ''
                            });
                            content.pages = pages;
                        }
                    }
                }, 4, function (msg) {
                    console.log(msg);
                }, 3500);
                // for (var i = 0; i < content.data.length; i++) {
                //     content.data[i].playUrl = this.getSite2Url(siteID, content.data[i].codeID,1);
                // }
                return content;
            },
            /**
             * 描述根据站点id,内容id获取地址
             * @param siteID
             * @param contentID
             * @param type 1省网,0杭网
             * @returns {string}
             */
            getSite2Url: function (siteID, contentID, type) {
                var types = type === 0 ? 0 : 1;
                var rp1_s = "&owchid=hdds_ip&isHD=0&isIpqam=0";//省网后缀
                var rp1 = "rtsp://21.254.5.198:554";//省网匹配
                var rp2 = 'rtsp://125.210.227.234:5541/hdds_ip';

                var base_url = 'http://125.210.227.229/catalog';
                var data = '<?xml version="1.0" encoding="UTF-8" ?>' +
                    '<message module="CATALOG_SERVICE" version="1.0">' +
                    '<header component-type="REQUEST" action="REQUEST" component-id="catalog" sequence="100000001" command="CONTENT_URL_QUERY" version="2.0"/>' +
                    '<body>' +
                    '<contents>' +
                    '<content>' +
                    '<site-code>hzvsite</site-code>' +
                    '<folder-code>' + siteID + '</folder-code>' +
                    '<code>' + contentID + '</code>' +
                    '<items-index>1</items-index>' +
                    '<format>50</format>' +
                    /*  '<begin-time></begin-time>'+
                        '<end-time></end-time>'+
                        '<file-index></file-index>'+ */
                    '</content>' +
                    '</contents>' +
                    '</body>' +
                    '</message>';
                var str = '';
                _frameWork.ajax.post('', 'url=' + base_url + '&data=' + encodeURIComponent(data.replace(/</ig, '&lt;').replace(/>/ig, '&gt;')) + '&method=soap', function (response) {
                    // console.log(response);
                    if (types == 1) {
                        var xmlDoc = _frameWork.xml.loadXML(response);
                        var elements = xmlDoc.getElementsByTagName('play-urls');
                        for (var i = 0; i < elements.length; i++) {
                            var urls = elements[i].getElementsByTagName('play-url');
                            for (var j = 0; j < urls.length; j++) {
                                var url = urls[j].firstChild.nodeValue;
                                if (url.indexOf(rp1) != -1 && url.indexOf('&isHD=0') != -1) {
                                    str = url.substring(0, url.indexOf('&')) + rp1_s;
                                    break;
                                }
                            }
                        }
                    } else {
                        /*杭网*/
                        var strIndex = res.indexOf(rp2);
                        var tmp = response.substring(strIndex);
                        str = strIndex != -1 ? tmp.substring(0, tmp.indexOf('&token')) : '';
                        /*contentPlayUrl.push(tmp);*/
                    }
                }, 4, function (msg) {
                    console.log(msg);
                }, 3500);
                return str;
            },
            /**
             * 描述: 根据内容id获取视频信息
             * @param contentID
             * @param type 1省网,0杭网
             * @returns {string}
             */
            getConidToUrl: function (contentID, type) {
                var types = type === 0 ? 0 : 1;
                var rp2 = 'rtsp://125.210.227.234:5541/hdds_ip';
                // var rp1_s = "&owchid=vod01_channel&isHD=0&isIpqam=0";//省网后缀
                // var rp1 = "rtsp://21.254.5.158:554";//省网匹配
                var rp1_s = "&owchid=hdds_ip&isHD=0&isIpqam=0";//省网后缀
                var rp1 = "rtsp://21.254.5.198:554";//省网匹配
                var url = 'http://125.210.227.229/catalog';
                var values = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<message module="CATALOG_SERVICE" version="1.0">' +
                    '<header component-type="REQUEST" action="REQUEST" component-id="catalog" sequence="100000001" command="CONTENT_URL_QUERY" version="2.0"/>' +
                    '<body>' +
                    '<contents>' +
                    '<content>' +
                    '<code>' + contentID + '</code>' +
                    '<items-index>1</items-index>' +
                    '<site-code>hzvsite</site-code>' +
                    '<format>50</format>' +
                    '</content>' +
                    '</contents>' +
                    '</body>' +
                    '</message>';

                var str = '';
                var res = _frameWork.crossAjaxHandler({
                    url: url,
                    data: values.replace(/</ig, '&lt;').replace(/>/ig, '&gt;'),
                    method: 'post',
                    type: 'soap'
                });
                if (types == 1) {
                    var xmlDoc = _frameWork.xml.loadXML(res);
                    var elements = xmlDoc.getElementsByTagName('play-urls');
                    for (var i = 0; i < elements.length; i++) {
                        var urls = elements[i].getElementsByTagName('play-url');
                        for (var j = 0; j < urls.length; j++) {
                            var url = urls[j].firstChild.nodeValue;
                            if (url.indexOf(rp1) != -1 && url.indexOf('&isHD=0') != -1) {
                                str = url.substring(0, url.indexOf('&')) + rp1_s;
                                break;
                            }
                        }
                    }
                    return str;
                } else {
                    var strIndex = res.indexOf(rp2);
                    var tmp = res.substring(strIndex);
                    return strIndex != -1 ? tmp.substring(0, tmp.indexOf('&token')) : '';
                }
            }
        },
        cookie: {
            /**
             * 描述: 获取cookie.
             * @param name
             * @returns {string}
             */
            get: function (name) {
                var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
                if (arr = document.cookie.match(reg)) {
                    if (arr[2].indexOf('"') === 0) {
                        arr[2] = arr[2].slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                    }
                    try {
                        arr[2].replace(/\+/g, ' ');
                        return decodeURIComponent(arr[2]);
                    } catch (e) {
                        console.log(e.message);
                    }
                } else {
                    return '';
                }
            },
            /**
             * 描述: 设置cookie
             * @param name
             * @param value
             * @param days
             */
            set: function (name, value, days) {
                var exp = new Date();
                exp.setTime(exp.getTime() + (days * 24 * 60 * 60 * 1000));
                if (days) {
                    window.document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + exp.toGMTString() + ';path=/';
                } else {
                    window.document.cookie = name + '=' + encodeURIComponent(value) + ';path=/';
                }
            },
            /**
             * 描述: 删除一个cookie
             * @param name
             */
            delOne: function (name) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval = this.get(name);
                if (cval != null) {
                    document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString() + ';path=/';
                }
            },
            /**
             * 描述: 删除所有cookie
             */
            delAll: function () {
                var strCookie = document.cookie;
                var arrCookie = strCookie.split('; '); // 将多cookie切割为多个名/值对
                for (var i = 0; i < arrCookie.length; i++) { // 遍历cookie数组，处理每个cookie对
                    if (arrCookie[i].indexOf('=') != -1) {
                        var arr = arrCookie[i].split('=');
                        if (arr.length > 0)
                            this.delOne(arr[0]);
                    } else if (arrCookie[i].indexOf(';') != -1) {
                        var nn = arrCookie[i].indexOf(';');
                        var arr = arrCookie[i].substring(0, nn);
                        if (arr.length > 0)
                            this.delOne(arr);
                    }
                }
            }
        },
        /**
         * localStorage 本地存储
         */
        localStorage: {
            get: function (_name) {
                localStorage.getItem(_name);
            },
            set: function (_name, _val) {
                var value = typeof _val === 'Object' ? JSON.stringify(_val) : _val
                localStorage.setItem(_name, value);
            },
            delOne: function (_name) {
                localStorage.removeItem(_name);
            },
            delAll: function () {
                localStorage.clear();
            }
        },
        /**
         * global
         * @private
         */
        global: {
            /**
             * 描述: 获取指定global
             * @param name
             * @returns {string}
             */
            get: function (name) {
                var GlobalValue = '';
                try {
                    GlobalValue = iPanel.getGlobalVar(name);
                } catch (e) {
                    console.log(e.message);
                    return '';
                }
                return GlobalValue;
            },
            /**
             * 描述: 设置一个global
             * @param name
             * @param value
             */
            set: function (name, value) {
                try {
                    iPanel.setGlobalVar(name, value);
                } catch (e) {
                    console.log(e.message);
                }
            },
            /**
             * 描述: 删除一个global
             * @param key
             */
            del: function (key) {
                try {
                    iPanel.delGlobalVar(key);
                } catch (e) {
                    console.log(e.message);
                }
            }
        },
        /**
         * json
         */
        json: {
            /**
             * 描述: 将json字符串转换成json
             * @param str
             * @returns {Object}
             */
            parse: function (str) {
                try {
                    str = eval('(' + str + ')');
                    return str;
                } catch (e) {
                    console.log(e.message);
                }
            },
            /**
             * 描述: 将对象解析成字符串.
             * @param obj
             * @returns {string}
             */
            stringify: function (obj) {
                var arr = [];
                var fmt = function (s) {
                    if (typeof s == 'object' && s != null) {
                        if (s instanceof Array) {
                            var temp = [];
                            for (var index = 0; index < s.length; index++) {
                                temp.push(fmt(s[index]));
                            }
                            return ('[' + temp.join(',') + ']');
                        } else {
                            return _frameWork.json.stringify(s);
                        }
                    } else {
                        return /^(string)$/.test(typeof s) ? "'" + s + "'" : s;
                    }
                };
                for (var i in obj) {
                    // arr.push("'" + i + "':" + fmt(obj[i]));
                    obj instanceof Array ? arr.push(fmt(obj[i])) : arr.push("'" + i + "':" + fmt(obj[i]));
                }
                return '{' + arr.join(',') + '}';
            }
        },
        /**
         * 描述: 跟地址相关方法.
         */
        locationUrl: {
            /**
             * 描述: 获取地址栏或者指定地址指定参数.
             * @param _name
             * @param _url
             * @returns {string}
             */
            getQueryString: function (_name, _url) {
                var reg = new RegExp('(^|&)' + _name + '=([^&]*)(&|$)', 'i');
                _url = _url || window.location.href
                var r = _url.substring(_url.indexOf('?') + 1).match(reg);
                if (r != null) return (decodeURIComponent(r[2]));
                return '';
            },
            /**
             * 描述: 判断浏览器类型.
             * @returns {string}
             */
            getNavigatorUA: function () {
                var _ua = navigator.userAgent.toLowerCase();
                if (/ipanel/.test(_ua)) {
                    return 'iPanel';
                } else if (/windows /.test(_ua)) {
                    return 'PC';
                }
                return _ua;
            },
            /**
             * 描述: 对当前地址或者指定地址设置参数.
             * @param _u
             * @param _k
             * @param _v
             * @returns {string}
             */
            setQueryString: function (_u, _k, _v) {
                _u.indexOf('?') != -1 ? _u += '&' : _u += '?';
                _u += _k + '=' + encodeURIComponent(_v);
                return _u;
            },
            /**
             *  描述: 格式化图片节点的地址.
             * @param url   图片地址
             * @param prefixSrc 图片域名
             * @returns {string}
             */
            formatImgUrl: function (url, prefixSrc) {
                var regex = /src="([^"]*)"/gi;
                var prefixSrc = prefixSrc || 'http://21.254.5.190';
                if (url != null && url != '') {
                    return prefixSrc + regex.exec(url)[1];
                }
                return '';
            },
            /**
             * 描述: 格式化图文节点中的图片地址.
             * @param url
             * @param prefixSrc
             * @returns {string}
             */
            replaceImgUrl: function (url, prefixSrc) {
                var regex = /<img[\s]*(alt=\"\")?[\s]*src="/gi;
                var prefixSrc = prefixSrc || 'http://21.254.5.190';
                var rs = regex.exec(url);
                if (url != null && url != '' && rs) {
                    url = url.replace(regex, '<img src="' + prefixSrc);
                }
                return url;
            }
        },
        /**
         * 描述: 返回和记忆焦点的处理
         */
        memoryO: {
            upBackUrl: '',
            backName: '',
            initFObject: '',
            localhostName: '',
            upBackName: '',
            goBackFlag: false,
            backObj: {'url': '', 'fObjectArr': [], 'pageIndexArr': []},
            loaded: false,

            goBackO: function (url, fObjectArr, pageIndexArr) {
                var tempO = {};
                tempO.url = url;
                tempO.fObjectArr = fObjectArr;
                tempO.pageIndexArr = pageIndexArr;
                return tempO;
            },
            /**
             * 描述: 生成页面返回时的记忆焦点对象,
             * @param url   返回地址,当无upBackName参数时url可为空.
             * @param fObjectArr    焦点数组
             * @param pageIndexArr  页码数组
             * @returns {Object}
             */
            initBackO: function (url, fObjectArr, pageIndexArr) {
                return this.goBackO(url, fObjectArr, pageIndexArr);
            },
            /**
             * 描述: 页面加载完成时对MemoryO的初始化
             * @param backname  页面名
             * @param initfo   初始化焦点名字
             * @param callback
             */
            initMemoryO: function (backname, initfo, callback) {
                this.backName = backname;
                this.initFObject = initfo;
                this.localhostName = backname + '_url';
                this.upBackName = _frameWork.locationUrl.getQueryString('upBackName');
                if (this.upBackName) {
                    this.upBackUrl = _frameWork.cookie.get(this.upBackName);
                }
                var hasback = this.loadBefor();
                if(hasback && _frameWork.isFunction(callback)){
                    callback(this.backObj);
                } else if(initfo != '' && !_frameWork.isUndefined(initfo)){
                    _frameWork.initFocus(initfo);
                }
                return hasback; // 兼容老的写法
            },
            /**
             * 描述: 跳转外链(第三方页面)时的返回页面处理.
             * @param projectName  项目名字
             * @param fileName  跳转文件短名字包括后缀
             * @returns {string}  返回跳转文件的全类名
             */
            getOutside: function (projectName, fileName) {
                var self = window.location.href;
                var name = fileName || 'outside_tools.htm';
                var baseUrl = _frameWork.getBaseUrl(projectName)
                _frameWork.global.set('outside_returnUrl', self);
                _frameWork.cookie.set('outside_returnUrl', self);
                return baseUrl + name;
            },
            /**
             * 描述: 返回事件默认处理.
             */
            goBack: function () {
                _frameWork.cookie.delOne('hs_back_' + this.backName);
                if (_frameWork.locationUrl.getQueryString('indexUrl')) {
                    //省网门户二次编码,需要二次解码.
                    window.location.href = decodeURIComponent(_frameWork.locationUrl.getQueryString('indexUrl'));
                } else if (_frameWork.locationUrl.getQueryString('returnUrl')) {
                    window.location.href = _frameWork.locationUrl.getQueryString('returnUrl');
                } else if (this.upBackUrl) {
                    _frameWork.cookie.delOne(this.upBackName);
                    window.location.href = this.upBackUrl;
                } else if (this.backObj.url) {
                    window.location.href = this.backObj.url;
                } else if (_frameWork.global.get('returnUrl')) {
                    window.location.href = _frameWork.global.get('returnUrl');
                } else {
                    history.go(-1);
                }
            },
            loadBefor: function () {
                var hs_back = _frameWork.cookie.get('hs_back_' + this.backName);
                if (hs_back) {
                    this.backObj = _frameWork.json.parse(hs_back);
                    this.loaded = true
                }
                return this.loaded;
            },
            /**
             *  描述: 离开页面时设置页面的焦点和页码cookie.
             * @param {Object}
             * @param {Boolean} isHold = true|false,true表示将当前地址记录到cookie，false表示不可以
             **/
            setBack: function (bObj, isHold) {
                isHold = isHold == true ? true : false;
                if (bObj.focObj) {
                    console.log('ERROR :setBack() focObj not find!');
                }
                if (!bObj.url && this.upBackUrl) {
                    bObj.url = this.upBackUrl;
                }
                if (!bObj.url && this.backObj.url) {
                    bObj.url = this.backObj.url;
                }
                _frameWork.cookie.set('hs_back_' + this.backName, _frameWork.json.stringify(bObj));
                if (isHold) {
                    _frameWork.cookie.set(this.localhostName, location.href);
                }
            }
        },
    };

    /*_frameWork 结束*/

    /**
     * 描述: 焦点对象构造函数.
     * hs.onBlur  和  hs.onFocus , doSelect需要自己重写
     * @param group
     * @param objindex
     * @param objid
     * @param up
     * @param down
     * @param left
     * @param right
     * @param touchCallback
     */
    function fObject(group, objindex, objid, up, down, left, right, touchCallback) {
        this.group = group;
        this.objindex = objindex;
        this.objid = objid;
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.touchCallback = touchCallback;

        this.doBlur = function () {
            if (typeof (hs.onBlur) == 'function') {
                hs.onBlur(this.group, this.objid, this.objindex);
            } else {
                console.log('Error:you should implement the funcion hs.onBlur(groupid,objid,index)');
            }
        };
        this.doFocus = function () {
            if (typeof (hs.onFocus) == 'function') {
                hs.onFocus(this.group, this.objid, this.objindex);
            } else {
                console.log('Error:you should implement the funcion hs.onFocus(groupid,objid,index)');
            }
        };
        this.doUp = function () {
            if (typeof (this.up) == 'function') {
                this.up(this);
            }
        };
        this.doDown = function () {
            if (typeof (this.down) == 'function') {
                this.down(this);
            }
        };
        this.doLeft = function () {
            if (typeof (this.left) == 'function') {
                this.left(this);
            }
        };
        this.doRight = function () {
            if (typeof (this.right) == 'function') {
                this.right(this);
            }
        };
        this.doSelect = function () {
            if (typeof (doSelect) == 'function') {
                doSelect(this.group, this.objindex, this.objid);
            } else {
                console.log('Error:you should implement the funcion doSelect(groupid, index, objid)');
            }

        };
        fObjList.push(this);
    }

    /**
     * 描述: 事件监听回调函数
     * @param event
     * @returns {number}
     */
    function grabEvent(event) {
        var key_code = event.keyCode || event.which;
        var ret;
        if (key_code === 27) _frameWork.preventDefault();
        ret = _frameWork.defaultFun(key_code);
        return ret;

    }

    /**
     * 描述: DOM对象选择器,只能是id
     * @param selector
     * @returns {HTMLElement}
     */
    v.$ = function (selector) {
        if (typeof selector == 'string') {
            var t = document.getElementById(selector);
            if (typeof t === 'undefined') {
                return null;
            } else {
                return t;
            }
        } else {
            console.log('getElementById(' + selector + ') is null!');
            return null;
        }
    };

    /**
     * 描述: 空函数
     * @returns {number}
     */
    function emptyFun() {
        console.log('emptyFun');
        return 0;
    }

    /**
     * 描述: 添加事件监听
     */
    _frameWork.addEvenToWindow = function () {
        if (_frameWork.evenStatus !== 1) {
            _frameWork.evenStatus = 1;
            window.document.onkeydown = grabEvent;
            // window.document.onkeypress = grabEvent;
            window.document.onirkeypress = grabEvent;
            window.document.onsystemevent = grabEvent;
        }
    };

    /**
     * 描述: 取消事件监听, 执行空函数
     */
    _frameWork.removeEvenToWindow = function () {
        if (_frameWork.evenStatus !== 0) {
            _frameWork.evenStatus = 0;
            window.document.onkeydown = emptyFun;
            // window.document.onkeypress = emptyFun;
            window.document.onirkeypress = emptyFun;
            window.document.onsystemevent = emptyFun;
        }
    };

    _frameWork.addEvenToWindow();

    /*初始化默认事件*/
    _frameWork.defaultEvenFn();

    //  将hs 设置为  winodw的顶层对象属性
    v.hs = _frameWork;

    /*兼容旧版ajax*/
    v.hs.ajax = new function () {
        var ajax = new _frameWork.AjaxObject();
        ajax.async = false;
        this.get = ajax.get;
        this.post = ajax.post;
    };

    //将fObject 设置为  winodw的顶层对象属性
    v.fObject = fObject;

    //----------hs 扩展函数---------------
    _frameWork.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]' || obj instanceof Array;
    };

    _frameWork.isObject = function (obj) {
        return typeof obj == 'object';
    };

    _frameWork.isFunction = function (obj) {
        return typeof obj == 'function';
    };

    _frameWork.isString = function (obj) {
        return typeof obj == 'string';
    };

    _frameWork.isBoolean = function (obj) {
        return typeof obj == 'boolean';
    };

    _frameWork.isNumber = function (obj) {
        return typeof obj == 'number';
    };

    _frameWork.isUndefined = function (obj) {
        return typeof obj == 'undefined';
    };

    /**
     * 描述: 判断是不是正确的手机号码
     * @param phone
     * @returns {boolean}
     */
    _frameWork.isPoneAvailable = function (phone) {
        var myreg = /^1[3456789]\d{9}$/;
        return myreg.test(phone);
    };

    /**
     * 描述: foreach方法 数组或者字符串
     */
    _frameWork.forEach = function () {
        if (![].forEach) {
            return function (items, fn, separator) {
                if (_frameWork.isString(items)) {
                    separator = separator || '|';
                    items = items.split(separator);
                }
                for (var i = 0, len = items.length; i < len; i++) {
                    if (fn(items[i], i) == false) {
                        return
                    }
                }
            };
        } else {
            return function (items, fn) {
                [].forEach.call(items, fn);
            }
        }
    }();

    /**
     * 描述: 判断对象是否为空, 高清机顶盒未测试
     * @param obj
     */
    _frameWork.isEmptyObject = function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    };

    /**
     * 描述: 删除字符串首尾空白符
     * @param value
     * @returns {*}
     */
    _frameWork.trim = function (value) {
        if (this.isString(value)) {
            var reg = /^\s+|\s+$/g;
            return value.replace(reg, '');
        }
        return value;
    };

    /**
     * 描述:  设置css
     * @param elem
     * @param value {String|Object}
     * @returns {boolean}
     */
    _frameWork.css = function (elem, value) {
        if (this.isString(value)) {
            cssText(elem, value);
        } else if (this.isObject(value)) {
            for (var m in value) elem.style[m] = value[m];
            return true;
        }
    };

    /**
     * 描述: 创建挂载dom元素.
     * @param type  元素类型
     * @param prame 参数对象, style|attr.
     * @param parentNode    父节点可为空
     * @returns {HTMLElement}
     */
    _frameWork.createElem = function (type, prame, parentNode) {
        //hs.createElem( 'div', {id:'div2', style:'width:100px;height:50px;', attr:{exDragable:1}} );
        var o = document.createElement(type);
        for (var p in prame) {
            if (p === 'style') {
                cssText(o, prame[p]);
            } else if (p === 'attr') {
                for (var i in prame[p])
                    o.setAttribute(i, prame[p][i]);
            } else {
                o[p] = prame[p];
            }
        }

        if (this.isUndefined(parentNode)) {
            document.body.appendChild(o);
        } else if (parent !== null) {
            parentNode.appendChild(o);
        }

        return o;
    };

    /**
     * 描述: 删除指定DOM节点.
     * @param elem
     * @returns {boolean}
     */
    _frameWork.removeElem = function (elem) {
        if (elem && elem.parentNode && elem.tagName.toLowerCase() !== 'body') {
            elem.parentNode.removeChild(elem);
            return true;
        }
    };

    /**
     * 描述: 块级元素:display切换[block,none].
     * @param _e
     * @param _d  show|none
     * @returns {boolean}
     */
    _frameWork.toggleDisplay = function (_e, _d) {
        if (this.isString(_d)) {
            var val = (_d === 'show' ? 'block' : 'none');
            this.css(_e, {display: val});
            return true;
        }
    };

    /**
     * 描述: 判断数组是否包含值
     * @param _arr  数组
     * @param _v    键
     * @returns {number}
     */
    _frameWork.arrayIsContains = function (_arr, _v) {
        var index = -1;
        this.forEach(_arr, function (_item, _index) {
            if (_item === _v) {
                index = _index;
                return false;
            }
        });
        return index;
    };

    /**
     * 描述: 数组去重
     * @param arr
     * @returns {*}
     */
    _frameWork.arrayUnique = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = i + 1; j < arr.length; j++) {
                if (arr[i] == arr[j]) {         //第一个等同于第二个，splice方法删除第二个
                    arr.splice(j, 1);
                    j--;
                }
            }
        }
        return arr;
    };

    /**
     * 描述：对象或者数组拷贝
     * @param o
     * @returns {Array|*}
     */
    _frameWork.deepCopy = function (o) {
        if (o instanceof Array) {
            var n = [];
            for (var i = 0; i < o.length; ++i) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;

        } else if (o instanceof Object) {
            var n = {}
            for (var i in o) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;
        } else {
            return o;
        }
    };

    /**
     * 描述:函数防抖, 函数在特定的时间内不被再调用后执行。
     * @param func
     * @param wait
     */
    _frameWork.debounce = function (func, wait) {
        var timer = null;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
            func();
            timer = null;
        }, wait);
    };

    /**
     * 描述:函数节流,函数特定的时间内至多执行一次。
     * @param func
     * @param wait
     */
    _frameWork.throttle = function (func, wait) {
        var timer;
        wait = wait || 600;

        if (timer) {
            return;
        }
        timer = setTimeout(function () {
            func();
            timer = null;
        }, wait);
    };

    /**
     * 描述: 返回一个lower - upper之间的随机数
     * @param lower
     * @param upper
     * @returns {number}
     */
    _frameWork.randomNum = function (lower, upper) {
        lower = +lower || 0;
        upper = +upper || 0;
        return Math.floor(Math.random() * (upper - lower)) + lower;
    };

    /**
     * 描述: 休眠函数(模拟Thread.sleep())
     * @param timeout 休眠时间，单位为毫秒:
     */
    _frameWork.sleep = function (timeout) {
        var start = new Date().getTime();
        console.log('休眠前：' + start);
        while (true) {
            if (new Date().getTime() - start > timeout) {
                break;
            }
        }
    };

    /**
     * 接口描述：图文添加记录
     * @param id 内容id
     * @param code 个体标识(mf_code)
     * @param isTW 是否是图文
     * @param title 标题
     */
    _frameWork.addRecord = function (id, code, isTW, title) {
        //增加记录功能
        var type = window.location.hostname === 'localhost' ? 'UTLService2' : 'UTLService';
        var url = 'http://21.254.5.190/' + type + '/UIL/Trace/Handler.ashx';
        this.ajax.get(url + '?stbid=' + this.mw.getSTBID() + '&is_tw=' + isTW + '&cid=' + id + '&ctitle=' + title + '&mcode=' + code, function (data) {
            console.log(data);
        }, 0, function (msg) {

        }, 3000);
    };

    /**
     * 接口描述：根据parame.action的3种值获取对应的数据:
     * 1. 内容详细信息查询 action=detail (code/acode/fcode可选)
     * 2. 栏目下内容查询 action=content (fcode/index/items)
     * 3. 根据栏目编码查询所属栏目下的内容信息 action=vedio (fcode/acode/index/items)
     * @param parame  parame对象
     * @returns {string}
     */
    _frameWork.getVedioByDlw = function (parame) {
        var str = '';
        if (!parame.domain) parame.domain = '21.254.5.190';
        if (!parame.action) parame.action = 'detail';   //  默认内容详细信息查询
        var url = 'http://' + parame.domain + '/' + (window.location.hostname == 'localhost' ? 'UTLService2' : 'UTLService') +
            '/UIL/Vedio/Handler.ashx?';

        if (parame.action == 'detail') {  // 内容详细信息查询,必要参数code
            url += 'action=detail';
            if (!parame.code) return '缺少内容标识!';
            if (parame.scode) url += '&scode=' + parame.scode;    // 站点编号，默认：hzvsite
            parame.fcode ? url += '&fcode=' + parame.fcode : url += '&fcode=';   // 栏目编号，默认：空值
            url += '&code=' + parame.code;     // 内容标识
            if (parame.acode) url += '&acode=' + parame.acode; // 区域标识。杭网：HZ、省网：ZJ
            if (parame.pcode) url += '&pcode=' + parame.pcode; // 播放标识。杭网：hdds_ip、省网：swbq_ip（默认）
            if (parame.ptype) url += '&ptype=' + parame.ptype; // 播放方式（ip/ ipqam），默认：ip
        } else if (parame.action == 'content') {  // 栏目下内容查询,必要参数fcode
            url += 'action=content';
            if (!parame.fcode) return '缺少栏目编号!';
            if (parame.scode) url += '&scode=' + parame.scode;    // 站点编号，默认：hzvsite
            url += '&ccode=' + parame.fcode;     // 栏目编号
            if (parame.index) url += '&index=' + parame.index;  // 当前页面
            if (parame.items) url += '&items=' + parame.items; // 每页显示记录数 默认10
        } else if (parame.action == 'vedio') {    // 根据栏目编码查询所属栏目下的内容信息（含所属的视频地址）
            url += 'action=vedio';
            if (!parame.fcode) return '缺少栏目编号!';
            if (parame.scode) url += '&scode=' + parame.scode;    // 站点编号，默认：hzvsite
            url += '&ccode=' + parame.fcode;     // 栏目编号
            if (parame.index) url += '&index=' + parame.index;  // 当前页面
            if (parame.items) url += '&items=' + parame.items; // 每页显示记录数 默认10
            if (parame.acode) url += '&acode=' + parame.acode; // 区域标识。杭网：HZ、省网：ZJ
            if (parame.pcode) url += '&pcode=' + parame.pcode; // 播放标识。杭网：hdds_ip、省网：swbq_ip（默认）
            if (parame.ptype) url += '&ptype=' + parame.ptype; // 播放方式（ip/ ipqam），默认：ip
        }

        this.ajax.get(url, function (res) {
            str = res;
        }, 0, function (msg) {
            console.log(msg);
        }, 3000);
        return str;
    };

    /**
     * 描述: 跨域接口
     *  domain :125.210.121.66(外网)   21.254.5.190(内网)
     *  url: url
     *  data: ：data
     *  method: Http请求方式，由第三方接口定义
     *  type: 请求内容类型,可选值default/json/soap默认值：default
     *  url=@url&data=@data=&method=@method=&type=@type=
     * 重要说明：基于安全性要求，需要对XmlData中的左、右尖括号“<”、“>”替换为对应的Html字符“&lt;”、“&gt;”。
     * @param parame domain/type/url/data/method
     * @returns {string}
     */
    _frameWork.crossAjaxHandler = function (parame) {
        var str = '';
        if (!parame.domain) parame.domain = '21.254.5.190';
        if (!parame.type) parame.type = 'default';
        this.ajax.post('http://' + parame.domain + '/' + (window.location.hostname == 'localhost' ? 'UTLService2' : 'UTLService') + '/UIL/Cross/Handler2.ashx',
            'url=' + encodeURIComponent(parame.url) + '&data=' + encodeURIComponent(parame.data) + '&method=' + parame.method + '&type=' + parame.type
            , function (res) {
                str = res;
            }, 0, function (msg) {
                console.log(msg);
            }, 3000);
        return str;
    };

    /**
     * 描述: 隐藏字符串指定位置变*号(例如手机号处理)
     * @param str
     * @param frontLen  前面显示几位
     * @param endLen    后面显示几位
     * @returns {string}
     */
    _frameWork.hiddenPartStar = function (str, frontLen, endLen) {
        var len = str.length - frontLen - endLen;
        var xing = '';
        for (var i = 0; i < len; i++) {
            xing += '*';
        }
        return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
    };

    /**
     * 描述: msg显示弹窗. 事件关闭或者延迟关闭
     * @param _imgurl   弹窗背景图
     * @param _msg      弹窗内容
     * @param _callback
     * @param _time
     */
    _frameWork.showMsgInfo = function (_imgurl, _msg, _callback, _time) {
        var _self = this;
        if (this.isDomExist('hs_msg')) {
            _imgurl = _imgurl || 'http://21.254.5.190/frame/img/msg.png';
            this.createElem('div', {
                id: 'hs_msg',
                style: 'position:absolute;left:0px;top:0px;display:none;width:1280px;height:720px;z-index:1000;'
            });
            $('hs_msg').innerHTML = ' <img src="' + _imgurl + '" style="position: absolute;left: 0px; top: 0px;" alt="">' +
                '<div style="position: absolute;left: 444px; top: 254px;width: 362px;height: 104px;line-height: 26px; font-size: 20px;color: #ffffff;overflow: hidden" id="hs_msg_info"></div>';
        }
        $('hs_msg_info').innerHTML = _msg;
        this.toggleDisplay($('hs_msg'), 'show');
        if (_time) {
            setTimeout(function () {
                _self.toggleDisplay($('hs_msg'), 'none')
                if (typeof _callback == 'function') {
                    _callback();
                }
            }, _time);
        } else {
            this.addEvenToList(hs.defaultDoCode, function () {
                _self.toggleDisplay($('hs_msg'), 'hidde');
                if (typeof _callback == 'function') {
                    _callback();
                }
            });
            _frameWork.addEvenToList(hs.defaultBackCode, function () {
                _self.toggleDisplay($('hs_msg'), 'hidde');
                if (typeof _callback == 'function') {
                    _callback();
                }
            });
        }
    };

    /**
     *  描述: 显示全键盘
     * @param _left 左边距
     * @param _top  上边距
     * @param _keyArea  键盘焦点区域
     * @param _objId    需要赋值的DOM的id
     * @returns {string}
     */
    _frameWork.showKey = function (_left, _top, _keyArea, _objId) {
        var defalutLeft = 20;
        var defalutTop = 20;
        var key = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
        var leftArr = [1, 7, 13, 19, 25, 31];
        var rightArr = [6, 12, 18, 24, 30, 36];
        var str = '<img src="http://21.254.5.190/frame/img/key/key_bg.png" style="position:absolute;left:0px;top:0px;" />';
        _left = _left || 909;
        _top = _top || 166;
        var _self = this;
        if (this.isDomExist('hs_keyboard')) {
            _keyArea = _keyArea || 100;
            this.createElem('div', {
                id: 'hs_keyboard',
                style: 'position:absolute;left:' + _left + 'px;top:' + _top + 'px;width:280px;height:318px;z-index:100;display:none;'
            });

            this.forEach(key, function (item, i) {
                // i 从1开始
                i += 1;
                new fObject(_keyArea, i, "user_key_" + i,
                    i - 6 >= 1 ? "user_key_" + (i - 6) : null,
                    i + 6 <= key.length ? "user_key_" + (i + 6) : "user_key_37",
                    function () {
                        if (_self.arrayIsContains(leftArr, _self.focObj.objindex) > -1) {
                            _self.initFocus(_self.areaLastFocus[_self.prevArea].objid);
                        } else if (_self.focObj.objindex > 1) {
                            _self.initFocus("user_key_" + (_self.focObj.objindex - 1));
                        }
                    },
                    function () {
                        if (_self.arrayIsContains(rightArr, _self.focObj.objindex) > -1) {
                            _self.initFocus(_self.areaLastFocus[_self.prevArea].objid);
                        } else if (_self.focObj.objindex < key.length) {
                            _self.initFocus("user_key_" + (_self.focObj.objindex + 1));
                        }
                    });

                str += '<div style="position: absolute;left: ' + defalutLeft + 'px;top: ' + defalutTop + 'px;width: 40px;height: 40px;" id="user_key_' + i + '">' +
                    '<img src="http://21.254.5.190/frame/img/key/key_foc1.png" style="position: absolute;left: 0px;top: 0px;width: 40px;height: 40px;display: none">' +
                    '<div style="position: absolute;left: 0px;top: 0px;width: 40px;height: 40px;line-height: 40px;text-align: center;font-size: 22px;">' + key[(i - 1)] + '</div>' +
                    '</div>';
                defalutLeft += 40;
                if (!(i % 6)) {
                    defalutLeft = 20;
                    defalutTop += 40;
                }
            });

            str += '<div style="position: absolute;left: 20px;top: ' + defalutTop + 'px;width: 80px;height: 40px;" id="user_key_37">' +
                '<img src="http://21.254.5.190/frame/img/key/key_foc2.png" style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;display: none">' +
                '<div style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;line-height: 40px;text-align: center;font-size: 22px;">确定</div>' +
                '</div>';
            new fObject(_keyArea, 37, "user_key_37",
                "user_key_31", null, null, "user_key_38");
            str += '<div style="position: absolute;left: 100px;top: ' + defalutTop + 'px;width: 80px;height: 40px;" id="user_key_38">' +
                '<img src="http://21.254.5.190/frame/img/key/key_foc2.png" style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;display: none">' +
                '<div style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;line-height: 40px;text-align: center;font-size: 22px;">删除</div>' +
                '</div>';
            new fObject(_keyArea, 38, "user_key_38",
                "user_key_33", null, "user_key_37", "user_key_39");
            str += '<div style="position: absolute;left: 180px;top: ' + defalutTop + 'px;width: 80px;height: 40px;" id="user_key_39">' +
                '<img src="http://21.254.5.190/frame/img/key/key_foc2.png" style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;display: none">' +
                '<div style="position: absolute;left: 0px;top: 0px;width: 80px;height: 40px;line-height: 40px;text-align: center;font-size: 22px;">清空</div>' +
                '</div>';
            new fObject(_keyArea, 39, "user_key_39",
                "user_key_35", null, "user_key_38", null);

            $("hs_keyboard").innerHTML = str;
            this.fObjCommit();

            this.addFocus([_keyArea], function (group, id, index) {
                _frameWork.toggleDisplay($(id).getElementsByTagName('img')[0], 'show');
            });

            this.addBlur([_keyArea], function (group, id, index) {
                _frameWork.toggleDisplay($(id).getElementsByTagName('img')[0], 'hidden');
            });
        }
        this.addSelect([_keyArea], function (group, id, index) {
            if (index < 37) {
                var value = $(id).getElementsByTagName('div')[0].innerHTML;
                $(_objId).innerHTML += value;
            } else if (index == 37) {
                _self.initFocus(_objId);
            } else if (index == 38) {
                var value = $(_objId).innerHTML;
                $(_objId).innerHTML = value.substring(0, value.length - 1);
            } else if (index == 39) {
                $(_objId).innerHTML = '';
            }

        });
        this.toggleDisplay($("hs_keyboard"), 'show');
        return 'user_key_1';
    };

    /**
     * 描述: 显示九宫键盘,固定键盘距离容器上下左右10px
     * @param _left 左边距
     * @param _top  有边距
     * @param _width    宽
     * @param _height   高
     * @param _keyArea  键盘焦点区域
     * @param _target   显示输入键盘结果得目标, 包含objId/callbakc事件触发的回调函数
     * @param _fontSize 字体大小
     * @param _head     left(objiid/fn)/right(objiid/fn)/top(objiid/fn)/bottom(objiid/fn)/background
     */
    _frameWork.show9Key = function (_left, _top, _width, _height, _keyArea, _target, _fontSize, _head) {
        var _this = this;
        var str = '';
        var row_width = (_width - 20);
        var row_height = (_height - 20) / 4;
        var col_width = (_width - 20) / 3;
        var col_height = (_height - 20) / 4;
        var textDt = [];
        _fontSize = _fontSize || 20;

        if (!_head.background) _head.background = '#a5c9f4'; // 默认背景

        // 获取单元格对应的文字
        var getText = function (_index) {
            var testArr = [];
            switch (_index) {
                case 0:
                    testArr = [1];
                    break;
                case 1:
                    testArr = [2, 'A', 'B', 'C'];
                    break;
                case 2:
                    testArr = [3, 'D', 'E', 'F'];
                    break;
                case 3:
                    testArr = [4, 'G', 'H', 'I'];
                    break;
                case 4:
                    testArr = [5, 'J', 'K', 'L'];
                    break;
                case 5:
                    testArr = [6, 'M', 'N', 'O'];
                    break;
                case 6:
                    testArr = [7, 'P', 'Q', 'R', 'S'];
                    break;
                case 7:
                    testArr = [8, 'T', 'U', 'V'];
                    break;
                case 8:
                    testArr = [9, 'W', 'X', 'Y', 'Z'];
                    break;
            }
            return testArr;
        };

        //  获取为获焦时文字对应的html
        var getKeyHtml = function (_key) {
            var str = '';
            if (_key.length == 1) {
                return _key[0]
            }
            str += '<div style="position: absolute;left: 0;top: ' + (col_height / 2 - _fontSize * 1.1) + 'px;width: ' + col_width + 'px;height:' + _fontSize * 1.1 + 'px;line-height:' + _fontSize * 1.1 + 'px;">' + _key[0] + '</div>';
            str += '<div style="position: absolute;left: 0;top: ' + (col_height / 2 - _fontSize * 1.1 + _fontSize) + 'px;width: ' + col_width + 'px;height:' + _fontSize * 1.1 + 'px;line-height:' + _fontSize * 1.1 + 'px;">';
            for (var j = 1; j < _key.length; j++) {
                str += _key[j]
            }
            str += '</div>';
            return str;
        };

        if(this.isDomExist('hs_keyboard')){
            // 创建父容器
            this.createElem('div', {
                id: 'hs_keyboard',
                style: 'position:absolute;left:' + _left + 'px;top:' + _top + 'px;width:' + _width + 'px;height:' + _height + 'px;background:' + _head.background + ';font-size:' + _fontSize + 'px;display:none;z-index:100;'
            });

            //  创建行和列
            str += '<div style="position: absolute;left: 10px;top: ' + (0 * col_height + 10) + 'px;width: ' + row_width + 'px;height:' + row_height + 'px;line-height: ' + col_height + 'px;text-align: center;">' +
                '    <div id="hs_keyboard_0" style="position: absolute;left: 0;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(0)) + '</div>' +
                '    <div id="hs_keyboard_1" style="position: absolute;left: ' + col_width + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(1)) + '</div>' +
                '    <div id="hs_keyboard_2" style="position: absolute;left: ' + (2 * col_width) + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(2)) + '</div>' +
                '</div>' +
                '<div style="position: absolute;left: 10px;top: ' + (1 * col_height + 11) + 'px;width: ' + row_width + 'px;height: ' + row_height + 'px;line-height: ' + col_height + 'px;text-align: center;">' +
                '    <div id="hs_keyboard_3" style="position: absolute;left: 0;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(3)) + '</div>' +
                '    <div id="hs_keyboard_4" style="position: absolute;left: ' + col_width + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(4)) + '</div>' +
                '    <div id="hs_keyboard_5" style="position: absolute;left: ' + (2 * col_width) + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color:#000000;">' + getKeyHtml(getText(5)) + '</div>' +
                '</div>' +
                '<div style="position: absolute;left: 10px;top: ' + (2 * col_height + 11) + 'px;width: ' + row_width + 'px;height: ' + row_height + 'px;line-height: ' + col_height + 'px;text-align: center;">' +
                '    <div id="hs_keyboard_6" style="position: absolute;left: 0;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000;">' + getKeyHtml(getText(6)) + '</div>' +
                '    <div id="hs_keyboard_7" style="position: absolute;left: ' + col_width + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000000;">' + getKeyHtml(getText(7)) + '</div>' +
                '    <div id="hs_keyboard_8" style="position: absolute;left: ' + (2 * col_width) + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000000;">' + getKeyHtml(getText(8)) + '</div>' +
                '</div>' +
                '<div style="position: absolute;left: 10px;top: ' + (3 * col_height + 11) + 'px;width: ' + row_width + 'px;height: ' + row_height + 'px;line-height: ' + col_height + 'px;text-align: center;">' +
                '    <div id="hs_keyboard_9" style="position: absolute;left: 0;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000000;">回删</div>' +
                '    <div id="hs_keyboard_10" style="position: absolute;left: ' + col_width + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000000;">0</div>' +
                '    <div id="hs_keyboard_11" style="position: absolute;left: ' + (2 * col_width) + 'px;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;color: #000000;">清除</div>' +
                '</div>' +
                '<div style="position: absolute;left: 10px;top: ' + (col_height + 10) + 'px;width: ' + row_width + 'px;height: 1px;background-color: #000000"></div>' +
                '<div style="position: absolute;left: 10px;top: ' + (2 * col_height + 10) + 'px;width: ' + row_width + 'px;height: 1px;background-color: #000000"></div>' +
                '<div style="position: absolute;left: 10px;top: ' + (3 * col_height + 10) + 'px;width: ' + row_width + 'px;height: 1px;background-color: #000000"></div>' +
                '<div style="position: absolute;left: ' + (10 + col_width) + 'px;top: 10px;width: 1px;height: ' + row_height * 4 + 'px;background-color: #000000"></div>' +
                '<div style="position: absolute;left: ' + (10 + 2 * col_width) + 'px;top: 10px;width: 1px;height: ' + row_height * 4 + 'px;background-color: #000000"></div>';

            $('hs_keyboard').innerHTML = str;

            // 创建12个单元格焦点, 预留上下左右边界口
            for (var k = 0; k < 12; k++) {
                new fObject(_keyArea, k, 'hs_keyboard_' + k,
                    function (obj) {
                        if (obj.objindex > 2) {
                            hs.initFocus('hs_keyboard_' + (obj.objindex - 3));
                        } else if (_head.top) {
                            if (typeof _head.top == 'function') {
                                _head.top();
                            } else {
                                hs.initFocus(_head.top)
                            }
                        }
                    },
                    function (obj) {
                        if (obj.objindex < 9) {
                            hs.initFocus('hs_keyboard_' + (obj.objindex + 3));
                        } else if (_head.bottom) {
                            if (typeof _head.bottom == 'function') {
                                _head.bottom();
                            } else {
                                hs.initFocus(_head.bottom)
                            }
                        }
                    },
                    function (obj) {
                        if (_head.left && _this.arrayIsContains([0, 3, 6, 9], obj.objindex)) {
                            if (typeof _head.left == 'function') {
                                _head.left();
                            } else {
                                hs.initFocus(_head.left)
                            }
                        } else if (obj.objindex > 0) {
                            hs.initFocus('hs_keyboard_' + (obj.objindex - 1));
                        }
                    },
                    function (obj) {
                        if (_head.right && _this.arrayIsContains([2, 5, 8, 11], obj.objindex)) {
                            if (typeof _head.right == 'function') {
                                _head.right();
                            } else {
                                hs.initFocus(_head.right)
                            }
                        } else if (obj.objindex < 11) {
                            hs.initFocus('hs_keyboard_' + (obj.objindex + 1));
                        }
                    }
                )
            }
            this.fObjCommit();

            this.addFocus([_keyArea, _keyArea + 1], function (group, id, index) {
                if (group == _keyArea) {
                    $(id).style.backgroundColor = '#a4130f';
                    $(id).style.color = '#ffffff';
                } else {
                    $(id).style.backgroundColor = '#ffffff';
                    $(id).style.color = '#a4130f';
                }
            });

            this.addBlur([_keyArea, _keyArea + 1], function (group, id, index) {
                if (group == _keyArea) {
                    $(id).style.backgroundColor = 'transparent';
                    $(id).style.color = '#000000';
                } else {
                    $(id).style.backgroundColor = 'transparent';
                    $(id).style.color = '#ffffff';
                }
            });
        }

        this.addSelect([_keyArea, _keyArea + 1], function (group, id, index) {
            // 当单元格为2到9时(内容为2行时)
            if (group == _keyArea && index > 0 && index < 9) {
                var str = '';
                textDt = getText(index)
                str = '<div style="position: absolute;left: 0;top: 0;width: ' + col_width + 'px;height:' + col_height + 'px;">';

                for (var i = 0; i < textDt.length; i++) {
                    str += '<div id="hs_keyboard_d' + i + '" style="position: absolute;left: ' + (i * col_width / textDt.length) + 'px;top: 0;width: ' + (col_width / textDt.length) + 'px;height: ' + col_height + 'px;">' + textDt[i] + '</div>';
                    new fObject(_keyArea + 1, i, 'hs_keyboard_d' + i,
                        function (obj) {
                            $(_this.areaLastFocus[_keyArea].objid).innerHTML = getKeyHtml(getText(hs.areaLastFocus[_keyArea].objindex)); // 恢复单元格默认值
                            _this.initFocus(_this.areaLastFocus[_keyArea].objid, {holdOldFoc: true})
                        },
                        function (obj) {
                            $(_this.areaLastFocus[_keyArea].objid).innerHTML = getKeyHtml(getText(hs.areaLastFocus[_keyArea].objindex)); // 恢复单元格默认值
                            _this.initFocus(_this.areaLastFocus[_keyArea].objid, {holdOldFoc: true})
                        },
                        function (obj) {
                            if (obj.objindex > 0) {
                                _this.initFocus('hs_keyboard_d' + (obj.objindex - 1))
                            }
                        },
                        function (obj) {
                            if (obj.objindex < textDt.length - 1) {
                                _this.initFocus('hs_keyboard_d' + (obj.objindex + 1))
                            }
                        }
                    )
                }
                str += '</div>';
                $(id).innerHTML = str;
                _this.fObjCommit();
                _this.areaLastFocus[_keyArea + 1] = null;
                _this.initFocus('hs_keyboard_d0', {holdOldFoc: true})
            } else if (index == 9) {  //  回删
                var value = $(_target.objId).innerHTML;
                $(_target.objId).innerHTML = value.substring(0, value.length - 1);
                if (typeof _target.callback === 'function') _target.callback(group, id, index);
            } else if (index == 11) { // 清除
                $(_target.objId).innerHTML = '';
                if (typeof _target.callback === 'function') _target.callback(group, id, index);
            } else if (group == _keyArea + 1) { // 多行单元格选中的时候
                $(_target.objId).innerHTML += $(id).innerHTML; // 写
                $(_this.areaLastFocus[_keyArea].objid).innerHTML = getKeyHtml(getText(hs.areaLastFocus[_keyArea].objindex)); // 恢复单元格默认值
                _this.initFocus(_this.areaLastFocus[_keyArea].objid, {holdOldFoc: true})
                if (typeof _target.callback === 'function') _target.callback(group, id, index);
            } else {
                $(_target.objId).innerHTML += $(id).innerHTML; // 其他: 1, 0(单行数据)
                if (typeof _target.callback === 'function') _target.callback(group, id, index);
            }
        });
        _this.toggleDisplay($("hs_keyboard"), 'show');
        return 'hs_keyboard_0';
    };

    /**
     * 描述: 关闭键盘
     * @param _newObjid 关闭键盘后, 新获焦的id
     */
    _frameWork.hiddenKey = function (_newObjid) {
        if (_newObjid) this.initFocus(_newObjid);
        this.toggleDisplay($("hs_keyboard"), 'hidden');
    };

    /**
     * 显示log
     * @param msg
     */
    _frameWork.logi = function (msg) {
        if(this.isDomExist('hs_log')) {
            this.createElem('div',{
                id: 'hs_log',
                style: 'position: absolute;left: 50px;top: 20px;width: 1200px;height: 660px;color: #ff0000;z-index: 1111;font-size: 20px;line-height: 22px;'
            });
            $('hs_log').innerHTML = '<div id="hs_log_con" style="position: absolute;left: 0px;top: 0px;width: 1200px;color: #ff0000;z-index: 1111;font-size: 20px;line-height: 22px;"></div>'
        }

        $('hs_log_con').innerHTML += msg + '--' +new Date().getMinutes()+ '分' + new Date().getSeconds() + '秒' + '<br>';

        var height = $('hs_log_con').offsetHeight - $('hs_log_con').parentNode.offsetHeight;
        var nowheight = parseInt(this.getStyle($('hs_log_con'), "top"));
        if (nowheight > (-height)) {
            $('hs_log_con').style.top = -height + 'px';
        }
    }

    /**
     * 描述:根据数据分页, 返回指定页码数据;
     * @param _currentPage
     * @param _pageSize
     * @param _data
     * @returns {object} {data: [], totalPages: number, currentPage: *}
     */
    _frameWork.pagesTool = function (_currentPage,_pageSize,_data) {
        var res = {
            currentPage: _currentPage,
            totalPages: 0,
            data: []
        };
        res.totalPages = Math.ceil(_data.length / _pageSize);
        if(_currentPage > res.totalPages) _currentPage = res.totalPages;
        var start = (_currentPage - 1) * _pageSize;
        var end = _currentPage * _pageSize > _data.length ? _data.length : _currentPage * _pageSize;
        for (var i = start; i < end; i++) {
            res.data.push(_data[i]);
        }
        return res;
    };

    // 触屏选项启用
    // 禁用图片拖拽 ondragstart="return false"
    // window.ondragstart = function () {
    //     return false;
    // };
    // 禁用右键
    // window.addEventListener('contextmenu', (e) => {
    //     e.preventDefault();
    // }, false)

    //视频自动播放
    // chrome://flags/#autoplay-policy        设置成 no user gesture is required 就好了。
    // <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    /*
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-action:none;
        touch-action:none;
        cursor: default;
    */

});






