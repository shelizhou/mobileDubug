/**
 * name : mobileDubg
 * Description :
 * createtime: 2014-12-10
 * version: 0.1
 * author: she
 */

;
(function(undefined) {

    "use strict";

    // 监听错误
    // window.addEventListener("error", function(msg,url,line,col,error){})
    window.onerror = function(msg,url,line,col,error){
        //没有URL不上报！上报也不知道错误
        if (msg != "Script error." && !url){
            return true;
        }
        //采用异步的方式
        //我遇到过在window.onunload进行ajax的堵塞上报
        //由于客户端强制关闭webview导致这次堵塞上报有Network Error
        //我猜测这里window.onerror的执行流在关闭前是必然执行的
        //而离开文章之后的上报对于业务来说是可丢失的
        //所以我把这里的执行流放到异步事件去执行
        //脚本的异常数降低了10倍
        setTimeout(function(){
            var data = {};
            //不一定所有浏览器都支持col参数
            col = col || (window.event && window.event.errorCharacter) || 0;

            data.url = url;
            data.line = line;
            data.col = col;
            if (!!error && !!error.stack){
                //如果浏览器有堆栈信息
                //直接使用
                data.msg = error.stack.toString();
            }else if (!!arguments.callee){
                //尝试通过callee拿堆栈信息
                var ext = [];
                var f = arguments.callee.caller, c = 3;
                //这里只拿三层堆栈信息
                while (f && (--c>0)) {
                   ext.push(f.toString());
                   if (f  === f.caller) {
                        break;//如果有环
                   }
                   f = f.caller;
                }
                ext = ext.join(",");
                data.msg = error.stack.toString();
            }

            //把data上报到后台！
            console && console.log(data);
            new Ajax({
                data: formatParams(data),
                success: function(res) {
                    // console.log(res);
                }
            });
        },0);

        return true;
    };
    // 抛出方法
    var MDebug = function(data, fn, delaytime) {

        // 返回对象
        if (!(this instanceof MDebug)) {
            return new MDebug(data, fn, delaytime);
        }

        // 整理变量，如果是单变量也变成对象传过去
        var ps = {};
        if ( Object.prototype.toString.call(data) !== "[object Object]" ){
            ps.__onlyValue__ = data;
        } else {
            ps = data;
        }
        console && console.log(ps);

        // 传输数据
        new Ajax({
            data: formatParams(ps, true),
            delaytime: delaytime || 0,
            success: function(res) {
                // console.log(res);
                fn && fn(res);
            }
        });
        // s.abort();

    };

    // 获取元素属性
    MDebug.getES = function(ele, styleName) {
        if (!ele) return;

        if (typeof $ !== "undefined" && ele instanceof $) {
            ele = ele.get(0);
        } else if (typeof ele === "string") {
            ele = document.getElementById(ele);
        }

        var scrollTop = window.pageYOffset //用于现代浏览器
            || document.documentElement.scrollTop //有dtd
            || document.body.scrollTop //没有dtd
            || 0;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

        var data = {
            height: ele.offsetHeight,
            width: ele.offsetWidth,
            scrollLeft: ele.getBoundingClientRect().left + scrollLeft,
            scrollTop: ele.getBoundingClientRect().top + scrollTop,
            className: ele.className,
            style: styleName ? (ele.currentStyle? ele.currentStyle : window.getComputedStyle(ele, null))[styleName] : ""
        }
        // styleName支持：'background-color'、 'width' 、 等
        // console.log(data.style)
        new Ajax({
            data: formatParams(data),
            success: function(res) {
                // console.log(res);
            }
        });

    };

    // 获取debug上传的地址
    var _file,
        _fileArr,
        _scripts = document.getElementsByTagName("script");
    for (var i = 0, l = _scripts.length; i < l; i++) {
        if (_scripts[i].getAttribute("data-debug") === "1") {
            _file = _scripts[i].getAttribute("src");
            break;
        }
    }
    if (_file) {
        _fileArr = parseURL(_file);
    }


    // ajax
    var Ajax = function(conf) {
        if (!_file) {
            alert("调试地址出错");
            return;
        }
        // console.log(window.location.hostname)
        var type = "POST"; //conf.type; //type参数
        var url =  _fileArr.protocol + "://" + _fileArr.host + ":"+ _fileArr.port +"/sendDate"; //conf.url; url参数

        var data = conf.data; //data参数可选，只有在post请求时需要 
        var dataType = conf.dataType || "text"; //datatype参数可选 
        var success = conf.success; //回调函数可选


        // 接口延时返回的时间
        data += "&__delaytime__=" + (conf.delaytime || 0);


        var xhr = this.createAjax();
        xhr.open(type, url, true);
        if (type == "GET" || type == "get") {
            xhr.send(null);
        } else if (type == "POST" || type == "post") {
            xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (dataType == "text" || dataType == "TEXT") {
                    if (success != null) { //普通文本
                        success(xhr.responseText);
                    }
                } else if (dataType == "xml" || dataType == "XML") {
                    if (success != null) { //接收xml文档
                        success(xhr.responseXML);
                    }
                } else if (dataType == "json" || dataType == "JSON") {
                    if (success != null) { //将json字符串转换为js对象
                        success(eval("(" + xhr.responseText + ")"));
                    }
                }
            }
        };
        return xhr;
    };
    Ajax.prototype.createAjax = function() {
        var xhr = null;
        try { //IE系列浏览器
            xhr = new ActiveXObject("microsoft.xmlhttp");
        } catch (e1) {
            try { //非IE浏览器
                xhr = new XMLHttpRequest();
            } catch (e2) {
                window.alert("您的浏览器不支持ajax，请更换！");
            }
        }
        return xhr;
    };

    // 取地址参数
    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function() {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length,
                    i = 0,
                    s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }

    //格式化参数并加类型, 只支持一级
    //flag：true 不增加类型
    function formatParams(data, flag) {
        var arr = [],
            type;
        for (var name in data) {
            type = Object.prototype.toString.call(data[name]).replace("[", "").replace("]", "").replace("object ", "");
            flag ? arr.push(name + "=" + data[name] + "  --->" + type) : arr.push(name + "=" + data[name]);
        }
        // arr.push(("v=" + Math.random()).replace("."));
        return arr.join("&");
    }

    window.MDebug = MDebug;

    // 检测上下文环境是否为 AMD 或者 CMD   
    // if (typeof define === 'function' && (define.amd || define.cmd)) {
    //     define(function() {
    //         return MDebug;
    //     });

    //     // 检查上下文是否为 node
    // } else if (typeof module !== 'undefined' && module.exports) {
    //     module.exports = MDebug;

    // } else {
    //     window.MDebug = MDebug;
    // }

})();