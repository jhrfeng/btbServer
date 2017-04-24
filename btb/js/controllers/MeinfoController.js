app.controller('MeinfoController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	 
	$scope.update = {}; 
	$scope.tabshow = 1;
	$scope.user = {};

	function ngInit(){
		$scope.getUser();
		$scope.reSend();
	}

	// 动态校验码
	$scope.reSend = function(){
		var reqUrl = globalConfig.rootUrl + "/validate/reSend";
		httpUtil.get(reqUrl,  function(data, status){
			if(status==200){
				$scope.user.vtext = data.que;
				$scope.user.vid = data.id;
			}
		});
	}

	// 获取信息
	$scope.getUser = function(){
		var reqUrl = globalConfig.rootUrl + "/me";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.user = data;
				console.log($scope.user)
			}
		})
	}

	
	
	ngInit();
  
}]);