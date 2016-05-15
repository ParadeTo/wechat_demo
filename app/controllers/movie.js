'use strict'
var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var Comment = mongoose.model('Comment')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

// detail page
exports.detail = function* (next) {
    var id = this.params.id;

    //yield Movie.update({_id: id}, {$inc: {pv: 1}}).exec();

    var movie = yield Movie.findOne({_id: id}).exec();

    var comments = yield Comment
        .find({movie: id})
        .populate('from', 'name')
        .populate('reply.from reply.to', 'name')
        .exec();

    yield this.render('pages/detail', {
        title: 'imooc 详情页',
        movie: movie,
        comments: comments
    });
}

// admin new page
exports.new = function* (next) {
    var categories = Category.find({}).exec();
    yield this.render('pages/admin', {
        title: 'imooc 后台录入页',
        categories: categories,
        movie: {}
    });
}

// admin update page
exports.update = function* (next) {
    var id = this.params.id

    if (id) {
        var movie = yield Movie.findOne({_id: id}).exec();
        var categories = yield Category.find({}).exec();
        yield this.render('pages/admin', {
            title: 'imooc 后台更新页',
            movie: movie,
            categories: categories
        });
    }
}

// admin poster
//exports.savePoster = function* (next) {
//    var posterData = this.files.uploadPoster
//    var filePath = posterData.path
//    var originalFilename = posterData.originalFilename
//
//    if (originalFilename) {
//        fs.readFile(filePath, function (err, data) {
//            var timestamp = Date.now()
//            var type = posterData.type.split('/')[1]
//            var poster = timestamp + '.' + type
//            var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
//
//            fs.writeFile(newPath, data, function (err) {
//                req.poster = poster
//                next()
//            })
//        })
//    }
//    else {
//        next()
//    }
//}

// admin post movie
exports.save = function* (next) {
    var id = this.request.body.movie._id
    var movieObj = this.request.body.movie
    var _movie

    if (this.poster) {
        movieObj.poster = req.poster
    }

    if (id) {
        var movie = yield Movie.findOne({_id: id}).exec();
        _movie = _.extend(movie, movieObj);
        yield _movie.save();

        this.redirect('/movie/' + movie._id)
    }
    else {
        _movie = new Movie(movieObj)

        var categoryId = movieObj.category
        var categoryName = movieObj.categoryName

        yield _movie.save();
        if (categoryId) {
            var category = yield Category.findOne({_id: categoryId}).exec();
            category.movies.push(_movie._id);
            yield category.save();
            this.redirect('/movie/' + _movie._id)
        }
        else if (categoryName) {
            var category = new Category({
                name: categoryName,
                movies: [_movie._id]
            })

            yield category.save();
            _movie.category = category._id
            yield _movie.save();
            this.redirect('/movie/' + _movie._id)
        }
    }
}

// list page
exports.list = function* (next) {
    var movies = yield Movie.find({})
        .populate('category', 'name')
        .exec();

    yield this.render('pages/list', {
        title: 'imooc 列表页',
        movies: movies
    });
}

// list page
exports.del = function* (next) {
    var id = this.query.id

    if (id) {
        try {
            yield Movie.remove({_id: id}).exec();
            this.body = {success: 1};
        }
        catch (err) {
           this.body = {success: 0};
        }
    }
}