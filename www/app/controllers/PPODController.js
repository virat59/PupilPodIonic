app.controller('PPODController',function($scope,PPODService,$http,$window,$document,$rootScope,$cordovaPush,$cordovaSQLite,sharedProperties,myCache,$ionicPlatform,$ionicSideMenuDelegate,$state){
	$scope.contactname = "ThoughtNet Technologies (India) Pvt. Ltd";
	$scope.loginTrue = sharedProperties.getIsLogin();
	$scope.student_name = sharedProperties.getStudentSelectedName();
	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
  
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  //simulate async response
		  $scope.items.push('New Item ' + Math.floor(Math.random() * 1000) + 4);
		  //Stop the ion-refresher from spinning
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};
	
	
	//$scope.student_name = "";
	function initialize() {
		$scope.ngViewClass = "modalOff";
		if(sharedProperties.getIsLogin() == true){
			//$window.location.href = '#/mainLanding';
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
		//alert('Hi In BindEvents');
        //document.addEventListener('deviceready', onDeviceReady, false);
		$ionicPlatform.ready(function(){
			alert('Hi Device Ready in PPODController');
			onDeviceReady();
		});
    };
	
	
	function onDeviceReady() {
		alert('Alert onDeviceReady');
		//receivedEvent('deviceready');
		PPODService.dbConnection($scope,sharedProperties);
    };
	
	$scope.swapeOn = function(){
		//alert('swape on');
		//return "blurOn";
		$scope.ngViewClass = "modalOn";
	};
	
	$scope.swapeOff = function(){
		//alert('swape off');
		//return "blurOff";
		$scope.ngViewClass = "modalOff";
	};
	
	function receivedEvent(id) {
		//alert('Event Received '+id);
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    };
	
	$rootScope.$on('loginStatus',function(event,args){
		alert('loginStatus Event Occured');
		$scope.loginTrue = args;
		$scope.students = myCache.get('students');
		$scope.student_name = sharedProperties.getStudentSelectedName();
		
		
	});
	
	$rootScope.$on('modelOffEvent',function(event){
		$scope.ngViewClass = "modalOff";
	});
	
	
	$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
      switch(notification.event) {
        case 'registered':
          if (notification.regid.length > 0 ) {
            //alert('registration ID = ' + notification.regid);
			//alert('Hii Came');
			PPODService.AddValueToDB($scope,'reg_id',notification.regid);
			//$window.location.href = '#/login';
			$state.go('eventmenu.login');
          }
          break;

        case 'message':
          // this is the actual push notification. its format depends on the data model from the push server
          alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
          break;

        case 'error':
          alert('GCM error = ' + notification.msg);
          break;

        default:
          alert('An unknown GCM event has occurred');
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
		//myCache.put('main_students_guid', args['student_guid']);
		//$window.location.href = '#/change_student';
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
			};

			scope.isSelected = function(item) {
				return item[scope.property] === scope.selected[scope.property];
			};

			scope.show = function() {
				scope.listVisible = true;
			};

			$rootScope.$on("documentClicked", function(inner, target) {
				//console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
				if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
					scope.$apply(function() {
						scope.listVisible = false;
					});
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

app.directive('dragToDismiss', function($drag, $parse, $timeout){
  return {
    restrict: 'A',
    compile: function(elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismiss);
      return function(scope, elem, attrs){
        var dismiss = false;

        $drag.bind(elem, {
          constraint: {
            minX: 0, 
            minY: 0, 
            maxY: 0 
          },
          move: function(c) {
            if( c.left >= c.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            elem.removeClass('dismiss');
          },
          end: function(c, undo, reset) {
            if (dismiss) {
              elem.addClass('dismitted');
              $timeout(function() { 
                scope.$apply(function() {
                  dismissFn(scope);  
                });
              }, 400);
            } else {
              reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create 
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function($scope) {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount == 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem == this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();
      
      var zIndex = function(){
        var res = 0;
        if (id == carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(n, o){
        elem[0].style['z-index']=zIndex();
      });
      

      $drag.bind(elem, {
        constraint: { minY: 0, maxY: 0 },
        adaptTransform: function(t, dx, dy, x, y, x0, y0) {
          var maxAngle = 15;
          var velocity = 0.02;
          var r = t.getRotation();
          var newRot = r + Math.round(dx * velocity);
          newRot = Math.min(newRot, maxAngle);
          newRot = Math.max(newRot, -maxAngle);
          t.rotate(-r);
          t.rotate(newRot);
        },
        move: function(c){
          if(c.left >= c.width / 4 || c.left <= -(c.width / 4)) {
            elem.addClass('dismiss');  
          } else {
            elem.removeClass('dismiss');  
          }          
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(c, undo, reset) {
          elem.removeClass('dismiss');
          if(c.left >= c.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          } else if (c.left <= -(c.width / 4)) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          reset();
        }
      });
    }
  };
});

app.controller('loginController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$q,$state){
	$scope.$on('$ionicView.enter', function(){
	// Any thing you can think of
		//alert('Hi Inside loginController');
		//$scope.fnInit1();
		$scope.fnInit();
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
		$scope.$emit('modelOffEvent', true);
		if(sharedProperties.getIsLogin() == true){
			//$window.location.href = '#/mainLanding';
			$state.go('eventmenu.mainLanding');
			return false;
		}
		$scope.loading = true;
					
		var regkey = sharedProperties.getRegKey();
		var usernameTemp = sharedProperties.getUserName();
		var passwordTemp = sharedProperties.getPassWord();
		var instnameTemp = sharedProperties.getInstName();
		var appId = sharedProperties.getAppId();
		var userGuid = sharedProperties.getUserGuid();
		//alert('Reg '+regkey+' Inst Name '+instnameTemp+' UserName '+usernameTemp+' password '+passwordTemp+' appId '+appId);
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
			//alert('Else Part');
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
	//$scope.fnInit();
});

app.controller('changeStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$state){
	$scope.$on('$ionicView.enter', function(){
	// Any thing you can think of
		alert('Hi Inside changeStudent');
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		//$window.location.href = '#/mainLanding';
		$state.go('eventmenu.mainLanding');
		return false;
    }
});

app.controller('mainController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache){
	$scope.$on('$ionicView.enter', function(){
		// Any thing you can think of
		//alert('Hi Inside mainController');
		$scope.$emit('loginStatus', true);
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		var main_students_guid = myCache.get('main_students_guid');
		var cache = myCache.get('studentName');
		//alert('main_students_guid '+main_students_guid);
		if(cache){
			//alert('Already Exist');
			if(myCache.get('main_students_guid') != sharedProperties.getStudentSelectedGuid())
			{
				//alert('Exist but for other student');
				PPODService.getStudentDetails($scope,sharedProperties,myCache);
			}
			$scope.loading = false;
			$scope.studentName = myCache.get('studentName');
			$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');;
			$scope.studentDetails = myCache.get('studentDetails');
		}
		else{
			//alert('Not Exist');
			PPODService.getStudentDetails($scope,sharedProperties);
		}
		$scope.$emit('modelOffEvent', true);
    }
	$scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

    $scope.onReload = function() {
      console.warn('reload');
      var deferred = $q.defer();
      setTimeout(function() {
        deferred.resolve(true);
      }, 1000);
      return deferred.promise;
    };
	
	//fnInit();
});

app.controller('gettingAllTests',function($scope,PPODService,$http,$window,$document,sharedProperties){
	$scope.$on('$ionicView.enter', function(){
	// Any thing you can think of
		alert('Hi Inside gettingAllTests');
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		PPODService.getStudentTestDetails($scope,sharedProperties);
		//$scope.$emit('modelOffEvent', true);
    }
	//fnInit();
});

app.controller('TestDetailsForStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,$routeParams){
	$scope.$on('$ionicView.enter', function(){
	// Any thing you can think of
		alert('Hi Inside TestDetailsForStudent');
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		//PPODService.getStudentTestDetails($scope,sharedProperties);
		//$scope.$emit('modelOffEvent', true);
		$scope.test_ins_guid = $routeParams.test_ins_guid;
		//alert('Test Instance Guid '+$scope.showName);
		PPODService.getStudentTestMarks($scope,sharedProperties);
		alert('TIG '+$scope.test_ins_guid);
    }
	//fnInit();
});




app.controller('feesController',function($scope,PPODService,$http,$window,$document,sharedProperties,$state){
	$scope.$on('$ionicView.enter', function(){
	// Any thing you can think of
		alert('Hi Inside feesController');
		$scope.fnInit();
	});
	var ref = "";
	$scope.fnInit = function(){
		$scope.$emit('modelOffEvent', true);	
    }
	$scope.makePayment = function(payment_id){
		alert('Hi Inside makePayment '+payment_id);
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
		//$window.location.href = '#/paymentCallBack'; 
		
	}
	//fnInit();
});


