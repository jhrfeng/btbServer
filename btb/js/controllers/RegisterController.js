app.controller('RegisterController', 
['$rootScope', '$scope', 'httpUtil','$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	$scope.user = {};
	$scope.smsable = false;
	
	function ngInit(){
		$scope.reSend();
	}

	$scope.register = function(){
		var reqUrl = globalConfig.rootUrl + "/user/register";
		if(validate()){
			if($scope.user.smscode=="" || null==$scope.user.smscode){
				alert("请输入手机验证码")
				return false;
			}
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
				}else if(status==502){
					alert("手机验证码不正确，请核实")
				}
			});
		}
	}

	//短信验证码 
	$scope.sendSms = function(){
		if(validate()){
			var reqUrl = globalConfig.rootUrl + "/validate/sendsms";
	        httpUtil.post(reqUrl, $scope.user, function(data, status){
	        	if(status==500 || status==402){
	        		alert("问题校验答案不正确，请刷新")
	        		$scope.reSend();
	        		return;
	        	}
	        	if(status==403){
	        		alert("请输入手机号")
	        		return;
	        	}
	        	if(status==200){
	        		countDown(60); // 倒计时
	        		if(data.status==501)
	        			alert(data.msg)
	        		return;
	        	}

	        })
		}
	}

		//find验证码 
	$scope.sendpwdSms = function(){
		if(!validatemobile($scope.user.username)){
			return false;
		} 
		if($scope.user.vcode=="" || null==$scope.user.vcode){
			alert("请输入动态验证码")
			return false;
		}
	
		var reqUrl = globalConfig.rootUrl + "/validate/sendpwdsms";
        httpUtil.post(reqUrl, $scope.user, function(data, status){
        	if(status==500 || status==402){
        		alert("问题校验答案不正确，请刷新")
        		$scope.reSend();
        		return;
        	}
        	if(status==403){
        		alert("该手机号未注册")
        		return;
        	}
        	if(status==200){
        		countDown(60); // 倒计时
        		if(data.status==501)
        			alert(data.msg)
        		return;
        	}

        })

	}

	$scope.findpwd = function(){
		var reqUrl = globalConfig.rootUrl + "/user/findpwd";
		if(!validatemobile($scope.user.username)){
			return false;
		}
		if($scope.user.smscode=="" || null==$scope.user.smscode){
			alert("请输入手机验证码")
			return false;
		}
		$("#register").button('loading');
        httpUtil.signin(reqUrl, $scope.user, function(data, status){
        	$("#register").button('reset');
        	if(status==200){
        		alert("重置密码已通过短信发送到您的手机中，请注意查收")
        		$state.go("login")
        	}
        	if(status==500){
        		alert("密码找回失败")
        		return;
        	}
        	if(status==501){
        		alert("不是绑定的手机号")
        		return;
        	}
        	if(status==502){
        		alert("验证码校验错误")
        		return;
        	}
		});

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

	$scope.login = function(){
		$state.go('/login'); 
	}
	
	function validate(){
		if(!validatemobile($scope.user.username)){
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
		if($scope.user.vcode=="" || null==$scope.user.vcode){
			alert("请输入动态验证码")
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


	function countDown(times){
		$('#sms').attr({"disabled":"disabled"});
    	if(!times||isNaN(parseInt(times)))return;
    	var args = arguments;
    	var self = this;
     	$('#sms').text(times+"s  ");
     	setTimeout(function(){
     		args.callee.call(self,--times);
     		if(times==0){
     			$('#sms').removeAttr("disabled");
     			$('#sms').text('点击发送');
     		}

     	},1000); 	
 	}

	ngInit();
}]);