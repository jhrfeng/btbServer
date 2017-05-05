var directSuperAlipay = require('direct-alipay');
var tokenManager = require('../config/token_manager');
var db = require('../config/mongo_database');
var redisClient = require('../config/redis_database').redisClient;


directSuperAlipay.config({
	//签约支付宝账号或卖家收款支付宝帐户
    seller_email: '2876073312@qq.com', //'jyjjh@mail.ccnu.edu.cn', //
    //合作身份者ID，以2088开头由16位纯数字组成的字符串
    partner: '2088121509997265', //'2088911275465084', //
    //交易安全检验码，由数字和字母组成的32位字符串
    key:'4nhzzd0qkf8awyu7q613l1sdbidyj1ua', //'tws3ri4d3sg8ohc4t7k9dnj8kumvia05',  //
    //支付宝服务器通知的页面
    notify_url: 'https://www.ljzbtcbank.com/aplipay/notify',
    //支付后跳转后的页面
    return_url: 'https://www.ljzbtcbank.com/#/spayorder'

    // notify_url: 'http://cat-vip.vicp.io/aplipay/notify',
   	// return_url: 'http://cat-vip.vicp.io/#/spayorder'
}); 

exports.pay = function(req, res) {
	var orderid = req.body.orderid || '';
	var userid = tokenManager.getUserId(req);
	if('' == orderid || orderid===undefined){
		return res.sendStatus(403); //未查询到订单
	}
	db.superorderModel.findOne({orderid:orderid, userid:userid}, function (err, order) {
		if (err) {
			return res.sendStatus(500); //订单与用户不匹配
		}
		//使用订单参数构造一个支付请求
		var url = directSuperAlipay.buildDirectPayURL({
		    out_trade_no: order.orderid, //'你的网站订单系统中的唯一订单号匹配',
		    subject: order.pid.name,//'订单名称显示在支付宝收银台里的“商品名称”里，显示在支付宝的交易管理的“商品名称”的列表里',
		    body: "z001",//"周期"+order.pid.week+"天，"+"到期收益率:"+order.pid.shouyi,//'订单描述、订单详细、订单备注，显示在支付宝收银台里的“商品描述”里',
		    total_fee: order.payAmount  //0.01  //
		});
		updateOrderpay({orderid:orderid, userid:userid});
		if(url=="" || url===undefined)
			res.json({status:400, msg:"未生成支付链接，请重新操作"});
		else
			res.json({status:200, url:url});
		// res.redirect(url);
	});
};


// 更新支付宝链接状态
function updateOrderpay(whereData){
	// 日志记录
	var log = new db.logModel();
	log.name = "生成支付宝支付链接地址";
	log.msg = whereData;

    var updateDat = {$set: {updated:new Date()}}; //如果不用$set，替换整条数据
	db.superorderModel.update(whereData, updateDat, function(err, uporder){ // 执行订单状态变更
		log.content = uporder;
		if(err){ // 保存此次订单更新失败状态
			console.log(err)
        	log.msg = "支付链接更新失败："+whereData.orderid;
			log.save(function(err) {})
		}
		log.save(function(err) {})
	})
}

exports.return = function(req, res){
	var log = new db.logModel();
	log.name = "已收到支付宝返回通知";

	var params = req.query;
	params.notify_time = params.notify_time.replace('+', ' ');
	console.log(params)

    directSuperAlipay.verify(params).then(function(result) {
    	if(result)
        	updateOrderStatus(params);
        //该通知是来自支付宝的合法通知
        res.reply('支付成功');
        // res.json({status:200, msg:"支付成功"});
    }).catch(function(err) {
        console.error(err);
        log.content = err;
        log.msg = params.out_trade_no;
		log.save(function(err) {});
		res.reply('支付失败');
        // res.json({status:500, msg:err});
    });
    res.end('');
};

exports.rank = function(req, res){
	redisClient.get('ljzcj1', function (err, rank) {
		var total = 1000000;
		console.log((rank/total*100)) // res.json((rank/total).toFixed(2)*100);
		if(rank==null)
			res.json(0);
		else
			res.json((rank/total*100)) //(rank/total*100)
	})
	
};

// 更新保单状态
function updateOrderStatus(params){
	// 日志记录
	var log = new db.logModel();
	log.name = "订单支付";
	log.content = params;
	// 统计总额
	redisClient.get('ljzcj1', function (err, rank) {
		if(rank==null){
			redisClient.set('ljzcj1',0);
		}
		redisClient.incrby('ljzcj1', Number(params.total_fee));
	})

	var whereData = {orderid:params.out_trade_no, status:'0'};
    var updateDat = {$set: {status:'1', created:new Date()}}; //如果不用$set，替换整条数据
	db.superorderModel.update(whereData, updateDat, function(err, uporder){ // 执行订单状态变更
		console.log(uporder)
		if(err){ // 保存此次订单更新失败状态
			console.log(err)
        	log.msg = "支付已成功，但订单更新失败："+params.out_trade_no;
			log.save(function(err) {})
		}
		log.save(function(err) {})
	})
}
