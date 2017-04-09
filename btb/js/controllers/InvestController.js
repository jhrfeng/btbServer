app.controller('InvestController', ['$scope', 'photos', '$state', function($scope, photos, $state) {
//	$scope.questionList = questionList; // 通过懒加载，加载配置JSON信息

	photos.success(function(data) {
    	$scope.questionList = data.questionList;
    	$scope.productList = data.productList;
	});

	$scope.goOrder = function(pid){
		$state.go("order", {pid:pid});
	}
}]);