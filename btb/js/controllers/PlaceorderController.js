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
		var payUrl = globalConfig.rootUrl + "/aplipay/pay";
		httpUtil.post(payUrl, {orderid:$state.params.orderId}, function(data, status){
			console.log(data, status)
			if(status==200){
				if(data.status==200){
					window.location.href=data.url;
				}else{
					alert(data.msg)
				}
			}
		})
		// $state.go("payorder", {orderId:$state.params.orderId})
	}
	
	
	ngInit();
  
}]);