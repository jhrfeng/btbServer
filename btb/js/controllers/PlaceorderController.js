app.controller('PlaceorderController', 
['$rootScope', '$scope', 'httpUtil', 'photos', '$state',
function($rootScope, $scope, httpUtil, photos, $state) {
	$rootScope.header = true;
	
	function ngInit(){
		var reqUrl = globalConfig.rootUrl + "/order/queryorder";
		httpUtil.post(reqUrl, {orderid: $state.params.orderId}, function(data, status){
			if(status==200){
				$scope.order = data.order;
			}else{
				alert("未查询到订单，请重新生成新单")
			}
		})
	}
	
	$scope.generate = function(){
		$("#register").button('loading');
		$state.go("payorder", {orderId:$state.params.orderId})
	}
	
	
	ngInit();
  
}]);