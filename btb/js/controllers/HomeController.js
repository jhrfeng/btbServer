app.controller('HomeController', 
['$rootScope', '$scope', 'photos', '$state', 'httpUtil',
function($rootScope,$scope, photos, $state, httpUtil) {
	$rootScope.header = false;
	function ngInit(){
		var url = window.location.href;
		url = url.substr(url.indexOf("home?")+4);
		if(url.indexOf("source") < 0){
			url = "?source=0";
		}
		httpUtil.get(globalConfig.rootUrl + "/source"+url, function(){});
		// 初始化产品加载
		photos.success(function(data) {
	    	$scope.productList = data.productList;
		});
		httpUtil.get(globalConfig.rootUrl + "/superaplipay/rank", function(data, status){
			$scope.percenter = data;
		})

	}
	
	$scope.goOrder = function(pid){
		$state.go("order", {pid:pid});
	}
	
	ngInit();
  
}]);