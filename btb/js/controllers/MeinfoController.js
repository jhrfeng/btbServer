app.controller('MeinfoController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	 
	$scope.update = {}; 
	$scope.tabshow = 1;
	$scope.user = {vtext:'点击获取'};

	function ngInit(){
		$scope.getUser();
		$scope.reSend();
	}

	// 动态校验码
	$scope.reSend = function(){
		var reqUrl = globalConfig.rootUrl + "/validate/reSend";
		httpUtil.get(reqUrl,  function(data, status){
			if(status==200){
				console.log(data)
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

		//find验证码 
	$scope.sendpwdSms = function(){
		if($scope.user.vcode=="" || null==$scope.user.vcode){
			alert("请输入动态验证码")
			return false;
		}
	
		var reqUrl = globalConfig.rootUrl + "/validate/sendinfosms";
        httpUtil.post(reqUrl, $scope.user, function(data, status){
        	if(status==500 || status==402){
        		alert("问题校验答案不正确，请刷新")
        		$scope.reSend();
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

	$scope.updateInfo = function(){
		console.log($scope.user)
		var reqUrl = globalConfig.rootUrl + "/user/updateInfo";
		if(validate()){
			$("#register").button('loading');
			httpUtil.signin(reqUrl, $scope.user, function(data, status){
	        	$("#register").button('reset');
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
	}

	function validate(){

		if($scope.user.name=="" || null==$scope.user.name){
			alert("请输入真实姓名")
			return false;
		}
		if($scope.user.idcard=="" || null==$scope.user.idcard){
			alert("请输入身份证")
			return false;
		}
		if($scope.user.weixin=="" || null==$scope.user.weixin){
			alert("请输入微信号")
			return false;
		}
		if($scope.user.qq=="" || null==$scope.user.qq){
			alert("请输入QQ 号")
			return false;
		}
		if($scope.user.email=="" || null==$scope.user.email){
			alert("请输入邮箱")
			return false;
		}
		if($scope.user.smscode=="" || null==$scope.user.smscode){
			alert("请输入验证码")
			return false;
		}
		return true;
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