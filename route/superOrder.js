var moment = require('moment');
var db = require('../config/mongo_database');
var tokenManager = require('../config/token_manager');

var product = {
	"s20170000": {"pid":"s20170000", "name":"陆家嘴比特币一号",   "shouyi":"浮动收益",  "week": 365, "join":100}
}

// 取消订单
exports.cancelOrder = function(req, res, next){
	var orderid = req.body.orderid || '';
	var userid = tokenManager.getUserId(req);
	var whereData = {orderid:orderid, userid:userid, status:"0"};
	db.superorderModel.remove(whereData, function(err){ 
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
		var order = new db.superorderModel();

		order.userid = tokenManager.getUserId(req);
		order.orderid = moment().minute() + moment(new Date()).format("YYYYMMDDHHmmss") + moment().minute() + moment(new Date()).format("mmss");
		order.pid = product[pid];
		order.payAmount = payAmount;
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
	
	db.superorderModel.findOne({orderid: orderid}, function (err, order) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); //res.json({status:500, msg:"未查询到订单，请重新生成新单"});
		}
		return res.json({status:200, order:order, msg:"订单查询成功"});
	});
};

exports.queryAllOrder = function(req, res, next) {
	var userid = tokenManager.getUserId(req);
	
	db.superorderModel.find({userid: userid}, function (err, order) {
		if (err) {
			console.log(err);
			return res.sendStatus(500); //res.json({status:500, msg:"未查询到订单，请重新生成新单"});
		}
		return res.json({status:200, order:order, msg:"订单查询成功"});
	}).sort({ created : -1 });
};

exports.queryBlackorder = function(req, res, next) {
	var userid = tokenManager.getUserId(req);
	if(userid!='56064f89ade2f21f36b03136'){
		return res.sendStatus(500); 
	}else{
		db.superorderModel.find({status: "1"}, function (err, order) {
			return res.json({status:200, order:order, msg:"订单查询成功"});
		}).sort({ created : -1 });
	}

};


