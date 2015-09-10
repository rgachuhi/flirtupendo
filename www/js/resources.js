angular.module('pendo.resources', ['ngResource', 'ngRoute'])
.factory('Preference', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/prefs/get', {}, {
        query: { method: "GET", isArray: false }
    });
}])
.factory('PreferenceUpdate', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/prefs/update', {});
}])
.factory('ProspectsResource', ['$resource', 'CONFIG', function($resource, CONFIG) {
    return function(url) {
        return $resource(url, {}, {
            query: { method: "GET", isArray: false }
        });
}}])
.factory('MatchList', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/matches/list', {}, {
        query: { method: "GET", isArray: true }
    });
}])
.factory('MatchMake', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/matches/make', {});
}])
.factory('ChatStreamMake', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/chats/stream_create', {});
}])
.factory('ChatStreamsResource', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/chats/streams_all', {}, {
        query: { method: "GET", isArray: true }
    });
}])
.factory('ChatListResource', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return function(streamId) {
		return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/chats/list/:stream_id', {}, {
	        //query: { method: "GET", isArray: true }
			list: {method: 'GET', isArray: true, params: {stream_id:streamId}}
	    });
	}
}])
.factory('ChatMessage', ['$resource', 'CONFIG', function($resource, CONFIG) {
	return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort+ '/chat/chat_create', {});
}])
.factory('socket', function (socketFactory) {
	  return socketFactory({
	    prefix: '',
	    ioSocket: io.connect('http://127.0.0.1:4000')
	  });
	
});
