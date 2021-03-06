var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
  openid: String,
  name: {
    unique: true,
    type: String
  },
  headimgurl: String,
  password: String,
  // 0: nomal user
  // 1: verified user
  // 2: professonal user
  // >10: admin
  // >50: super admin
  role: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

//UserSchema.pre('save', function(next) {
//  var user = this
//
//  if (this.isNew) {
//    this.meta.createAt = this.meta.updateAt = Date.now()
//  }
//  else {
//    this.meta.updateAt = Date.now()
//  }
//  next();
//  //bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//  //  if (err) return next(err)
//  //
//  //  bcrypt.hash(user.password, salt, function(err, hash) {
//  //    if (err) return next(err)
//  //
//  //    user.password = hash
//  //    next()
//  //  })
//  //})
//})

UserSchema.methods = {
  comparePassword: function(_password,password) {
    //win 下无法安装bcrypt
    if (_password === password) {
      return true;
      //cb(null, true);
    } else {
      return false;
      //cb(null, false)
    }
  }
  //  var password = this.password;
  //  return function(cb) {
  //    bcrypt.compare(_password, password, function(err, isMatch) {
  //      cb(err, isMatch)
  //    });
  //  }
  //}
}

UserSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = UserSchema