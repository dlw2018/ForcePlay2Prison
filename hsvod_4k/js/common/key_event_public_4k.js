// 参数控制是在浏览器还是机顶盒上面
var isBrowser = true;
var showTimeOut = -1;
var playStatus = -1;
var playGapTime = 30000;
/***********************************封装播放器对象**************************************************/
function BridgeApk(_parm) {
	// 是否包含视频播放，包含的话需先关闭播放器再退出
	this.havePlayer = (typeof _parm.havePlayer == "undefined") ? false : _parm.havePlayer;
	// 返回类型,1表示退出原生浏览器，2表示返回上一级
	this.returnType = (typeof _parm.returnType == "undefined") ? 2 : _parm.returnType;
	// 播放的视频流
	this.movies = (typeof _parm.movies == "undefined") ? [] : _parm.movies;
	// 当前播放视频流
	this.playUrl = "";
	// 默认播放第一个视频流
	this.countFlag = 0;
	this.whenKeyBack = null;
	// 视频总时长
	this.playDuration = 0;
	// 视频播放时长
	this.playElapsed = 0;
	// 机顶盒号
	this.stbid = "";
	// 该方法异步获取机顶盒号，操作只能回调进行，可直接通过cookie获取
	this.getStbid = function () {
		var _this = this;
		window.$bridge.callHandler('wasu_function_getTvid', {}, function (response) {
			_this.stbid = response;
			if (!jundgeNull(_this.stbid)) {
				_this.stbid = "030183762A8BD3A9F45A3";
			}
		})
	}
	// 获取到rtsp后调用初始化方法
	this.initPlay = function () {
		var _this = this;
		if (_this.movies.length > 0) {
			_this.playUrl = _this.movies[_this.countFlag];
			window.$bridge.callHandler('wasu_player_init_withUrl', { 'url': _this.playUrl, 'type': 4, 'isFull': 1 }, function (response) {
				window.$bridge.callHandler('wasu_player_play', {}, function (response) {playStatus = 0;});
			});
		}
	};
	// 根据资产索引进行播放
	this.playVod = function () {
		var _this = this;
		if (_this.countFlag >= _this.movies.length - 1) {
			_this.countFlag = 0;
		} else {
			_this.countFlag++;
		}
		_this.playUrl = _this.movies[_this.countFlag];
		window.$bridge.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
			if (response == 1) {//是否全屏状态保持一致
				window.$bridge.callHandler('wasu_player_play_withUrl', { 'url': _this.playUrl, 'type': 4, 'isFull': 1 }, function (response) { });
			} else {
				window.$bridge.callHandler('wasu_player_play_withUrl', { 'url': _this.playUrl, 'type': 4, 'isFull': 0 }, function (response) { });
			}
		});
	};
	this.selectPlayIndex = function (index) {
		this.countFlag = index;
		this.playVod();
	}
	// 进入全屏模式
	this.fullScreen = function () {
		window.$bridge.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {
			if (response == 1) {
				window.$bridge.callHandler('wasu_player_Exit_fullScreen', {}, function (response) { });
			} else {
				window.$bridge.callHandler('wasu_player_Enter_fullScreen', {}, function (response) { });
			}
		});
	}
	// 在页面跳转前调用
	this.locationFunc = function (func) {
		if (typeof func == "function") {
			if (this.havePlayer) {
				window.$bridge.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
					if (response == 1) {//全屏时退出全屏
						window.$bridge.callHandler('wasu_player_Exit_fullScreen', {}, function (response) { })
					} else {//否则退出页面
						window.$bridge.callHandler('hideJieCaoVideoPlayer', {}, function (response) {//隐藏播放器
							window.$bridge.callHandler('wasu_player_stop', {}, function (response) {//停止播放
								func();
							})
						})
					}
				})
			}
		}
	}
	// 离开页面的方法
	this.leavePage = function () { 
		if (typeof this.whenKeyBack == "function") {
			this.whenKeyBack();
		}
		else {
			if (this.returnType == 1) {//退出原生浏览器
				window.$bridge.callHandler('wasu_function_exit_browser', {}, function (response) { })
			} else {//返回上一级
				window.history.go(-1);
			}
		}
	};
	// 退出全屏播放
	this.returnVedio = function () { 
		// p.log('调用 returnvideo')
		var _this = this;
		window.$bridge.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
			// p.log('判断是否为全屏' + response)
			if (response == 1) {//全屏时退出全屏
				window.$bridge.callHandler('wasu_player_Exit_fullScreen', {}, function (response) { })
			} else {//否则退出页面
				window.$bridge.callHandler('hideJieCaoVideoPlayer', {}, function (response) {//隐藏播放器
					// p.log('隐藏播放器')
					window.$bridge.callHandler('wasu_player_stop', {}, function (response) {//停止播放
						// p.log('暂停播放器')
						_this.leavePage();
					})
				})
			}
		})
	};
	// 退出播放
	this.closeVedio = function () { 
		// p.log('调用 closeVedio')
		window.$bridge.callHandler('wasu_player_isSwithtoFullScreen', {}, function (response) {//判断是否全屏
			// p.log('判断是否为全屏' + response)
			if (response == 1) {//全屏时退出全屏
				window.$bridge.callHandler('wasu_player_Exit_fullScreen', {}, function (response) { })
			} 
			window.$bridge.callHandler('hideJieCaoVideoPlayer', {}, function (response) {//隐藏播放器
				// p.log('隐藏播放器')
				window.$bridge.callHandler('wasu_player_stop', {}, function (response) {//停止播放
					// p.log('暂停播放器')
					_this.leavePage();
				})
			})
		})
	};
	// 注册事件监听
	this.receiveEvent = function () {
		var _this = this;
		window.$bridge.registerHandler('receiveAnyEventFromAndroid', function (data, responseCallback) {
			// 一旦注册键值监听认为是在机顶盒上
			isBrowser = false;
			// p.log("dataType="+data.type+",dataAction="+data.action+",dataKeyCode="+data.keycode);
			if (data.type == "key_event" && data.action == 1 && data.keycode == 8) {
				// 返回操作
				if (_this.havePlayer) {
					_this.returnVedio();
				} else {
					_this.leavePage();
				}
			} 
			else if (data.type == "key_event" && data.action == 1 && data.keycode == 13){
				// 确定操作
				if (playStatus == 0){_this.pausePlay();}
				else if (playStatus == 4) {
					_this.getCurrentPosition();
					_this.resumePlay(_this.playElapsed);
				}
				else{}
			}
			else if (data.type == "key_event" && data.action == 1 && data.keycode == 303){
				// 快进操作
				_this.seekVedio("FF");
			}
			else if (data.type == "key_event" && data.action == 1 && data.keycode == 302){
				// 快退操作
				_this.seekVedio("FB");
			}
			else if (data.type == "play_event" && data.play_type == 2 && data.play_code == 4) {
				// 播放状态：点播播放完成，处理连播逻辑
				// _this.playVod();
				_this.returnVedio();
			}
		});
	};
	this.receiveEvent();
	// 暂停播放
	this.pausePlay = function () {
		var _this = this;
		window.$bridge.callHandler('wasu_player_pause',{},function(response){
			if (response==1){
				playStatus = 4;
				_this.getCurrentPosition();
				_this.getDuration();
				window.clearTimeout(showTimeOut);
				showTimeOut = window.setTimeout(function(){_this.showNavigateInfo(_this.playElapsed);},300)
			}
			else {console.log("暂停失败");}
		});
	};
	// 恢复播放
	this.resumePlay = function(posValue){
		var _this = this;
		window.$bridge.callHandler('wasu_player_play',{'position': posValue},function(response){
			if (response==1){
				playStatus = 0;
				_this.getCurrentPosition();
				_this.getDuration();
				window.clearTimeout(showTimeOut);
				showTimeOut = window.setTimeout(function(){_this.showNavigateInfo(_this.playElapsed);},300)
			}
			else {console.log("恢复失败");}
		});
	};
	// 视频快进快退
	this.seekVedio = function(way){
		var _this = this;
		window.$bridge.callHandler('wasu_player_getCurrentPosition',{},function(response){
			var currentPos = response;
			if (way=="FF"){currentPos += playGapTime;}
			else{currentPos -= playGapTime;}
			window.$bridge.callHandler('wasu_player_seek',{'timeMillis':currentPos},function(response){
				// p.log("快进/退："+way+"->"+currentPos);
				_this.showNavigateInfo(currentPos);
			});
		});
	};
	// 获取资产播放总时长（单位：毫秒）
	this.getDuration = function(){
		var _this = this;
		window.$bridge.callHandler('wasu_player_getDuration',{},function(response){
			_this.playDuration = response;
		});
	};
	// 获取当前播放位置（单位：毫秒）
	this.getCurrentPosition = function(){
		var _this = this;
		window.$bridge.callHandler('wasu_player_getCurrentPosition',{},function(response){
			_this.playElapsed = response;
		})
	};
	// 获取当前播放状态
	/*this.getPlayStatus = function(){
		var _this = this;
		 window.$bridge.callHandler('wasu_player_status',{},function(response){
			_this.playStatus = response;
		});
	}; */
	// 获取播放状态描述
	this.getPlayStatusMemo = function(state){
		var stateMemo;
		switch(state){
			case 0:
				stateMemo = "正常";	
				break;
			case 2:
				stateMemo = "停止";
				break;
			case 3:
				stateMemo = "失败";
				break;
			case 4:
				stateMemo = "暂停";
				break;
			default:
				stateMemo = "未知";
		}
		return stateMemo;
	};
	// 输入视频进度条信息
	this.showNavigateInfo = function(elapsedValue){
		var _this = this;
		if (elapsedValue>0){_this.playElapsed = elapsedValue;}
		else{_this.getCurrentPosition();}
		if (_this.playDuration<=0){_this.getDuration();}
		var currProgress = Math.floor(_this.playElapsed/_this.playDuration*100);
		document.getElementById("navInfo").innerHTML = "时长："+dlw.utility.formatDuring(_this.playElapsed)+"/"+dlw.utility.formatDuring(_this.playDuration)+"，已播放："+currProgress+"%，状态："+_this.getPlayStatusMemo(playStatus);
		document.getElementById("navProgressBar").style.width = currProgress+"%";
		if (document.getElementById("navBar").style.visibility=="hidden") {document.getElementById("navBar").style.visibility = "visible";}
		window.clearTimeout(showTimeOut);
		showTimeOut = window.setTimeout(function(){
			if (document.getElementById("navBar").style.visibility=="visible") {document.getElementById("navBar").style.visibility = "hidden";}
		},1000*3);
	};
}
function jundgeNull(str) {
	if (str !== null && str !== "" && str !== "undefined" && str !== undefined) {
		return true;
	} else {
		return false;
	}
}