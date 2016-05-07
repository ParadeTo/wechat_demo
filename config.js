/**
 * Created by Administrator on 2016/4/29 0029.
 */

'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt')

var config = {
    wechat: {
        appID: 'wx483e77141ca5699a',
        appSecret: '540380f7f5915f6262c22526d8b2687c',
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