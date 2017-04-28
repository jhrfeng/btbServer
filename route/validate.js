var redisClient = require('../config/redis_database').redisClient;
var db = require('../config/mongo_database');
var moment = require('moment');
var request = require('request');
var tokenManager = require('../config/token_manager');
var md5 = require('md5');
var TIME_OUT = 60 * 5;
let SMS_URL = 'https://sms.yunpian.com/v2/sms/single_send.json';
// let SMS_CODE = ['281822','283711','190982','367291','903831','368731','094823','283746','766321','476261',
// 				'495871','984731','374781','048473','371673','756463','239183','476236','499837','373677'];


// 动态校验码
exports.reSend = function (req, res, next) {
	let question = {
		"0" : {"id":"1"  ,"que":"1 + 2 = ?", "ok":"3"},
		"1" : {"id":"1"  ,"que":"1 + 1 = ?", "ok":"2"},
		"2" : {"id":"2"  ,"que":"2 + 4 = ?", "ok":"6"},
		"3" : {"id":"3"  ,"que":"3 * 3 = ?", "ok":"9"},
		"4" : {"id":"4"  ,"que":"10 + 10 = ?", "ok":"20"},
		"5" : {"id":"5"  ,"que":"4 * 4 = ?", "ok":"16"},
		"6" : {"id":"6"  ,"que":"18 - 10 = ?", "ok":"8"},
		"7" : {"id":"7"  ,"que":"4 - 2 = ?", "ok":"2"},
		"8" : {"id":"8"  ,"que":"5 * 1 = ?", "ok":"5"},
		"9" : {"id":"9"  ,"que":"9 - 6 = ?", "ok":"3"},
		"9" : {"id":"10"  ,"que":"9 - 5 = ?", "ok":"4"}
	};
	var index = Math.round(Math.random()*9);
	var resque = question[index];
	console.log(resque)
	resque["id"]= moment(new Date()).format("YYYYMMDDHHmmss");
	redisClient.set(resque["id"], resque["ok"]);
    redisClient.expire(resque["id"], TIME_OUT); // 5分钟失败

    resque.ok = undefined; // 清空答案
    res.json(resque);
};

// 发送短信
exports.sendinfosms = function(req, res){
	var user = tokenManager.getUser(req);
	var username = user.username;
	var vcode = req.body.vcode || '';
	var vid = req.body.vid || '';

	if(vcode == '' || vid == ''){
		res.sendStatus(402); //动态验证码为空
	}

	var remoteip = new Array(req.connection.remoteAddress);
	redisClient.get(vid, function (err, code) {
		console.log(err, code)
		if (err)
		    res.sendStatus(500); // 验证码错误
		if (vcode==code) { // 验证成功发送验证码

			var smsJson = {
				apikey:"966f88af7f6c20b51bb758ffa50c197c",
				text:"【比特币网站】欢迎使用陆家嘴比特币，您的验证码是000000， 本次验证码10分钟内有效",
				mobile:""
			};
			
			var SMS_CODE = moment(new Date()).format("mmssSS"); //验证码
			smsJson.mobile = username;
			smsJson.text = smsJson.text.replace("000000", SMS_CODE); // 验证码替换模板
			
			console.log(smsJson);

			request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
				console.log(body)
				var object = JSON.parse(body);
				if(object["code"]==0){
					console.log("redissms", username, SMS_CODE)
					redisClient.set(username, SMS_CODE);
    				redisClient.expire(username, TIME_OUT*2); // 10分钟失败
    				redisClient.del(vid);
    				res.sendStatus(200);
				}else{
					 res.json({status:501, msg:object["msg"] });
				}
			});
		
		}else	res.sendStatus(500); // 验证码错误
	});
};


// 发送短信
exports.sendsms = function(req, res){
	var username = req.body.username || '';
	var vcode = req.body.vcode || '';
	var vid = req.body.vid || '';
	console.log(req.body)
	if(username == ''){
		res.sendStatus(403); //手机号为空
	}
	if(vcode == '' || vid == ''){
		res.sendStatus(402); //动态验证码为空
	}
	var remoteip = new Array(req.connection.remoteAddress);
	redisClient.get(vid, function (err, code) {
		console.log(err, code)
		if (err)
		    res.sendStatus(500); // 验证码错误
		if (vcode==code) { // 验证成功发送验证码

			var smsJson = {
				apikey:"966f88af7f6c20b51bb758ffa50c197c",
				text:"【比特币网站】欢迎使用陆家嘴比特币，您的验证码是000000， 本次验证码10分钟内有效",
				mobile:""
			};
			
			var SMS_CODE = moment(new Date()).format("mmssSS"); //验证码
			smsJson.mobile = username;
			smsJson.text = smsJson.text.replace("000000", SMS_CODE); // 验证码替换模板
			
			console.log(smsJson);

			request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
				console.log(body)
				var object = JSON.parse(body);
				if(object["code"]==0){
					console.log("redissms", username, SMS_CODE)
					redisClient.set(username, SMS_CODE);
    				redisClient.expire(username, TIME_OUT*2); // 10分钟失败
    				redisClient.del(vid);
    				res.sendStatus(200);
				}else{
					 res.json({status:501, msg:object["msg"] });
				}
			});
		
		}else	res.sendStatus(500); // 验证码错误
	});
};

