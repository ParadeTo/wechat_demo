/**
 * Created by ayou on 2016-06-04.
 */
var WX = {
  config: function() {
    // 异步配置
    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: 'wx26d08f3077dfca3e', // 必填，公众号的唯一标识
      timestamp: '#{timestamp}', // 必填，生成签名的时间戳
      nonceStr: '#{noncestr}', // 必填，生成签名的随机串
      signature: '#{signature}',// 必填，签名，见附录1
      jsApiList: [
        'previewImage',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'translateVoice'
      ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
  },
  ready: function() {
    
  }
}


$(function(){
  function fetchMovies(q, start, count) {

  }

  var wx = {

  }

  wx.ready(function () {
    // 分享给好友
    var shareContent = {
      title: '默认标题', // 分享标题
      desc: '我搜出来了个鬼', // 分享描述
      link: 'https://www.baidu.com', // 分享链接
      imgUrl: '#', // 分享图标
      success: function () {
        window.alert('分享成功');
      },
      cancel: function () {
        window.alert('分享失败');
      }
    }
    wx.onMenuShareAppMessage(shareContent);
    wx.checkJsApi({
      jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
      success: function (res) {
        console.log('result:');
        console.log(res);
        // 以键值对的形式返回，可用的api值true，不可用为false
        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
      }
    });
    /*var slides = null;
     // 点击poster
     $('#poster').on('tap', function () {
     wx.previewImage(slides);
     });*/
    // 点击录音
    var isRecording = false;
    $('#recordBtn').on('tap', function () {

      if (!isRecording) {
        isRecording = true;
        wx.startRecord({
          cancel: function () {
            window.alert('那就不能搜了哦');
          }
        });
        return;
      }
      // 再次点击，停止录音
      isRecording = false;
      wx.stopRecord({
        success: function (res) {
          var localId = res.localId;
          wx.translateVoice({
            localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function (res) {
              var result = res.translateResult;
              // 语音识别结果
              $.alert('语音解析结果：'+result);
              // 开启移动调试后，向豆瓣发送的请求会失败
              $.ajax({
                type: 'get',
                url: 'https://api.douban.com/v2/movie/search?q=' + result,
                dataType: 'jsonp',
                jsonp: 'callback',
                success: function (data) {
                  var subject = data.subjects[0];
                  // 赋值
                  $('#title').html(subject.title);
                  $('#director').html(subject.directors[0].name);
                  $('#poster').html('<img src="' + subject.images.large + '"/>');
                  $('#year').html(subject.year);
                  alert('点击海报查看更多哦');
                  shareContent = {
                    title: subject.title, // 分享标题
                    desc: '我搜出来了' + subject.title, // 分享描述
                    link: 'http://5xh1glu64e.proxy.qqbrowser.cc/movie', // 分享链接
                    imgUrl: subject.images.small, // 分享图标
                    type: 'link', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                      window.alert('分享成功');
                    },
                    cancel: function () {
                      window.alert('分享失败');
                    }
                  }
                  wx.onMenuShareAppMessage(shareContent);
                  slides = {
                    current: subject.images.large,
                    urls: [subject.images.large]
                  };
                  data.subjects.forEach(function (item) {
                    slides.urls.push(item.images.large);
                  });
                },
                error: function (err) {
                }
              });
              //alert(res.translateResult); // 语音识别的结果
            }
          });
        }
      });
    });
  });


})();