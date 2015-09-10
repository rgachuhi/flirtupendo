angular.module('pendo.security', ['ngResource', 'ngRoute'])
//api-token-auth
    .factory('LoginResource', ['$rootScope','$resource','CONFIG', function($rootScope, $resource, CONFIG) {
        return function(newUser) {
            return $resource(CONFIG.serverUrl +":" + CONFIG.serverPort + '/:dest/:token', {}, {
            //login: {method: 'POST', params: {dest:"auth", token:"token"}, headers:{"Authorization": "JWT " + btoa(newUser.userId + ":" + newUser.password)} },
            login: {
            	method: 'POST', params: {dest:"auth", token:"token"},
            	//data: {client_id:"odJ9ud4ltFf6DLRaykjCykrQoHOyCs0SaaTEc752", 
                	//client_secret:"uCSlMqMompBEaJEKLZJJDifTmgv4iCUTBXjZTwzc8lTmRMoLZgHvcVh1ir0yJoMMJTKwIPrR1hjy1qNX92OZBUs0BW6QWhuYzDfXhhxpmIskOJonrUtVUEOikd3UjUqu",
                //		grant_type:"password",
                //		username:newUser.userId,
                //		password:newUser.password
                //		},
            	headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            	transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                }
            }
            	//,
            	//headers:{"Authorization": "JWT " + btoa(newUser.userId + ":" + newUser.password)} 
        });
    }}])
    .factory('LogoutResource', ['$resource', function($resource) {
        return $resource('rest/private/:dest', {}, {
            logout: {method: 'POST', params: {dest:"logout"}}
        });
    }])
    .factory('RegistrationResource', ['$resource', function($resource) {
        return $resource('rest/register/:dest', {}, {
            activation: {method: 'POST', params: {dest:"activation"}}
        });
    }])
    .factory('SecurityService', ['$rootScope', function($rootScope) {

        var SecurityService = function() {
            //var userName, password;

            this.initSession = function(response) {
                console.log("[INFO] Initializing user session.");
                console.log("[INFO] Token is :" + response.access_token);
                console.log("[INFO] Token Stored in session storage.");
                // persist token, user id to the storage
                sessionStorage.setItem('token', response.access_token);
            };

            this.endSession = function() {
                console.log("[INFO] Ending User Session.");
                sessionStorage.removeItem('token');
                console.log("[INFO] Token removed from session storage.");
            };

            this.getToken = function() {
                return sessionStorage.getItem('token');
            };
            
            this.isLoggedIn = function(){
            	 var token = this.getToken();
            	 return token != null && token != '' && token != 'undefined';
            };
            
            this.setUserEmail = function(email) {
            	sessionStorage.setItem('user_email', email);
            }
            
            this.getUserEmail = function() {
            	return sessionStorage.getItem('user_email');
            }

            this.secureRequest = function(requestConfig) {
                var token = this.getToken();

                if(token != null && token != '' && token != 'undefined') {
                    console.log("[INFO] Securing request.");
                    console.log("[INFO] Setting x-session-token header: " + token);
                    requestConfig.headers['Authorization'] = 'Bearer ' + token;
                }
            };
        };

        return new SecurityService();
    }]).factory(
            "transformRequestAsFormPost",
            function() {
                // I prepare the request data for the form post.
                function transformRequest( data, getHeaders ) {
                	console.log("transformRequest");
                    var headers = getHeaders();
                    headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
                    return( serializeData( data ) );
                }
                // Return the factory value.
                return( transformRequest );
                // ---
                // PRVIATE METHODS.
                // ---
                // I serialize the given Object into a key-value pair string. This
                // method expects an object and will default to the toString() method.
                // --
                // NOTE: This is an atered version of the jQuery.param() method which
                // will serialize a data collection for Form posting.
                // --
                // https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
                function serializeData( data ) {
                	console.log(data);
                    // If this is not an object, defer to native stringification.
                    if ( ! angular.isObject( data ) ) {
                        return( ( data == null ) ? "" : data.toString() );
                    }
                    var buffer = [];
                    // Serialize each key in the object.
                    for ( var name in data ) {
                    	console.log(data[ name ]);
                        if ( ! data.hasOwnProperty( name ) ) {
                            continue;
                        }
                        var value = data[ name ];
                        buffer.push(
                            encodeURIComponent( name ) +
                            "=" +
                            encodeURIComponent( ( value == null ) ? "" : value )
                        );
                    }
                    // Serialize the buffer and clean it up for transportation.
                    var source = buffer
                        .join( "&" )
                        .replace( /%20/g, "+" )
                    ;
                    return( source );
                }
            }
        );

//// controllers definition
//function LoginCtrl($scope, LoginResource, SecurityService, $location, $rootScope) {
//    $scope.newUser = {};
//
//    $scope.login = function() {
//        if ($scope.newUser.userId != undefined && $scope.newUser.password != undefined) {
//            LoginResource($scope.newUser).login($scope.newUser,
//                function (data) {
//                    SecurityService.initSession(data);
//                    $location.path( "/home" );
//                }
//            );
//        }
//    };
//
//    $scope.redirectoToSignUp = function() {
//        $location.path( "/signup" );
//    };
//
//}
//
//function SignupCtrl($scope, $http, RegistrationResource, $q, $location, $timeout) {
//    $scope.register = function() {
//        if($scope.newUser.password !== $scope.newUser.passwordConfirmation) {
//            $scope.errors = {passwordConfirmation : "Password Mismatch !!!"};
//            return;
//        }
//
//        RegistrationResource.save($scope.newUser, function(data) {
//            $location.path("/successfulRegistration");
//        });
//    };
//}


//angular.module("SignatureUtil", [])
//    .service("SignatureUtil", function() {
//        var jws = function() {
//            var hmacKey = "hmackey";
//
//            this.generateSignature = function(joeStr, hs256) {
//
//                var token = new jwt.WebToken(joeStr, hs256);
//                var signed = token.serialize(hmacKey)
//                var split = signed.split("\.")
//
//                return split;
//            };
//
//            this.verifySignature = function(signature) {
//                var token = jwt.WebTokenParser.parse(signature);
//                return token.verify(hmacKey);
//            };
//
//            this.getClaims = function(jwsEncoded) {
//                console.log("claims:" + jwsEncoded.split(".")[1]);
//                var claims = atob(jwsEncoded.split(".")[1]);
//                console.log(claims);
//                return claims;
//            };
//        }
//
//        return {
//            getInstance: function () {
//                return new jws();
//            }
//        };
//    });