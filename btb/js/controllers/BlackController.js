app.controller('BlackController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	
	$scope.tabshow = '1';
	$scope.user = {};
	
	$scope.login = function(){
		var reqUrl = globalConfig.rootUrl + "/user/black";

		$("#register").button('loading');
		httpUtil.signin(reqUrl, $scope.user, function(data, status){
			$("#register").button('reset');
			if(status==200){
				httpUtil.cacheUtil.put("Authorization", data.token);
				$rootScope.me = true;
				alert("登录成功！");
				$state.go("blackMe")
			}else if(status==401){
				alert("用户名或密码不正确")
			}
		});

	}

	$scope.toChangeView = function(type) {
		$scope.tabshow = type;
		if(type==1){ 
			var reqUrl = globalConfig.rootUrl + "/order/queryBlackorder";
			httpUtil.get(reqUrl, function(data, status){
				if(status==200){
					$scope.orderList = data.order;
				}
			})
		}
		if(type==2){ 
			var reqUrl = globalConfig.rootUrl + "/order/queryBlackuser";
			httpUtil.get(reqUrl, function(data, status){
				if(status==200){
					$scope.userList = data.user;
				}
			})
		}
	}
	
	
	
}]);