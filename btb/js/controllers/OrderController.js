app.controller('OrderController', 
['$rootScope', '$scope', 'httpUtil', 'photos', '$state',
function($rootScope, $scope, httpUtil, photos, $state) {
	$rootScope.header = true;
	$scope.order = {payAmount:null};
	
	function ngInit(){
		photos.success(function(data) {
			angular.forEach(data.productList, function(product, index){
				if(product.pid==$state.params.pid){
					$scope.product = product;
				}
			})
		});
	}
	
	$scope.generate = function(){
		var reqUrl = globalConfig.rootUrl + "/order/neworder";
		$scope.order.pid = $state.params.pid; // 获取产品id
		if(validate()){
			$("#register").button('loading');
			httpUtil.post(reqUrl, $scope.order, function(data, status){
				$("#register").button('reset');
				if(status==200){
					console.log(data);
					if(data.status==200)
						$state.go("placeorder", {orderId: data.data.orderid});
					else
						alert(data.data.msg)
				}else{
					alert(data.msg)
				}
			})
		}
		
	}
	
	function validate(){
		if(null==$scope.order.payAmount || $scope.order.payAmount==0){
			alert("请输入订单金额")
			return false;
		}
		if(parseInt($scope.order.payAmount)!==$scope.order.payAmount){
			alert("请输入整数金额")
			return false;
		}
		if($scope.order.payAmount < 1000){
			alert("请输入大于1000元整数金额")
			return false;
		}
		return true;
	}
	
	ngInit();
  
}]);