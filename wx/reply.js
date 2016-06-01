/**
 * Created by Administrator on 2016/4/29 0029.
 */
'use strict'
var wx = require('./index');
var Movie = require('../app/api/movie');

var help = '亲爱的，欢迎关注电影世界\r\n' + '这是小包子的测试公众号！\r\n' +
    '回复首页，进入电影首页\r\n' +
    '回复登陆，进入微信登陆页面\r\n' +
        //'回复游戏，进入游戏页面\r\n' +
    '回复电影名字，查询电影信息\r\n' +
    '回复语音，查询电影\r\n' +
    '也可以点击<a href="http://5xh1glu64e.proxy.qqbrowser.cc/movie">语音查电影</a>';

exports.reply = function* (next) {

    var message = this.weixin;
    // 事件
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {

            this.body = help;
        }
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = '';
        }
        else if (message.Event === 'LOCATION') {

            this.body = '您在' + message.Latitude + '/' + message.Longitude + '-' +
            message.Precision;
        }
        else if (message.Event === 'CLICK') {

            var news = [];
            var movies = [];
            if (message.EventKey === 'movie_hot') {
                movies = yield Movie.findHotMovies(-1, 10);
            }
            else if (message.EventKey === 'movie_cold') {
                movies = yield Movie.findHotMovies(1, 10);
            }
            else if (message.EventKey === 'movie_crime') {
                let cat = yield Movie.findMoviesByCate('犯罪');
                if (cat) {
                    movies = cat.movies;
                }
            }
            else if (message.EventKey === 'movie_cartoon') {
                let cat = yield Movie.findMoviesByCate('动画');
                if (cat) {
                    movies = cat.movies;
                }
            }
            else if (message.EventKey === 'help') {
                news = help;
            }
            if (movies) {
                movies.forEach(function (movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: wx.wechatOptions.url + '/wechat/jump/' + movie._id
                    });
                });
            }
            this.body = news;
        }
    }
    // 语音
    else if (message.MsgType === 'voice') {
        var voiceText = message.Recognition;
        var reply = [];

        var movies = yield Movie.searchByName(voiceText);
        if (!movies || movies.length === 0) {
            movies = yield Movie.searchByDouban(voiceText);
        }
        if (movies || movies.length > 0) {
            movies = movies.slice(0, 10);
            movies.forEach(function (movie) {
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.poster,
                    url: wx.wechatOptions.url + '/wechat/jump/' + movie._id
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
        else if (content.toLowerCase() === '哆啦a梦') {
            reply = [{
                title: '纯CSS哆啦A梦',
                description: '进来看看',
                picUrl: 'http://preview.quanjing.com/chineseview089/east-ep-a91-2195211.jpg',
                url: 'https://www.baidu.com'
            }];
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
                        url: wx.wechatOptions.url + '/wechat/jump/' + movie._id
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