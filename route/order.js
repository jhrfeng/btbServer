var moment = require('moment');
var db = require('../config/mongo_database');
var tokenManager = require('../config/token_manager');

var product = {
	"20170001": {"pid":"20170001", "name":"新人专享9611050期", "shouyi":20.0, "week": 90, "join":1000},
	"20170002": {"pid":"20170002", "name":"预约专享9601051期", "shouyi":30.0, "week":180, "join":1000},
	"20170003": {"pid":"20170003", "name":"稀缺产品963353期",  "shouyi":40.0, "week":365, "join":1000}
}

// 生成订单
exports.newOrder = function(req, res, next) {
	var pid = req.body.pid || '';             // 商品号
	var payAmount = req.body.payAmount || ''; // 支付金额

	console.log(moment(new Date()).dayOfYear(90))
	console.log(moment(new Date()).dayOfYear(30))

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
		order.orderid = moment().minute() + moment(new Date()).format("YYYYMMDDHHmmss");
		order.pid = product[pid];
		order.payAmount = payAmount;
		order.tradeno = tradeno;
		order.outtrade = outtrade;
		order.opendate = moment(new Date()).dayOfYear(product[pid].week);
		order.openAmount = payAmount*(1 + product[pid].shouyi/100);

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
	});
};


