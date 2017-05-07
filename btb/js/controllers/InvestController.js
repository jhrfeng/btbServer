app.controller('InvestController', ['$scope', 'photos', '$state', 'httpUtil', function($scope, photos, $state, httpUtil) {
//	$scope.questionList = questionList; // 通过懒加载，加载配置JSON信息
	function ngInit(){
		// 初始化产品加载
		photos.success(function(data) {
	    	$scope.questionList = data.questionList;
    		$scope.productList = data.productList;
    		$scope.sproductList = data.sproductList;
		});
		httpUtil.get(globalConfig.rootUrl + "/home/percenter", function(data, status){
			$scope.percenter = data;
		})

	}

	$scope.goOrder = function(pid){
		$state.go("order", {pid:pid});
	}

	$scope.goSorder = function(pid){
		$state.go("btc1");
	}

	ngInit();
}]);