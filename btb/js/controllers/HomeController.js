app.controller('HomeController', 
['$rootScope', '$scope', 'photos', '$state',
function($rootScope,$scope, photos, $state) {
	$rootScope.header = false;
	// 初始化产品加载
	photos.success(function(data) {
    	$scope.productList = data.productList;
	});
	
	$scope.goOrder = function(pid){
		$state.go("order", {pid:pid});
	}
	
	
  
}]);