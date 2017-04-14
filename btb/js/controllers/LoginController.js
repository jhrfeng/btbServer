app.controller('LoginController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	
	$scope.user = {};
	
	$scope.login = function(){
		var reqUrl = globalConfig.rootUrl + "/user/signin";
		if(validate()){
			$("#register").button('loading');
			httpUtil.signin(reqUrl, $scope.user, function(data, status){
				$("#register").button('reset');
				if(status==200){
					httpUtil.cacheUtil.put("Authorization", data.token);
					$rootScope.me = true;
					alert("登录成功！");
					$state.go("home")
				}else if(status==401){
					alert("用户名或密码不正确")
				}
			});
		}
	}
	
	function validate(){
		if($scope.user.username=="" || null==$scope.user.username){
			alert("请输入手机号")
			return false;
		}
		var phone = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
		if(!phone.test($scope.user.username)) 
		{ 
		    alert('请输入有效的手机号码！'); 
		    return false; 
		} 
		return true;
	}
	
	
	
}]);