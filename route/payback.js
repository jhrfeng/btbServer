var request = require('request');
var db = require('../config/mongo_database');
var secret = require('../config/secret');
let SMS_URL = 'https://sms.yunpian.com/v2/sms/single_send.json';
var tokenManager = require('../config/token_manager');


exports.backpay = function(req, res){
	var orderid = req.body.orderid || '';
	var userid = tokenManager.getUserId(req);
	var whereData = {orderid:orderid, userid:userid, status:"1"};
	db.orderModel.findOne(whereData, function(err, order){
		if(order){
			res.json(order);
		}else{
			res.status(400); // 未发现订单
		} 
		
	})

}


exports.sms1 = function(req, res){
	db.userModel.find(function (err, users) {
			for(i in users){
				if(users[i]["username"]!="root"){
					console.log(users[i]["username"])
					sendSms(users[i]["username"])
				}
			}
			res.json({msg:"发送成功"}); 
		}).sort({ created : -1 });	
}


function sendSms(mobile){
	var smsJson = {
				apikey:"966f88af7f6c20b51bb758ffa50c197c",
				text:"【陆家嘴比特币】尊敬的用户：您的新产品陆家嘴比特币一号已授权完成，可以进行查看。",
				mobile:""
			};
    smsJson.mobile = mobile;
	request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
		var object = JSON.parse(body);
		if(object["code"]!=0){
			var log = new db.logModel();
			log.name = "短信通知";
			log.content = { msg:object["msg"], mobile:mobile };
			log.save(function(err) {})
		}
	});	
}

