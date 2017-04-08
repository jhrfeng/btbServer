app.controller('MeController', 
['$rootScope', '$scope', 'httpUtil',
function($rootScope, $scope, httpUtil) {
	$rootScope.header = true;
	 
	$scope.tabshow = 1;
	$scope.toChangeView = function(type) {
		$scope.tabshow = type;
		if(type==3){ // 查询所有订单
			var reqUrl = globalConfig.rootUrl + "/order/queryAllorder";
			httpUtil.get(reqUrl, function(data, status){
				if(status==200){
					$scope.orderList = data.order;
				}
			})
		}
	}
	  
	function ngInit(){
		var reqUrl = globalConfig.rootUrl + "/me";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.user = data;
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