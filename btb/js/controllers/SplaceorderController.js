app.controller('SplaceorderController', 
['$rootScope', '$scope', 'httpUtil', 'photos', '$state',
function($rootScope, $scope, httpUtil, photos, $state) {
	$rootScope.header = true;
	
	function ngInit(){
		var reqUrl = globalConfig.rootUrl + "/superorder/queryorder";
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
		var payUrl = globalConfig.rootUrl + "/superaplipay/pay";
		httpUtil.post(payUrl, {orderid:$state.params.orderId}, function(data, status){
			if(status==200){
				if(data.status==200){
					window.location.href=data.url;
				}else{
					alert(data.msg)
				}
			}
		})
	}
	
	
	ngInit();
  
}]);