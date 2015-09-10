angular.module(
		'pendo.controllers',
		[ 'pendo.security', 'pendo.services', 'pendo.resources',
				'ionic.contrib.ui.tinderCards' ])
.directive('noScroll',
		function($document) {

			return {
				restrict : 'A',
				link : function($scope, $element, $attr) {

					$document.on('touchmove', function(e) {
						e.preventDefault();
					});
				}
			}
		})
.controller(
		'LoginCtrl', function($rootScope, $scope, $state, $ionicHistory,
				LoginResource, SecurityService) {
			$ionicHistory.clearHistory();
    		$ionicHistory.nextViewOptions({
 			   disableBack: true
 			});
			if (SecurityService.isLoggedIn()) {
				//$ionicHistory.clearCache();
				$state.go('dash');
				//$location.path('dash');
				return;
			}
			// Perform the login action when the user submits the login form
			$scope.loginData = {};

			$scope.doLogin = function() {
				if ($scope.loginData != undefined
						&& $scope.loginData.email != undefined
						&& $scope.loginData.password != undefined) {
					console.log('Doing login', $scope.loginData);
					SecurityService.setUserEmail($scope.loginData.email);
					var logindata = {};
					logindata.client_id = "odJ9ud4ltFf6DLRaykjCykrQoHOyCs0SaaTEc752";
					logindata.grant_type = "password";
					logindata.username = $scope.loginData.email;
					logindata.password = $scope.loginData.password;
					//logindata = $httpParamSerializerJQLike(logindata);
					LoginResource().login(logindata,
							function(data) {
								SecurityService.initSession(data);
								console.log("Switching location");
								$ionicHistory.clearHistory();
								$state.go('dash');
								//$location.path('dash');
							});
				}
			};
		})

