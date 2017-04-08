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
    notify_url: 'http://127.0.0.1:3000/notify',
    //支付后跳转后的页面
    return_url: 'http://127.0.0.1:3000/aplipay/return'
    // return_url: 'http://127.0.0.1:8020/angularjs_btc/index.html#/payorder'
}); 

exports.pay = function(req, res) {
	var orderid = req.query.orderid;
	var userid = tokenManager.getUserId(req);
	if('' == orderid){
		return res.sendStatus(403); //未查询到订单
	}
	db.orderModel.findOne({orderid:orderid, userid:userid}, function (err, order) {
		if (err) {
			return res.sendStatus(500); //订单与用户不匹配
		}
		//使用订单参数构造一个支付请求
		var url = directAlipay.buildDirectPayURL({
		    out_trade_no: order.outtrade, //'你的网站订单系统中的唯一订单号匹配',
		    subject: order.pid.name,//'订单名称显示在支付宝收银台里的“商品名称”里，显示在支付宝的交易管理的“商品名称”的列表里',
		    body: "周期"+order.pid.week+"天，"+"到期收益率"+order.pid.shouyi,//'订单描述、订单详细、订单备注，显示在支付宝收银台里的“商品描述”里',
		    total_fee: order.payAmount
		});
		console.log("url", url)
		res.header("Access-Control-Allow-Origin", "*"); 
		res.redirect('http://www.baidu.com');
		// res.redirect(url);
	});
};

exports.return = function(req, res){
	var params = req.query;
    alipay.verify(params, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            if (result === true) {
            	var log = new db.logModel();
            	log.name = "订单支付";
            	log.content = params;
            	log.save(function(err) {
					
				});
            	//该通知是来自支付宝的合法通知
                res.reply('支付成功');
            }
        }
    });
    res.end('');
}
