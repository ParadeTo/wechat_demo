/**
 * Created by Administrator on 2016/4/20 0020.
 */
'use strict'

var Koa = require('koa');
var staticServer = require('koa-static');
var path = require('path');
var config = require('./config');
var reply = require('./wx/reply');
var wechat = require('./wechat/g');
var Wechat = require('./wechat/wechat');
var crypto = require('crypto');

var app = new Koa();

var ejs = require('ejs');
var heredoc = require('heredoc');
var tpl = heredoc(function() {/*
   <!DOCTYPE html>
   <html>
    <head>
        <title>搜电影</title>
        <meta name="viewport" centent="initial-scale=1, maximum-scale=1, minimum-scale=1">
    </head>
    <body>
        <h1 style="margin-top:200px;font-size:5rem;">开始录音翻译，查询你喜欢的电影</h1>
         <h1 id="search">查询：</h1>
        <p id="title"></p>
         <div id="director"></div>
         <div id="year"></div>
        <div id="poster"></div>
        <script src="http://zeptojs.com/zepto-docs.min.js"></script>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            // 异步配置
             wx.config({
                 debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                 appId: 'wx26d08f3077dfca3e', // 必填，公众号的唯一标识
                 timestamp: '<%=timestamp %>', // 必填，生成签名的时间戳
                 nonceStr: '<%=noncestr %>', // 必填，生成签名的随机串
                 signature: '<%=signature %>',// 必填，签名，见附录1
                 jsApiList: [
                     'previewImage',
                     'onMenuShareTimeline',
                     'onMenuShareAppMessage',
                     'onMenuShareQQ',
                     'onMenuShareWeibo',
                     'onMenuShareQZone',
                     'startRecord',
                     'stopRecord',
                     'onVoiceRecordEnd',
                     'translateVoice'
                     ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
             });

             wx.ready(function() {
                // 分享给好友
                var shareContent = {
                     title: '默认标题', // 分享标题
                     desc: '我搜出来了个鬼', // 分享描述
                     link: 'https://www.baidu.com', // 分享链接
                     imgUrl: '#', // 分享图标
                     success: function () {
                        window.alert('分享成功');
                     },
                     cancel: function () {
                        window.alert('分享失败');
                     }
                }
                 wx.onMenuShareAppMessage(shareContent);

                 wx.checkJsApi({
                     jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                     success: function(res) {
                        console.log('result:');
                        console.log(res);
                     // 以键值对的形式返回，可用的api值true，不可用为false
                     // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                     }
                 });
                 var slides = null;
                 // 点击poster
                 $('#poster').on('tap', function(){
                    wx.previewImage(slides);
                 });
                 // 点击标题
                 var isRecording = false;
                 $('h1').on('tap', function() {
                    if (!isRecording) {
                        isRecording = true;
                         wx.startRecord({
                             cancel: function() {
                                window.alert('那就不能搜了哦');
                             }
                         });
                         return;
                    }
                    // 再次点击，停止录音
                    isRecording = false;
                    wx.stopRecord({
                        success: function(res) {
                            var localId = res.localId;
                             wx.translateVoice({
                                 localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                                 isShowProgressTips: 1, // 默认为1，显示进度提示
                                 success: function (res) {
                                    var result = res.translateResult;
                                    $('#search').html('查询:').append(result); // 语音识别的结果
                                    // 开启移动调试后，向豆瓣发送的请求会失败
                                    $.ajax({
                                        type:'get',
                                        url:'https://api.douban.com/v2/movie/search?q=' + result,
                                        dataType:'jsonp',
                                        jsonp:'callback',
                                        success: function(data) {
                                            //alert(data)
                                            var subject = data.subjects[0];
                                            $('#title').html(subject.title);
                                            $('#director').html(subject.directors[0].name);
                                            $('#poster').html('<img src="'+subject.images.large+'"/>');
                                            $('#year').html(subject.year);
                                            alert('点击海报查看更多哦');

                                            shareContent = {
                                                 title: subject.title, // 分享标题
                                                 desc: '我搜出来了'+subject.title, // 分享描述
                                                 link: 'http://5xh1glu64e.proxy.qqbrowser.cc/movie', // 分享链接
                                                 imgUrl: subject.images.small, // 分享图标
                                                 type: 'link', // 分享类型,music、video或link，不填默认为link
                                                 dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                                                 success: function () {
                                                    window.alert('分享成功');
                                                 },
                                                 cancel: function () {
                                                    window.alert('分享失败');
                                                 }
                                             }
                                            wx.onMenuShareAppMessage(shareContent);

                                             slides = {
                                                current: subject.images.large,
                                                urls:[subject.images.large]
                                             };
                                             data.subjects.forEach(function(item){
                                                slides.urls.push(item.images.large);
                                             });
                                        },
                                        error: function(err){
                                        }
                                    });
                                    //alert(res.translateResult); // 语音识别的结果
                                 }
                             });
                        }
                    });

                 });
             });

        </script>
    </body
   </html>
*/});

var createNonce = function() {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + '';
};

/**
 * 可到http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign
 * 查看签名算法是否与微信官方一致
 * @param noncestr
 * @param ticket
 * @param timestamp
 * @param url 使用qq的调试工具时会加端口号，这是一个坑
 * @returns {*}
 * @private
 */
var _sign = function(noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ];

    var str = params.sort().join('&');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
};

function sign(ticket, url) {
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url);
    console.log(ticket);
    console.log(url);
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    };
}

// 简单路由
app.use(function *(next) {
   if (this.url.indexOf('/movie') > -1) {
       var wechatApi = new Wechat(config.wechat);
       var data = yield wechatApi.fetchAccessToken();
       var access_token = data.access_token;

       var ticketData = yield wechatApi.fetchTicket(access_token);
       console.log(ticketData);
       var ticket = ticketData.ticket;
       //使用qq的调试工具时会加端口号，这是一个坑
       var url = this.href.replace(':8000','');
       var params = sign(ticket, url);
       this.body = ejs.render(tpl, params);
       return next;
   }
    yield next;
});

app.use(staticServer(path.join(__dirname, 'public')));
app.use(wechat(config.wechat, reply.reply));

app.listen(9999);
console.log("Listening:9999");