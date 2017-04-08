app.controller('InvestController', ['$scope', 'photos', function($scope, photos) {
//	$scope.questionList = questionList; // 通过懒加载，加载配置JSON信息

	photos.success(function(data) {
    	$scope.questionList = data.questionList;
    	$scope.productList = data.productList;
	});
}]);