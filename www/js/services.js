angular.module('pendo.services', ['ionic','pendo.security', 'pendo.resources', 'ngResource', 'ngRoute'])

.factory('ChatManager', function(SecurityService, ChatStreamsResource, ChatListResource, ChatMessage) {

	var chatStreams = null; 
	var chats = null;
	var selectedStream = null;
	var users = null;
	var socket = null;
	var chatManager =  {
		fetchStreams: function() {
			chatStreams = ChatStreamsResource.query(function (){});
			return chatStreams;
		},
		fetchChatsForStream: function(streamId) {
			chats = ChatListResource(streamId).list(function (data){
				console.log("Chat List Data " + data);
			});
			console.log("Chat List Data 2 " + chats);
			return chats;
		},
		//remove: function(stream) {
		//	chatStreams.splice(chats.indexOf(stream), 1);
		//},
		selectStream: function(streamId) {
			if(chatStreams === null){
				return null;
			}
			for (var i = 0; i < chatStreams.length; i++) {
				if (chatStreams[i].id === streamId) {
					selectedStream = chatStreams[i];
					return selectedStream;
				}
			}
			return null;
		}
	};
	return chatManager;
})
.factory('Prospects', function($state, $ionicHistory, CONFIG, ProspectsResource) {
	var prospects = null;
	
	return {
		load: function($scope, cards){
			if(typeof cards === 'undefined' || prospects === null){
				ProspectsResource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/nearest/-80.089/40.675/list?page=1').query(function(data) {
					prospects = data;
					console.log("Calling the query function");
					$ionicHistory.clearCache();
					$state.go('tab.prospects');
				});
			}else{
				if(prospects.next === null){
					return;
				}
				ProspectsResource(prospects.next).query(function(data) {
					prospects = data;
					console.log("Calling the query function 2");
					
					if(cards && cards !== null){
						var empty = (cards.length < 1);
						for (var i = 0; i < prospects.results.length; i++) {
							cards.unshift(prospects.results[i]);
						}
						if(empty){
							console.log("Calling the query function 2 empty cards");
							var newCard = cards.pop();
							$scope.cards.push(angular.extend({}, newCard));
						}
					}
					//$ionicHistory.clearCache();
					//$state.go('tab.prospects');
				});
			}
		},
		all: function() {
			if(prospects === null){
				console.log("Prospects is null ");
				$ionicHistory.clearCache();
				$state.go('dash');
				return null;
			}
			console.log("Prospects 2");
			return prospects.results;
		},
		get: function(prospectId) {
			for (var i = 0; i < prospects.results.length; i++) {
				if (prospects.results[i].id === parseInt(prospectId)) {
					return prospects.results[i];
				}
			}
			return null;
		}
	};
})
.factory('MessageService', ['$rootScope', function($rootScope) {
	$rootScope.messages = [];

	var MessageService = function() {
		this.setMessages = function(messages) {
			console.log(messages);
			$rootScope.messages = messages;
		};

		this.hasMessages = function() {
			return $rootScope.messages && $rootScope.messages.length > 0;
		}

		this.clearMessages = function() {
			$rootScope.messages = [];
		}
	};

	return new MessageService();
}]);
