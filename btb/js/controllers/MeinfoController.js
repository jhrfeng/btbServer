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
			httpUtil.post(reqUrl, $scope.user, function(data, status){
	        	$("#register").button('reset');
	        	if(status==200){
	        		alert("修改成功！")
	        		$state.go('me');
	        	}
	        	if(status==500){
	        		alert("修改失败")
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
		if(validateIdCard($scope.user.idcard)){
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
		var regEmail=/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+(\.[a-zA-Z]{2,3})+$/;
		if(!regEmail.test($scope.user.email)) {
	        alert("请输入正确邮箱地址")
			return false;
	    }
		if($scope.user.smscode=="" || null==$scope.user.smscode){
			alert("请输入验证码")
			return false;
		}
		return true;
	}

	function validateIdCard(idCard){
		//15位和18位身份证号码的正则表达式
	 	var regIdCard=/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;

	 	//如果通过该验证，说明身份证格式正确，但准确性还需计算
	 	if(regIdCard.test(idCard)){
	  		if(idCard.length==18){
			   var idCardWi=new Array( 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ); //将前17位加权因子保存在数组里
			   var idCardY=new Array( 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ); //这是除以11后，可能产生的11位余数、验证码，也保存成数组
			   var idCardWiSum=0; //用来保存前17位各自乖以加权因子后的总和
			   for(var i=0;i<17;i++){
			    idCardWiSum+=idCard.substring(i,i+1)*idCardWi[i];
			   }
		   		var idCardMod=idCardWiSum%11;//计算出校验码所在数组的位置
		   		var idCardLast=idCard.substring(17);//得到最后一位身份证号码

		   		//如果等于2，则说明校验码是10，身份证号码最后一位应该是X
		   		if(idCardMod==2){
		    		if(idCardLast=="X"||idCardLast=="x"){
		     			return false;
		    		}else{
		     			alert("身份证号码错误！");
		     			return true;
		    		}
		  		}else{
		    		//用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
		    		if(idCardLast==idCardY[idCardMod]){
		     			return false;
		    		}else{
		     			alert("身份证号码错误！");
		     			return true;
		    		}
		   		}
	  		} 
	 	}else{
	  		alert("身份证格式不正确!");
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