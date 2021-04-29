/**
 *  vue-bridge-webview config
 *
 */

let bridgeConfig = {
  bridgeWebViewDelay: 0.2 * 1000,
  callHandle: {}, // bridge android / ios
  silent: false,
  isBrowser: true //参数控制是在浏览器还是机顶盒上面
}

let $bridge = {
  registerHandler: function (name, callback) {
    if (bridgeConfig.silent) {
      console.log(name, ' register handler failure')
    }
    registerStatusIsOk = false;
    // callback('registerHandler-' + name + '-pc')
  },
  callHandler: function (name, params, callback) {
    if (bridgeConfig.silent) {
      console.log(name, ' call handler webView failure')
    }
    // callback('callHandler-' + name + '-pc')
  }
};


/* 用于创建桥接对象的函数 , android 初始化 */
function connectWebViewJavascriptBridge(callback) {
  //如果桥接对象已存在，则直接调用callback函数
  if (window.HtmlAndApkBridge) {
    window.HtmlAndApkBridge.init(function (message, responseCallback) {
    })
    callback(window.HtmlAndApkBridge)
  }
  //否则添加一个监听器来执行callback函数
  else {
    document.addEventListener('HtmlAndApkBridgeReady', function () {
      HtmlAndApkBridge.init(function (message, responseCallback) {
      })
      callback(HtmlAndApkBridge)
    }, false)
  }
}

/* device detect for android */
connectWebViewJavascriptBridge(function (bridge) {
  $bridge = bridge
})


// =====================device init operation end ==================

