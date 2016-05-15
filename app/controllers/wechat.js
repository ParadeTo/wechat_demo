/**
 * Created by Administrator on 2016/5/14 0014.
 */
'use strict'

var wechat = require('../../wechat/g');
var reply = require('../../wx/reply');
var wx = require('../../wx/index');

exports.hear = function* (next) {
    this.middle = wechat(wx.wechatOptions.wechat, reply.reply);
    yield this.middle(next);
};