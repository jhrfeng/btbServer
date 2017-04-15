app.controller('MeController', 
['$rootScope', '$scope', 'httpUtil', '$state',
function($rootScope, $scope, httpUtil, $state) {
	$rootScope.header = true;
	 
	$scope.update = {}; 
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
	
	function queryAllorder(){
		var reqUrl = globalConfig.rootUrl + "/order/queryAllorder";
		httpUtil.get(reqUrl, function(data, status){
			if(status==200){
				$scope.orderList = data.order;
			}
		})
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
		var date = new Date('2016-04-16'); // order.created
		// 调用日期差方法，求得参数日期与系统时间相差的天数
		var diff = now.diff(date);
		diff = diff.toFixed(0);

		console.log(diff)
	
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
});