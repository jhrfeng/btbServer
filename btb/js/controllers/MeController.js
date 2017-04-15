app.controller('MeController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	 
	$scope.update = {}; 
	$scope.tabshow = 1;

	function ngInit(){
		var reqUrl = globalConfig.rootUrl + "/me";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.user = data;
			}
		})
	}

	$scope.toChangeView = function(type) {
		$scope.tabshow = type;
		if(type==3){ // 查询所有订单
			queryAllorder();
		}
	}

	// 取消订单
	$scope.cancelOrder = function(orderid){
		var reqUrl = globalConfig.rootUrl + "/order/cancelOrder";
		httpUtil.post(reqUrl, {orderid:orderid}, function(data, status){
			if(status==200){
				alert("订单取消成功");
				queryAllorder();
			}
		})
	} 

	// 修改密码
	$scope.updatepwd = function(){
		var reqUrl = globalConfig.rootUrl + "/user/updatepwd";
		httpUtil.post(reqUrl, $scope.update, function(data, status){
			if(status==200){
				alert("密码修改成功，请重新登录！");
				$state.go("login")
			}
			if(status==402){
				alert("密码不能为空");
				return;
			}
			if(status==403){
				alert("两次密码输入不一致");
				return;
			}
			if(status==501){
				alert("老密码输入错误");
				return;
			}
		})
	}
	
	function queryAllorder(){
		var reqUrl = globalConfig.rootUrl + "/order/queryAllorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.orderList = data.order;
			}
		})
	}

	
	ngInit();
  
}]).filter('orderStatus', function() { //可以注入依赖
    return function(value) {
        if(value=="0")
        	return "待支付"
        if(value=="1")
        	return "支付已生效"	
    }
});