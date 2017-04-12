app.factory('httpUtil', ['$http','$state', function($http,$state) {
  	var cacheUtil = {
        put: function (key, value) {
            try {
                if (window.localStorage) {
                    window.localStorage.removeItem(key);
                    window.localStorage.setItem(key, value);
                }
            } catch (e) {
            	alert("请选择使用谷歌浏览器或者火狐浏览器")
                console.log(e);
            }
        },
        get: function (key) {
            return window.localStorage.getItem(key);
        },
        remove: function (key) {
            window.localStorage.removeItem(key);
        },        
        //存储对象，以JSON格式存储
        setObject:function(key,value){
          window.localStorage[key]=JSON.stringify(value);
        },        
        //读取对象
        getObject: function (key) {
          return JSON.parse(window.localStorage[key] || '{}');
        }
    };
  	
  	return {
  		signin: function(reqUrl, body, callback){
	        	var headers = {'Content-Type': 'application/json'};
	        	$http({
	                method: 'POST',
	                data: body,
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).success(function(data, status){
	                callback(data, status);
	            }).error(function(data,status){
	                callback(data, status);
	            });
  		},
  		post: function(reqUrl, body, callback){
	        	var headers = {'Content-Type': 'application/json'};
	        	headers.Authorization = "Bearer "+cacheUtil.get("Authorization");
	        	$http({
	                method: 'POST',
	                data: body,
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).success(function(data, status){
	                callback(data, status);
	            }).error(function(data,status){
	            	if(status==401){
						alert("用户已失效，请重新登录!")
						cacheUtil.remove("Authorization")
						$state.go("login")
					}
	                callback(data, status);
	            });
  		},
  		get: function(reqUrl, callback){
	        	var headers = {'Content-Type': 'application/json'};
	        	headers.Authorization = "Bearer "+cacheUtil.get("Authorization");
	        	$http({
	                method: 'GET',
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).success(function(data, status){
	                callback(data, status);
	            }).error(function(data,status){
	            	if(status==401){
						alert("用户已失效，请重新登录!")
						cacheUtil.remove("Authorization")
						$state.go("login")
					}
	                callback(data, status);
	            });
  		},
  		pay: function(reqUrl, body, callback){
	        	var headers = {'Content-Type': 'application/json'};
	        	headers.Authorization = "Bearer "+cacheUtil.get("Authorization");
	        	$http({
	                method: 'GET',
	                params: body,
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).success(function(data, status){
	                callback(data, status);
	            }).error(function(data,status){
					alert("订单处理失败，请联系客服人员!")
	            });
  		},
  		postPay: function(reqUrl, body){
	        	var headers = {'Content-Type': 'application/json'};
	        	headers.Authorization = "Bearer "+cacheUtil.get("Authorization");
	        	$http({
	                method: 'POST',
	                data: body,
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).error(function(data,status){
					alert("请求支付宝链接失败，请联系客服人员!")
	            });
  		},
  		authGet: function(reqUrl, body, callback){
	        	var headers = {'Content-Type': 'application/json'};
	        	$http({
	                method: 'GET',
	                params: body,
	                url: reqUrl,
	                timeout: 100000,
	                headers: headers
	            }).success(function(data, status){
	                callback(data, status);
	            }).error(function(data,status){
	                callback(data, status);
	            });
  		},
  		cacheUtil: cacheUtil 
  	}
}]);