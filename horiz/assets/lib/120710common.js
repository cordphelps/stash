
/*
 *  horiz
 *  Copyright 2012, Cord Phelps
 *
 *
*/
// global variable to track "ready" /
// // 
var isPhoneGapReady = false;
var isDomInitialized = false;
var consoleString = "";
var isConnected = false;
var isHighSpeed = false;
var internetInterval;
var currentURL;
var deviceUUID;

var isAndroid = false;
var isBlackberry = false;
var isIphone = false;
var isWindows = false;

var loaded = false;
var showDebug = false;
var photoTaken = false;
var photosVisible = true;
var prevX = 1.0;

// accelerometer
var watchID = null;

var map;
    // for a DEMO, hardcode the center to gaviota
    // gaviota  lon -120.282051, lat 34.477601 
    // stanford lon -122.165, lat 37.423 
    //
    var mapOptions = {
           // center: new google.maps.LatLng(34.477601, -120.282051),
           //center: new google.maps.LatLng(position.coords.latitude,
           //                  position.coords.longitude),
           mapTypeId: google.maps.MapTypeId.ROADMAP,
           zoom: 13   // larger numbers zoom in
    };
var randomMarker = false;
var coord_array = [];
var iterator = 0;

var jeOptions = {
    aeURL: "http://snaptestsnap.appspot.com/_je/",
    tableName: "messages",
    messageBodyField: "messageBody_",
    recordNumber: "LvjdVebVYZL7GCJ1CCIftqEcINJZh326"
};

var gaeOptions = {
    uploadService: "http://muvmuvvum.appspot.com",
    // is the app-engine uploader working yet?
    serviceReady: false
};

var putOptions = {
    aeURL: "http://snaptestsnap.appspot.com/_je/",
    tableName: "messages",
    messageBodyField: "messageBody_"
};


var snap = {
    lng: "",
    lat: "", 
    geohash: "",
    zipcode: "",
    owner: "",
    timestamp: "",
    active: true,
    image: "",
    type: 'image/png', 
    text: "",
    URI: "",
    fileName: "",
    gaeLocator: "",
    gaeUpload: false
};


var gallery,
    el,
    i,
    page;

    /*
    dots = document.querySelectorAll('#nav li'),
    */

var slides = [];

var  landscapes = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRiSTgw",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRjKZQw",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRixbQw",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRiRTgw"
        ];

var wires = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRi5lAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRihnAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRiJpAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRihnAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjxqwEM"
    ];

var farmville = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjZswEM"
    ];


//  capture a few terms and begin documetations / issues list
//  - using the "single page (ajax) navigation model" (vs the multipage model)
//  - need to figure out when to turn off/on geolocation watchID
//  - "blinking" 
//    http://stackoverflow.com/questions/5953753/flickering-when-navigating-between-pages/8939296#8939296
//
//  search phonegap google group: "splash screen", "orientation"; "camera image 
//  background"; 
//  - photo upload process needs to verify that we are 'online'
//  - need to handle online/offline events more completely v-s-v the listeners
//

function my_init() {

    var j = 0;

    if (isPhoneGapReady) {
        	onDeviceReady();
    }
    else {
	// add event listener for device ready
	document.addEventListener('deviceready', onDeviceReady, false);
	// alert("added listener: href: ", location.href);
    }


}


function onDeviceReady() {

    // alert("onDeviceReady");

    // document.getElementById('deviceProperties');
    isPhoneGapReady = true;
    deviceUUID = device.uuid;
    /* alert(deviceUUID); */
    deviceDetection();
    networkDetection();
    domSetup();            // setup map + markers; init the slides array
    configureEvents();
    // bindPhotoButtons();
    // watchForShake(1.5); // '0.5' seems 'too soft'

    // and wait for events....


}

