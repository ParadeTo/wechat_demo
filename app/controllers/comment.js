'use strict';
var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')

// comment
exports.save = function* (next) {
    var _comment = this.request.body.comment;
    var id = _comment.movie;
    if (_comment.cId) {
        var comment = yield Comment.findOne({_id: _comment.cId}).exec();
        var reply = {
            from: _comment.from,
            to: _comment.tId,
            content: _comment.content
        };

        comment.reply.push(reply);

        yield comment.save();

        this.body = {success:1};
    }
    else {
        let comment = new Comment({
            movie: _comment.movie,
            from: _comment.from,
            content: _comment.content
        });

        yield comment.save();
        this.body = {success:1};
    }
}