/**
 * Created by Administrator on 2016/4/29 0029.
 */
'use strict'
var path = require('path');
var wx = require('./index');
var Movie = require('../app/api/movie');
var wechatApi = wx.getWechat();


exports.reply = function* (next) {

    var message = this.weixin;
    // 事件
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            //if (message.EventKey) {
            //    console.log('扫二维码进来:' + message.EventKey + ' ' + message
            //        .ticket);
            //}
            this.body = '亲爱的，欢迎关注电影世界\r\n' + '这是小包子的测试公众号！\r\n' +
            '回复首页，进入电影首页\r\n' +
            '回复登陆，进入微信登陆页面\r\n' +
            '回复游戏，进入游戏页面\r\n' +
            '回复电影名字，查询电影信息\r\n' +
            '回复语音，查询电影\r\n' +
            '也可以点击<a href="http://5xh1glu64e.proxy.qqbrowser.cc/movie">语音查电影</a>';
        }
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = '';
        }
        else if (message.Event === 'LOCATION') {
            console.log('无情取关');
            this.body = '您在' + message.Latitude + '/' + message.Longitude + '-' +
                message.Precision;
        }
        else if (message.Event === 'CLICK') {
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到你扫了一下哦';
        }
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接：' + message.EventKey;// url地址
        }
        // 扫码推送事件
        else if (message.Event === 'scancode_push') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'pic_sysphoto') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'pic_photo_or_album') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'pic_weixin') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'location_select') {
            console.log(message.SendLocationInfo.Location_X);
            console.log(message.SendLocationInfo.Location_Y);
            console.log(message.SendLocationInfo.Scale);
            console.log(message.SendLocationInfo.Label);
            console.log(message.SendLocationInfo.Poiname);
            this.body = '您点击了菜单：' + message.EventKey;
        }
    }
    // 语音
    else if (message.MsgType === 'voice') {
        var voiceText = message.Recognition;
        var reply = [];
        console.log('voiceText');
        console.log(voiceText);
        var movies = yield Movie.searchByName(voiceText);
        if (!movies || movies.length === 0) {
            movies = yield Movie.searchByDouban(voiceText);
        }
        if (movies || movies.length > 0) {
            movies = movies.slice(0, 10);
            movies.forEach(function(movie) {
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.poster,
                    url: wx.wechatOptions.url + '/movie/' + movie._id
                });
            });
        }
        else {
            reply = '没有查询到与 ' + content + ' 匹配的电影，换一个试试';
        }
        this.body = reply;
    }
    // 文本
    else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '你好，小妹子，试试输入1-10吧';
        if (content === '1') {
            reply = '天下第一吃大米';
        }
        else if (content === '2') {
            reply = '天下第二吃豆腐';
        }
        else if (content === '3') {
            reply = '天下第三吃仙丹'
        }
        else if (content === '4') {
            reply = [
                {
                    title: '技术改变世界',
                    description: '描述',
                    picUrl: 'http://preview.quanjing.com/age_foto079/x8h-1475301.jpg',
                    url: 'https://github.com/'
                },
                {
                    title: '我是帅哥',
                    description: '描述',
                    picUrl: 'http://preview.quanjing.com/chineseview089/east-ep-a91-2195211.jpg',
                    url: 'https://www.baidu.com'
                }
            ];
        }
        else {
            var movies = yield Movie.searchByName(content);
            if (!movies || movies.length === 0) {
                movies = yield Movie.searchByDouban(content);
            }
            if (movies || movies.length > 0) {
                reply = [];
                movies = movies.slice(0, 10);
                movies.forEach(function (movie) {
                    reply.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: wx.wechatOptions.url + '/wechat/movie/' + movie._id
                    })
                });
            }
            else {
                reply = '没有查询到与 ' + content + ' 匹配的电影，换一个试试';
            }
        }
        this.body = reply;
    }
    yield next;
};