function domSetup() {

    if (!isDomInitialized) {
	// alert("getCurrentPosition");

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	navigator.geolocation.getCurrentPosition(function(position){

                            snap.lat = position.coords.latitude;
                            snap.lng = position.coords.longitude;
                            // alert("lat/lng: " + snap.lat + " " + snap.lng);
                            // latlng is a class, see
                            // http://gwt-google-apis.googlecode.com/svn/javadoc/maps/1.0
                            // /com/google/gwt/maps/client/geom/LatLng.html

                            var center = new google.maps.LatLng(position.coords.latitude,
                                                                position.coords.longitude);

                            mapOptions.center = center;

                            map.setCenter(center);

                            }, function(error) {

                                alert('geo error code: ' + error.code + '\n' + 
                                        'message: ' + error.message + '\n');

                            }, 

					           {timeout : 10000,
					           enableHighAccuracy : true,
					           maximumAge : 3000
					           }

                          );

    // load the slides array with initial slides
    for (j = 0; j < landscapes.length; j++) { 

        slides[j] = new Object();
        slides[j].img = landscapes[j];

        slides[j].marker = new google.maps.Marker({
                                position: mapOptions.center,
                                map: map,
                                animation: google.maps.Animation.DROP,
                                draggable: false,
                                title: "you"
                            });
        }


    // init the SlideView gallery
    gallery = new SwipeView('#wrapper', { numberOfPages: slides.length });
    // present the slides via SlideView
    setupSlides();

	// var imgObj = document.getElementById("farmville");
    //var newElement;
    //newElement = document.createElement('img');
    // newElement.src = farmville[0];
    // document.getElementById("farmville").appendChild(newElement);
    document.getElementById("farmville").src = farmville[0];
    document.getElementById("farmville").title = "hoser";

    // alert("domSetup: " + imgObj.src)

	isDomInitialized = true;

    }

    else {
	// alert("avoided re-load map; domSetup: true");
    }
}



function configureEvents() {
    if (isPhoneGapReady) {
	document.addEventListener('pause', onPause, false);
	document.addEventListener('resume', onResume, false);
	document.addEventListener('online', onOnline, false);
	document.addEventListener('offline', onOffline, false);
	document.addEventListener('batterylow', onBatterylow, false);
    document.addEventListener("onorientationchange", updateOrientation);

    // yeah SlideView()
    // http://cubiq.org/dropbox/SwipeView/demo/gallery/ 
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	// set timer to monitor the network
	internetInterval = window.setInterval(function() {
		if (navigator.network.connection.type != Connection.NONE) {
		    networkDetection();
		}
		else {
		    onOffline();
		}
	    }, 5000);
	
    /*
	$('#page1').bind('taphold', function(){
		if (photosVisible) {
		      $('#wrapper').hide();
              $('#mapCanvas').hide();
		      photosVisible = false;
		}
		else {
		        $('#wrapper').show();
                $('#mapCanvas').show();
		        photosVisible = true;
		}
	    });
*/

        /*

	$('#page3').bind('swipeleft', function(){
		$.mobile.changePage('#page1', 'slide'); });
	$('#page3').bind('swiperight', function(){
		$.mobile.changePage('#page1', 'slide'); });
	$('#page3').bind('taphold', function(){
		$.mobile.changePage('#page4', 'flip'); });
	*/


	//
	$('#page4').bind('swipeleft', function() {
                                      
		                              $.mobile.changePage('#page1', 'slide'); 
                                    });

	$('#page4').bind('swiperight', function() {
                                        
                                        $.mobile.changePage('#page1', 'slide');
                                    });

    }


    $('#moveCameraButton').bind('click', function(){
                            handlePhotoV2();
                            });

    /*

    $('#zipButton').bind('click', function(){
            
            // getGeohash();
        alert("geohash disabled");
        });

*/


     // alert("events finished");
}

function updateOrientation(e) {
    // http://leethams.wordpress.com/2010/11/23/working-with-orientation-on-the-ipad-in-phonegap/

    var orientation = "portrait";

    if (window.orientation == -90 || window.orientation == 90) {
	orientation = "landscape";
    }

    alert("orientation: " + orientation);
    // document.getElementById("page1").innerHTML+=orientation+"<br>";
}

