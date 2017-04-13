var app = angular.module('GalleryApp', ['ui.router','oc.lazyLoad']); //'ngRoute',

app.controller('rootCtrl',['$rootScope',function($rootScope){
	if(window.localStorage.getItem("Authorization")){
		$rootScope.me = true;		
	}else{
		$rootScope.me = false;
	}
}]);

app.config(function ($stateProvider, $urlRouterProvider) { //$routeProvider, 
	$urlRouterProvider.when('', '/home');
	$stateProvider
		.state('home',{
			url:'/home',
			templateUrl: 'views/home.html',
			controller: 'HomeController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
			 			// 'js/json/home.js'
			 		]);
			 	}]
			}
		})
		.state('aboutus',{
			url:'/aboutus',
			controller: 'AboutusController', 
			templateUrl: 'views/aboutus.html',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		})
		.state('login',{
			url:'/login',
			templateUrl: 'views/login.html',
			controller: 'LoginController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		})
		.state('register',{
			url:'/register',
			templateUrl: 'views/register.html',
			controller: 'RegisterController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		})
		.state('particulars',{
			url:'/particulars',
			templateUrl: 'views/particulars.html',
			controller: 'particularsController', 
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		})
		.state('safety',{
			url:'/safety',
			templateUrl: 'views/safety.html',
			controller: 'SafetyController', 
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		})
		.state('invest',{
			url:'/invest',
			templateUrl: 'views/invest.html',
			controller: 'InvestController', 
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
			 			// 'js/json/invest.js'
			 		]);
			 	}]
			}
		})
		.state('me',{
			url:'/me',
			templateUrl: 'views/me.html',
			controller: 'MeController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//			 			'js/services/httpUtil.js'
			 		]);
			 	}]
			}
		}).state('order',{
			url:'/order/{pid}',
			templateUrl: 'views/order.html',
			controller: 'OrderController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([
//						'js/controllers/OrderController.js'
			 		]);
			 	}]
			}
		}).state('placeorder',{
			url:'/placeorder/{orderId}',
			templateUrl: 'views/placeorder.html',
			controller: 'PlaceorderController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([

			 		]);
			 	}]
			}
		}).state('payorder',{
			url:'/payorder',
			templateUrl: 'views/payorder.html',
			controller: 'PayorderController',
			resolve: {
			 	load: ['$ocLazyLoad', function($ocLazyLoad) {
			 		return $ocLazyLoad.load([

			 		]);
			 	}]
			}
		});

});