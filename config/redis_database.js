var redis = require('redis');
var redisClient = redis.createClient(6379, '172.31.92.189');

redisClient.on('error', function(err){
	console.log('Error '+ err);
});

redisClient.on('connect', function() {
	console.log('Redis is ready');
});

exports.redis = redis;
exports.redisClient = redisClient;