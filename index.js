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

var app = express();
var serverPort = process.env.PORT || 3000;
app.listen(serverPort, "localhost", function (err) { // 192.168.7.148
  if (err) {
    console.log(err);
    return;
  }
  console.log("Listening at http://localhost:" + serverPort);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods: GET, POST, PUT,DELETE');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'btb')))

// index.html//默认跳转主页
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//查询当前用户所有订单
app.get('/order/queryAllorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryAllOrder);

//查询订单
app.post('/order/queryorder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.queryOrder);

//生成订单
app.post('/order/neworder', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.order.newOrder);

//Logout
app.get('/user/logout', jwt({secret: secret.secretToken}), routes.users.logout); 

//用户登录
app.post('/user/signin', routes.users.signin); 

//创建新用户
app.post('/user/register', routes.users.register); 

//获取用户信息
app.get('/me', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.users.me);

//支付宝回调
app.get('/aplipay/return', routes.aplipay.return);

//支付宝交易
app.post('/aplipay/pay', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.aplipay.pay);


process.on('uncaughtException', function(err){
  console.log(err);
})

