var redisClient = require('./redis_database').redisClient;
var moment = require('moment');
var TIME_OUT = 60 * 5;
var smsJson = {
	apikey:"966f88af7f6c20b51bb758ffa50c197c",
	text:"【比特币网站】欢迎使用陆家嘴比特币，您的验证码是000000， 本次验证码10分钟内有效",
	mobile:""
};
var question = {
	"1" : {"id":"1"  ,"que":"1 + 1 = ?", "ok":"2"},
	"2" : {"id":"2"  ,"que":"2 + 4 = ?", "ok":"6"},
	"3" : {"id":"3"  ,"que":"3 * 3 = ?", "ok":"9"},
	"4" : {"id":"4"  ,"que":"10 + 10 = ?", "ok":"20"},
	"5" : {"id":"5"  ,"que":"4 * 4 = ?", "ok":"16"},
	"6" : {"id":"6"  ,"que":"18 - 10 = ?", "ok":"8"},
	"7" : {"id":"7"  ,"que":"4 - 2 = ?", "ok":"2"},
	"8" : {"id":"8"  ,"que":"5 * 1 = ?", "ok":"5"},
	"9" : {"id":"9"  ,"que":"9 - 6 = ?", "ok":"3"}
};
let SMS_URL = 'https://sms.yunpian.com/v2/sms/single_send.json';

// 注册动态校验码第一次
exports.regSend = function (req, res, next) {
	var resque = question[Math.round(Math.random()*9+1)];
	resque.id = moment(new Date()).format("YYYYMMDDHHmmss");
	redisClient.set(resque.id, resque["ok"]);
    redisClient.expire(resque.id, TIME_OUT); // 5分钟失败

    resque.ok = undefined; // 清空答案
    res.json(resque);
};

// 动态校验码
exports.reSend = function (req, res, next) {
	var resque = question[Math.round(Math.random()*9+1)];
	resque.id = moment(new Date()).format("YYYYMMDDHHmmss");
	redisClient.set(resque.id, resque["ok"]);
    redisClient.expire(resque.id, TIME_OUT); // 5分钟失败

    resque.ok = undefined; // 清空答案
    res.json(resque);
};


// 发送短信
exports.sendsms = function(req, res){
	var username = req.body.username || '';
	var vcode = req.body.vcode || '';
	var vid = req.body.vid || '';
	if(res.body.username == ''){
		res.sendStatus(401); //手机号为空
	}
	if(res.body.vcode == '' || res.body.vid == ''){
		res.sendStatus(402); //动态验证码为空
	}
	var remoteip = new Array(req.connection.remoteAddress);
	redisClient.get(vid, function (err, code) {
		if (err)
		    res.sendStatus(500); // 验证码错误
		if (vcode==code) { // 验证成功发送验证码
			var smsCode =  moment(new Date()).format("HHmmss");
			smsJson.mobile = username;
			smsJson.text = smsJson.text.replace("000000", smsCode);
			
			console.log(smsJson);// 监测是否有IP，有新增+1，没有新增初始化1

			request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
				var object = JSON.parse(body);
				if(object["code"]==0){
					redisClient.set(username, smsCode);
    				redisClient.expire(token, TIME_OUT*2); // 10分钟失败
    				res.sendStatus(200);
				}
				res.sendStatus(501); // 短信服务发送失败
			});
		}
		res.sendStatus(500); // 验证码错误
	});
};
			