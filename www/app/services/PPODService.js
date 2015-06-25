/**
*	This service belongs to Mobile Development
*	author Virat Joshi
**/


app.service('PPODService',function($http,url,$window,$timeout,sharedProperties,$cordovaPush,$rootScope,$state,myCache){    
	this.dbConnection = function($scope,sharedProperties){
		var shortName = 'tnet_pupilpod';
		var version = '1.0';
		var displayName = 'Tnet_Pupilpod';
		var maxSize = 65535;
		db = $window.openDatabase(shortName, version, displayName,maxSize);
		db.transaction(createTable,errorHandlerTransaction,successCallBack);
		$scope.db = db;
	};
	
	function createTable(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS tnet_login_details(Id INTEGER NOT NULL PRIMARY KEY, field_key TEXT NOT NULL, field_value TEXT NOT NULL)',[],nullHandler,errorHandlerQuery); 
	};
	
    function successHandler(result) {
		return false;
    };
	
    function errorHandler(error) {
		alert("errorHandler Code : "+error.code+" Message "+error.message);
		return false;
    };
	
	function errorHandlerTransaction(error){
		alert("errorHandlerTransaction Code : "+error.code+" Message "+error.message);
		return false;
	};
	
	function errorHandlerQuery(error){
		alert("errorHandlerQuery Code : "+error.code+" Message "+error.message);
		return false;
	};
	
	function successInsert(error){
		return false;
	};
	
	this.AddValueToDB = function($scope,field_key,field_value) { 
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		if(field_key == 'reg_id')
			sharedProperties.setRegKey(field_value);
		if($scope.db == null || $scope.db == undefined || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details WHERE field_key = ? ", [field_key],function(transaction, result)
			{
				if (result != null && result.rows != null) {
					if(result.rows.length == 0){
						transaction.executeSql('INSERT INTO tnet_login_details(field_key, field_value) VALUES (?,?)',[field_key, field_value],nullHandler,errorHandlerQuery);
					}
					else{
						transaction.executeSql('UPDATE tnet_login_details set field_value = ? WHERE field_key = ? ',[ field_value,field_key],nullHandler,errorHandlerQuery);
					}
				}
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
				
		return false;
	};
	
	function nullHandler(){
		return false;
	};
	
	function successCallBack() { 
		db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details WHERE field_key = ? ", ['reg_id'],function(transaction, result)
			{
				var androidConfig = {
					"senderID": "74320630987",
				};
				if (result != null && result.rows != null) {
					if(result.rows.length == 0){
						$cordovaPush.register(androidConfig).then(function(resultPush) {
						}, function(err) {
							alert('Error '+err);
						})
					}
					else{
						transaction.executeSql("SELECT * FROM tnet_login_details", [],function(transaction, resultT1)
						{
							for (var i = 0; i < resultT1.rows.length; i++) {
								var row = resultT1.rows.item(i);
								if(row.field_key == 'reg_id'){
									sharedProperties.setRegKey(row.field_value);
								}
								else if(row.field_key == 'username'){
									sharedProperties.setUserName(row.field_value);
								}
								else if(row.field_key == 'password'){
									sharedProperties.setPassWord(row.field_value);
								}
								else if(row.field_key == 'instname'){
									sharedProperties.setInstName(row.field_value);
								}
								else if(row.field_key == 'appid'){
									sharedProperties.setAppId(row.field_value);
								}
								else if(row.field_key == 'userguid'){
									sharedProperties.setUserGuid(row.field_value);
								}
							}
						},errorHandlerQuery);
						$state.go('eventmenu.login');
					}
				}
				else{
					$cordovaPush.register(androidConfig).then(function(resultPush) {
					}, function(err) {
						alert('Error '+err);
					})
				}
				return false;
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
		return false;
	};
	
	this.loginFunction = function ($scope,sharedProperties){
		var self = this;
		var param = JSON.stringify({
                "serviceName":"TnetMobileService", 
                "methodName":"login",
                "parameters":[null,{'instName' : $scope.login.instName,'userName' : $scope.login.userName,'password': $scope.login.password,'registration_key' : $scope.login.registration_key,'app_id' : $scope.login.app_id,'user_guid' : $scope.login.user_guid}]
                });
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		var tempUrl = "http://"+$scope.login.instName+"/"+url;
		$http.post(tempUrl, param).success(function(data, status, headers, config) {		
			if(data.valid == 'VALID'){
				sharedProperties.setInstName(data.instName);
				sharedProperties.setUserName(data.userName);
				sharedProperties.setPassWord(data.password);
				sharedProperties.setAppId(data.app_id);
				sharedProperties.setUserGuid(data.user_guid);
				sharedProperties.setIsLogin(false);
				sharedProperties.setStudentSelectedGuid(data.studentDetails[0]['student_guid']);
				sharedProperties.setStudentSelectedName(data.studentDetails[0]['name']);
				$scope.login = true;
				$scope.students = data.studentDetails;
				myCache.put('students', data.studentDetails);
				myCache.put('main_students_guid', data.studentDetails[0]['student_guid']);
				self.AddValueToDB($scope,'username',data.userName);
				self.AddValueToDB($scope,'password',data.password);
				self.AddValueToDB($scope,'instname',data.instName);
				self.AddValueToDB($scope,'appid',data.app_id);
				self.AddValueToDB($scope,'userguid',data.user_guid);
				$state.go('eventmenu.mainLanding');
				
			}
			else{
				$scope.instDis = false;
				$scope.loading = false;
				alert('Wrong User Name or Password, Please try again '+data.reason);
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			alert('Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in');
			return false;
		});
    };
	
	this.getStudentDetails = function($scope,sharedProperties){
		var param = JSON.stringify({
                "serviceName":"TnetMobileService", 
                "methodName":"getStudentDetails",
                "parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid()}]
                });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {	
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentName = data.name;
				$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+data.photo;
				$scope.studentDetails = data.all_other;
				myCache.put('studentDetails', data.all_other);
				myCache.put('studentName', data.name);
				myCache.put('studentImage', data.photo);
				myCache.put('main_students_guid', sharedProperties.getStudentSelectedGuid());
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			alert('Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in');
			return false;
		});
	};

	this.getStudentTestDetails = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getStudentTestDetails",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid()}]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentTestDetails = data.all_tests;
				$scope.termName = data.term_name;
				$scope.sectionName = data.section_name;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			alert('Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in');
			return false;
		});
	};
	
	this.getStudentTestMarks = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getStudentTestMarks",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),'test_ins_guid': $scope.test_ins_guid }]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentTestMarks = data.test_details;
				$scope.testName = data.test_name;
				$scope.testCode = data.test_code;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			alert('Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in');
			return false;
		});
	};
	
	this.removeLocalEntry = function($scope,sharedProperties){
		if (!window.openDatabase) {
			alert('Databases are not supported in this browser.');
			return;
		}
		
		if($scope.db == null || $scope.db == undefined || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details", [],function(transaction, resultT1)
			{
				for (var i = 0; i < resultT1.rows.length; i++) {
					var row = resultT1.rows.item(i);
					if(row.field_key == 'reg_id'){
					}
					else if(row.field_key == 'username'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'password'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'instname'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'appid'){
					}
					else if(row.field_key == 'userguid'){
					}
				}
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
		
		sharedProperties.setInstName("");
		sharedProperties.setUserName("");
		sharedProperties.setPassWord("");
		sharedProperties.setIsLogin(true);
		sharedProperties.setStudentSelectedGuid("");
		sharedProperties.setStudentSelectedName("");
		$state.go('eventmenu.login');
	};
});