var redisClient = require('../config/redis_database').redisClient;
var moment = require('moment');

// home 购买量
exports.percenter = function(req, res) {
	var percenter = {"0":"5.2", "1":"38.6", "2":"27.1", "3":"15.6"};
	res.json(percenter);
};

// 获取访问量
exports.getSource = function(req, res) {
	var params = req.query;
	var today = moment(new Date()).format("YYYYMMDD");
	if(params.source==0){
		redisClient.get(today, function (err, rank) {
			res.json(rank);
		})
	}else{
		redisClient.get(today+params.source, function (err, rank) {
			res.json(rank);
		})
	}
}


// 统计访问量
exports.sources = function(req, res) {
	var params = req.query;
	var today = moment(new Date()).format("YYYYMMDD");
	add(today);
	add(today+params.source);
	if(params.source!=0){
		add(today+params.source);
	}
	res.sendStatus(200);
	
}

function add(today){
	// 统计总额
	redisClient.get(today, function (err, rank) {
		if(rank==null){
			redisClient.set(today,0);
		}
		redisClient.incrby(today, 1);
	})
}