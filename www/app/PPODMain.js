var app = angular.module('PPOD',['ionic',"ngCordova"]);

app.constant('url', 'NBA/amfphp-2.1/Amfphp/?contentType=application/json');

app.run(['$ionicPlatform','$timeout','$state','$window', 
	function($ionicPlatform,$timeout,$state,$window) {
	FastClick.attach(document.body);
}]);

app.factory('myCache', function($cacheFactory) {
 return $cacheFactory('myData');
});

app.config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

app.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('eventmenu', {
		cache: false,
		url: "/event",
		abstract: true,
		templateUrl: 'app/views/others/sidebar.html'
    })
	.state('eventmenu.home', {
		cache: false,
		url: "/home",
		views: {
			'menuContent' :{
			  templateUrl: 'app/views/Home.html'
			}
		}
    })
	.state('eventmenu.login', {
		cache: false,
		url: "/login",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/login.html',
				controller: "loginController"
			}
		}
    })
	.state('eventmenu.mainLanding', {
		cache: false,
		url: "/mainLanding",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/mainLanding.html',
				controller: "mainController"
			}
		}
    })
	.state('eventmenu.exam_details', {
		cache: false,
		url: "/exam_details",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/exam_details.html',
				controller: "gettingAllTests"
			}
		}
    })
	.state('eventmenu.fees', {
		cache: false,
		url: "/fees",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/fees.html',
				controller: "feesController"
			}
		}
    })
	.state('eventmenu.paymentCallBack', {
		cache: false,
		url: "/paymentCallBack",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/paymentCallBack.html',
				controller: ""
			}
		}
    })
	.state('eventmenu.view_test_details', {
		cache: false,
		url: "/view_test_details",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/view_test_details.html',
				controller: "TestDetailsForStudent"
			}
		}
    })
	.state('eventmenu.change_student', {
		url: "/change_student",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/change_student.html',
				controller: "changeStudent"
			}
		}
    })
	$urlRouterProvider.otherwise("/event/home");
}]);

app.service('sharedProperties', function () {
	var reg_key = '';
	var userName = '';
	var passWord = '';
	var instName = '';
	var parOrStu = '';
	var isLogin = false;
	var login_entity_guid = '';
	var app_id = '';
	var student_guid = '';
	var student_name = '';
	return {
		getRegKey: function() {
			return reg_key;
		},
		setRegKey: function(regKey) {
			reg_key = regKey;
		},
		getUserName: function() {
			return userName;
		},
		setUserName: function(user) {
			userName = user;
		},
		getPassWord: function() {
			return passWord;
		},
		setPassWord: function(pass) {
			passWord = pass;
		},
		getInstName: function() {
			return instName;
		},
		setInstName: function(inst) {
			instName = inst;
		},
		getParOrStu: function() {
			return parOrStu;
		},
		setParOrStu: function(typeoflogin) {
			parOrStu = typeoflogin;
		},
		getUserGuid: function() {
			return login_entity_guid;
		},
		setUserGuid: function(entity_guid) {
			login_entity_guid = entity_guid;
		},
		getIsLogin: function() {
			return isLogin;
		},
		setIsLogin: function(login) {
			isLogin = login;
		},
		getAppId: function() {
			return app_id;
		},
		setAppId: function(appid) {
			app_id = appid;
		},
		getStudentSelectedGuid: function() {
			return student_guid;
		},
		setStudentSelectedGuid: function(stuGuid) {
			student_guid = stuGuid;
		},
		getStudentSelectedName: function() {
			return student_name;
		},
		setStudentSelectedName: function(stuName) {
			student_name = stuName;
		}
	};
});