let bridgeStatusIsOk = false;
let registerStatusIsOk = true;
let VueBridgeWebview = {

  install: function (Vue) {
    Vue.prototype.$bridge = this

    Vue.bridge = this

    // config
    bridgeConfig.slient = Vue.config.slient

  },

  /**
   *  Android调用JS,需要明确调用的`function名称` .
   *
   *
   * @param name `function name`
   * @param registerCallback 回调的响应事件
   */
  registerHandler: function (name, registerCallback) {
    if ($bridge['registerHandler']) {
      if (bridgeStatusIsOk) {
        //console.log("registerHandler bridgeStatusIsOk")
        $bridge.registerHandler(name, registerCallback)
      } else {
        let isFirstRegisterHandlerSuccess = false;
        let countRegister = 0;
        let webviewRegisterTimer = setInterval(function () {
          if (!isFirstRegisterHandlerSuccess) {
            if (countRegister > 25) {
              clearInterval(webviewRegisterTimer);
              return false;
            }
            $bridge.registerHandler(name, registerCallback);
            if (registerStatusIsOk) {
              //console.log("registerHandler registerStatusIsOk: countRegister=" + countRegister)
              clearInterval(webviewRegisterTimer);
              isFirstRegisterHandlerSuccess = true;
              bridgeStatusIsOk = true;
            } else {
              //console.log("registerHandler registerStatusIs not Ok:countRegister=" + countRegister)
              registerStatusIsOk = true;
            }
          }
          countRegister++;
        }, bridgeConfig.bridgeWebViewDelay);

      }

    } else {
      console.log("don't built-in WebView invoking ", name, '{registerHandler}')
    }
  },

  /**
   *  JS 调用 Android
   *
   *  name: 回调名称, android 名称 ,eg: 'callHandler'
   *  params 请求参数, eg: { 'userId' : 1}
   *  callback: response(响应函数)
   *
   *  eg: this.$bridge.callHandler('getUserInfo',{'userId':1},function(data){...})
   *
   */
  callHandler: function (name, params, callback) {

    if ($bridge['callHandler']) {
      /* 解决部分系统加载延迟导致 android 不响应问题 */
      if (bridgeStatusIsOk) {
        $bridge.callHandler(name, params, function (data) {
          if (typeof callback === 'function') {
            callback(data)
          }
        });

      } else {
        let isFirstCallHandlerSuccess = false;
        let count = 0;
        let webviewJavescriptTimer = setInterval(function () {
          if (!isFirstCallHandlerSuccess) {
            if (count > 25) {
              clearInterval(webviewJavescriptTimer);
              return false;
            }
            //console.log("callHandler : count=" + count)
            $bridge.callHandler(name, params, function (data) {
              //回调到这里，可以确定连接桥已经ok, 取消计时器
              if (isFirstCallHandlerSuccess) {
                return;
              }
              clearInterval(webviewJavescriptTimer);
              isFirstCallHandlerSuccess = true;
              bridgeStatusIsOk = true;
              if (typeof callback === 'function') {
                callback(data)
              }
            });
          }
          count++;
        }, bridgeConfig.bridgeWebViewDelay);
      }

    } else {
      console.log("don't built-in WebView invoking ", name, '{callHandler}')
    }
  },

  // 封装API
  bridgeObj: function (_parm) {
    //是否包含视频播放，包含的话需先关闭播放器再退出
    this.havePlayer = (typeof _parm.havePlayer === "undefined") ? false : _parm.havePlayer;
    //返回类型,1表示退出原生浏览器，2表示返回上一级
    this.returnType = (typeof _parm.returnType === "undefined") ? 2 : _parm.returnType;
    // 初始化视频播放参数
    this.vedioInfo = (typeof _parm.vedioInfo === "undefined") ? {} : _parm.vedioInfo;
    this.movies = (typeof _parm.movies === "undefined") ? [] : _parm.movies;  //  播放的视频流
    this.playUrl = "";  //  当前播放视频流
    this.countFlag = 0; //  默认播放第一个视频流
    this.whenKeyBack = null;  // 自定义返回函数
    this.stbid = "";//获取机顶盒号
    this.playState = false  // 播放状态
    this.keyCode = null // 监听到的键值
    this.closeing = false // 是否正在关闭(防止重复关闭, 也将播放放到关闭后, 防止关闭的回调停止新播放)
    this.listenerDridge = new function () {
      // 私有变量
      // 全局配置信息
      var _config = {
          // 是否开启多级作用域
          multiLevel: true,
          // 发布者发布后，订阅者相关动作是否需要删除
          removeNow: false,
        },
        _receives = {},
        _this = this;
      // 订阅者
      // 需要传入订阅类型，动作
      this.subscribe = function (type, action, removeNow) {
        // 初始化
        removeNow = removeNow || _config.removeNow;
        // 对应的level
        var level = _createLevel(type);
        level.actions = level.actions || [];
        // 保证传入的是函数
        if (action instanceof Function) {
          level.actions.push({
            action: action,
            removeNow: removeNow
          });
        }
        // console.log(_receives);
        return _this
      };
      // 发布者
      // 需要传入发布类型和数据
      this.publish = function (type, data) {
        // 初始化
        // 获取对应actions
        var level = _searchLevel(type)
        if (Object.keys(level).length === 0) return
        var actions = level.actions;

        // 遍历执行actions里的函数
        for (var i = 0, len = actions.length; i < len; i++) {
          actions[i].action.call(null, data);
          if (actions[i].removeNow) {
            actions.splice(i, 1);
          }
        }
        // console.log(_receives);
        return _this
      };

      // 取消指定或者全部订阅
      this.off = function (type, action) {
        // 初始化
        // 获取对应actions
        var level = _searchLevel(type)
        if (Object.keys(level).length === 0) return
        var actions = level.actions;

        // action == 'undefined' 表示清空
        if (action === undefined || action === null) {
          level.actions = []
          // console.log(_receives);
          return _this
        }

        for (var i = 0, len = actions.length; i < len; i++) {
          if (actions[i].action === action) {
            actions.splice(i, 1);
          }
        }
        // console.log(_receives);
        return _this
      };

      // 寻找执行的Level
      var _searchLevel = function (type) {
        var receives = _receives,
          multiLevel = _config.multiLevel;
        if (multiLevel) {
          // 有多级作用域
          try {
            // 分割type取得各级作用域
            var types = type.split('.');
            for (var i = 0, len = types.length; i < len; i++) {
              if (receives[types[i]]) {
                receives = receives[types[i]];
              }
            }
            return receives || {};
          } catch (e) {
            console.log(e);
          }
        } else {
          return receives[type];
        }
      }
      // 创建对应的Level
      var _createLevel = function (type) {
        var receives = _receives,
          multiLevel = _config.multiLevel;
        if (multiLevel) {
          // 有多级作用域
          try {
            var types = type.split('.');
            for (var i = 0, len = types.length; i < len; i++) {
              // 有则选择，无则初始化
              receives[types[i]] = receives[types[i]] || {};
              receives = receives[types[i]];
            }
          } catch (e) {
            console.log(e);
          }
        } else {
          receives[type] = receives[type] || {};
          receives = receives[type];
        }

        // console.log(_receives);
        return receives;
      };
    };

    //存储数据 key-value对,response===1表示保存成功,response===0表示保持失败
    this.sharepreSave = function (data) {
      VueBridgeWebview.callHandler('wasu_function_sharepreference_save', {
        'shareprefname': data.name,
        'key': data.key,
        'value': data.value
      }, function (response) {
        console.log("wasu_function_sharepreference_save" + response)
      });
    }
    // 取存储数据
    this.getSharepreValue = function (data) {
      VueBridgeWebview.callHandler('wasu_function_shareprefrence_get', {
        'shareprefname': data.name,
        'key': data.key
      }, function (response) {
        console.log("wasu_function_shareprefrence_get" + response)
      });
    }
    // 删除存储里 key对应的名值对,response===1表示删除成功,response===0表示删除失败
    this.delSharepreValue = function (data) {
      HtmlAndApkBridge.callHandler('wasu_function_shareprefrence_remove', {
        'shareprefname': data.name,
        'key': data.key
      }, function (response) {
        console.log("wasu_function_shareprefrence_remove" + response)
      })
    }
    //获取当前网络状态,response===1表示网络已经打开,response===0表示网络已经关闭
    this.getCurrentNetworkStatus = function () {
      VueBridgeWebview.callHandler('wasu_function_getCurrentNetworkStatus', {}, function (response) {
        console.log('wasu_function_getCurrentNetworkStatus', response)
      })
    }
    // 获取当前分辨率
    this.getCurrentResolution = function () {
      VueBridgeWebview.callHandler('wasu_function_currentResolution', {}, function (response) {
        console.log("width:" + response.screenWidth + " height:" + response.screenHeight)
      })
    }
    //获取用户特性,response是String类型的字符串
    this.getUserProfile = function () {
      VueBridgeWebview.callHandler('wasu_function_UserProfile', {}, function (response) {
        console.log('wasu_function_UserProfile', response);
      })
    }
    //获取机顶盒时间,response为long型对象
    this.getStbidTime = function (fn) {
      // fn(1557372249757)  // test
      VueBridgeWebview.callHandler('wasu_function_dateTime', {}, function (response) {
        if (typeof fn === 'function') fn(response)
        console.log('wasu_function_dateTime' + response);
      })
    }
    this.getStbid = function () {
      let _this = this;
      VueBridgeWebview.callHandler('wasu_function_getTvid', {}, function (response) {
        _this.stbid = response;
        return _this.stbid;
      })
    }
    /**
     *  type是视频格式：2:表示hls, 4:表示rtsp格式，5:表示直播格式
     *  isFull:0, 0:表示视频窗不是全屏，1:表示视频窗是全屏的
     *  position表示从什么开始播放, position单位为秒
     */
    this.initPlay = function (callback) {//获取到rtsp后调用初始化方法
      let _this = this;
      if (_this.movies.length > 0) {
        _this.playUrl = _this.movies[_this.countFlag];
        // 有下一个的时候++
        if (_this.countFlag < _this.movies.length - 1) _this.countFlag++;
        VueBridgeWebview.callHandler('wasu_player_init_withUrl', {
          'url': _this.playUrl,
          'type': 4,
          'isFull': 0
        }, function (response) {
          _this.play(0)
        });
      }
    };
    this.play = function (pos, callback) {
      let position = pos !== undefined ? pos : 0
      VueBridgeWebview.callHandler('wasu_player_play', {
        position: position
      }, function (response) {
        if (typeof callback) callback(response)
      });
    }
    // 暂停播放
    this.pause = function (callback) {
      let _this = this;
      VueBridgeWebview.callHandler('wasu_player_pause', {}, function (response) {
        _this.getCurrentPosition(function (res) {
          if (typeof callback) callback(res)
        })
      });
    }
    // 获取总时长 response为long类型的值，单位毫秒
    this.getDuration = function (callback) {
      let _this = this;
      VueBridgeWebview.callHandler('wasu_player_getDuration', {}, function (response) {
        if (typeof callback) callback(response)
      });
    }
    // 获取当前播放位置  response为long类型的值，单位毫秒
    this.getCurrentPosition = function (callback) {
      let _this = this;
      VueBridgeWebview.callHandler('wasu_player_getCurrentPosition', {}, function (response) {
        if (typeof callback) callback(response)
      });
    }
    // 快进快退
    this.seek = function (currentPos) {
      let _this = this;
      VueBridgeWebview.callHandler('wasu_player_seek', {'timeMillis': currentPos}, function (response) {

      });
    }
    this.selectPlayIndex = function (index) {
      this.countFlag = index;
      this.playVod();
    };
    this.playVod = function () {//根据资产索引进行播放
      let _this = this;
      _this.playUrl = _this.movies[_this.countFlag];
      if (_this.countFlag >= _this.movies.length - 1) {
        _this.countFlag = 0;
      } else {
        _this.countFlag++;
      }
      VueBridgeWebview.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
        if (response === 1) {//是否全屏状态保持一致
          VueBridgeWebview.callHandler('wasu_player_play_withUrl', {
            'url': _this.playUrl,
            'type': 4,
            'isFull': 1
          }, function (response) {
          });
        } else {
          VueBridgeWebview.callHandler('wasu_player_play_withUrl', {
            'url': _this.playUrl,
            'type': 4,
            'isFull': 0
          }, function (response) {
          });
        }
      });
    };
    // 订购
    this.gotoApplication2order = function (parame) {// 鉴权播控
      let parameObj = {
        'packageName': 'com.wasu.launcher',
        'className': 'com.wasu.origin.order.OrderActivity',
        'orderType': 'TYPE_QUICK_ORDER',
        'ppv': parame.ppvId,
        "columnAlias": parame.columnAlias
      }
      VueBridgeWebview.callHandler('wasu_function_gotoApplication', parameObj, function (data, responseCallback) {
      });
    }
    // 根据播放地址播放播
    this.gotoApplication2play = function (parame) {// 鉴权播控
      let parameObj = {
        'packageName': 'com.wasu.launcher',
        'className': 'com.wasu.videoplay.vod.urlplayer.UrlPlayerActivity',
        'vodPlayUrl': parame
      }
      VueBridgeWebview.callHandler('wasu_function_gotoApplication', parameObj, function (data, responseCallback) {
      });
    }
    this.fullScreen = function () {//进入全屏模式
      VueBridgeWebview.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {
        if (response === 1) {
          VueBridgeWebview.callHandler('wasu_player_Exit_fullScreen', {}, function (response) {
          });
        } else {
          VueBridgeWebview.callHandler('wasu_player_Enter_fullScreen', {}, function (response) {
          });
        }
      });
    }
    this.locationFunc = function (func) {//在页面跳转前调用
      let _this = this
      if (this.havePlayer === true) {
        VueBridgeWebview.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
          if (response === 1) {//全屏时退出全屏
            VueBridgeWebview.callHandler('wasu_player_Exit_fullScreen', {}, function (response) {
            })
          } else {//否则退出页面
            VueBridgeWebview.callHandler('hideJieCaoVideoPlayer', {}, function (response) {//隐藏播放器
              VueBridgeWebview.callHandler('wasu_player_stop', {}, function (response) {//停止播放
                if (typeof func === "function") {
                  _this.playState = false
                  _this.closeing = false
                  func();
                }
              })
            })
          }
        })
      }
    }
    // 自定义返回函数,当有时, 无时参数1就退出浏览器,否则返回上一页
    this.leavePage = function () {//离开页面的方法
      if (typeof this.whenKeyBack === "function") {
        this.whenKeyBack();
      } else {
        if (this.returnType === 1) {//退出原生浏览器
          VueBridgeWebview.callHandler('wasu_function_exit_browser', {}, function (response) {
          })
        } else {//返回上一级
          window.history.go(-1);
        }
      }
    };
    this.closeVedio = function (func) {
      let _this = this
      _this.closeing = true
      VueBridgeWebview.callHandler('hideJieCaoVideoPlayer', {}, function (response) {//隐藏播放器
        VueBridgeWebview.callHandler('wasu_player_stop', {}, function (response) {//停止播放
          _this.closeing = false
          _this.playState = false
          if (typeof func === 'function') func()
        })
      })
    };
    this.returnVedio = function () {//退出播放器的方法
      let _this = this;
      VueBridgeWebview.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
        if (response === 1) {//全屏时退出全屏
          VueBridgeWebview.callHandler('wasu_player_Exit_fullScreen', {}, function (response) {
          })
        } else {//否则退出页面
          _this.closeVedio(_this.leavePage())
        }
      })
    };

    // 设置 bound
    this.setBound = function (parame) {
      // let parame = {
      //   content: '1920*1080',
      //   offsetLeft: 0,
      //   offsetTop: 0,
      //   width: 1280,
      //   height: 1080
      // }
      VueBridgeWebview.callHandler('wasu_player_setBound', parame, function (response) {

      })
    };

    this.receiveEvent = function () {
      let _this = this;
      bridgeConfig.isBrowser = false;
      VueBridgeWebview.registerHandler('receiveAnyEventFromAndroid', function (data, responseCallback) {
        if (data.type === "key_event") {//  监听按键消息
          if (data.action === 1) {
            _this.keyCode = data.keycode
            if (data.keycode === 8) {// 根据安卓的键值，退出播放
              if (_this.havePlayer === true) {
                _this.returnVedio();
              } else {
                _this.leavePage();
              }
            }
          }
        } else if (data.type === "play_event") {//监听系统播放消息
          //this.changetext("playstatus", data.play_code, data.play_type);//打印播放状态
          //处理连播
          if (data.play_type === 2) {//VODEvent.TYPE_STOP
            if (data.play_code === 4) {//VODEvent.REASON_VOD_ANNOUNCE
              // 播放完成
              //setTimeout(function(){
              _this.playVod();
              //},2000);
            }
          } else if (data.play_type === 0) {  //VODEvent.TYPE_SUCCESS
            if (data.play_code === 1) { //  VODEvent.REASON_VOD_PLAY
              // 点播开始播放
              // 重新设置播放位置.
              _this.setBound(_this.vedioInfo)
              _this.playState = true
              _this.listenerDridge.publish('action.onPlay', data)
            }
          }
        } else if (data.type === "voice_event") { //  语音
          //data.voice_content就是语音的具体内容
          _this.listenerDridge.publish('action.voice', data.voice_content)
        }
      });
    };
    this.changetext = function (id, playcode, playtype) {
      if (playtype === 60) {
        if (playcode === 2) {//TYPE_VOD_SUCCESS
          $(id).innerHTML = "播放状态：点播暂停成功";
        }

      } else if (playtype === 0) {//  VODEvent.TYPE_SUCCESS
        if (playcode === 1) { //  VODEvent.REASON_VOD_PLAY
          $(id).innerHTML = "播放状态：点播开始播放";
          HtmlAndApkBridge.callHandler('wasu_player_getDuration', {}, function (response) {
            //add("wasu_player_getDuration" + response);
          });
        } else {
          $(id).innerHTML = "播放状态：直播开始播放";
        }

      } else if (playtype === 2) {//VODEvent.TYPE_STOP
        if (playcode === 4) {//VODEvent.REASON_VOD_ANNOUNCE
          $(id).innerHTML = "播放状态：点播播放完成";
        }

      } else if (playtype === 61) {//VODEvent.TYPE_VOD_ERROR
        $(id).innerHTML = "播放状态：点播播放错误";
      } else if (playtype === 1) {//PlayerEvent.TYPE_START:
        if (playcode === 402) {//VODEvent.REASON_TRANSPORT_ERR_402
          $(id).innerHTML = "播放状态：无信号";
        } else if (playcode === 403) {//VODEvent.REASON_TRANSPORT_LOCK_403
          $(id).innerHTML = "播放状态：cable线插入";
        } else if (playcode === 2099) {//VODEvent.REASON_CA_code_2099
          $(id).innerHTML = "播放状态：播放成功";
        }
      } else if (playtype === 3) {//VODEvent.TYPE_FAIL
        if (playcode === 463 || playcode === 401) {//VODEvent.REASON_VOD_ERR_463 | VODEvent.REASON_TRANSPORT_ERR_401
          $(id).innerHTML = "播放状态：自动频点切换/未插电缆";
        } else if (playcode === 460) {//PlayerEvent.REASON_VOD_ERR_460
          $(id).innerHTML = "播放状态：连接失败";
        } else if (playcode === 470) {//PlayerEvent.REASON_DECODE_ERR_470
          $(id).innerHTML = "播放状态：解码失败";
        } else if (playcode === 441 || playcode === 2311) {//PlayerEvent.REASON_CARD_ERR_441 || PlayerEvent.REASON_DVNCA_code_2311
          $(id).innerHTML = "播放状态：CA卡无效！";
        } else if (playcode === 2109 || playcode === 2125 || playcode === 2205 || playcode === 2317) {//PlayerEvent.REASON_CDCA_code_2109
          $(id).innerHTML = "播放状态：节目未授权";
        } else if (playcode === 2316) {//PlayerEvent.REASON_DVNCA_code_2316
          $(id).innerHTML = "播放状态：节目授权已过期";
        } else if (playcode === 2320 || playcode === 2323) {//PlayerEvent.REASON_DVNCA_code_2320 | PlayerEvent.REASON_DVNCA_code_2323
          $(id).innerHTML = "播放状态：智能卡过期";
        } else if (playcode === 2112 || playcode === 2207 || playcode === 2313) {//PlayerEvent.REASON_CDCA_code_2112 | PlayerEvent.REASON_SGCA_code_2207 |PlayerEvent.REASON_DVNCA_code_2313
          $(id).innerHTML = "播放状态：区域码错误";
        } else if (playcode === 2118) {//PlayerEvent.REASON_CDCA_code_2118
          $(id).innerHTML = "播放状态：智能卡休眠";
        } else if (playcode === 2202 || playcode === 2108 || playcode === 2307) {//PlayerEvent.REASON_SGCA_code_2202 | PlayerEvent.REASON_CDCA_code_2108 | PlayerEvent.REASON_DVNCA_code_2307
          $(id).innerHTML = "播放状态：机卡未对应";
        } else {
          //id.innerHTML="播放状态：播放失败";
        }
      } else if (playtype === 64) {//VODEvent.TYPE_PING_TIMEOUT
        if (playcode === 8) {//VODEvent.REASON_VOD_PING
          $(id).innerHTML = "播放状态：网络断开";
        }
      } else if (playtype === 65) {//VODEvent.TYPE_PING_SUCCESS
        if (playcode === 9) {//VODEvent.REASON_VOD_PING_SUCCESS
          $(id).innerHTML = "播放状态：网络连上";
        }
      }
    }
    this.receiveEvent();
    this.getStbid();
  },
  getBridgeObj: function (prame) {
    return new this.bridgeObj(prame)
  }
}

function jundgeNull(str) {
  if (str !== null && str !== "" && str !== "undefined" && str !== undefined) {
    return true;
  } else {
    return false;
  }
}

/*
if (typeof exports === "object") {
  module.exports = VueBridgeWebView;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return VueBridgeWebView;
  })
} else if (window.Vue) {
  window.$bridge = VueBridgeWebView
  Vue.use(VueBridgeWebView);
} else {
  window.$bridge = VueBridgeWebView
}*/

export default VueBridgeWebview

