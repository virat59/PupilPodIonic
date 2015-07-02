/**
*	This service belongs to Mobile Development
*	author Virat Joshi
**/

app.controller('PPODController',function($scope,PPODService,$window,$rootScope,$cordovaPush,sharedProperties,myCache,$ionicPlatform,$ionicSideMenuDelegate,$state,$timeout,$cordovaDialogs){
	$scope.contactname = "ThoughtNet Technologies (India) Pvt. Ltd";
	$scope.loginTrue = sharedProperties.getIsLogin();
	
	$scope.student_name = sharedProperties.getStudentSelectedName();
	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	
	$scope.students = {};
	$scope.student = "";
	
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};
	
	function initialize() {
		$scope.ngViewClass = "modalOff";
		if(sharedProperties.getIsLogin() == false){
			$state.go('eventmenu.mainLanding');
			return false;
		}	
		$scope.db = null;
        bindEvents();
    };
	
	var androidConfig = {
		"senderID": "74320630987",
	};
	
	function bindEvents() {
		$ionicPlatform.ready(function(){
			onDeviceReady();
		});
    };
	
	function onDeviceReady() {
		PPODService.dbConnection($scope,sharedProperties);
    };
	
	$scope.swapeOn = function(){
		$scope.ngViewClass = "modalOn";
	};
	
	$scope.swapeOff = function(){
		$scope.ngViewClass = "modalOff";
	};
		
	$rootScope.$on('loginStatus',function(event,args){
		if(!args.status){
			$scope.loginTrue = false;
			$scope.students = myCache.get('students');
			$scope.student_name = sharedProperties.getStudentSelectedName();
		}
		else{
			$scope.loginTrue = true;
		}
	});
	
	$rootScope.$on('modelOffEvent',function(event){
		$scope.ngViewClass = "modalOff";
	});
	
	
	$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
		alert('Event Occured '+notification.event);
      switch(notification.event) {
        case 'registered':
          if (notification.regid.length > 0 ) {
			PPODService.AddValueToDB($scope,'reg_id',notification.regid);
			//PPODService.sendRegKeyToServer($scope,'reg_id',notification.regid);
			$state.go('eventmenu.login');
          }
          break;

        case 'message':
          // this is the actual push notification. its format depends on the data model from the push server
			$cordovaDialogs.alert(notification.message, "Push Notification Received")
			//alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
			break;

        case 'error':
          //alert('GCM error = ' + notification.msg);
		  $cordovaDialogs.alert(notification.msg, "Error")
          break;

        default:
			$cordovaDialogs.alert("An unknown GCM event has occurred", "Event")
			//alert('An unknown GCM event has occurred');
			break;
      }
    });
	
	
	function getDBValues(field_key) {
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details WHERE field_key = ? ", [field_key],function(transaction, result)
			{
				if (result != null && result.rows != null) {
					for (var i = 0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
					}
					var row = result.rows.item(0);
					resultForRet = row.field_value;
				}
				else{
					resultForRet = '';
				}
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
		return false;
	};
	
	$rootScope.$on('studentChanged',function(event,args){
		$scope.student_name = args['name'];
		$state.go('eventmenu.change_student');
			return false;
	});
	
	$scope.onReload = function() {
      console.warn('reload');
      var deferred = $q.defer();
      setTimeout(function() {
        deferred.resolve(true);
      }, 1000);
      return deferred.promise;
    };
	
	$scope.goTo = function(url){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$state.go('eventmenu.change_student');
	}
	
	initialize();
});

app.run(function($rootScope) {
	angular.element(document).on("click", function(e) {
		$rootScope.$broadcast("documentClicked", angular.element(e.target));
	});	
});

