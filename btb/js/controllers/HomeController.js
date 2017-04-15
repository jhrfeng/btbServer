app.controller('HomeController', 
['$rootScope', '$scope', 'photos', '$state', 'httpUtil',
function($rootScope,$scope, photos, $state, httpUtil) {
	$rootScope.header = false;
	function ngInit(){
		// 初始化产品加载
		photos.success(function(data) {
	    	$scope.productList = data.productList;
		});
		httpUtil.get(globalConfig.rootUrl + "/home/percenter", function(data, status){
			$scope.percenter = data;
		})

	}
	
	$scope.goOrder = function(pid){
		$state.go("order", {pid:pid});
	}
	
	ngInit();
  
}]);