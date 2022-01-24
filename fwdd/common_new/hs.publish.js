+function (f) {
    if (typeof f === "function") {
        if (typeof hs != "undefined") {
            f(hs);
        }
    }
}(function (v) {
    function _publish() {
        /**
         *图文列表。
         *参数：用户id，栏目id，获取到的图文插入的节点
         * @param code
         * @param id
         * @param objid
         * @returns {string}
         */
        this.getPublishData = function (code, id, objid,prefix) {
            var title = "";
            v.ajax.get("?action=select&table=tw_mixture&params=mt_title,mt_subtitle,mt_about,mt_notes,mt_image,mt_type,create_dtime,mt_sequence"
                + "&column=" + id + "&where=&order=mt_sequence%20asc,id%20asc&code=" + code + "&index=1&items=70", function (data) {
                data = eval("(" + data + ")");
                console.log(data);
                if (data.Success == true) {
                    var contenttext = "";
                    title = data.Data.Items[0].mt_title;
                    for (var i = 0; i < data.Data.Items.length; i++) {
                        if (data.Data.Items[i].mt_type == "T") {
                            contenttext += "<div style=\"line-height:33px;font-size: 23px;text-align: justify;\">" + data.Data.Items[i].mt_notes + "</div>";
                        }
                        if (data.Data.Items[i].mt_type == "I") {
                            var imgsrc = v.locationUrl.formatImgUrl(data.Data.Items[i].mt_image,prefix);

                            if (data.Data.Items[i].mt_subtitle != "") {
                                var imgPos = data.Data.Items[i].mt_subtitle.substring('=')[1];
                                contenttext += "<br/><div style=\"text-align:" + imgPos + ";\"><img src=\"" + imgsrc + "\"></img></div>";
                            } else {
                                contenttext += "<br/><div style=\"text-align:center;\"><img src=\"" + imgsrc + "\"></img></div>";
                            }
                        }
                    }
                    $(objid).innerHTML = contenttext;
                }
            }, 2, function () {
                alert("hs.publish 获取内容失败!");
            }, 3000);
            return title;
        };

        /**
         *图文向下翻页动作
         * @param ojbid
         */
        this.pagePublishDown = function (ojbid,speed) {
            var height = $(ojbid).offsetHeight - $(ojbid).parentNode.offsetHeight;
            var nowheight = parseInt(v.getStyle($(ojbid), "top"));
            speed = speed ? speed : 200 ;
            //console.log(height + "|" + nowheight);
            if (nowheight > (-height)) {
                nowheight -= speed;
                $(ojbid).style.top = nowheight + 'px';
            }
        };

        /**
         *图文向上翻页动作
         * @param ojbid
         */
        this.pagePublishUp = function (ojbid,speed) {
            speed = speed ? speed : 200 ;
            var nowheight = parseInt(v.getStyle($(ojbid), "top"));
            if (nowheight < (-speed)) {
                nowheight += speed;
                $(ojbid).style.top = nowheight + 'px';
            } else {
                nowheight = 0;
                $(ojbid).style.top = '0px';
            }
        };
    }
    v.publish = new _publish();
});