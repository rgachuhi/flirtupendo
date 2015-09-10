// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('pendo', ['ionic', 'ngAria', 'ngMaterial', 'btford.socket-io', 'ngCordova.plugins.camera', 'pendo.controllers', 'pendo.services', 'pendo.security', 'pendo.resources'])

.run(function($ionicPlatform, $ionicHistory, $location, $state, $rootScope, $timeout, MessageService, SecurityService, ChatManager) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
    	console.log("$stateChangeStart Switching route: from "  +fromState.url +" to "+ toState.url + " access " + toState.access.allowAnonymous + 
    			" logged in " +SecurityService.isLoggedIn());
    	if (toState.access != undefined && !toState.access.allowAnonymous && !SecurityService.isLoggedIn()) {
    		
    		/*console.log("Back to login page");
    		$ionicHistory.clearHistory();
    		$ionicHistory.nextViewOptions({
 			   disableBack: true
 			});*/
    		//$state.go('login');
    		
            console.log("Back to login page 2");
            //$location.path("/login"); 
            $state.go('login');
            //$state.transitionTo("login");
            event.preventDefault(); 
            
        }
    	if(toState.url === "/chats/:streamId"){
    		$ionicHistory.clearCache();
    		console.log("Clear cache for chats detail page");
    	}/*else{
    		if(ChatManager.socket != undefined){
    			ChatManager.socket.disconnect();
    			console.log("Socket disconneted");
    		}
    	}*/
    	if(toState.url === "/login"){
    		console.log("login page 2");
    		$ionicHistory.clearHistory();
    		$ionicHistory.nextViewOptions({
 			   disableBack: true
 			});
    	}
    	/*if(toState.url === "/chats/"){
    		$ionicHistory.clearCache();
    		console.log("Clear cache for chats page");
    		if(ChatManager.socket != undefined){
    			socket.disconnect();
    			console.log("Socket disconneted");
    		}
    	}*/
    
        MessageService.clearMessages();
    });
  });
})//"serverUrl": " http://192.168.18.21",
.constant("CONFIG", {
        "serverUrl": " http://127.0.0.1",
        "serverPort": "8000"
})
.config(function ($stateProvider, $urlRouterProvider, $mdGestureProvider) {
	$mdGestureProvider.skipClickHijack();

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider.state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl',
    access : {allowAnonymous : true}
  })
  
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('dash', {
    url: '/dash',
    templateUrl: 'templates/tab-dash.html',
    controller: 'DashCtrl',
    access : {allowAnonymous : false}
  })
  
  .state('tab.prospects', {
    url: '/prospects',
    access : {allowAnonymous : false},
    views: {
      'tab-prospects': {
        templateUrl: 'templates/tab-prospects.html',
        controller: 'ProspectsCtrl'
      }
    }
  })
  
  .state('tab.matches', {
    url: '/matches',
    access : {allowAnonymous : false},
    views: {
      'tab-matches': {
        templateUrl: 'templates/tab-matches.html',
        controller: 'MatchesCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      access : {allowAnonymous : false},
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chat-streams.html',
          controller: 'ChatStreamsCtrl'
        }
      }
    })
  .state('tab.chat-detail', {
      url: '/chats/:streamId',
      access : {allowAnonymous : false},
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    access : {allowAnonymous : false},
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'PreferencesCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
  /*$urlRouterProvider.otherwise(function($injector, $location, SecurityService){
	  if(SecurityService.isLoggedIn()){
		  $location.path('/tab/dash');
	  }else{
		  $location.path('/login');
	  }
  });*/

}).factory('AuthHttpResponseInterceptor', ['$q', '$rootScope', '$location', 'SecurityService', 'MessageService',
                                            function ($q, $rootScope, $location, SecurityService, MessageService) {
    return {
        'request': function (config) {
            SecurityService.secureRequest(config);
            return config || $q.when(config);
        },
        'response': function (response) {
            return response || $q.when(response);
        },
        'responseError': function (rejection) {
            console.log("Server Response Status: " + rejection.status);
            console.log(rejection);

            if (rejection.data && rejection.data.message) {
                MessageService.setMessages(rejection.data.message);
            } else {
                MessageService.setMessages(["Unexpected error from server."]);
            }

            if (rejection.status === 401) {
                console.log("[INFO] Unauthorized response.");
                SecurityService.endSession();
                $location.path('/login');
                MessageService.setMessages(["Please, provide your credentials."]);
            } else if (rejection.status == 400) {
                console.log("[ERROR] Bad request response from the server.");
            } else if (rejection.status == 500) {
                console.log("[ERROR] Internal server error.");
            } else {
                console.log("[ERROR] Unexpected error from server.");
            }

            return $q.reject(rejection);
        }
    }
}])
.config(['$httpProvider', function ($httpProvider) {
    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('AuthHttpResponseInterceptor');
}]);
