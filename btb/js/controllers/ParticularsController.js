app.controller('particularsController', 
['$scope', 'httpUtil', '$state', function($scope, httpUtil, $state) {

	$scope.order = {pid:"s20170000", payAmount:100};

	httpUtil.get(globalConfig.rootUrl + "/superaplipay/rank", function(data, status){
		$scope.percenter = data;
	})

	$scope.generate = function(){
		var reqUrl = globalConfig.rootUrl + "/superorder/neworder";
		if(validate()){
			$("#register").button('loading');
			httpUtil.post(reqUrl, $scope.order, function(data, status){
				$("#register").button('reset');
				if(status==200){
					if(data.status==200)
						$state.go("splaceorder", {orderId: data.data.orderid});
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
		if($scope.order.payAmount < 100){
			alert("请输入大于100元整数金额")
			return false;
		}
		return true;
	}

}]);