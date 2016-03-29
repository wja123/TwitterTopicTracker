'use strict';

var mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');

const JWT_SECRET = 'Would the Declaration of Independence be too long?';

var User;

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tweets: {
        type: [String],
        default: []
    }
});

userSchema.statics.authMiddleware = function(req, res, next) {
    var cookie = req.cookies.tweetcookie;

    try {
        var payload = jwt.decode(cookie, JWT_SECRET);
    } catch (err) {
        return res.clearCookie('tweetcookie').status(401).send();
    }

    User.findById(payload._id).select({
        'password': 0
    }).exec(function(err, user) {
        if (err || !user) return res.status(401).send();
        req.user = user;
        next();
    });
};

userSchema.methods.generateToken = function() {
    var payload = {
        _id: this._id,
        iat: Date.now()
    };

    var token = jwt.encode(payload, JWT_SECRET);
    return token;
};

userSchema.statics.authenticate = function(userObj,cb){
  User.findOne({username:userObj.username}).exec(function(err,user){
    if(err || !user){
      return cb("Authentication Failed");
    } 
    bcrypt.compare(userObj.password,user.password,function(err,matchFound){
      if(err || !matchFound){
        return cb("Authentication Failed");
      }
      else{
        user.password = null;
        cb(null,user);
      }

    });

  });
};

userSchema.statics.register = function(userObj, cb) {
    bcrypt.hash(userObj.password, 10, function(err, hash) {
        if (err) {
            cb(err);
        }
        User.create({
            username: userObj.username,
            password: hash
        }, function(err, user) {
            if (err) {
                cb(err);
            } else {
                user.password = null;
                cb(err, user);
            }
        });
    });
};



User = mongoose.model('TwitterUser', userSchema);

module.exports = User;