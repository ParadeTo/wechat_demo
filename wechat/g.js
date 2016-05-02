/**
 * Created by Administrator on 2016/4/22 0022.
 */
/**
 * Created by Administrator on 2016/4/20 0020.
 */
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('../libs/util');

module.exports = function(opts, handler) {
    var wechat = new Wechat(opts);
    return function *(next) {
        var that = this;
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce; // 随机字符串
        var ts = this.query.timestamp;
        var echostr = this.query.echostr; // 若验证通过，原样返回

        var str = [token,ts,nonce].sort().join('');
        var sha = sha1(str);
        console.log(this.method);
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + '';
            } else {
                this.body = 'wrong';
            }
        }
        else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });
            var content = yield util.parseXMLAsync(data);
            console.log(content);
            var message = util.formatMessage(content.xml)
            console.log(message);

            this.weixin = message;

            // 交给外层处理
            yield handler.call(this, next);

            wechat.reply.call(this);
            //if (message.MsgType === 'event') {
            //    if (message.Event === 'subscribe') {
            //        var now = new Date().getTime();
            //        that.status = 200;
            //        that.type = 'application/xml';
            //        that.body = xml
            //        return;
            //    }
            //} else if (message.MsgType === 'text') {
            //    var now = new Date().getTime();
            //    that.status = 200;
            //    that.type = 'application/xml';
            //    that.body = ' <xml>'+
            //    '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
            //    '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
            //    '<CreateTime>' + now + '</CreateTime>' +
            //    '<MsgType><![CDATA[text]]></MsgType>' +
            //    '<Content><![CDATA[我是最帅的男盆友！]]></Content>' +
            //    '</xml>';
            //    return;
            //}
        }
    }
}

