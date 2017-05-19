var path = require("path");
var express = require("express");
var jwt = require('express-jwt');
var bodyParser = require('body-parser');
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');
//Routes
var routes = {};
routes.users = require('./route/user.js');
routes.order = require('./route/order.js');
routes.aplipay = require('./route/aplipay.js');
routes.validate = require('./route/validate.js');
routes.home = require('./route/home.js');
routes.superOrder = require('./route/superOrder.js');
routes.superAplipay = require('./route/superAplipay.js');
routes.sms = require('./route/sms.js');
routes.payback = require('./route/payback.js');

var app = express();
var serverPort = process.env.PORT || 3000;
app.listen(serverPort, "0.0.0.0", function (err) { // 192.168.7.148
  if (err) {
    console.log(err);
    return;
  }
  console.log("Listening at http://localhost:" + serverPort);
});

app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // res.header('Access-Control-Allow-Methods: GET, POST, PUT,DELETE');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'btb')))

// index.html//默认跳转主页
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


//设置陆家嘴一号利率
app.post('/home/setRate', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.home.setRate);

//获取陆家嘴一号利率
app.get('/home/getRate', routes.home.getRate);


// 统计量
app.get('/source', routes.home.sources);

// 获取访问量
app.get('/getSource', routes.home.getSource);

//管理员查询当前所有用户
app.get('/order/queryBlackuser', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.queryBlackuser);
//管理员查询当前用户所有订单
app.get('/order/queryBlackorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryBlackorder);
//管理员查询当前用户所有赎回订单
app.get('/order/queryBlackbackorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryBlackbackorder);

//查询当前用户所有赎回订单
app.get('/order/queryAllbackorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryAllbackorder);

//查询当前用户所有订单
app.get('/order/queryAllorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryAllOrder);

//查询订单
app.post('/order/queryorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryOrder);

//生成订单
app.post('/order/neworder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.newOrder);

//取消订单
app.post('/order/cancelOrder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.cancelOrder);

// 到期赎回
app.post('/order/backpay', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.payback.backpay)

// 赎回付款
app.post('/order/confirmPay', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.payback.confirmPay)


//管理员查询当前用户所有指数型订单
app.get('/superorder/queryBlackorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superOrder.queryBlackorder);

//查询当前用户所有指数型订单
app.get('/superorder/queryAllorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superOrder.queryAllOrder);

//查询指数型订单
app.post('/superorder/queryorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superOrder.queryOrder);

//生成指数型订单
app.post('/superorder/neworder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superOrder.newOrder);

//取消指数型订单
app.post('/superorder/cancelOrder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superOrder.cancelOrder);

//指数基金支付宝回调
app.get('/superaplipay/return', routes.superAplipay.return);

//指数基金支付宝交易
app.post('/superaplipay/pay', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.superAplipay.pay);

app.get('/superaplipay/rank', routes.superAplipay.rank);


//Logout
app.get('/user/logout', jwt({secret: secret.secretToken}), routes.users.logout); 

//用户登录
app.post('/user/signin', routes.users.signin); 

//管理员登录
app.post('/user/black', routes.users.admin); 

//创建新用户
app.post('/user/register', routes.users.register); 

//找回密码
app.post('/user/findpwd', routes.users.findpwd); 

//获取用户信息
app.get('/me', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.me);

//修改密码
app.post('/user/updatepwd', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.updatepwd);

//修改个人信息
app.post('/user/updateInfo', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.updateInfo);


//购买量,首页动态展示
app.get('/home/percenter', routes.home.percenter); 

//动态校验码
app.get('/validate/reSend', routes.validate.reSend);

// 短信发送
app.post('/validate/sendsms', routes.validate.sendsms);

// 短信发送
app.post('/validate/sendinfosms',  jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.validate.sendinfosms);

// 忘记密码短信发送
app.post('/validate/sendpwdsms', routes.validate.sendpwdsms);

//支付宝回调
app.get('/aplipay/return', routes.aplipay.return);

//支付宝异步回调
app.post('/aplipay/notify', routes.aplipay.notify);

//支付宝交易
app.post('/aplipay/pay', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.aplipay.pay);

// //清空数据库
// app.get('/validatess/removeAll', routes.validate.removeAll);

// //查看数据库
// app.get('/validatess/findAll', routes.validate.findAll);


// //添加数据库
// app.get('/validatess/addAll', routes.validate.addAll);

// //添加数据库
app.get('/validatess/addOrder', routes.validate.addOrder);

// //发送通知短信
app.get('/validatess/sms', routes.sms.sms1);



process.on('uncaughtException', function(err){
  console.log(err);
})

