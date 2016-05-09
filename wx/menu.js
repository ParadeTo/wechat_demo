/**
 * Created by Administrator on 2016/5/8 0008.
 */
'use strict'

module.exports = {
    'button': [
        {
            'name': '点击事件',
            'type': 'click',
            'key': 'menu_click'
        },
        {
            'name': '点出菜单',
            'sub_button': [
                {
                    'type': 'view',
                    'name': '跳转URL',
                    'url': 'http://github.com/'
                },
                {
                    'type': 'scancode_push',
                    'name': '扫码推送事件',
                    'key': 'qr_scan'
                },
                {
                    'type': 'scancode_waitmsg',
                    'name': '扫码推送中',
                    'key': 'qr_scan_wait'
                },
                {
                    'type': 'pic_sysphoto',
                    'name': '弹出系统拍照',
                    'key': 'pic_photo'
                },
                {
                    'type': 'pic_photo_or_album',
                    'name': '弹出拍照或者相册',
                    'key': 'pic_photo_album'
                }
            ]
        },
        {
            'name': '点出菜单2',
            'sub_button': [
                {
                    'type': 'pic_weixin',
                    'name': '微信相册发图',
                    'key': 'pic_weixin'
                },
                {
                    'type': 'location_select',
                    'name': '地理位置选择',
                    'key': 'location_select'
                }
                //{
                //    'type': 'view_limited',
                //    'name': '',
                //    'key': 'location_select'
                //},
                //{
                //    'type': 'media_id',
                //    'name': '下发图片消息',
                //    'media_id': 'xxx'
                //}
            ]
        }
    ]
};