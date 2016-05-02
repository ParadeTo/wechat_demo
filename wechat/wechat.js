/**
 * Created by ayou on 2016-04-28.
 */
'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var util = require('../libs/util');
var fs = require('fs');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  upload: prefix + 'media/upload?'
}

function Wechat(opts) {
  var that = this;
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;
  this.fetchAccessToken();
}

Wechat.prototype.isValidAccessToken = function(data) {
  if(!data || !data.access_token || !data.expires_in) {
    return false;
  }
  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = (new Date().getTime());

  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
}

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID;
  var appSecret = this.appSecret
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
  return new Promise(function(resolve, reject) {
    request({url:url,json:true}).then(function(response) {
      var data = response.body;
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;
      data.expires_in = expires_in;
      resolve(data);
    });
  });
};

Wechat.prototype.reply = function() {
  var content = this.body;
  var message = this.weixin;
  console.log('body:'+content);
  console.log('weixin:'+message);
  var xml = util.tpl(content, message);
  console.log('xml:'+xml);
  this.status = 200;
  this.type = 'application/xml';
  this.body = xml;
};

Wechat.prototype.fetchAccessToken = function(data) {
  var that = this;

  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this);
    }
  }

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data);
      } catch(e) {
        return that.updateAccessToken();
      }
      // 如果合法，向下传递
      if (that.isValidAccessToken(data)) {
        return Promise.resolve(data);
      }
      // 不合法，则更新
      else {
        return that.updateAccessToken();
      }
    })
    .then(function(data) {
      console.log(data);
      that.access_token = data.access_token;
      that.expires_in = data.expires_in;
      that.saveAccessToken(data);
      return Promise.resolve(data);
    });
}

Wechat.prototype.uploadMaterial = function(type, filepath) {
  var that = this;
  var form = {
    media: fs.createReadStream(filepath)
  };

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.upload + 'access_token=' + data.access_token + '&type='
            + type;
          console.log(url);
        request({
          method:'POST',
          url:url,
          formData: form,
          json:true
        }).then(function(response) {
          var _data = response.body;
          if (_data) {
            resolve(_data);
          } else {
            throw new Error('Upload material fails');
          }
        })
        .catch(function(err) {
           reject(err);
        });
      });
  });
};

module.exports = Wechat;