function setHeight() {
    // http://www.sharepointjohn.com/using-simple-
    //             jquery-to-set-the-height-of-a-div-to-the-page-height/
    $("#page1").height($(document).height());
}


function deviceDetection() {
    if (isPhoneGapReady) {
	switch (device.platform) {
	case "Android":
	    isAndroid = true;
	    break;
	case "Blackberry":
	    isBlackberry = true;
	    break;
	case "iPhone":
	    isIphone = true;
	    break;
	case "WinCE":
	    isWindows = true;
	    break;
	}
    }
}

function networkDetection() {
    if (isPhoneGapReady) {

	if (navigator.network.connection.type != Connection.NONE) {
	    isConnected = true;
	}

	    // high speed? 20 recipes, pg 10
	    switch (navigator.network.connection.type) {
	    case Connection.UNKNOWN:
	    case Connection.CELL_2G:
		isHighSpeed = false;
		break;

	    default:
		isHighSpeed = true;
		// alert('network is high speed');
		break;
      
	    }
    }
}



function onPause(){
    isPhoneGapReady = false;
    // clear check interval (20 recipes, pg 19)
    window.clearInterval(internetInterval);
    // cannot do this: alert('that was pause');

}


function onResume(){
    // iOS Quirk per phonegap documentation
    // to keep the app from hanging
    setTimeout(function() { 
        if (isPhoneGapReady == false) {
	       my_init();
        }
        alert("that was a resume");
    }, 0);
}

function onOnline(){
    networkDetection();
}

function onOffline(){
    alert('that was offline');
}

function onBatterylow(){
    alert("battery low");
}



function handlePhotoV2() {

    showDebug = false;

    var photoOptions = {
        quality: 50,
	       // encodingType: Camera.EncodingType.PNG,
        destinationType: navigator.camera.DestinationType.FILE_URI,
	    sourceType : Camera.PictureSourceType.CAMERA,
       // sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
        // allowEdit: false,
	// these control the image file size:                                                     
        // 150x150 gets 40K bytes; 300x300 gets 180K bytes                                        
	    targetWidth: 300,
        targetHeight: 300
    };

    navigator.camera.getPicture(uploadPhoto, onPhotoFail, photoOptions);

}

function uploadPhoto(imageURI) {
    // http://docs.phonegap.com/en/1.0.0/phonegap_file_file.md.html#FileTransfer

    // http://www.json.org/js.html
    var jsonObj = { "records" : [
                        { "recNum" : "1", "content" : "stuff1"},
                        { "recNum" : "2", "content" : "stuff2"},
                        { "recNum" : "3", "content" : "stuff3"} 
                        ]
                    };
    var jsonText = JSON.stringify(jsonObj);

    $.getJSON("http://uploaderred.appspot.com/upload-url", function (uploadURL) {
        // alert ("uploadURL: " + uploadURL);

        var options = new FileUploadOptions();
        options.fileKey="file";  // name of the form element, default="file"
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1); // fileName for the server
        options.mimeType="image/png"; 

        var params = new Object();
        params.description = "orange";
        params.tags = "t-stuff";

        options.params = params; // optional key/value pairs (object)

        var ft = new FileTransfer();
        ft.upload(imageURI, uploadURL, win, fail, options);
    });
}

function win(r) {
    // alert("code:" + r.responseCode + " bytes: " + r.bytesSent); 
    // alert("Response = " + r.response);
    var g = getGeoCell();
    // alert("got geoCell: " + g ); 
    getRecords("orange");
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
}

    
function onPhotoFail() {
    alert('photoFail()');
    photoTaken = false;
}

