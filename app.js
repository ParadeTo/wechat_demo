/**
 * Created by Administrator on 2016/4/20 0020.
 */
'use strict'

var Koa = require('koa');
var path = require('path');
var koaStatic = require('koa-static');
var fs = require('fs');
var mongoose = require('mongoose');

var dbUrl = 'mongodb://192.168.1.191/movie'

mongoose.connect(dbUrl)


// models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
    fs
        .readdirSync(path)
        .forEach(function(file) {
            var newPath = path + '/' + file
            var stat = fs.statSync(newPath)

            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath)
                }
            }
            else if (stat.isDirectory()) {
                walk(newPath)
            }
        })
}
walk(models_path)

// 微信接口
var wx = require('./wx/index');
var wechatApi = wx.getWechat();

// 初始化菜单
var menu = require('./wx/menu');
wechatApi.delMenu().then(function() {
    return wechatApi.createMenu(menu);
}).then(function(msg) {
    console.log(msg);
});

var app = new Koa();

// 静态文件
app.use(koaStatic(__dirname + '/public'));

var Router = require('koa-router');
var session = require('koa-session');
var bodyParser = require('koa-bodyparser');
var router = new Router();
var game = require('./app/controllers/game');
var wechat = require('./app/controllers/wechat');
var User = mongoose.model('User');

// 模板引擎
var views = require('koa-views');
app.use(views(__dirname + '/app/views', {
    extension: 'jade'
}));

// session
app.keys = ['imooc'];
app.use(session(app));
app.use(bodyParser());
app.use(function* (next) {
   var user = this.session.user
    if (user && user._id) {
        this.session.user = yield User.findOne({_id: user._id}).exec();
        // 模板引擎中可以读到这个变量
        this.state.user = this.session.user;
    }
    else {
        this.state.user = null;
    }
    yield next;
});

require('./config/routes')(router);
app.
    use(router.routes()).
    use(router.allowedMethods());

app.listen(9999);
console.log("Listening:9999");