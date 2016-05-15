/**
 * Created by Administrator on 2016/5/13 0013.
 */
/**
 * Created by Administrator on 2016/4/29 0029.
 */

'use strict'

var path = require('path');
var util = require('../libs/util');
var Wechat = require('../wechat/wechat');
var wechat_file = path.join(__dirname, '../config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, '../config/wechat_ticket.txt');
var config = {
    wechat: {
        appID: 'wx26d08f3077dfca3e',
        appSecret: '635b0889021346fd4d9e7a1380247fdd',
        token:'youxingzhi',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file);
        },
        saveTicket: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file,data);
        }
    },
    url: 'http://5xh1glu64e.proxy.qqbrowser.cc'
}

exports.wechatOptions = config;

exports.getWechat = function() {
    var wechatApi = new Wechat(config.wechat);
    return wechatApi;
};

