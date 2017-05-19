app.controller('particularsController', 
['$scope', 'httpUtil', '$state', function($scope, httpUtil, $state) {

	$scope.order = {pid:"s20170000", payAmount:5000, rate:0};

	httpUtil.get(globalConfig.rootUrl + "/superaplipay/rank", function(data, status){
		$scope.percenter = data;
	})

	httpUtil.get(globalConfig.rootUrl + "/home/getRate", function(data, status){
		if(status==200){
			$scope.order.rate = Number(data)*100;
		}
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
		if($scope.order.payAmount < 5000){
			alert("请输入大于5000元整数金额")
			return false;
		}
		return true;
	}

}]);