.controller('DashCtrl', function($scope, $timeout, $ionicViewService, $ionicHistory, $state, SecurityService, Prospects) {
	if(!SecurityService.isLoggedIn()){
		$state.go('login');
		return;
	}
	
	$scope.init = function() {
		console.log("DashCtrl init");
		$timeout(function() {
			// simulate async response
			console.log('Call after delay');
			Prospects.load();
		}, 300);
	}
})
.controller('CardCtrl', function($scope, TDCardDelegate) {
  
})
.controller('ProspectsCtrl', function($rootScope, $scope, $ionicScrollDelegate, $timeout, $ionicModal, Prospects, MatchMake,
				TDCardDelegate, SecurityService) {
	$timeout(function() {
		$ionicScrollDelegate.$getByHandle('prospectScroll')
		.freezeAllScrolls([ true ]);
	}, 300);

	console.log("ProspectsCtrl created");
	var cardTypes = null;
	$scope.init = function() {
		console.log("ProspectsCtrl init");
		cardTypes = new Array();
		var all = Prospects.all();
		if (cardTypes && all) {
			$scope.cards = [];
			for (var i = 0; i < all.length; i++) {
				if(i < 3){
					$scope.cards.push(angular.extend({}, all[i]));
				}else{
					cardTypes.unshift(all[i]);
				}
			}
		}
	}

	$scope.cardSwipedLeft = function(card) {
		console.log('Card Swiped Left' + card.email);
		$scope.addCard();
	}

	$scope.cardSwipedRight = function(card) {
		console.log('Card Swiped Right' + card.email);
		$scope.addCard();
	}

	$scope.like = function(){
		console.log(SecurityService.getUserEmail() + ' likes');
		if($scope.cards.length < 1){
			return;
		}
		console.log('Card Swiped ' + $scope.cards[0].email);
		var liked = new MatchMake();
		liked.email = $scope.cards[0].email;
		liked.status = 'liked';
		liked.$save(function (u, headers){
			console.log("Match Liked: " + u);
			//$scope.modal.show();
		});
		TDCardDelegate.$getByHandle('friends').cardInstances[0].swipe('right');
		$scope.addCard();
	}

	$scope.notLike = function(){
		console.log(SecurityService.getUserEmail() + ' notLike');
		if($scope.cards.length < 1){
			return;
		}
		console.log('Card Swiped ' + $scope.cards[0].email);
		var liked = new MatchMake();
		liked.email = $scope.cards[0].email;
		liked.status = 'rejected';
		liked.$save(function (u, headers){
			console.log("Match Rejected: " + u);
			//$scope.modal.show();
		});
		TDCardDelegate.$getByHandle('friends').cardInstances[0].swipe('left');
		$scope.addCard();
	}


	$scope.cardDestroyed = function(index) {
		console.log('cardDestroyed');
		$scope.cards.splice(index, 1);
	}

	$scope.addCard = function() {
		if(cardTypes.length < 1){
			return;
		}
		var newCard = cardTypes.pop();
		console.log('add card ' + newCard.email);
		$scope.cards.push(angular.extend({}, newCard));
		if(cardTypes.length  < 2){
			Prospects.load($scope, cardTypes);
		}
	}

	$ionicModal.fromTemplateUrl('templates/match-found-popover.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});

	/*$ionicPopover.fromTemplateUrl('templates/match-found-popover.html', {
			    scope: $scope
			  }).then(function(popover) {
			    $scope.popover = popover;
			  });


			  $scope.openPopover = function($event) {
			    $scope.popover.show($event);
			  };
			  $scope.closePopover = function() {
			    $scope.popover.hide();
			  };
			  //Cleanup the popover when we're done with it!
			  $scope.$on('$destroy', function() {
			    $scope.popover.remove();
			  });
			  // Execute action on hide popover
			  $scope.$on('popover.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove popover
			  $scope.$on('popover.removed', function() {
			    // Execute action
			  });*/
})

.controller('MatchesCtrl', function($scope, $timeout, $state, MatchList, ChatStreamMake) {
	$scope.init = function() {
		console.log("MatchesCtrl init");
		var matches = MatchList.query(function() {
			console.log("Found Matches");
			$scope.matches = matches;
		});
	}
	$scope.startChat = function(match){
		console.log("MatchesCtrl startChat " +match.tag?match.target.email:match.source.email);
		var liked = new ChatStreamMake();
		liked.email = match.tag?match.target.email:match.source.email;
		liked.match_id = match.id;
		liked.$save(function (u, headers){
			console.log("ChatStreamMake: " + u);
			$state.go('tab.chats');
		});
	}
})

.controller('ChatStreamsCtrl', function($scope, $ionicHistory, ChatManager) {
	$ionicHistory.clearHistory();
	$scope.streams = ChatManager.fetchStreams();
	$scope.remove = function(stream) {
		//ChatManager.remove(stream);
	}
})

.controller('ChatDetailCtrl', function($scope, $stateParams, ChatManager, ChatMessage, socket, $cordovaCamera, 
		SecurityService, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout, $state, $ionicViewService) {
	
	var stream = ChatManager.selectStream($stateParams.streamId);
	if(stream === null){
		$ionicViewService.nextViewOptions({
			   disableBack: true
			});
		$state.go('tab.chats');
	}
	$scope.stream = stream;
	
	// Registers an interest in receiving push chat messages for this stream from the socket
	socket.emit('join_stream', $stateParams.streamId);
	ChatManager.socket = socket;
	
	$scope.handle = localStorage.handle || 'Anonymous';
	$scope.showTime = false;
	console.log($scope.showTime);

	function scrollBottom() {
		$ionicScrollDelegate.$getByHandle('chat').scrollBottom();
	}
	
	$scope.data = {};
	var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
	$scope.inputUp = function() {
		window.addEventListener('native.keyboardshow', function() {
			if (isIOS) {
				$scope.data.keyboardHeight = 216;
			}
			$timeout(function() {
				$ionicScrollDelegate.scrollBottom(true);
			}, 300);

		});
	};

	$scope.inputDown = function() {
		if (isIOS) {
			$scope.data.keyboardHeight = 0;
		}
		$ionicScrollDelegate.resize();
	};
	
	$scope.chats = ChatManager.fetchChatsForStream($stateParams.streamId);
	
	//$scope.chats.$watch(scrollBottom);

	$scope.add = function(message) {
		addChat(message);
		// pretty things up
		$scope.message = null;
	};
	
	function addChat(message, img) {
		console.log("Message to server " +message);
		var targetEmail = $scope.stream.tag1?$scope.stream.user2.email:$scope.stream.user1.email;
		console.log("Message targetEmail " +targetEmail);
		//socket.emit('send_message', message);
		var chatMessage = new ChatMessage();
		chatMessage.stream = $stateParams.streamId;
		chatMessage.target = targetEmail;
		chatMessage.message = message;
		chatMessage.$save(function (u, headers){
			console.log("ChatMessage: " + u);
		});
	}
	
	socket.on('chat', function (message) {
	    $scope.bar = true;
	    message = JSON.parse(message);
	    console.log("Message from socket " +message);
	    console.log(" message stream id " +message.stream.id);
	    if($scope.stream && $scope.stream.id === message.stream.id){
	    	console.log("Message from socket added to posts" +message);
	    	$scope.chats.push(message);
	    }
	});
	
	
	/*$scope.takePicture = function() {
		$ionicActionSheet.show({
			buttons: [{
				text: 'Picture'
			}, {
				text: 'Selfie'
			}, {
				text: 'Saved Photo'
			}],
			titleText: 'Take a...',
			cancelText: 'Cancel',
			buttonClicked: function(index) {
				ionic.Platform.isWebView() ? takeARealPicture(index) : takeAFakePicture();
				return true;
			}
		});

		function takeARealPicture(cameraIndex) {
			var options = {
					quality: 50,
					sourceType: cameraIndex === 2 ? 2 : 1,
							cameraDirection: cameraIndex,
							destinationType: Camera.DestinationType.DATA_URL,
							encodingType: Camera.EncodingType.JPEG,
							targetWidth: 500,
							targetHeight: 600,
							saveToPhotoAlbum: false
			};
			$cordovaCamera.getPicture(options).then(function(imageData) {
				var photo = 'data:image/jpeg;base64,' + imageData;
				addPost(null, photo);
			}, function(err) {
				// error
				console.error(err);
				takeAFakePicture();
			});
		}

		function takeAFakePicture() {
			addPost(null, $cordovaCamera.getPlaceholder());
		}
	};*/

	$scope.save = function(handle) {
		localStorage.handle = $scope.handle = handle;
		$scope.modal.hide();
	};

	/*$ionicModal.fromTemplateUrl('templates/account.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});*/

	$scope.openModal = function() {
		$scope.modal.show();
	};
})

.controller('PreferencesCtrl', function($scope, Preference, PreferenceUpdate) {
	$scope.init = function() {
		console.log("PreferencesCtrl init");
		var pref = Preference.query(function() {
			console.log("Found Preference");
			$scope.preference = pref;
		});
	}
	$scope.update = function(pref){
		console.log("PreferencesCtrl  " + pref.user.email);
		var pref_update = new PreferenceUpdate();
		pref_update.gender_pref = pref.gender_pref;
		pref_update.min_age = pref.min_age;
		pref_update.max_age = pref.max_age;
		pref_update.distance = pref.distance;
		pref_update.hidden = pref.hidden;
		pref_update.$save(function (u, headers){
			console.log("Preference updated: " + u);
			//$state.go('tab.chats');
		});
	}
	//$scope.settings = {
	//	enableFriends : true
	//};
});
