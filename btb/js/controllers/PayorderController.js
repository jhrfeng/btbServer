app.controller('PayorderController', 
['$rootScope', '$scope', 'httpUtil', 'photos', '$state',
function($rootScope, $scope, httpUtil, photos, $state) {
	$rootScope.header = true;
	
	function ngInit(){
		var url = window.location.href; //获取url中"?"符后的字串
		url = url.substr(url.indexOf("payorder?")+8);
		// console.log(url);
		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
		    strs = str.split("&");
		    for(var i = 0; i < strs.length; i ++) {
		   		theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
		    }
		}
		$scope.orderId = theRequest.out_trade_no;
		// theRequest.body = decodeURI(theRequest.body);
		// theRequest.subject = decodeURI(theRequest.subject);
		// theRequest.notify_time = theRequest.notify_time.replace('%2B', ' ');
		// console.log(theRequest);
		var payUrl = globalConfig.rootUrl + "/aplipay/return"+url;
		httpUtil.pay(payUrl, {}, function(data, status){
			
		})
	}
	
	// 查询结果
	$scope.queryResult = function(){
		$("#register").button('loading');
		var reqUrl = globalConfig.rootUrl + "/order/queryorder";
		httpUtil.post(reqUrl, {orderid: $scope.orderId}, function(data, status){
			$("#register").button('reset');
			if(status==200 && data.order.status=="1"){
				alert("订单已支付成功且已生效， 请到我的账户进行查看")
			}else{
				alert("订单查询失败，请联系客服人员")
			}
		})
	}
	
	
	ngInit();
  
}]);