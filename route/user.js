var md5 = require('md5');
var db = require('../config/mongo_database');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');

exports.signin = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username == '' || password == '') { 
		return res.sendStatus(401); 
	}

	db.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.sendStatus(401);
		}

		if (user == undefined) {
			return res.sendStatus(401);
		}
		
		user.comparePassword(password, function(isMatch) {
			if (!isMatch) {
				console.log("Attempt failed to login with " + user.username);
				return res.sendStatus(401);
            }
            var token = jwt.sign(user, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION }); //expiresIn: '24h'
            redisClient.set(token, '{is_expired:false}');
            redisClient.expire(token, tokenManager.TOKEN_EXPIRATION);
			return res.json({token:token});
		});

	});
};

exports.logout = function(req, res) {
	if (req.user) {
		tokenManager.expireToken(req.headers);

		delete req.user;	
		return res.sendStatus(200);
	}
	else {
		return res.sendStatus(401);
	}
}

exports.me = function(req, res){
	res.json(tokenManager.getUser(req));
}

exports.register = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';
	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.sendStatus(400);
	}

	var user = new db.userModel();
	user.username = username;
	user.password = password;
	user.remoteip = new Array(req.connection.remoteAddress);
	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}	
		return res.sendStatus(200)
	});
}

// 发送短信验证码
exports.sendRegMS = function(req, res) {

}

