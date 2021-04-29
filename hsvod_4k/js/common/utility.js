var dlw = window.dlw || {};
dlw.utility = new function(){
    // 补零
    this.zeroPadding = function(num){
        if (num<10) {return '0' + num;} 
        else {return '' + num;}
    };
    // 毫秒转时分秒格式
    this.formatDuring = function(ms){
        var _this = this;
        // var days = parseInt(ms / (1000 * 60 * 60 * 24));
        var hours = parseInt((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((ms % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((ms % (1000 * 60)) / 1000);
        // return days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 ";
        return _this.zeroPadding(hours)+":"+_this.zeroPadding(minutes)+":"+_this.zeroPadding(seconds);
    };
};