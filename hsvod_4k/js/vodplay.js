// 创建播放器对象
var objBridge = new BridgeApk({ havePlayer: true, returnType: 2 });
// 播放列表
var movieUrls = ["rtsp://125.210.227.234:5541/hdds_ip/icms_icds_pub05/opnewsps05/Video/2017/02/14/16/20170214155253_G20xiziduanpiangaoqing_1537946112_1537946730.ts?Contentid=CP23010020170214107704&isHD=0&isIpqam=0"];
objBridge.movies = movieUrls;
// 播放视频
objBridge.initPlay();
objBridge.getStbid();
window.setTimeout(function(){p.log("stbid="+objBridge.stbid);},300);