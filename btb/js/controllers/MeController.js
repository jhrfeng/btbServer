app.controller('MeController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	 
	$scope.update = {}; 
	$scope.vo = {};
	$scope.tabshow = 1;

	function ngInit(){
		var reqUrl = globalConfig.rootUrl + "/me";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.user = data;
			}
		})
	}

	$scope.toChangeView = function(type) {
		$scope.tabshow = type;
		if(type==3){ // 查询所有订单
			queryAllorder();
		}
		if(type==6){ // 查询所有订单
			squeryAllorder();
		}
		if(type==7){ // 查询所有赎回订单
			queryAllbackorder();
		}
		if(type==5){ // 修改个人信息
			$state.go("meinfo")
		}
	}

	// 取消订单
	$scope.cancelOrder = function(orderid){
		var reqUrl = globalConfig.rootUrl + "/order/cancelOrder";
		httpUtil.post(reqUrl, {orderid:orderid}, function(data, status){
			if(status==200){
				alert("订单取消成功");
				queryAllorder();
			}
		})
	}

	// 取消订单
	$scope.scancelOrder = function(orderid){
		var reqUrl = globalConfig.rootUrl + "/superorder/cancelOrder";
		httpUtil.post(reqUrl, {orderid:orderid}, function(data, status){
			if(status==200){
				alert("订单取消成功");
				squeryAllorder();
			}
		})
	} 

	// 登出
	$scope.logout = function(){
		httpUtil.cacheUtil.remove("Authorization")
		$rootScope.me = false;
		$state.go("login")
	} 

	// 修改密码
	$scope.updatepwd = function(){
		var reqUrl = globalConfig.rootUrl + "/user/updatepwd";
		httpUtil.post(reqUrl, $scope.update, function(data, status){
			if(status==200){
				alert("密码修改成功，请重新登录！");
				$state.go("login")
			}
			if(status==402){
				alert("密码不能为空");
				return;
			}
			if(status==403){
				alert("两次密码输入不一致");
				return;
			}
			if(status==500){
				alert("密码修改失败");
				return;
			}
		})
	}

	$scope.backpay = function(order){
		$scope.vo.orderid = order.orderid;
		if(isBackpay(order) >= 0){
			alert("尚未到赎回日期")
		}else{
			$('#myModal').modal('show');
		}
	}

	$scope.confirmPayback = function(){
		var reqUrl = globalConfig.rootUrl + "/order/backpay";
		httpUtil.post(reqUrl, {orderid: $scope.vo.orderid}, function(data, status){
			if(status==200){
				alert("提交成功")
			}
			if(status==402){
				alert("尚未到赎回日期")
			}
		})
	}
	
	function queryAllorder(){
		var reqUrl = globalConfig.rootUrl + "/order/queryAllorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.orderList = data.order;
			}
		})
	}

	function queryAllbackorder(){
		var reqUrl = globalConfig.rootUrl + "/order/queryAllbackorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.backorderList = data.order;
			}
		})	
	}

	function squeryAllorder(){
		var reqUrl = globalConfig.rootUrl + "/superorder/queryAllorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.sorderList = data.order;
			}
		})
	}

	function isBackpay(order) {
		Date.prototype.diff = function(date){
		  return (this.getTime() - date.getTime())/(24 * 60 * 60 * 1000);
		}
		var now = new Date();
		var date = addDaysToDate(new Date(order.created), order.pid.week);
		var diff = date.diff(now);
		diff = diff.toFixed(0);
		return diff;
		
	                                           
    }

    function addDaysToDate(myDate,days) {
		return new Date(myDate.getTime() + days*24*60*60*1000);
	}

	
	ngInit();
  
}]).filter('orderStatus', function() { //可以注入依赖
    return function(value) {
        if(value=="0")
        	return "待支付"
        if(value=="1")
        	return "支付已生效"	
    }
}).filter('income', function() { //可以注入依赖
    return function(order) {
    	
    	// 给日期类对象添加日期差方法，返回日期与diff参数日期的时间差，单位为天
		Date.prototype.diff = function(date){
		  return (this.getTime() - date.getTime())/(24 * 60 * 60 * 1000);
		}
		// 构造两个日期
		var now = new Date();
		var date = new Date(order.created); //
		// 调用日期差方法，求得参数日期与系统时间相差的天数
		var diff = now.diff(date);
		diff = diff.toFixed(0);

		if(0 == diff)
			return order.payAmount;
		if(diff < order.pid.week){ // 如果小于周期天数
	        var income = order.payAmount*(1 + order.pid.shouyi/100/365*diff);
			return income.toFixed(0);
		}else{
			var income = order.payAmount*(1 + order.pid.shouyi/100/365*order.pid.week);
			return income.toFixed(0);
		}
    }
}).filter('incomeEnd', function() { //可以注入依赖
    return function(order) {
		if(0 == order.payAmount)
			return order.payAmount;

		var income = order.payAmount*(1 + order.pid.shouyi/100/365*order.pid.week);
		return income.toFixed(0);
    }
}).filter('userstatus', function() { //可以注入依赖
    return function(val) {
		if(val==0)
			return '未认证';
		if(val==1)
			return '审核中';
		if(val==2)
			return '已认证';
    }
});;