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
			console.log(isBackpay(order))
			if(isBackpay(order) >= 0){
				res.status(402); //尚未到时间
			}
			res.json(order);
		}else{
			res.status(400); // 未发现订单
		} 
		
	})

}

exports.confirmPayback = function(req, res){
	var orderid = req.body.orderid || '';
	var user = tokenManager.getUser(req);
	var whereData = {orderid:orderid, userid:user.userid, status:"1"};
	console.log(whereData)
	db.orderModel.findOne(whereData, function(err, order){
		console.log(order)
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

function updateOrderStatus(status){
	var updateDat = {$set: {status:'', updated:new Date()}}; //如果不用$set，替换整条数据
	db.orderModel.update(whereData, updateDat, function(err, uporder){ // 执行订单状态变更
		log.content = uporder;
		if(err){ // 保存此次订单更新失败状态
			console.log(err)
        	log.msg = "支付链接更新失败："+whereData.orderid;
			log.save(function(err) {})
		}
		log.save(function(err) {})
	})
}

function isBackpay(order) {
		Date.prototype.diff = function(date){
		  return (this.getTime() - date.getTime())/(24 * 60 * 60 * 1000);
		}
		var now = new Date();
		var date = addDaysToDate(new Date(order.created), order.pid.week);
		var diff = date.diff(now);
		diff = diff.toFixed(0);
		return diff;
		
	                                           
    }

function addDaysToDate(myDate,days) {
	return new Date(myDate.getTime() + days*24*60*60*1000);
}
