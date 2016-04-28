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

module.exports = function(opts) {
    //var wechat = new Wechat(opts);
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
            // 获取post过来的数据
            /**
             <xml><ToUserName><![CDATA[gh_5cf9bdf8f7f5]]></ToUserName>//开发者
             <FromUserName><![CDATA[oJJPgw4ibwCrtLAjiA6F_PAHDCVo]]></FromUserName>//发送方
             <CreateTime>1461807724</CreateTime>
             <MsgType><![CDATA[event]]></MsgType>
             <Event><![CDATA[subscribe]]></Event>
             <EventKey><![CDATA[]]></EventKey>
             </xml>
             */

            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });
            var content = yield util.parseXMLAsync(data);
            console.log(content);
            var message = util.formatMessage(content.xml)
            console.log(message);

            if (message.MsgType === 'event') {
                if (message.Event === 'subscribe') {
                    var now = new Date().getTime();
                    that.status = 200;
                    that.type = 'application/xml';
                    that.body = ' <xml>'+
                    '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
                    '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
                    '<CreateTime>' + now + '</CreateTime>' +
                    '<MsgType><![CDATA[text]]></MsgType>' +
                    '<Content><![CDATA[是我的小妹子吗？更多功能请稍候哦]]></Content>' +
                    '</xml>';
                    return;
                }
            } else if (message.MsgType === 'text') {
                var now = new Date().getTime();
                that.status = 200;
                that.type = 'application/xml';
                that.body = ' <xml>'+
                '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
                '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
                '<CreateTime>' + now + '</CreateTime>' +
                '<MsgType><![CDATA[text]]></MsgType>' +
                '<Content><![CDATA[我是最帅的男盆友！]]></Content>' +
                '</xml>';
                return;
            }
        }
    }
}

