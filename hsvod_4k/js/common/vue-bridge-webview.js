(function () {
    /**
     *  vue-bridge-webview config
     *
     * @type {{bridgeWebViewDelay: number}}
     */
    var bridgeConfig = {
        bridgeWebViewDelay: 0.2 * 1000,
        callHandle: {}, // bridge android / ios
        silent: false
    }
    var $bridge = {
        registerHandler: function (name, callback) {
            if (bridgeConfig.silent) {
                //console.log(name,' register handler failure')
            }
            registerStatusIsOk = false;
        },
        callHandler: function (name, params, callback) {
            if (bridgeConfig.silent) {
                //console.log(name,' call handler webView failure')
            }
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
    // ==============device init operation end ============
    var bridgeStatusIsOk = false;
    var registerStatusIsOk = true;
    var VueBridgeWebView = {
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
                    var isFirstRegisterHandlerSuccess = false;
                    var countRegister = 0;
                    var webviewRegisterTimer = setInterval(function () {
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
                //console.log("don't built-in WebView invoking ",name,'{registerHandler}')
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
                        if (typeof callback == 'function') {
                            callback(data)
                        }
                    });

                } else {
                    var isFirstCallHandlerSuccess = false;
                    var count = 0;
                    var webviewJavescriptTimer = setInterval(function () {
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
                                if (typeof callback == 'function') {
                                    callback(data)
                                }
                            });
                        }
                        count++;
                    }, bridgeConfig.bridgeWebViewDelay);
                }

            } else {
                //console.log("don't built-in WebView invoking ",name,'{callHandler}')
            }
        }
    }
    if (typeof exports == "object") {
        module.exports = VueBridgeWebView;
    } else if (typeof define == "function" && define.amd) {
        define([], function () { return VueBridgeWebView; })
    } else if (window.Vue) {
        window.$bridge = VueBridgeWebView
        Vue.use(VueBridgeWebView);
    } else {
        window.$bridge = VueBridgeWebView
    }
})()