app.directive("dropdown", function($rootScope,sharedProperties) {
	return {
		restrict: "E",
		templateUrl: "app/directives/templates/dropdown.html",
		transclude: true,
		scope: {
			placeholder: "@",
			list: "=",
			selected: "=",
			property: "@"
		},
		link: function(scope) {
			scope.listVisible = false;
			scope.isPlaceholder = true;

			scope.select = function(item) {
				scope.isPlaceholder = false;
				scope.selected = item;
				scope.listVisible = false;
			};

			scope.isSelected = function(item) {
				return item[scope.property] === scope.selected[scope.property];
			};

			scope.show = function() {
				scope.listVisible = true;
			};

			$rootScope.$on("documentClicked", function(inner, target) {

			});

			scope.$watch("selected", function(value) {
				scope.isPlaceholder = scope.selected[scope.property] === undefined;
				scope.display = scope.selected[scope.property];
				sharedProperties.setStudentSelectedGuid(scope.selected['student_guid']);
				sharedProperties.setStudentSelectedName(scope.selected['name']);
				scope.$emit('studentChanged',{'name':scope.selected['name'],'student_guid':scope.selected['student_guid']});
			});
		}
	}
});

app.controller('loginController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$q,$state,$ionicSideMenuDelegate,$timeout){
	$scope.loading = true;
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.loading = true;
		$ionicSideMenuDelegate.canDragContent(false);
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.login = {
		instName: "",
		userName: "",
		password: "",
		registration_key: "",
		app_id: "",
		user_guid: ""
	};
	$scope.instDis = true;
	
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			$state.go('eventmenu.mainLanding');
			return false;
		}
		else{
			$scope.loading = true;		
			var regkey = sharedProperties.getRegKey();
			var usernameTemp = sharedProperties.getUserName();
			var passwordTemp = sharedProperties.getPassWord();
			var instnameTemp = sharedProperties.getInstName();
			var appId = sharedProperties.getAppId();
			var userGuid = sharedProperties.getUserGuid();
			if(instnameTemp != '' && usernameTemp != '' && passwordTemp != ''){
				$scope.login.instName = instnameTemp;
				$scope.login.userName = usernameTemp;
				$scope.login.password = passwordTemp;
				$scope.login.registration_key = regkey;
				$scope.login.app_id = appId;
				$scope.login.user_guid = userGuid;
				PPODService.loginFunction($scope,sharedProperties);
			}
			else{
				$scope.loading = false;
			}
		}
    }
	$scope.submit = function(form) {
		$scope.loading = true;
		$scope.submitted = true;
		$scope.login.registration_key = sharedProperties.getRegKey();
		$scope.login.app_id = sharedProperties.getAppId();
		$scope.login.user_guid = sharedProperties.getUserGuid();
		if($scope.login.instName == "" || $scope.login.instName == null){
			$scope.loading = false;
			alert('Please enter Instance Name, Instance Name field can not be empty');
			return false;
		}
		else if($scope.login.userName == "" || $scope.login.userName == null){
			$scope.loading = false;
			alert('Please enter User Name, User Name/id field can not be empty');
			return false;
		}
		else if($scope.login.password == "" || $scope.login.password == null){
			$scope.loading = false;
			alert('Please enter password, password field can not be empty');
			return false;
		}
		PPODService.loginFunction($scope,sharedProperties);	  
	};
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});


