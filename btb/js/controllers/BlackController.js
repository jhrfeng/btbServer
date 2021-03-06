app.controller('BlackController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	
	$scope.tabshow = '1';
	$scope.vo = {rate:null};
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

	$scope.setRate = function(){
		console.log($scope.vo.rate);
		if($scope.vo.rate>2){
			alert("请输入合理的小数利率")
			return false;
		}
		var reqUrl = globalConfig.rootUrl + "/home/setRate";
		httpUtil.post(reqUrl, $scope.vo, function(data, status){
			alert("设置成功")
		})	
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
		if(type==3){ 
			var reqUrl = globalConfig.rootUrl + "/superorder/queryBlackorder";
			httpUtil.get(reqUrl, function(data, status){
				if(status==200){
					$scope.sorderList = data.order;
				}
			})
		}
		if(type==4){ 
			queryAllbackorder()
		}
	}

	$scope.backDetail = function(order){
		$scope.tabshow = 5;
		$scope.backOrder = order;
	}

	$scope.confirmPay = function(order){
		if(order.tradeno=='' || order.tradeno==null){
			alert("交易流水号不能为空")
			return false;
		}
		if(order.account=='' || order.account==null){
			alert("客户支付宝账号不能为空")
			return false;
		}
		var reqUrl = globalConfig.rootUrl + "/order/confirmPay";
		$("#register").button('loading');
		httpUtil.post(reqUrl, order, function(data, status){
			$("#register").button('reset');
			if(status==200){
				$scope.toChangeView(4)
			}else{
				alert('提交失败')
			}
		})	
	}

	function queryAllbackorder(){
		var reqUrl = globalConfig.rootUrl + "/order/queryBlackbackorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.backorderList = data.order;
			}
		})	
	}
	
	
	
}]);