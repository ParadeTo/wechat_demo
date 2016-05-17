/**
 * Created by Administrator on 2016/5/8 0008.
 */
'use strict'

module.exports = {
    'button': [
        {
            'name': '排行榜',
            'sub_button': [
                {
                    'type': 'click',
                    'name': '最热的',
                    'key': 'movie_hot'
                },
                {
                    'type': 'click',
                    'name': '最冷的',
                    'key': 'movie_cold'
                }
            ]
        },
        {
            'name': '分类',
            'sub_button' : [
                {
                    'type': 'click',
                    'name': '犯罪',
                    'key': 'movie_crime'
                },
                {
                    'type': 'click',
                    'name': '动画',
                    'key': 'movie_cartoon'
                }
            ]
        },
        {
            'name': '帮助',
            'type': 'click',
            'key': 'help'
        }
    ]
};