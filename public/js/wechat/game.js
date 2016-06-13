/**
 * Created by ayou on 2016-06-04.
 */
var query = '';
    start = 0,
    count = 5;
/**
 * 点击加载
 */
function clickLoad() {
    $(document).on('tap','.more', function() {
        console.log(1);
        fetchMovies(query).then(addItems);
    });
}

/**
 * 查询电影
 * @param q
 * @param start
 * @param end
 */
function fetchMovies(q) {
    var defer = $.Deferred();
    // 开启移动调试后，向豆瓣发送的请求会失败
    $.ajax({
        type: 'get',
        url: 'https://api.douban.com/v2/movie/search?q=' + q + '&start=' + start + '&count=' + count,
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function(data) {
            alert(data);
            defer.resolve(data);
        },
        error: defer.reject
    })
    return defer.promise();
}

/**
 * 增加元素
 * @param data
 */
function addItems(data) {
    var defer = $.Deferred();
    var movies = data.subjects;
    alert(movies.length);
    var html = '';
    if(movies.length > 0) {
        start += count;
        movies.forEach(function(item){
            html += '<div class="card">';
            html += '<div class="card-header color-white no-border no-padding">';
            html += '<img id="img" src="' + item.images.large  + '">';
            html += '</div>';
            html += '<div class="card-content">';
            html += '<div class="list-block">';
            html += '<ul>';
            html += '<li id="title" class="h-center">' + item.title + '</li>';
            html += '<li>';
            html += '<div class="item-content">';
            html += '<div class="item-inner">';
            html += '<div class="item-title label">导演</div>';
            html += '<div id="director" class="item-input">';
            var directors = [];
            item.directors.forEach(function(d) {
               directors.push(d.name);
            });
            html += directors.join('/');
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';
            html += '<li>';
            html += '<div class="item-content">';
            html += '<div class="item-inner">';
            html += '<div class="item-title label">主演</div>';
            html += '<div id="cast" class="item-input">';
            var casts = [];
            item.casts.forEach(function(c) {
                casts.push(c.name);
            });
            html += casts.join('/');
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';
            html += '<li>';
            html += '<div class="item-content">';
            html += '<div class="item-inner">';
            html += '<div class="item-title label">类型</div>';
            html += '<div id="type" class="item-input">' + item.genres.join('/') + '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';
            html += '<li>';
            html += '<div class="item-content">';
            html += '<div class="item-inner">';
            html += '<div class="item-title label">年份</div>';
            html += '<div id="year" class="item-input">' + item.year + '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';
            html += '<li>';
            html += '<div class="item-content">';
            html += '<div class="item-inner">';
            html += '<div class="item-title label">评分</div>';
            html += '<div id="score" class="item-input">' + item.rating.average + '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
    }
    $('#list').append(html);
    if (movies.length < 5) {
        $('.infinite-scroll-preloader').remove();
    }
    defer.resolve();
    return defer.promise();
}

/**
 * 分享
 * @param movie
 */
function share(shareContent) {
    //_shareContent = {
    //    title: movie.title, // 分享标题
    //    desc: '我搜出来了' + movie.title, // 分享描述
    //    link: 'http://5xh1glu64e.proxy.qqbrowser.cc/movie', // 分享链接
    //    imgUrl: movie.images.small, // 分享图标
    //    type: 'link', // 分享类型,music、video或link，不填默认为link
    //    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
    //    success: function () {
    //        $.alert('分享成功');
    //    },
    //    cancel: function () {
    //        $.alert('分享失败');
    //    }
    //}
    var _shareContent = {
        title: '默认标题', // 分享标题
        desc: '我搜出来了个鬼', // 分享描述
        link: '', // 分享链接
        imgUrl: '#', // 分享图标
        success: function () {
            window.alert('分享成功');
        },
        cancel: function () {
            window.alert('分享失败');
        }
    };
    _shareContent = $.extend(_shareContent, shareContent);
    wx.onMenuShareAppMessage(_shareContent);
}

/**
 * 微信接口配置
 */
function wxConfig() {
    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: 'wx26d08f3077dfca3e', // 必填，公众号的唯一标识
        timestamp: $('#timestamp').val(), // 必填，生成签名的时间戳
        nonceStr: $('#noncestr').val(), // 必填，生成签名的随机串
        signature: $('#signature').val(),// 必填，签名，见附录1
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
}

/**
 * wx接口ready后
 * @returns {*}
 */
function wxReady(callback) {
    //var defer = $.Deferred();
    wx.ready(callback);
    //return defer.promise();
}

/**
 * 点击录音
 */
function clickRecord() {
    var defer = $.Deferred();
    $('#recordBtn').on('click', function() {
        var $this = $(this);
        // 改变文案
        $this.html('点击结束录音');
        // 是否在录音
        if (!$this.hasClass('recording')) {
            alert(12);
            $this.addClass('recording');
            wx.startRecord({
                cancel: function () {
                    window.alert('那就不能搜了哦');
                }
            });
            return;
        }
        // 再次点击，停止录音
        alert(22);
        wx.stopRecord({
            success: function (res) {
                $this.removeClass('recording');
                var localId = res.localId;
                $this.html('点击录音，查询电影');
                alert(localId);
                defer.resolve(localId);
            }
        });
    });
    return defer.promise();
}

/**
 * 微信翻译接口
 * @param localId
 */
function wxTranslate(localId) {
    alert(33);
    var defer = $.Deferred();
    wx.translateVoice({
        localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: function (res) {
            var result = res.translateResult;
            // 语音识别结果
            alert('语音解析结果：' + result);

            defer.resolve(result);
        }
    });
    return defer.promise();
}

$(function () {


    //query = '功夫熊猫';
    //fetchMovies(query,start,count).then(addItems).then(()=>{$('.infinite-scroll-preloader').show()});
    wxConfig();
    wxReady(function(){
        clickRecord()
            .then(wxTranslate)
            .then(fetchMovies)
            .then(addItems)
    })
        //.then(function(){
        //    clickRecord()
        //        .then(wxTranslate)
        //        .then(fetchMovies)
        //        .then(addItems)
        //});
        //then(()=>{$('.infinite-scroll-preloader').show()});
    clickLoad();

});


