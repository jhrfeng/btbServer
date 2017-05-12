var moment = require('moment');
var db = require('../config/mongo_database');
var tokenManager = require('../config/token_manager');

var product = {
	"20170000": {"pid":"20170000", "name":"比特币套利基金新月", "shouyi":8.0, "week": 30, "join":1000},
	"20170001": {"pid":"20170001", "name":"比特币套利基金一季", "shouyi":20.0, "week": 90, "join":1000},
	"20170002": {"pid":"20170002", "name":"比特币套利基金半年", "shouyi":30.0, "week":180, "join":1000},
	"20170003": {"pid":"20170003", "name":"比特币套利基金全年", "shouyi":40.0, "week":365, "join":1000}
}

// 取消订单
exports.cancelOrder = function(req, res, next){
	var orderid = req.body.orderid || '';
	var userid = tokenManager.getUserId(req);
	var whereData = {orderid:orderid, userid:userid, status:"0"};
	db.orderModel.remove(whereData, function(err){ 
		res.sendStatus(200);
	})
	// res.sendStatus(200);
}

// 生成订单
exports.newOrder = function(req, res, next) {
	var pid = req.body.pid || '';             // 商品号
	var payAmount = req.body.payAmount || ''; // 支付金额

	if(pid!='' && payAmount!=''){
		if(product[pid] === undefined){
			return res.json({status:402, msg:"未查询到产品"});
		}
		if(payAmount < product[pid].join){
			return res.json({status:402, msg:"订单金额应大于起投金额"});
		}
		var order = new db.orderModel();

		var tradeno = moment(new Date()).format("YYYYMMDDHHmmss") + moment(new Date()).format("YYYYMMDDHHmmss");
		var outtrade = "666888" + moment(new Date()).format("YYYYMMDDHHmmss");
	
		order.userid = tokenManager.getUserId(req);
		order.orderid = moment().minute() + moment(new Date()).format("YYYYMMDDHHmmss") + moment().minute() + moment(new Date()).format("mmss");
		order.pid = product[pid];
		order.payAmount = payAmount;
		order.tradeno = tradeno;
		order.outtrade = outtrade;
		order.opendate = moment(new Date()).dayOfYear(product[pid].week);
		order.openAmount = payAmount*(1 + product[pid].shouyi/100/365*product[pid].week);
		order.openAmount = order.openAmount.toFixed(0);
		console.log(order.openAmount)
		order.save(function(err) {
			if (err) {
				console.log(err);
				return res.json({status:500, msg:"订单处理失败，请重新下单"});
			}	
			return res.json({status:200, data:{orderid:order.orderid}, msg:"订单生产成功"});
		});

	}else{
		return res.json({status:401, msg:"未接收到参数"});
	}

}

exports.queryOrder = function(req, res, next) {
	var orderid = req.body.orderid || '';
	
	db.orderModel.findOne({orderid: orderid}, function (err, order) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); //res.json({status:500, msg:"未查询到订单，请重新生成新单"});
		}
		return res.json({status:200, order:order, msg:"订单查询成功"});
	});
};

exports.queryAllOrder = function(req, res, next) {
	var userid = tokenManager.getUserId(req);
	
	db.orderModel.find({userid: userid}, function (err, order) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); //res.json({status:500, msg:"未查询到订单，请重新生成新单"});
		}
		return res.json({status:200, order:order, msg:"订单查询成功"});
	}).sort({ created : -1 });
};

// 赎回订单
exports.queryAllbackorder = function(req, res, next) {
	var userid = tokenManager.getUserId(req);
	
	db.backorderModel.find({userid: userid}, function (err, order) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		return res.json({status:200, order:order, msg:"订单查询成功"});
	}).sort({ created : -1 });
};

exports.queryBlackorder = function(req, res, next) {
	var userid = tokenManager.getUserId(req);
	if(userid!='56064f89ade2f21f36b03136'){
		return res.sendStatus(500); 
	}else{
		db.orderModel.find({status: "1"}, function (err, order) {
			return res.json({status:200, order:order, msg:"订单查询成功"});
		}).sort({ created : -1 });
	}

};


