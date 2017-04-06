var db = require('../config/mongo_database');
var redisClient = require('../config/redis_database').redisClient;

// 生成订单
exports.newOrder = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';
	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.sendStatus(400);
	}

	var user = new db.userModel();
	user.username = username;
	user.password = password;

	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}	
		return res.sendStatus(200)
		

	});
}

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


