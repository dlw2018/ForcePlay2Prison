var printObj = {
    dev: true, // 是否为开发状态，设置为false时所有打印都会取消 
    defaultColor: 'yellow', // 默认颜色
    maxShowHeight: 580, // 最大高度，超高此高度元素向上滚动
    printPrev: 'Front Page Test', // 打印前缀
    createElement: function () { // 创建显示打印信息的元素
        window.hasCreateJidinghe = true;
        window.jidingheEle = document.createElement("p");
        jidingheEle.setAttribute("id", "jidinghe");
        jidingheEle.style.position = "absolute";
        jidingheEle.style.background = 'url(http://hd2.hzdtv.tv/template_images/banner/ban180131a.png)';
        jidingheEle.style.left = "375px";
        jidingheEle.style.top = "75px";
        jidingheEle.style.padding = "15px";
        jidingheEle.style.zIndex = "11";
        // 添加body
        document.body.appendChild(jidingheEle);
    },
    log: function (arg, color) {
        if (!this.dev) return;
        var arg = arg
        var locColor = color || this.defaultColor;
        if (!window.hasCreateJidinghe) {
            window.hasCreateJidinghe = true;
            this.createElement();
        }
        // 获取元素高度
        var height = jidingheEle.offsetHeight
        if (height > this.maxShowHeight) jidingheEle.style.top = (this.maxShowHeight - height) + 'px';
        var prevHtml = jidingheEle.innerHTML;
        jidingheEle.innerHTML = prevHtml + '<span style="color:' + locColor + ';font-size:33px;"> ' + this.printPrev + ':'
            + arg + ' ' + Math.random().toString().substr(0, 3) + "</span><br>";
    },
    error: function (arg) {
        this.log(arg, 'red')
    },
    info: function (arg) {
        this.log(arg, '#fff')
    }
}
var p = printObj;