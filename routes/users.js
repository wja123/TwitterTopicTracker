var express = require('express');
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.post('/', function(req, res, next) {
    User.register(req.body, function(err, user) {
        if (err) return res.status(400).send("Registration Failed!");
        return res.send(user);
    });

});

router.put('/', function(req, res, next) {
    User.authenticate(req.body, function(err, user) {
        if (err) {
            return res.status(400).send("Registration Failed!");
        } else {
            var token = user.generateToken();
            return res.cookie('tweetcookie', token).send(user);
        }
    });
});

router.delete('/logout', function(req, res) {
    return res.clearCookie('tweetcookie').send();
});

module.exports = router;