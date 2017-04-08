app.controller('PayorderController', 
['$rootScope', '$scope', 'httpUtil', 'photos', '$state',
function($rootScope, $scope, httpUtil, photos, $state) {
	$rootScope.header = true;
	
	function ngInit(){
		var payUrl = globalConfig.rootUrl + "/aplipay/pay";
		httpUtil.pay(payUrl, {orderid:$state.params.orderId});
	}
	
	// 查询结果
	$scope.queryResult = function(){
		$("#register").button('loading');
		$state.go("placeorder", {orderId:$state.params.orderId})
	}
	
	
	ngInit();
  
}]);