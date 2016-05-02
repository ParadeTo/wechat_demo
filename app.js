/**
 * Created by Administrator on 2016/4/20 0020.
 */
'use strict'

var Koa = require('koa');
var staticServer = require('koa-static');
var path = require('path');
var config = require('./config');
var weixin = require('./weixin');
var wechat = require('./wechat/g');

var app = new Koa();
app.use(staticServer(path.join(__dirname, 'public')));
app.use(wechat(config.wechat, weixin.reply));

app.listen(9999);
console.log("Listening:9999");