app.controller('homeController',function($scope,PPODService,$ionicSideMenuDelegate,$timeout){
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.doRefresh = function() {
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('changeStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$state,$ionicSideMenuDelegate,$timeout){
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$ionicSideMenuDelegate.canDragContent(false);
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.fnInit = function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$state.go('eventmenu.mainLanding');
		return false;
    };
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('mainController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$ionicSideMenuDelegate,$timeout,$state){
	$scope.loading = true;
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		var param = {"status": false};
		if(sharedProperties.getIsLogin() == false){
			$scope.$emit('loginStatus', param);
		}
		$scope.loading = true;
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
    });
	$scope.fnInit = function(){
		//var main_students_guid = myCache.get('main_students_guid');
		var tempData = {};
		if(sharedProperties.getTestDBConObj() == null){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(PPODService.createTable,PPODService.errorHandlerTransaction,PPODService.nullHandler);
			$scope.db = db;		
		}
		else{
			$scope.db = sharedProperties.getTestDBConObj();
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_notification_details", [],function(transaction, resultT1)
			{
				for (var i = 0; i < 3; i++) {
					var row = resultT1.rows.item(i);
					tempData.push(row);
				}
			},PPODService.errorHandlerQuery);
		},PPODService.errorHandlerTransaction,PPODService.nullHandler);
		myCache.set('messageDashboard') = tempData;
		
		var cache = myCache.get('studentName');
		if(cache){
			if(sharedProperties.getIsLogin() == false){
				if(myCache.get('main_students_guid') != sharedProperties.getStudentSelectedGuid())
				{
					PPODService.getStudentDetails($scope,sharedProperties);
				}
				else{
					
					$scope.loading = false;
					$scope.messageDashboard = myCache.get('messageDashboard');
					$scope.programDashboard = myCache.get('programDashboard');
					$scope.cal_of_eventDashboard = myCache.get('cal_of_eventDashboard');
					$scope.attendanceDashboard = myCache.get('attendanceDashboard');
					$scope.feesDashboard = myCache.get('feesDashboard');
					$scope.studentDetails = myCache.get('studentDetails');
				}
			}
			else{
				//$scope.loading = false;
				$state.go('eventmenu.login');
			}
		}
		else{
			if(sharedProperties.getIsLogin() == false){
				PPODService.getStudentDetails($scope,sharedProperties);
			}
			else{
				//$scope.loading = false;
				$state.go('eventmenu.login');
			}
		}
    };

    $scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('gettingAllTests',function($scope,PPODService,$http,$window,$document,sharedProperties,$ionicSideMenuDelegate,$timeout,$state){
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		//alert('Inside Get Test Details');
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			//alert('Inside Get Test Details for student');
			PPODService.getStudentTestDetails($scope,sharedProperties);
		}
    }
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
	$scope.goToDetails = function(tig){
		var path = "eventmenu.view_test_details";
		var param = {test_ins_guid: tig};
		$state.go(path,param);
	};
});

app.controller('TestDetailsForStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,$stateParams,$ionicSideMenuDelegate,$timeout){
	
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			$scope.test_ins_guid = $stateParams.test_ins_guid;
			PPODService.getStudentTestMarks($scope,sharedProperties);
		}
    }
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('feesController',function($scope,PPODService,$http,$window,$document,sharedProperties,$state,$ionicSideMenuDelegate,$timeout){
	
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.fnInit();
	});
	var ref = "";
	$scope.fnInit = function(){
		$scope.$emit('modelOffEvent', true);	
    }
	$scope.makePayment = function(payment_id){
		ref = window.open('http://thoughtnet.pupilpod.in/paymenttest.php', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) {  });
        ref.addEventListener('loadstop', function(event) {  
			if (event.url.match("/close")) {
				ref.close();
			}
		});
        ref.addEventListener('loaderror', function(event) {
			if (event.url.match("/close")) {
				ref.close();
			} 
		});
		ref.addEventListener('exit', function(event) { $state.go('eventmenu.paymentCallBack'); });
	}
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('logoutController',function($scope,PPODService,sharedProperties,$ionicSideMenuDelegate,$ionicHistory,$ionicPopup){
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.spinning = true;
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
		$scope.spinning = false;
    });
	$scope.fnInit = function(){
		$scope.showConfirm();
    }
	$scope.showConfirm = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Logout',
			template: 'Are you sure you want to logout?',
			okText: 'Logout', // String (default: 'OK'). The text of the OK button.
			okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
		});
		confirmPopup.then(function(res) {
			if(res) {
				var param = {"status": true};
				$scope.$emit('loginStatus', param);
				PPODService.removeLocalEntry($scope,sharedProperties);
			} else {
				console.log('Inside else part');
				if($ionicSideMenuDelegate.isOpenLeft()){
					$ionicSideMenuDelegate.toggleLeft();
				}
				$ionicHistory.goBack();
				return false;
			}
		});
	};
});

app.controller('studentViewController',function($scope,PPODService,sharedProperties,$ionicSideMenuDelegate,$ionicHistory,$ionicPopup){
	$scope.loading = false;
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.spinning = true;
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		
    });
	$scope.fnInit = function(){	
		$scope.loading = false;
		$scope.studentName = myCache.get('studentName');
		$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');
		$scope.studentDetails = myCache.get('studentDetails');
    };
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});