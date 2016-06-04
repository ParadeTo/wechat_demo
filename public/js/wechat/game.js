/**
 * Created by ayou on 2016-06-04.
 */
var WX = {
  config: function() {
    // �첽����
    wx.config({
      debug: false, // ��������ģʽ,���õ�����api�ķ���ֵ���ڿͻ���alert��������Ҫ�鿴����Ĳ�����������pc�˴򿪣�������Ϣ��ͨ��log���������pc��ʱ�Ż��ӡ��
      appId: 'wx26d08f3077dfca3e', // ������ںŵ�Ψһ��ʶ
      timestamp: '#{timestamp}', // �������ǩ����ʱ���
      nonceStr: '#{noncestr}', // �������ǩ���������
      signature: '#{signature}',// ���ǩ��������¼1
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
      ] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
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
    // ���������
    var shareContent = {
      title: 'Ĭ�ϱ���', // �������
      desc: '���ѳ����˸���', // ��������
      link: 'https://www.baidu.com', // ��������
      imgUrl: '#', // ����ͼ��
      success: function () {
        window.alert('����ɹ�');
      },
      cancel: function () {
        window.alert('����ʧ��');
      }
    }
    wx.onMenuShareAppMessage(shareContent);
    wx.checkJsApi({
      jsApiList: ['onVoiceRecordEnd'], // ��Ҫ����JS�ӿ��б�����JS�ӿ��б����¼2,
      success: function (res) {
        console.log('result:');
        console.log(res);
        // �Լ�ֵ�Ե���ʽ���أ����õ�apiֵtrue��������Ϊfalse
        // �磺{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
      }
    });
    /*var slides = null;
     // ���poster
     $('#poster').on('tap', function () {
     wx.previewImage(slides);
     });*/
    // ���¼��
    var isRecording = false;
    $('#recordBtn').on('tap', function () {

      if (!isRecording) {
        isRecording = true;
        wx.startRecord({
          cancel: function () {
            window.alert('�ǾͲ�������Ŷ');
          }
        });
        return;
      }
      // �ٴε����ֹͣ¼��
      isRecording = false;
      wx.stopRecord({
        success: function (res) {
          var localId = res.localId;
          wx.translateVoice({
            localId: localId, // ��Ҫʶ�����Ƶ�ı���Id����¼����ؽӿڻ��
            isShowProgressTips: 1, // Ĭ��Ϊ1����ʾ������ʾ
            success: function (res) {
              var result = res.translateResult;
              // ����ʶ����
              $.alert('�������������'+result);
              // �����ƶ����Ժ��򶹰귢�͵������ʧ��
              $.ajax({
                type: 'get',
                url: 'https://api.douban.com/v2/movie/search?q=' + result,
                dataType: 'jsonp',
                jsonp: 'callback',
                success: function (data) {
                  var subject = data.subjects[0];
                  // ��ֵ
                  $('#title').html(subject.title);
                  $('#director').html(subject.directors[0].name);
                  $('#poster').html('<img src="' + subject.images.large + '"/>');
                  $('#year').html(subject.year);
                  alert('��������鿴����Ŷ');
                  shareContent = {
                    title: subject.title, // �������
                    desc: '���ѳ�����' + subject.title, // ��������
                    link: 'http://5xh1glu64e.proxy.qqbrowser.cc/movie', // ��������
                    imgUrl: subject.images.small, // ����ͼ��
                    type: 'link', // ��������,music��video��link������Ĭ��Ϊlink
                    dataUrl: '', // ���type��music��video����Ҫ�ṩ�������ӣ�Ĭ��Ϊ��
                    success: function () {
                      window.alert('����ɹ�');
                    },
                    cancel: function () {
                      window.alert('����ʧ��');
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
              //alert(res.translateResult); // ����ʶ��Ľ��
            }
          });
        }
      });
    });
  });


})();