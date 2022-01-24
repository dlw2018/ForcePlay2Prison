/** 文字滚动 */
+function (f) {
    if (typeof f === "function") {
        if (typeof hs != "undefined") {
            f(hs);
        }
    }

}(function (v) {
    function _scroll() {
        var that = this;
        var text_offset = 30;
        //取文字宽度
        this.getTextWeight = function (content, _txtFontSize) {
            var contentLen = this.len(content);
            var txtFontSize = _txtFontSize;
            return contentLen * txtFontSize / 2;
        };
        this.len = function (str) {
            var len = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                //单字节加1
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                    len++;
                } else {
                    len += 2;
                }
            }
            return len;

        };
        this.scrollR = {
            scrollWidth: 0,
            _text_width: 0,
            _text_left: 0,//变化中的text left
            _inc: 1.5,//滚动方向
            _scrollObj: null,
            /**
             *
             * @param scrollObj
             * @param _scrollWidth
             * @param _txtFontSize
             */
            scrollText: function (scrollObj, _scrollWidth, _txtFontSize) {
                var content = scrollObj.innerText;
                this._text_width = that.getTextWeight(content, _txtFontSize);
                // this._text_width =scrollObj.offsetWidth;
                this._text_left = 0;
                this._scrollObj = scrollObj;
                // _scrollObj.style.left = 0+"px";
                this.scrollWidth = _scrollWidth;
                if (this._text_width <= this.scrollWidth) {
                    this.stopScroll(this._scrollObj);
                } else if (scrollObj.scrollTimeout == null) {
                    this._text_width += text_offset;
                    this._scrollObj.style.left = 0 + "px";
                    this._scrollObj.style.textAlign = "left";
                    this._scrollObj.style.width = this._text_width + "px";
                    scrollObj.scrollTimeout = setInterval(function () {
                        that.scrollR.moveText();
                    }, 50);
                }
            },

            //每间隔1s移动text
            moveText: function () {
                if (this._text_left < this.scrollWidth - this._text_width) {
                    this._inc = -1.5;
                } else if (this._text_left <= 6 && this._text_left > 2) {
                    this._inc = 1.5;
                }
                this._text_left -= this._inc;
                this._scrollObj.style.left = this._text_left + "px";
            },
            stopScroll: function (scrollObj) {
                if (scrollObj.scrollTimeout) {
                    clearInterval(scrollObj.scrollTimeout);
                    scrollObj.scrollTimeout = null;
                    scrollObj.style.left = "0px";
                    //scrollObj.style.textAlign = "center";
                }
            }
        };
        this.scrollC = {
            scrollHeight: 0,//显示的文字高度
            _text_width_col: 0,
            _text_top: 0,//变化中的text top
            _inc_col: 1.5,//滚动方向
            _scrollObj_col: null,

            scrollText_col: function (scrollObj, _scrollHeight, _txtFontSize) {
                this.stopScroll(scrollObj);
                var _content = scrollObj.innerText;
                this._scrollObj_col = scrollObj;
                // this._text_width_col = that.getTextWeight(_content, _txtFontSize);
                this._text_width_col = scrollObj.offsetHeight;
                this._text_top = 0;
                this.scrollHeight = _scrollHeight;
                if (this._text_width_col <= this.scrollHeight) {
                    this.stopScroll(scrollObj);
                } else {
                    //偏移量
                    this._text_width_col += text_offset;
                    scrollObj.style.height = this._text_width_col + "px";
                    scrollObj.scrollTimeout = setInterval(function () {
                        that.scrollC.moveText_col();
                    }, 50);
                }
            },
            //每间隔1s移动text
            moveText_col: function () {
                if (this._text_top < this.scrollHeight - this._text_width_col) {
                    this._inc_col = -1.5;
                } else if (this._text_top <= 6 && this._text_top > 2) {
                    this._inc_col = 1.5;
                }
                this._text_top -= this._inc_col;
                this._scrollObj_col.style.top = this._text_top + "px";
            },
            stopScroll: function (scrollObj) {
                if (scrollObj.scrollTimeout) {
                    clearInterval(scrollObj.scrollTimeout);
                    scrollObj.scrollTimeout = null;
                    scrollObj.style.top = "0px";
                }
            }
        };
        this.scrollMarqueeLeft = {
            textWidth: 0,
            _inc: 0,//滚动方向
            _scrollObj: null,
            _scrollWidth: 0,

            scrollText: function (scrollObj, _scrollWidth, _txtFontSize) {
                var content = scrollObj.innerText;
                this._scrollObj = scrollObj;
                this._scrollWidth = _scrollWidth;
                this.textWidth = that.getTextWeight(content, _txtFontSize);
                scrollObj.scrollTimeout = setInterval(function () {
                    that.scrollMarqueeLeft.moveText();
                }, 50);
            },
            //每间隔1s移动text
            moveText: function () {
                var left = this._scrollWidth;
                if (this._inc < this.textWidth + this._scrollWidth) {
                    this._inc += 1.5;
                } else {
                    this._inc = 0;
                    left = this._scrollWidth
                }
                left -= this._inc;
                this._scrollObj.style.left = left + "px";
            }
        };
        this.scrollMarqueeUp = {};
    }

    v.ScroolObject = _scroll;
});


