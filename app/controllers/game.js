/**
 * Created by Administrator on 2016/5/13 0013.
 */
'use strict';

var wx = require('../../wx/index');
var util = require('../../libs/util');
var Movie = require('../api/movie');

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

exports.find = function* (next) {
    var id = this.params.id;
    var wechatApi = wx.getWechat();

    var data = yield wechatApi.fetchAccessToken();
    var access_token = data.access_token;

    var ticketData = yield wechatApi.fetchTicket(access_token);

    var ticket = ticketData.ticket;
    //使用qq的调试工具时会加端口号，这是一个坑
    var url = this.href.replace(':8000', '');
    var params = util.sign(ticket, url);
    var movie = yield Movie.searchById(id);
    params.movie = movie;
    yield this.render('wechat/movie', params);
};

