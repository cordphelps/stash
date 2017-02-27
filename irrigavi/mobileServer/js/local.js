/*
 * local.js
 *
 * Cord Phelps
 * Copyright 2015, MIT License
 * http://www.opensource.org/licenses/MIT
 *
 * Software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

function localVars() {

    this.ajaxTimeout = 5000;
    this.ajaxError = false;
    this.authServerURL = 'http://long-wave-89413.appspot.com/tokeninfo';

    this.debug = true;

    this.clientID = '701838661355-eb855c0l9vu3mh24fq0kih5f60euqap3.apps.googleusercontent.com';
    this.authResult = '';
    this.authError = '';

    this.instrument = '';
    this.domain = '';
    this.recordSep = '|';


    this.signedIn = false;
    this.email = '';
    this.user_id = '';
    this.network = 'unknown';
    this.token = '';
    this.tokenExpires = '';
    this.checkTokenURL = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';

    this.arrayOfRecords = [];

}


function connectUser() {   // if token exists: generate a new token
                           // if no token (due to browser logout), produce the google login screen

  console.log("\nvanilla login() (begin)\n");

  // hello('google').login()
  hello('google').login({display: "page", scope: "email", force: "true" }).then( 
    function(auth){
    	$('#loginBtn').text("hello('google').login(): have new token");
        console.log("connectUser(): hello('google').login(): have new token:\n" + JSON.stringify(auth));
        var currentTime = (new Date()).getTime() / 1000;
        var timeRemaining = (app.tokenExpires - currentTime ); 
        console.log("connectUser()" +
                    "\ntoken: " + app.token + 
                    "\nexpires: " + app.tokenExpires + 
                    "\ncurrentTime: " + currentTime + 
                    "\nremaining: " + timeRemaining + " seconds");
        app.signedIn = true;
    }, 
    function(e)   {
    	$('#loginBtn').text(" hello('google').login() get token error: " + e.error.message);
        console.log(" hello('google').login() get token error: " + e.error.message );
        app.signedIn = false;
        }
    );

  console.log("\nvanilla login() (end)\n\n");


}

function disconnectUser() {

  var sess = sessionActive();
  // full logout not supported
  hello('google').logout({force:false}).then( function(){
    showLocalStorage();
    console.log("hello().logout(), sessionActive: " + sess);
    app.token = "";
    $('#loginBtn').text("hello.on('auth.login'): get token");
    $('#tokenBtn').text('no token: (check current token again)');
    $('#disconnectBtn').text("hello().logout(): (disconnect again?)");
    }, function(e){
          console.log( "hello().logout() error: " + e.error.message + " sessionActive: " + sess );
          $('#disconnectBtn').text("error, hello().logout(): (disconnect again?)");
  });

}

function clearLocalStorage() {

	if (localStorage.hello) {
		localStorage.removeItem('hello');
		$('#holdingTank').text('cleared localStorage for key = ' + 'hello');
		console.log('cleared localStorage for key = ' + 'hello');
		app.token = "";
		$('#loginBtn').text("hello.on('auth.login'): get token");
  	$('#tokenBtn').text('no token: (check current token again)');
	}
	else {
		$('#holdingTank').text('localStorage for key "hello" not found');
	}


}

function showLocalStorage() {

	if (localStorage.hello) {
		//var token = localStorage.getItem('hello');
		var token = localStorage.hello;
		$('#holdingTank').text('localStorage for key ' + 'hello' + ':\n' + token);
	}
	else {
		$('#holdingTank').text('localStorage for key "hello" not found');
	}


}

function checkToken(token) {
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken

  if (token == '') {
  	// clearLocalStorage() clears app.token
  	console.log("checkToken(): nothing to check")
  	$('#loginBtn').text("hello.on('auth.login'): get token");
  	$('#tokenBtn').text('no token: (check current token again)');
  	return
  }

  app.ajaxError = false;

  $('#tokenBtn').text('check current token ( working... )');

  $.ajax({
        url: app.checkTokenURL + token,
        dataType: 'json',    // the format of the response
        cache: false,
        contentType: false,  
        processData: true,    // do convert outgoing data to a string
        timeout: app.ajaxTimeout,                        
        type: 'get',
        complete : function(){
          // 
          },
        error : function(x, textStatus, errorThrown){
          app.ajaxError = true;
          // handle https errors coming from the server (for example, 403)
          // firefox: 'expired token' gets 'NetworkError: 400 Bad Request' 
          // chrome: 'expired token' gets "responseJSON":{"error":"invalid_token","error_description":"Invalid Value"},"status":400,"statusText":"OK"}
          // timeout gets textStatus = 'timeout' and errorThrown = 'timeout'
          console.log ("checkToken() x: " + JSON.stringify(x) + "\nerror: " + textStatus + " " + errorThrown + " " + x.status);

          if (errorThrown == 'timeout') {
          	$('#tokenBtn').text('token timeout: (check current token again)');
          }
          else if (x.status == '400') {
          	$('#tokenBtn').text('token expired: (check current token again)');
          }
          else {
          	$('#tokenBtn').text('token unknown error: (check current token again)');
          }

        },
        success: function(response) {
        	app.ajaxError = false;
        	// google sez its a token, but is it our token?
          	console.log("checkToken() result:\n" + JSON.stringify(response));

          app.user_id = response.user_id;
          app.domain = 'avo1';

        	// check the audience 
        	if (response.audience == app.clientID) {
        		var expires_in = response.expires_in / 60;
          		var fixed = expires_in.toFixed(2);
          		$('#tokenBtn').text('token expiring in: ' + fixed + ' minutes, (check current token again)');
          		console.log("\ncheckToken() token clientID match, calculated expiration\n");
        	}
        	else {
        		// "I'm telling you baby, that's not  mine." - Austin "Danger" Powers
        		$('#tokenBtn').text('foreign token found, get new token');
        		console.log("\ncheckToken() foreign token found for clientID: " + response.audience + "\n");
        	}

        }
      });
}

function checkCurrentToken() {

  $('activeTokenBox').text(app.token);

  checkToken(app.token);

}

function sessionActive() {
  // http://adodson.com/hello.js/#helloapi
  var gl = hello( "google" ).getAuthResponse();
  var current_time = (new Date()).getTime() / 1000;
  return gl && gl.access_token && gl.expires > current_time;
}


function initHelloJS () {

	hello.on('auth.login', function(auth){

		console.log("\nauth.login event callback (begin)\n");

  		// this seems to be triggered BOTH by hello('google').login({scope: "email" }).then(
  		// AND by the discovery, on startup, of a previously existing token (valid or invalid)  <--- 'autologin' (see below)
  		//
  		// 

  	if (typeof auth != 'undefined') {

    	$('#loginBtn').text("hello.on('auth.login'): found token");
    	console.log("\nauth.login event callback, found token:\n" + JSON.stringify(auth) + "\n");

      console.log("\nauthResponse:\n" + JSON.stringify(auth.authResponse) + "\n");

      var authResponse = JSON.stringify(auth.authResponse);
      var authResponseObj = JSON.parse(authResponse);

      console.log("\nauthResponse:\n" + authResponse + "\n");
      console.log("\n.token:\n" + authResponseObj.access_token + "\n");

    	app.network = auth.network;

    	showLocalStorage();

    	app.token = authResponseObj.access_token;
    	app.tokenExpires = authResponseObj.expires;

      $('#activeTokenBox').text(app.token);

    	checkToken(app.token);

  	}

  	else {
    	$('#loginBtn').text("hello.on('auth.login'): no token");
    	console.log("auth.login event callback, no token:\n" + JSON.stringify(auth));
  	}

  	console.log("\nauth.login event callback (end)\n");
  
	});


	hello.init(

		// "Autologin is triggered when client_ids are assigned to the services.""
		// https://github.com/MrSwitch/hello.js/issues/124

  		{ google   : app.clientID },
  		{ redirect_uri:'hello.html' }

	);

}

function saveData() {
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken

  app.ajaxError = false;

  var jsonContent = ' {"op": "save", "user": " ' + app.user_id + ' ","domain": " ' + app.domain + ' ","instrument": "inst", "probes": "hotshot" } ' ;

  //  record separator on the server side is | ; prevent this character from being sent
  jsonContent = jsonContent.replace(/\|$/, "");

  $('#saveDataBtn').text('send token ( working... )');

  $.ajax({
        url: app.authServerURL + "?token=" + app.token + "&op=" + jsonContent,
        dataType: 'json',    // the format of the response
        cache: false,
        contentType: false,  
        processData: true,    // do convert outgoing data to a string
        timeout: app.ajaxTimeout,                        
        type: 'get',
        complete : function(){
          // 
          },
        error : function(x, textStatus, errorThrown){
          app.ajaxError = true;
          // handle https errors coming from the server (for example, 403)
          // firefox: 'expired token' gets 'NetworkError: 400 Bad Request' 
          // chrome: 'expired token' gets "responseJSON":{"error":"invalid_token","error_description":"Invalid Value"},"status":400,"statusText":"OK"}
          // timeout gets textStatus = 'timeout' and errorThrown = 'timeout'

          $('#saveDataBtn').text('save data ( error )');
          console.log ("sendToken() x: " + JSON.stringify(x) + "\nerror: " + textStatus + " " + errorThrown + " " + x.status);

          if (errorThrown == 'timeout') {
            $('#saveDataBtn').text('token timeout: (check current token again)');
          }
          else if (x.status == '400') {
            $('#saveDataBtn').text('400');
          }
          else if (x.status == '501') {
            $('#saveDataBtn').text('501');
          }
          else {
            $('#saveDataBtn').text('save data unknown error: (check current token again)');
          }

        },
        success: function(response) {
          app.ajaxError = false;

          $('#holdingTank').text("");
          $('#responseBox').text("");
          $('#parseDataBox').text("");

          $('#saveDataBtn').text('save data');
          $('#requestDataBtn').text('request data');
          $('#deleteDataBtn').text('delete data');

          $('#saveDataBtn').text('save data ( success )');
          console.log("saveData() result:\n" + JSON.stringify(response));
          $('#responseBox').text(JSON.stringify(response));
          // check the audience 
          if (response.audience == app.clientID) {

          }
          else {

          }

        }
      });
}

function requestData() {
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken

  app.ajaxError = false;

  var jsonContent = ' {"op": "report", "user": " ' + app.user_id + ' ","domain": " ' + app.domain + ' ","instrument": "inst","time": "time" } ' ;

  $('#requestDataBtn').text('request data ( working... )');
  $('#responseBox').text("");

  $.ajax({
        url: app.authServerURL + "?token=" + app.token + "&op=" + jsonContent,
        dataType: 'text',   // no pre-processing occurs. The data is simply passed on to the success handler, 
                            // and made available through the responseText property of the jqXHR object
                            // the Content-Type header of the response will be disregarded.
        cache: false,
        contentType: false,  
        processData: true,    // do convert outgoing data to a string
        timeout: app.ajaxTimeout,                        
        type: 'get',
        complete : function(){
          // 
          },
        error : function(x, textStatus, errorThrown){
          app.ajaxError = true;
          // handle https errors coming from the server (for example, 403)
          // firefox: 'expired token' gets 'NetworkError: 400 Bad Request' 
          // chrome: 'expired token' gets "responseJSON":{"error":"invalid_token","error_description":"Invalid Value"},"status":400,"statusText":"OK"}
          // timeout gets textStatus = 'timeout' and errorThrown = 'timeout'

          $('#requestDataBtn').text('request data ( error )');
          console.log ("requestData() x: " + JSON.stringify(x) + "\nerror: " + textStatus + " " + errorThrown + " " + x.status);

          if (errorThrown == 'timeout') {
            $('#requestDataBtn').text('token timeout: (check current token again)');
          }
          else if (x.status == '400') {
            $('#requestDataBtn').text('400');
          }
          else if (x.status == '501') {
            $('#requestDataBtn').text('501');
          }
          else {
            $('#requestDataBtn').text('request data unknown error: (check current token again)');
          }

        },
        success: function(response, textStatus, jqXhrObj) {

          app.ajaxError = false;

          $('#holdingTank').text("");
          $('#responseBox').text("");
          $('#parseDataBox').text("");

          $('#saveDataBtn').text('save data');
          $('#requestDataBtn').text('request data');
          $('#deleteDataBtn').text('delete data');


          $('#requestDataBtn').text('success: request textStatus: ' + textStatus);

          $('#holdingTank').text(JSON.stringify(jqXhrObj));

          if (response.length > 0) {

            $("#responseBox").text("");

            app.arrayOfRecords = parseData(response);

            var newObj = $.parseJSON(app.arrayOfRecords[0]);
            alert("app.arrayOfRecords: " + newObj.user);

          }
          
          // check the audience 
          if (response.audience == app.clientID) {

          }
          else {

          }

        }
      });
}

function parseData(content) {

  // GET escape sequence is inserting a lot of '\'; strip them out
  var clean = content.replace(/[\\]/g, "");
  // chop off any leading space
  clean = clean.replace(/^[\s]/, "");
  // chop off any trailing record separator
  clean = clean.replace(/\|$/, "");

  // TODO: strip out control chars (tab/newline) 
  //       ensure curly brackets at beginning and end
  // http://api.jquery.com/jquery.parsejson/

  // split into array based on record separator 
  recArray = clean.split("|");

  var outputString = $("#parseDataBox").val();

  for (var i=0; i < recArray.length; i++) {
    //alert("parsing:\n" + recArray[i]);
    var newObj = $.parseJSON(recArray[i]);

    // alert(newObj.user);

    outputString = outputString + JSON.stringify(newObj) + "\n\n";
  }

  $("#parseDataBox").text(outputString);

  return recArray

}

function deleteData() {
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken

  app.ajaxError = false;

  ///
  ///
  ////  record separator on the server side is |
  ///
  //    need to strp this from jsonContent
  //
  //

 var jsonContent = ' {"op": "delete", "user": " ' + app.user_id + ' ","domain": " ' + app.domain + ' ","instrument": "inst", "probes": "hotshot" } ' ;

  $('#deleteDataBtn').text('delete token ( working... )');

  $.ajax({
        url: app.authServerURL + "?token=" + app.token + "&op=" + jsonContent,
        dataType: 'json',    // the format of the response
        cache: false,
        contentType: false,  
        processData: true,    // do convert outgoing data to a string
        timeout: app.ajaxTimeout,                        
        type: 'get',
        complete : function(){
          // 
          },
        error : function(x, textStatus, errorThrown){
          app.ajaxError = true;
          // handle https errors coming from the server (for example, 403)
          // firefox: 'expired token' gets 'NetworkError: 400 Bad Request' 
          // chrome: 'expired token' gets "responseJSON":{"error":"invalid_token","error_description":"Invalid Value"},"status":400,"statusText":"OK"}
          // timeout gets textStatus = 'timeout' and errorThrown = 'timeout'

          $('#deleteDataBtn').text('delete ( error )');
          console.log ("sendToken() x: " + JSON.stringify(x) + "\nerror: " + textStatus + " " + errorThrown + " " + x.status);

          if (errorThrown == 'timeout') {
            $('#deleteDataBtn').text('token timeout: (check current token again)');
          }
          else if (x.status == '400') {
            $('#deleteDataBtn').text('400');
          }
          else if (x.status == '501') {
            $('#deleteDataBtn').text('501');
          }
          else {
            $('#deleteDataBtn').text('delete unknown error: (check current token again)');
          }

        },
        success: function(response) {
          app.ajaxError = false;

          $('#holdingTank').text("");
          $('#responseBox').text("");
          $('#parseDataBox').text("");

          $('#saveDataBtn').text('save data');
          $('#requestDataBtn').text('request data');
          $('#deleteDataBtn').text('delete data');

          $('#deleteDataBtn').text('delete ( success )');
          console.log("deleteDataBtn() result:\n" + JSON.stringify(response));
          $('#responseBox').text(JSON.stringify(response));
          // check the audience 
          if (response.audience == app.clientID) {

          }
          else {

          }

        }
      });
}

