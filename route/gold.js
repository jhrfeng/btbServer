var request = require('request');
var schedule = require('node-schedule');
var ali = require('../utils/ali');
var redisClient = require('../config/redis_database').redisClient;

var newDate = new Date()

function sheduleOpt(){
  var date = new Date().getDay();
  if(date==0 || date==6)return false;

  var hour = newDate.getHours();
  if(hour>8 && hour<22
    )return true;
    else return false;
}


function GetDateStr(count) { 
  var newDate = new Date();
  newDate.setDate(newDate.getDate()+count);//获取AddDayCount天后的日期 
  var y = newDate.getFullYear(); 
  var m = newDate.getMonth()+1;//获取当前月份的日期 
  m = m < 10 ? '0' + m : m;  
  var d = newDate.getDate();  
  d = d < 10 ? ('0' + d) : d;
  y = ''+y+m+d;
  return y; 
} 

function saveGold(data){
  redisClient.get('moneyPrice', function(err, result){
    if(err){
      console.log('error.........')
      redisClient.set('moneyPrice', data);
    }else{
      console.log(JSON.parse(result));
    }
  })
}
// 存在set里面

function scheduleCronstyle(){
    // redisClient.lpop('money:price',function(err,result){
    //    console.log(result);
    // })
    schedule.scheduleJob('20 * * * * *', function(){
        if(sheduleOpt()){
          var yeasterday = GetDateStr(-1);
          console.log('scheduleCronstyle:' + yeasterday);
          var resultGold, resultMoney;
          // 获取美元指数
          request('http://web.juhe.cn:8080/finance/exchange/frate?type=&key=56070babcb424918dc9d62e3d276e432', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              resultMoney = JSON.parse(body);
              resultMoney = resultMoney.result[0]["data2"];
              redisClient.set('money', JSON.stringify(resultMoney));
              saveGold({yeasterday: resultMoney.yesPic});
            }
          });
          //获取黄金价格
          request('http://web.juhe.cn:8080/finance/gold/shgold?v=&key=03d9124bc4287ec2bc732c55679ad705', function (error, response, body) {
            if (!error && response.statusCode == 200) {
              resultGold = JSON.parse(body);
              resultGold = resultGold.result[0][4];
              redisClient.set('gold', JSON.stringify(resultGold));
              //redisClient.zadd('goldPrice', GetDateStr(-1), resultGold.yespri);
            }
          });
        }
    }); 
}

// scheduleCronstyle();

exports.usaMoney = function(req, res){
  redisClient.get('money', function (err, reply) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(reply);
  });
}

exports.auGold = function(req, res){
  redisClient.get('gold', function (err, reply) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(reply);
  });
}

exports.uploadImg = function(req, res){
	var base64 = req.body.base;
	console.log(req.body)
  	ali.uploadFile(base64, "100.jpg", function(fileurl){
    	res.send(fileurl);
  	})
}