'use strict';

var express = require("express");
var router = express.Router();
var http = require("http");
var User = require("../models/user");
var Twitter = require("twitter");
var queryPath = "https://api.twitter.com/1.1/search/tweets.json";
var env = require("dotenv").config();

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


router.get("/", User.authMiddleware, function(req, res) {
  console.log(req.user);
  var qVal="";
  if(req.user.tweets){
      qVal = req.user.tweets.join(" OR ");
    client.get(queryPath, {q:qVal}, function(err, tweets, response) {
        if (err) {
            console.log(err)
        }
        return res.send(tweets);
    });  
  } else{
    return res.send("No queries available");
  }

});


router.post("/:query", User.authMiddleware, function(req, res) {
    console.log(req.params.query);

    User.findByIdAndUpdate(req.user._id, {
        $push: {
            tweets: req.params.query
        }
    }, {
        new: true
    }).exec(function(err, user) {
        if (err) return res.status(400).send(err);
        user.password = null;
        return res.status(200).send(user.tweets);

    });

});


router.put("/:query", User.authMiddleware, function(req, res) {
    console.log(req.params.query);

    User.findByIdAndUpdate(req.user._id, {
        $push: {
            tweets: req.params.query
        }
    }, {
        new: true
    }).exec(function(err, user) {
        if (err) return res.status(400).send(err);
        return res.status(200).send(user.tweets);

    });

});

router.delete("/:query", User.authMiddleware, function(req, res) {
    console.log(req.params.query);

    User.findByIdAndUpdate(req.user._id, {
        $pull: {
            tweets: req.params.query
        }
    }, {
        new: true
    }).exec(function(err, user) {
        if (err) return res.status(400).send(err);
        return res.status(200).send(user);

    });

});





module.exports = router;