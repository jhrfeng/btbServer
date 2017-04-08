app.controller('RegisterController', 
['$rootScope', '$scope', 'httpUtil','$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	$scope.user = {};
	
	$scope.register = function(){
		var reqUrl = globalConfig.rootUrl + "/user/register";
		if(validate()){
			$("#register").button('loading');
            httpUtil.signin(reqUrl, $scope.user, function(data, status){
            	$("#register").button('reset');
				if(status==200){
					alert("注册成功");
					$state.go("login")
				}else if(status==400){
					alert("密码输入有误，请重新输入")
				}else if(status==500){
					alert("该手机号已注册，请重新输入")
				}
			});
		}
	}
	
	$scope.login = function(){
		$state.go('/login'); 
	}
	
	function validate(){
		if($scope.user.username=="" || null==$scope.user.username){
			alert("请输入手机号")
			return false;
		}
		var phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
		if(!phone.test($scope.user.username)) 
		{ 
		    alert('请输入有效的手机号码！'); 
		    return false; 
		} 
		if($scope.user.password=="" || null==$scope.user.password
			|| $scope.user.passwordConfirmation=="" || null==$scope.user.passwordConfirmation){
			alert("两次密码不能为空")
			return false;
		}
		if($scope.user.password!==$scope.user.passwordConfirmation){
			alert("两次密码输入不一致")
			return false;
		}
		return true;
	}
}]);