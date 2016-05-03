/**
 * Created by Administrator on 2016/4/29 0029.
 */

'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt')

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
        }
    },
    url: 'http://xazkkj.eicp.net'
}

module.exports = config;