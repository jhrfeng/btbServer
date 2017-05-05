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
					// alert("登录成功！");
					$state.go("home")
				}else if(status==401){
					alert("用户名或密码不正确")
				}
			});
		}
	}
	
	function validate(){
		if(!validatemobile($scope.user.username)){
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

	function validatemobile(newname) {
	    if (newname=='' || newname==null) {
	        alert('请输入手机号码！');
	        return false;
	    }
	    if (newname.length != 11) {
	        alert('请输入有效的手机号！');
	        return false;
	    }
	    var PATTERN_CHINAMOBILE = /^1(3[4-9]|5[0123789]|8[23478]|4[7]|7[8])\d{8}$/; //移动号
	    var PATTERN_CHINAUNICOM = /^1(3[0-2]|5[56]|8[56]|4[5]|7[6])\d{8}$/; //联通号
	    var PATTERN_CHINATELECOM = /^1(3[3])|1(7[3])|(8[019])\d{8}$/; //电信号
	    if (PATTERN_CHINAUNICOM.test(newname)) {
	        return true;
	    } else if (PATTERN_CHINAMOBILE.test(newname)) {
	        return true;
	    } else if (PATTERN_CHINATELECOM.test(newname)) {
	        return true;
	    }else {
	        alert("请输入正确的手机号");
	        return false;
	    }
	}
	
	
	
}]);