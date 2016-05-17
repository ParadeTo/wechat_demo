/**
 * Created by Administrator on 2016/5/13 0013.
 */
'use strict';

var wx = require('../../wx/index');
var util = require('../../libs/util');
var Movie = require('../api/movie');
var koa_request = require('koa-request');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var config = wx.wechatOptions;

exports.guess = function* (next) {
    var wechatApi = wx.getWechat();
    var data = yield wechatApi.fetchAccessToken();
    var access_token = data.access_token;
    var ticketData = yield wechatApi.fetchTicket(access_token);
    var ticket = ticketData.ticket;
    //使用qq的调试工具时会加端口号，这是一个坑
    var url = this.href.replace(':8000', '');
    var params = util.sign(ticket, url);
    yield this.render('wechat/game', params);
};
/**
 * TODO 需开启 网页授权获取用户基本信息
 * @param next
 */
exports.jump = function* (next) {
    var movieId = this.params.id;
    var redirect = config.url + '/wechat/movie/' + movieId;
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
        config.wechat.appID + '&redirect_uri=' + redirect +
        '&response_type=code&scope=snsapi_base&state=' + movieId +
        '#wechat_redirect';
    this.redirect(url);
}
exports.find = function* (next) {
    // 获取用户openid
    var code = this.query.code;
    var openUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' +
        config.wechat.appID + '&secret=' + config.wechat.appSecret + '&code=' + code + '&grant_type=authorization_code';

    var response = yield koa_request({
        url: openUrl
    })
    var body = JSON.parse(response.body);
    var openid = body.openid;
    // 看数据库中是否保存了
    var user = yield User.findOne({openid: openid}).exec();

    if (!user) {

        // 获取用户基本信息
        user = yield wx.getWechat().fetchUsers(openid);
        // 新建用户
        user = new User({
            headimgurl: user.headimgurl,
            openid: openid,
            password: '123456',
            name: user.nickname
        });
        user = yield user.save();

        //// 否则随机
        //else {
        //    user = new User({
        //                openid: openid,
        //                password: '123456',
        //                name: Math.random().toString(36).substr(2)
        //            });
        //}

    }
    this.session.user = user;
    // 模板中可以读到
    this.state.user = user;

    var id = this.params.id;

    //var data = yield wechatApi.fetchAccessToken();
    //var access_token = data.access_token;
    //
    //var ticketData = yield wechatApi.fetchTicket(access_token);
    //
    //var ticket = ticketData.ticket;
    ////使用qq的调试工具时会加端口号，这是一个坑
    //var url = this.href.replace(':8000', '');
    //var params = util.sign(ticket, url);
    var movie = yield Movie.searchById(id);
    var comments = yield Comment
        .find({movie: id})
        .populate('from', 'name headimgurl')
        .populate('reply.from reply.to', 'name headimgurl')
        .exec();

    var params = {};
    params.movie = movie;
    params.comments = comments;
    yield this.render('wechat/movie', params);
};