function getRecords(description) {

    var searchDesc = "/?description%5B%5D=" + description;
    var getURL = "http://uploaderred.appspot.com" + searchDesc;

    // alert("getURL: " + getURL);

    var result;

    $.get(getURL)
                .done(function (result) {
                    var myJSONtext;

                    // take out all the safe chars %5D
                    myJSONtext = JSON.stringify(result);
                    // now we have {"pictures":[{"updated":{"timestamp":"xxxxxx"} , "description": xxxx
                    // alert("result: " + myJSONtext);

                    // make the string back into an object that can be indexed
                    var myJSONobject = JSON.parse(myJSONtext);

                    // just checking....
                    // alert("pictures?: " + JSON.stringify(myJSONobject.pictures[0]));

                    // http://www.json.org/js.html

                    // clear the slides array: remove current pictures and markers
                    clearSlides();

                    
                    $.each(myJSONobject.pictures, function (JSONrecordNumber, JSONrecordContents) {

                        // this index starts at '0'
                        // alert("each records: " + JSONrecordNumber);

                        slides[ JSONrecordNumber ] = new Object();
                        slides[ JSONrecordNumber ].img = myJSONobject.pictures[JSONrecordNumber].url;

                    });

                    // we jump in here after successfully taking a picture
                    // (so at least one picture is downloaded). to be functional, SwipeView wants 
                    // at least 3 slides -  so add some placeholders if necessary
                    if (slides.length == 2 ) {
                        // need 1 dummy slide
                        slides[2] = new Object();
                        slides[2].img = wires[1];
                    }
                    else if (slides.length == 1 ) {
                        // need 2 dummy slides
                        slides[1] = new Object();
                        slides[1].img = wires[0];
                        slides[2] = new Object();
                        slides[2].img = wires[1];
                    }

                    // temporarily, define some lat/lng pair of each slide
                    for (var j = 0 ; j < slides.length ; j++) {
                        slides[j].lat = snap.lat - ( (j) / 500 );
                        slides[j].lng = snap.lng - ( (j) / 500 );
                        // alert("len: " + slides.length + " j: " + j + "\n" + slides[j].lat + "\n" + slides[j].lng);

                        slides[j].latlng = new google.maps.LatLng(slides[j].lat, slides[j].lng);
    
                        slides[j].marker = new google.maps.Marker({
                                            position: slides[j].latlng,
                                            map: map,
                                            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                            // animation: google.maps.Animation.BOUNCE,
                                            animation: google.maps.Animation.DROP,
                                            draggable: false
                                    });
                    }


                    setupSlides();
                });
}



function setMarkerAnimation(visiblePage) {
    // https://developers.google.com/maps/documentation/javascript/overlays#MarkerAnimations

    alert("visiblePage: " + visiblePage 
    + "\n" + "currentMasterPage: " + gallery.currentMasterPage 
    + "\n" + "page: " + gallery.page);

    var j;

    for (j = 0; j < slides.length; j++) {
    
	   // slides[j].marker.setAnimation(null);
       slides[j].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    }

	// slides[visiblePage].marker.setAnimation(google.maps.Animation.BOUNCE);
    slides[visiblePage].marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
}


function clearSlides() {

    var j = 0;
    
    for (j = 0; j < slides.length; j++) {
        // remove current images (what about the listeners? )
        $(gallery.masterPages[j]).empty();

        // remove the markers from the map
        slides[j].marker.setMap(null);
    }

    // clear the array
    slides.splice(0, slides.length);

}


