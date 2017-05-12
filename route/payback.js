var request = require('request');
var db = require('../config/mongo_database');
var secret = require('../config/secret');
let SMS_URL = 'https://sms.yunpian.com/v2/sms/single_send.json';
var tokenManager = require('../config/token_manager');

/**
  1.判断订单是否到赎回期，
  2，Y更新订单状态为2
  3，同时插入到赎回订单中一条记录
  4，发送短信通知客户和管理员

**/
exports.backpay = function(req, res){
	var orderid = req.body.orderid || '';
	var user = tokenManager.getUser(req);
	var whereData = {orderid:orderid, userid:user.id, status:"1"};
	console.log(whereData)
	db.orderModel.findOne(whereData, function(err, order){
		if(order){
			if(isBackpay(order) >= 0){
				res.sendStatus(402); //尚未到时间
			}else{
				updateOrderStatus(orderid, "1");
				generateBackorder(order, user);
				sendCustomer(user.username, orderid);
				sendAdmin(user.username, orderid);
				res.sendStatus(200);
			}
		}else{
			res.sendStatus(400); // 未发现订单
		} 
		
	})

}

exports.confirmPayback = function(req, res){
	var orderid = req.body.orderid || '';
	var user = tokenManager.getUser(req);
	var whereData = {orderid:orderid, userid:user.id, status:"1"};
	console.log(whereData)
	db.orderModel.findOne(whereData, function(err, order){
	})
}

//】尊敬的用户：已收到您赎回#orderid#的订单请求，我们会在1~3个工作日处理完毕，再次感谢您对我们的支持和信任。
function sendCustomer(mobile, orderid){
	var smsJson = {
				apikey:"966f88af7f6c20b51bb758ffa50c197c",
				text:"【陆家嘴比特币】尊敬的用户：已收到您赎回"+orderid+"的订单请求，我们会在1~3个工作日处理完毕，再次感谢您对我们的支持和信任。",
				mobile:mobile
			};
	request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
		console.log(body)
	});	
}

function sendAdmin(mobile, orderid){
	var smsJson = {
				apikey:"966f88af7f6c20b51bb758ffa50c197c",
				text:"【陆家嘴比特币】手机号为"+mobile+"的客户正在申请赎回"+orderid+"订单，请您及时处理。",
				mobile:""
			};
    smsJson.mobile = mobile;
	request.post({url:SMS_URL, form: smsJson}, function(err,httpResponse,body){
		console.log(body)
	});	
}

function updateOrderStatus(orderid, status){
	var updateDat = {$set: {status:status, updated:new Date()}}; //如果不用$set，替换整条数据
	db.orderModel.update({orderid:orderid}, updateDat, function(err, uporder){ // 执行订单状态变更
	})
}

// 生成一笔赎回单
function generateBackorder(order, user){
	var backOrder = new db.backorderModel();

	backOrder.userid  = order.userid;
	backOrder.orderid = order.orderid;
	backOrder.product = order.pid.name
	backOrder.account = user.username;
	// 先处理掉user中敏感的字段信息
	backOrder.user = user;
	backOrder.save(function(err) {});
	
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
