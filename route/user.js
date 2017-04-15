var request = require('request');
var md5 = require('md5');
var db = require('../config/mongo_database');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');
let SMS_URL = 'https://sms.yunpian.com/v2/sms/single_send.json';

// 忘记密码， 通过短信找回
exports.findpwd = function(req, res){
	console.log(req.body)
	var username = req.body.username || '';
	var smscode = req.body.smscode || '';

	redisClient.get(username, function (err, code) {
		if(err) res.sendStatus(501); //不是绑定短信手机号
		if(smscode==code){ 

			var whereData = {username:username};
		    var updateDat = {$set: {password:md5("abcd4321")}}; //如果不用$set，替换整条数据
			db.userModel.update(whereData, updateDat, function(err, uporder){ 
				if(err){ // 保存此次订单更新失败状态
					res.sendStatus(500); 
				}
				var smsJson = {
					apikey:"966f88af7f6c20b51bb758ffa50c197c",
					text:"【比特币网站】欢迎使用陆家嘴比特币密码找回功能，重置后密码为abcd4321, 请妥善保管",
					mobile:""
				};
				smsJson.mobile = username;
				request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
					console.log(body)
					var object = JSON.parse(body);
					console.log(object)
					if(object["code"]==0){
						res.sendStatus(200); 						
					}else{
						res.json({status:500, msg:object["msg"] });
					}
				});
				
			})

		}else res.sendStatus(502); // 手机验证码不对
	});
}

// 修改密码
exports.updatepwd = function(req, res, next){
	console.log(req.body)
	var oldpwd = req.body.oldpwd || '';
	var newpwd = req.body.newpwd || '';
	if (oldpwd == '' || newpwd == '') { 
		return res.sendStatus(402); // 参数为空
	}
	if (oldpwd != newpwd) { 
		return res.sendStatus(403); // 参数为空
	}
	var userid = tokenManager.getUserId(req);
	if(userid=='56064f89ade2f21f36b03136'){
		return res.sendStatus(500); 
	}
	var userid = tokenManager.getUserId(req);
	db.userModel.findOne({_id:userid}, function (err, user) {
		if(err) res.sendStatus(500); 
		if(null!=user){
			db.userModel.update({_id:userid}, {password:md5(newpwd)}, function(err, pwduser){ // 执行变更
				res.sendStatus(200); 
			})
		}else{
			res.sendStatus(501); 
		}
		
	})


}

exports.admin = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username == '' || password == '') { 
		return res.sendStatus(401); 
	}
	if (username != 'root') { 
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

exports.signin = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	if (username == '' || password == '') { 
		return res.sendStatus(401); 
	}
	if(username == 'root'){
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
	console.log(req.body)
	var username = req.body.username || '';
	var smscode = req.body.smscode || '';
	var password = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';
	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.sendStatus(400);
	}

	var user = new db.userModel();
	user.username = username;
	user.password = password;
	user.remoteip = new Array(req.connection.remoteAddress);
	console.log(user.remoteip)
	redisClient.get(username, function (err, code) {
		console.log(err, code);
		if(err) res.sendStatus(501); //不是绑定短信手机号
		if(smscode==code){ 
			user.save(function(err) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}	
				return res.sendStatus(200)
			});

		}else res.sendStatus(502); // 手机验证码不对
	});
	
}

// 发送短信验证码
exports.sendRegMS = function(req, res) {

}