function setupSlides() {

    var j;
    var i;
    var el;
    page = 0;
    
    // gallery sanity check
    gallery.updatePageCount(slides.length);

    // Load initial data
    for (i=0; i<3; i++) {

        page = i==0 ? slides.length-1 : i-1;
        el = document.createElement('img');
        el.className = 'loading';
        el.src = slides[page].img;
        el.id = page.toString();
        el.width = 300;
        el.height = 300;
        // el.width = slides[page].width;
        // el.height = slides[page].height;
        el.title = page.toString();
        el.onload = function () { this.className = ''; };
        // el.bind('tap', function(){ setMarkerAnimation(gallery.currentMasterPage); });
        // el.onclick = function () { alert("clicked"); };     //  <-- mystery: does not work 
                                                            // in the browser, works in iOS
        // el.onclick = function () { setMarkerAnimation(gallery.currentMasterPage); };
        
        gallery.masterPages[i].appendChild(el);

        /*
        el = document.createElement('span');
        el.innerHTML = slides[page].desc;
        gallery.masterPages[i].appendChild(el);
        */
    }

    // for *all* elements of type img
    // (but its the shotgun approach and possibly overbinds the elemetns)
    $('img').bind('tap', function(){ setMarkerAnimation(gallery.currentMasterPage); });

    gallery.onFlip(function () {
    var el,
        upcoming,
        i;

    for (i=0; i<3; i++) {
        upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;

        if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
            el = gallery.masterPages[i].querySelector('img');
            el.className = 'loading';
            el.src = slides[upcoming].img;
            el.width = 300;
            el.height = 300;
            /*
            el.width = slides[upcoming].width;
            el.height = slides[upcoming].height;
            el = gallery.masterPages[i].querySelector('span');
            el.innerHTML = slides[upcoming].desc;
            */
        }
    }
    
    // document.querySelector('#nav .selected').className = '';
    // dots[gallery.pageIndex+1].className = 'selected';
    });

    gallery.onMoveOut(function () {
        gallery.masterPages[gallery.currentMasterPage].className = gallery.masterPages[gallery.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');
    });

    gallery.onMoveIn(function () {
        var className = gallery.masterPages[gallery.currentMasterPage].className;
    /(^|\s)swipeview-active(\s|$)/.test(className) || (gallery.masterPages[gallery.currentMasterPage].className = !className ? 'swipeview-active' : className + ' swipeview-active');
    });


} // end setupSlides()


function watchForShake(threshold) {
    // http://wiki.phonegap.com/w/page/16494783/Handling%20Shake%20Events
    // this is a straight cordova call 

    watchID = navigator.accelerometer.watchAcceleration(
			  function (Accel)
			  {
			      if (true === Accel.is_updating){
				  return;
			      }
			      var diffX = Math.abs(Accel.x) - prevX;
 
			      if (diffX >= threshold)
				  {
				      // The user has shaken their device. Do something
				      alert("You have made a milkshake!");
                      // flipping to options page, disable accelerometer
                      navigator.accelerometer.clearWatch(watchID);
                      watchID = null;
				      $.mobile.changePage('#page4', 'flip');
				  }
			      prevX = Math.abs(Accel.x);
			  }
			  , function(){ alert("accelerometer error"); }
			  , {frequency : 2000} // 2 seconds = 2000 
			  );
}

function getGeoCell(){

    var baseURL = "https://uploaderred.appspot.com/getGeoCell";
    var getURL;
    var result;
    var parameters = new Array();
    var resolution = "6"; // max = "13"

    parameters["resolution"] = resolution;
    parameters["longitude"] = snap.lng;
    parameters["latitude"] = snap.lat;

    var geoCell = "";

    // http://stackoverflow.com/questions/316781/how-to-build-query-string-with-javascript
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
    getURL = baseURL + "?" + qs;
  }

    /* $.get(getURL)
                .done(function (result) {
                    var myJSONtext;
                    // take out all the safe chars %5D
                    myJSONtext = JSON.stringify(result);
                    alert("geocell result: " + myJSONtext);

                    // make the string back into an object that can be indexed
                    var myJSONobject = JSON.parse(myJSONtext);
                    
                    $.each(myJSONobject.geoCell, function (JSONrecordNumber, JSONrecordContents) {
                        // this index starts at '0' and there should only be one record

                        geoCell = myJSONobject.geoCell[JSONrecordNumber];

                    });
                });
*/

    geoCell = "******";

    // alert("getGeoCell: " + geoCell + "  " + getURL);

  return geoCell;
 }

