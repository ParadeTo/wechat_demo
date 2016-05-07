/**
 * Created by Administrator on 2016/4/29 0029.
 */
'use strict'

var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechatApi = new Wechat(config.wechat);

exports.reply = function* (next) {
    var message = this.weixin;

    // 事件
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫二维码进来:' + message.EventKey + ' ' + message
                    .ticket);
            }
            this.body = '哈哈，你订阅了这个号\r\n' + '这是游大帅哥的测试公众号！\r\n' +
            '试试回复深圳、长沙';
        }
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = '';
        }
        else if (message.Event === 'LOCATION') {
            console.log('无情取关');
            this.body = '您在' + message.Latitude + '/' + message.Longitude + '-' +
                message.Precision;
        }
        else if (message.Event === 'CLICK') {
            this.body = '您点击了菜单：' + message.EventKey;
        }
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
            this.body = '看到你扫了一下哦';
        }
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接：' + message.EventKey;// url地址
        }
    }
    // 文本
    else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '你好，小妹子，试试输入1-10吧';
        if (content === '1') {
            reply = '天下第一吃大米';
        }
        else if (content === '2') {
            reply = '天下第二吃豆腐';
        }
        else if (content === '3') {
            reply = '天下第三吃仙丹'
        }
        else if (content === '4') {
            reply = [
                {
                    title: '技术改变世界',
                    description: '描述',
                    picUrl : 'http://preview.quanjing.com/age_foto079/x8h-1475301.jpg',
                    url: 'https://github.com/'
                },
                {
                    title: '我是帅哥',
                    description: '描述',
                    picUrl : 'http://preview.quanjing.com/chineseview089/east-ep-a91-2195211.jpg',
                    url: 'https://www.baidu.com'
                }
            ];
        }
        else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', __dirname +
                '/public/images/cs/1.jpg');

            reply = {
                type: 'image',
                mediaId: data.media_id
            };
        }
        else if (content === '6') {
            console.log("content:"+6);
            var data = yield wechatApi.uploadMaterial('video', __dirname +
            '/public/video/xmz.mp4');

            reply = {
                type: 'video',
                title: '回眸一笑百媚生',
                description: '回眸一笑百媚生',
                mediaId: data.media_id
            };
        }
        else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', __dirname +
            '/public/images/cs/1.jpg');

            reply = {
                type: 'music',
                title: '来来来，嗨皮一下',
                description: '嗨皮一下',
                musicUrl: 'http://xazkkj.eicp.net/music/moon.mp3',
                thumbMediaId: data.media_id // 上传的图片作为音乐封面
            };
        }
        // 永久素材
        else if (content === '8') {
            var data = yield wechatApi.uploadMaterial('image', __dirname +
            '/public/images/cs/1.jpg',{type:'image'});
            reply = {
                type: 'image',
                mediaId: data.media_id
            };
        }
        else if (content === '9') {
            var data = yield wechatApi.uploadMaterial('video', __dirname +
            '/public/video/xmz.mp4',{
                type:'video',
                description: '{"title":"Really a nice place","introduction":"good"}'
            });
            reply = {
                type: 'video',
                title: '回眸一笑百媚生',
                description: '回眸一笑百媚生',
                mediaId: data.media_id
            };
        }
        else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', __dirname +
            '/public/images/cs/1.jpg',{});
            console.log('picData:');
            console.log(picData);
            var media = {
                articles: [{
                    title: '图片',
                    thumb_media_id: picData.media_id,
                    author: 'Scott',
                    digest: '摘要',
                    show_cover_pic: 1,
                    content: '没有内容',
                    content_source_url: 'http://www.baidu.com'
                }]
            };
            var data = yield wechatApi.uploadMaterial('news', media, {});
            console.log('data1:');
            console.log(data);
            data = yield wechatApi.fetchMaterial(data.media_id, 'news', {});
            console.log('data:');
            console.log(data);
            var items = data.news_item;
            var news = [];

            items.forEach(function(item) {
               news.push({
                   title: item.title,
                   description: item.digest,
                   picUrl: picData.url,
                   url: item.url
               });
            });

            reply = news;
        }
        else if (content === '11') {
            var counts = yield wechatApi.countMaterial();
            console.log(JSON.stringify(counts));
            var results = yield [
                wechatApi.batchMaterial({
                    offset: 0,
                    count: 10,
                    type:'image'
                }),
                wechatApi.batchMaterial({
                    offset: 0,
                    count: 10,
                    type:'video'
                }),
                wechatApi.batchMaterial({
                    offset: 0,
                    count: 10,
                    type:'voice'
                }),
                wechatApi.batchMaterial({
                    offset: 0,
                    count: 10,
                    type:'news'
                })
            ];
            console.log(JSON.stringify(results));
            reply = '1';
        }
        else if (content === '12') {
            var group = yield wechatApi.createGroup('wechat');
            console.log('新分组 wechat');
            console.log(group);
            var groups = yield wechatApi.fetchGroups();
            console.log('分组列表');
            console.log(groups);

            var group2 = yield wechatApi.checkGroup(message.FromUserName);
            console.log('查看');
            console.log(group2);
            reply = 'Group done!';
        }
        else if (content === '13') {
            var user = yield wechatApi.fetchUsers(message.FromUserName);
            console.log(user);
            var openIds = [
                {
                    openid: message.FromUserName,
                    lang: 'en'
                }
            ];
            var users = yield wechatApi.fetchUsers(openIds);
            console.log(users);
            reply = JSON.stringify(user);
        }
        else if (content === '14') {
            var userlist = yield wechatApi.listUsers();
            console.log(userlist);
            reply = userlist.total;
        }
        // 测试号发不了
        else if (content === '15') {
            var mpnews = {
                media_id: 'M50gNASgkWfAmCAruVMxxauKDbpcZXQXG-J4uxcZpGE'
            }
            var text = {
                'content':'Hello ayou'
            };
            var msgData = yield wechatApi.sendByGroup('mpnews', mpnews);

            console.log('msgData:');
            console.log(msgData);
            reply = 'Yeah!';
        }
        else if (content === '长沙') {
            reply = [
                {
                    title: '长沙-啊，我的故乡',
                    description: '',
                    picUrl : 'http://preview.quanjing.com/age_foto079/x8h-1475301.jpg',
                    url: 'https://github.com/'
                },
                {
                    title: '我是帅哥',
                    description: '描述',
                    picUrl : 'http://preview.quanjing.com/chineseview089/east-ep-a91-2195211.jpg',
                    url: 'https://www.baidu.com'
                }
            ];
        }
        else if (content === '深圳') {

        }
        this.body = reply;
    }
    yield next;
};