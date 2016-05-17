var mongoose = require('mongoose');
var Movie = mongoose.model('Movie');
var co = require('co');
var koa_request = require('koa-request');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var Category = mongoose.model('Category');
var _ = require('lodash');

// index page
exports.findAll = function* () {
    var categories = yield Category
        .find({})
        .populate({
            path: 'movies',
            select: 'title poster',
            options: {limit: 6}
        })
        .exec();
    return categories;
}

// search page
exports.searchByCategory = function* (catId) {
    var categories = yield Category
        .find({_id: catId})
        .populate({
            path: 'movies',
            select: 'title poster',
            options: {limit: 6}
        })
        .exec();
    return categories;
};

exports.searchByName = function* (q) {
    var movies = yield Movie
        .find({title: new RegExp(q + '.*', 'i')})
        .exec();
    return movies;
};

exports.searchById = function* (id) {
    var movies = yield Movie
        .findOne({_id: id})
        .exec();
    return movies;
};

/**
 * 这个方法不是生成器方法，所以里面需要自己执行yield
 * @param movie
 */
function updateMovies(movie) {
    var options = {
        url: 'https://api.douban.com/v2/movie/subject/' + movie.doubanId,
        json: true
    };
    request(options).then(function (response) {
        var data = response.body;
        var countries = '';
        if (data.countries) {
            countries = data.countries.join(',');
        }
        movie = _.extend(movie, {
            country: countries,
            language: data.language,
            summary: data.summary
        });
        var genres = movie.genres;

        // 更新分类
        if (genres && genres.length > 0) {
            var cateArray = [];
            genres.forEach(function (genre) {
                // 生成器函数数组，如何调用呢？
                // TJ大神的库--co，可以让我们用同步的方式编写异步的代码
                cateArray.push(function* () {
                    var cat = yield Category.findOne({name: genre}).exec();
                    console.log(cat);
                    if (cat) {
                        cat.movies.push(movie._id)
                    }
                    else {
                        cat = new Category({
                            name: genre,
                            movies: [movie._id]
                        });
                    }
                    cat = yield cat.save();
                    movie.category = cat._id
                    yield movie.save();
                });
            });
            co(function* () {
                yield cateArray;
            });
        }
        // 存电影
        else {
            movie.save();
        }
    });
}

exports.searchByDouban = function* (q) {
    var options = {
        url: 'https://api.douban.com/v2/movie/search?q='
    }
    options.url += encodeURIComponent(q);

    var response = yield koa_request(options);
    var data = JSON.parse(response.body);
    var subjects = [];
    var movies = [];

    if (data && data.subjects) {
        subjects = data.subjects
    }

    if (subjects.length > 0) {
        var queryArray = [];
        subjects.forEach(function (item) {
            queryArray.push(function *() {
                var movie = yield Movie.findOne({doubanId: item.id});
                if (movie) {
                    movies.push(movie)
                } else {
                    var directors = item.directors || [];
                    var director = directors[0] || {};
                    movie = new Movie({
                        director: director.name || '',
                        title: item.title,
                        doubanId: item.id,
                        poster: item.images.large,
                        year: item.year,
                        genres: item.genres || []
                    });
                    movie = yield movie.save();
                    movies.push(movie);
                }
            });
        });
        yield queryArray;
        movies.forEach(function (movie) {
            updateMovies(movie);
        });

    }
    return movies;
};

exports.findHotMovies = function* (hot, count) {
    var movies = yield Movie
        .find({})
        .sort({'pv': hot}) // 1 升序 -1 倒序
        .limit(count)
        .exec();
    return movies;
};

exports.findMoviesByCate = function* (cat) {
    var movies = yield Category
        .findOne({name: cat})
        .populate({
            path : 'movies',
            select: 'title poster _id'
        })
        .exec();
    return movies;
};