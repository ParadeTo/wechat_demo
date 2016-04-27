/**
 * Created by Administrator on 2016/4/20 0020.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
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
    }
}

var app = new Koa();

app.use(wechat(config.wechat));

app.listen(1234);
console.log("Listening:1234");