var redisClient = require('./redis_database').redisClient;
var jwt = require('jsonwebtoken');
var secret = require('./secret');
var TOKEN_EXPIRATION = 60 * 60;
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 1;

// Middleware for token verification
exports.verifyToken = function (req, res, next) {
	var token = getToken(req.headers);

	redisClient.get(token, function (err, reply) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		if (null==reply) {
			res.sendStatus(401);
		}
		else {
			next();
		}

	});
};

exports.expireToken = function(headers) {
	var token = getToken(headers);
	if (token != null) {
		redisClient.set(token, '{is_expired:true}');
    	redisClient.expire(token, 3);
	}
};

exports.getUser = function(req){
	var token = getToken(req.headers);
	var json = jwt.decode(token, secret.secretToken);
	var user = {};
	user.id = json._doc._id;
	user.username = json._doc.username;
	user.name = json._doc.name;
	user.idcard = json._doc.idcard;
	return user;
}

exports.getUserId = function(req){
	var token = getToken(req.headers);
	var json = jwt.decode(token, secret.secretToken);
	return json._doc._id;
}

var getToken = function(headers) {
	if (headers && headers.authorization) {
		var authorization = headers.authorization;
		var part = authorization.split(' ');

		if (part.length == 2) {
			var token = part[1];

			return part[1];
		}
		else {
			return null;
		}
	}
	else {
		return null;
	}
};

exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;