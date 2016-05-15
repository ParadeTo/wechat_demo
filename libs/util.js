/**
 * Created by Administrator on 2016/4/22 0022.
 */
'use strict';

var fs = require('fs');
var Promise = require('bluebird');
var xml2js = require('xml2js');
var tpl = require('./tpl');
var crypto = require('crypto');


exports.readFileAsync = function(fpath, encoding) {
    return new Promise(function(resolve,reject) {
        fs.readFile(fpath, encoding, function(err, content) {
            if(err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
};

exports.writeFileAsync = function(fpath, content) {
    return new Promise(function(resolve,reject) {
        fs.writeFile(fpath, content, function(err) {
            if(err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
};

exports.parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
       xml2js.parseString(xml, {trim: true}, function(err, content) {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
       });
    });
};

/**
 * 格式化微信消息结构
 * @param result
 * @returns {{}}
 */
function formatMessage (result) {
    var message = {};
    if (typeof result === 'object') {
        var keys = Object.keys(result);
        for (var i=0;i<keys.length;i++) {
            var item = result[keys[i]];
            var key = keys[i];
            if(!(item instanceof Array) || item.length === 0){
                continue;
            }

            if (item.length === 1) {
                var val = item[0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                }
                else {
                    message[key] = (val || '').trim();
                }
            }
            // value是对象
            else {
                message[key] = [];
                for (var j=0,k=item.length;j<k;j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
    return message;
}

exports.formatMessage = formatMessage;

/**
 *
 * @param content 发送给用户的内容
 * @param message 用户发送过来的消息结构
 * @returns {*}
 */
exports.tpl = function(content, message) {
    var info = {};
    var type = 'text';
    var fromUserName = message.FromUserName;
    var toUserName = message.ToUserName;

    if (Array.isArray(content)) {
        type = 'news';
    }

    type = content.type || type;
    info.content = content;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.toUserName = fromUserName;
    info.fromUserName = toUserName;

    return tpl.compiled(info);
};

var createNonce = function () {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000, 10) + '';
};

/**
 * 可到http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign
 * 查看签名算法是否与微信官方一致
 * @param noncestr
 * @param ticket
 * @param timestamp
 * @param url 使用qq的调试工具时会加端口号，这是一个坑
 * @returns {*}
 * @private
 */
var _sign = function (noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ];

    var str = params.sort().join('&');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
};

exports.sign = function(ticket, url) {
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url);
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    };
}