// 发送忘记短信
exports.sendpwdsms = function(req, res){
	var username = req.body.username || '';
	var vcode = req.body.vcode || '';
	var vid = req.body.vid || '';
	console.log(req.body)
	if(username == ''){
		res.sendStatus(403); //手机号为空
	}
	if(vcode == '' || vid == ''){
		res.sendStatus(402); //动态验证码为空
	}
	db.userModel.findOne({username: username}, function (err, user) {
		if (err) {
			return res.sendStatus(403);
		}
		if (user == undefined) {
			return res.sendStatus(403);
		}
		var remoteip = new Array(req.connection.remoteAddress);
		redisClient.get(vid, function (err, code) {
			console.log(err, code)
			if (err)
			    res.sendStatus(500); // 验证码错误
			if (vcode==code) { // 验证成功发送验证码

				var smsJson = {
					apikey:"966f88af7f6c20b51bb758ffa50c197c",
					text:"【比特币网站】欢迎使用陆家嘴比特币，您的验证码是000000， 本次验证码10分钟内有效",
					mobile:""
				};
				
				var SMS_CODE = moment(new Date()).format("mmssSS"); //验证码
				smsJson.mobile = username;
				smsJson.text = smsJson.text.replace("000000", SMS_CODE); // 验证码替换模板
				
				console.log(smsJson);

				request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
					console.log(body)
					var object = JSON.parse(body);
					if(object["code"]==0){
						console.log("redissms", username, SMS_CODE)
						redisClient.set(username, SMS_CODE);
	    				redisClient.expire(username, TIME_OUT*2); // 10分钟失败
	    				redisClient.del(vid);
	    				res.sendStatus(200);
					}else{
						 res.json({status:501, msg:object["msg"] });
					}
				});
			
			}else	res.sendStatus(500); // 验证码错误
		});
	})	


	
};
			
// 慎重， 删除所有数据
exports.removeAll = function (req, res, next) {
	db.userModel.remove(function(err, data){ console.log(err, data)});
	db.orderModel.remove(function(err, data){ console.log(err, data)});
    db.logModel.remove(function(err, data){ console.log(err, data)});

    db.userModel.find(function(err, data){ console.log(err, data)});
	db.orderModel.find(function(err, data){ console.log(err, data)});
    db.logModel.find(function(err, data){ console.log(err, data)});
}

// 慎重， 查看所有
exports.findAll = function (req, res, next) {
    db.userModel.find({username:'13575766414'}, function(err, data1){
     	// db.orderModel.find(function(err, data2){ 
     	// 	res.json({data1:data1, data2:data2}); 
     	// });
 	});
	
  
}

// 慎重， 添加所有数据
exports.addAll = function (req, res, next) {
	var user = new db.userModel();
	user.username = "13575766414";
	user.password = "13575766414";
	user.remoteip = new Array(req.connection.remoteAddress);
	user.save(function(err) {});

	// var user1 = new db.userModel();
	// user1.username = "18811122887";
	// user1.password = "123456";
	// user1.remoteip = new Array(req.connection.remoteAddress);
	// user1.save(function(err) {});

	// var user2 = new db.userModel();
	// user2.username = "18601248765";
	// user2.password = "123456";
	// user2.remoteip = new Array(req.connection.remoteAddress);
	// user2.save(function(err) {});

};

// 慎重， 添加所有数据
exports.addOrder = function (req, res, next) {
			var order1 = new db.orderModel();
	order1.userid = "5902b077b209130502de9e98";
	order1.orderid = "00000000_09"; // 预存
	order1.pid = {"pid":"20170003", "name":"比特币套利基金全年", "shouyi":40.0, "week":365, "join":1000};
	order1.payAmount = 100000;
	order1.tradeno = "00000000_09";
	order1.outtrade = "00000000_09";
	order1.opendate = moment("2017-04-28").dayOfYear(365);
	order1.openAmount = 140000;
	order1.openStatus = "0";
	order1.created = moment("2017-04-28"); //购买日期
	order1.updated = new Date();
	order1.status = "1";
	order1.save(function(err) {});

	// 	var order2 = new db.orderModel();
	// order2.userid = "58ee59fe9275553efc7a0d26";
	// order2.orderid = "00000000_02"; // 预存
	// order2.pid = {"pid":"20170001", "name":"新人专享9611050期", "shouyi":20.0, "week": 90, "join":1000};
	// order2.payAmount = 30000;
	// order2.tradeno = "00000000_02";
	// order2.outtrade = "00000000_02";
	// order2.opendate = moment("2017-07-05");
	// order2.openAmount = 45000;
	// order2.openStatus = "0";
	// order2.created = moment("2017-04-05"); //购买日期
	// order2.updated = new Date();
	// order2.status = "1";
	// order2.save(function(err) {});

	// 	var order3 = new db.orderModel();
	// order3.userid = "58ee59fe9275553efc7a0d27";
	// order3.orderid = "00000000_03"; // 预存
	// order3.pid = {"pid":"20170001", "name":"新人专享9611050期", "shouyi":20.0, "week": 90, "join":1000};
	// order3.payAmount = 200;
	// order3.tradeno = "00000000_03";
	// order3.outtrade = "00000000_03";
	// order3.opendate = moment("2017-06-19");
	// order3.openAmount = 240;
	// order3.openStatus = "0";
	// order3.created = moment("2017-03-19"); //购买日期
	// order3.updated = new Date();
	// order3.status = "1";
	// order3.save(function(err) {});

	// 	var order4 = new db.orderModel();
	// order4.userid = "58ee59fe9275553efc7a0d28";
	// order4.orderid = "00000000_04"; // 预存
	// order4.pid = {"pid":"20170001", "name":"新人专享9611050期", "shouyi":20.0, "week": 90, "join":1000};
	// order4.payAmount = 1000;
	// order4.tradeno = "00000000_04";
	// order4.outtrade = "00000000_04";
	// order4.opendate = moment("1995-12-25");
	// order4.openAmount = 1200;
	// order4.openStatus = "0";
	// order4.created = moment("1995-12-25"); //购买日期
	// order4.updated = new Date();
	// order4.status = "1";
	// order4.save(function(err) {});
}