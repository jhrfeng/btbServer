var directAlipay = require('direct-alipay');
var tokenManager = require('../config/token_manager');
var db = require('../config/mongo_database');


directAlipay.config({
	//签约支付宝账号或卖家收款支付宝帐户
    seller_email: 'jyjjh@mail.ccnu.edu.cn',
    //合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner: '2088911275465084',
    //交易安全检验码，由数字和字母组成的32位字符串
    key: 'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',
    //支付宝服务器通知的页面
    notify_url: 'http://cat-vip.vicp.io/aplipay/notify',
    //支付后跳转后的页面
    return_url: 'http://127.0.0.1:3000/aplipay/return'
    // return_url: 'http://127.0.0.1:8020/angularjs_btc/index.html#/payorder'
}); 

exports.pay = function(req, res) {
	var orderid = req.body.orderid || '';
	var userid = tokenManager.getUserId(req);
	if('' == orderid || orderid===undefined){
		return res.sendStatus(403); //未查询到订单
	}
	db.orderModel.findOne({orderid:orderid, userid:userid}, function (err, order) {
		if (err) {
			return res.sendStatus(500); //订单与用户不匹配
		}
		//使用订单参数构造一个支付请求
		var url = directAlipay.buildDirectPayURL({
		    out_trade_no: order.orderid, //'你的网站订单系统中的唯一订单号匹配',
		    subject: order.pid.name,//'订单名称显示在支付宝收银台里的“商品名称”里，显示在支付宝的交易管理的“商品名称”的列表里',
		    body: "周期"+order.pid.week+"天，"+"到期收益率"+order.pid.shouyi,//'订单描述、订单详细、订单备注，显示在支付宝收银台里的“商品描述”里',
		    total_fee: 0.01  //order.payAmount
		});
		if(url=="" || url===undefined)
			res.json({status:400, msg:"未生成支付链接，请重新操作"});
		else
			res.json({status:200, url:url});
		// res.redirect(url);
	});
};

exports.return = function(req, res){
	var params = req.query;
	console.log("进到了回调页面")
    directAlipay.verify(params, function (err, result) {
    	console.log("验证回调页面", result)
        if (err) {
            console.error(err);
        } else {
            if (result === true) {
				updateOrderStatus(params);
            	//该通知是来自支付宝的合法通知
                res.reply('支付成功');
            }
        }
    });
    res.end('');
};

// 更新保单状态
function updateOrderStatus(params){
	// 日志记录
	var log = new db.logModel();
	log.name = "订单支付";
	log.content = params;

	db.orderModel.findOne({orderid:params.out_trade_no}, function (err, order) {
		console.log(order)
		var whereData = {orderid:params.out_trade_no};
        var updateDat = {$set: {"status":"1"}}; //如果不用$set，替换整条数据
		order.update(whereData, updateDat, function(err, uporder){ // 执行订单状态变更
			console.log(uporder)
			if(err){ // 保存此次订单更新失败状态
				console.log(err)
            	log.msg = "支付已成功，但订单更新失败："+params.out_trade_no;
				log.save(function(err) {})
			}
			log.save(function(err) {})
		})
   });
}
