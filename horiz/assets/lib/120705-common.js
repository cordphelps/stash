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

var map;
var marker_array = [];
var tempMarker;
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
    lon: "",
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

var  slides = [
	      {
		  img: "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRiSTgw",
		  width: 300,
		  height: 300,
		  desc: "",
		  marker: new google.maps.Marker(),
		  lng: "-120.282346",
		  lat: "34.477594"
	      },
              {
                  img: "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRjKZQw",
                  width: 300,
                  height: 300,
                  desc: "",
                  marker: new google.maps.Marker(),
                  lng: "-120.2833",
                  lat: "34.48"
              },
              {
                  img: "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRixbQw",
                  width: 300,
                  height: 300,
                  desc: "",
                  marker: new google.maps.Marker(),
                  lng: "-120.2843",
                  lat: "34.49"
              },

	      { 
                  img: "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIOCxIHTWVzc2FnZRjaNgw",
                  width: 300,
                  height: 300,
                  desc: "",
                  marker: new google.maps.Marker(),
                  lng: "-120.2853",
                  lat: "34.46"
              }

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

    if (isPhoneGapReady) {
        	onDeviceReady();
    }
    else {
	// add event listener for device ready
	document.addEventListener('deviceready', onDeviceReady, false);
	// alert("added listener: href: ", location.href);
    }

    // http://cubiq.org/dropbox/SwipeView/demo/gallery/ 
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


}

function loadPhotoArray (zipcode) {
    
    // get any array of nearby photos

    // getSlides(zipcode);

    // http://cubiq.org/dropbox/SwipeView/demo/gallery/
    // document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    // load the gallery
    setupSlides();
}

function onDeviceReady() {

    alert("onDeviceReady");

    // document.getElementById('deviceProperties');
    isPhoneGapReady = true;
    deviceUUID = device.uuid;
    /* alert(deviceUUID); */
    deviceDetection();
    networkDetection();
    domSetup();
    executeEvents();
    bindPhotoButtons();
    watchForShake(0.5);

}

function domSetup() {

    if (!isDomInitialized) {
	// alert("domSetup: false");
	navigator.geolocation.getCurrentPosition(loadMap, geoError, 
					     {timeout:10000,
					      enableHighAccuracy : true,
					      maximumAge : 3000
					      });

	// now (debugging) it has the TX zipcode hardcoded
	// 76537 is the dummy zipcode
	// alert("loadphotoarray");
	loadPhotoArray("76537");

	// in debug mode, don't the pound on the geoHash service
	// it is disabled, so set the zip code
	snap.zipcode = "dummy";

	isDomInitialized = true;
    }
    else {
	alert("domSetup: true");
    }
}



function executeEvents() {
    if (isPhoneGapReady) {
	document.addEventListener('pause', onPause, false);
	document.addEventListener('resume', onResume, false);
	document.addEventListener('online', onOnline, false);
	document.addEventListener('offline', onOffline, false);
	document.addEventListener('batterylow', onBatterylow, false);

	// set timer to monitor the network
	internetInterval = window.setInterval(function() {
		if (navigator.network.connection.type != Connection.NONE) {
		    networkDetection();
		}
		else {
		    onOffline();
		}
	    }, 5000);
	
	$('#page1').bind('taphold', function(){
		if (photosVisible) {
		    $('#wrapper').hide();
		    photosVisible = false;
		}
		else {
		    $('#wrapper').show();
		    photosVisible = true;
		}
	    });

	/*
	$('#page3').bind('swipeleft', function(){
		$.mobile.changePage('#page1', 'slide'); });
	$('#page3').bind('swiperight', function(){
		$.mobile.changePage('#page1', 'slide'); });
	$('#page3').bind('taphold', function(){
		$.mobile.changePage('#page4', 'flip'); });
	*/
	//
	$('#page4').bind('swipeleft', function(){
		$.mobile.changePage('#page1', 'slide'); });
	$('#page4').bind('swiperight', function(){
                $.mobile.changePage('#page1', 'slide'); });

    }

     alert("events finished");
}

function orientationChange(e) {

    var orientation = "portrait";

    if (window.orientation == -90 || window.orientation == 90) {
	orientation = "landscape";
    }

    alert("orientation change");
    // document.getElementById("page1").innerHTML+=orientation+"<br>";
}

function setHeight() {
    // http://www.sharepointjohn.com/using-simple-
    //             jquery-to-set-the-height-of-a-div-to-the-page-height/
    $("#page1").height($(document).height());
    $("#page2").height($(document).height());
    $("#page3").height($(document).height());
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

function bindPhotoButtons() {

    $('#moveCameraButton').bind('click', function(){
            // navigator.notification.beep(1);
            // $.mobile.changePage('#page3');
	    handlePhotoV2();
        });

    $('#zipButton').bind('click', function(){
            
            // getGeohash();
	    alert("geohash disabled");
        });

    $('#resetZipButton').bind('click', function(){
	    
	    var oldZip = snap.zipcode;
	    snap.zipcode = $('#newZipcode').val();
	    $('#newZipcode').value = "";
	    updateDebugTextArea("old zip: " + oldZip + " new zip: " + snap.zipcode);
	    
        });


    $('#newArrayButton').bind('click', function(){
            
	    updateDebugTextArea("loading data for zipcode: " + snap.zipcode);
	    loadPhotoArray(snap.zipcode);
	    // getMapMarkers();
        });

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
    alert("code:" + r.responseCode + " bytes: " + r.bytesSent); 
    // alert("Response = " + r.response);

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

                    slides = [];
                    
                    $.each(myJSONobject.pictures, function (JSONrecordNumber, JSONrecordContents) {
                        // alert( "rec num: " + JSONrecordNumber 
                         //           + " url: " + myJSONobject.pictures[JSONrecordNumber].url);
                        var newSlide = new Object();
                        newSlide.img = myJSONobject.pictures[JSONrecordNumber].url;
                        newSlide.width = 300;
                        newSlide.height = 300;

                        slides[JSONrecordNumber] = newSlide;
                        // alert (".img= " + newSlide.img );
                    });
                    setupSlides();
                });
}

function getSlides(zipcode) {
    // query the jsonengine datastore and get 5 records from
    // the local zip code
    //
    // query needs to look like: (%22 is a URI encode of a double quote)
    // http://snaptestsnap.appspot.com/_je/messages?cond=zipcode.eq.%2276537%22
    // 76537 is the dummy zipcode
    //
    var searchZip = "?cond=zipcode.eq.%22" + zipcode + "%22";
    var getURL = jeOptions.aeURL + jeOptions.tableName + searchZip;

    alert (getURL);
    
    var request = $.ajax({

            url: getURL,
            type: "GET",
            dataType: "json",// eval response as js and return text
            jsonp: false, // don't tweak the query string will server callback info
            jsonpCallback: 'alertResponse', // client callback 
            processData: false, // don't build a query string from 'data' pair
            cache: true, // true prevents timestamp addition 
            
	    success: function(returnedJSON) {
		
		// http://stackoverflow.com/questions/6298599/jquery-each-json-array-object-iteration
		// http://api.jquery.com/jQuery.each/
		// "In the case of an array, the callback is passed an array index and 
		// a corresponding array value each time."
		// 
		$.each(returnedJSON, function(JSONrecordNumber, JSONrecordContents) {

			slides[JSONrecordNumber].img = returnedJSON[JSONrecordNumber].fileName;
			slides[JSONrecordNumber].desc = returnedJSON[JSONrecordNumber].text;
			slides[JSONrecordNumber].lat = returnedJSON[JSONrecordNumber].lat;
			slides[JSONrecordNumber].lon = returnedJSON[JSONrecordNumber].lon;
			// alert("slide[].img: " + JSONrecordNumber + " " 
			// + slides[JSONrecordNumber].img);

		    }); // end of JSONrecordNumber .each
		}  // end of success function
	     }); // end of ajax request
    	
    request.done(function(returnedStuff) {
            // alert("get done: ");
        } // end of function
	); // end of statement

} // end getSlides()
    





function loadMap(position) {

    // alert("load map");
    snap.lat = position.coords.latitude;
    snap.lon = position.coords.longitude;
    // alert("lat/lon: " + snap.lat + " " + snap.lon);
    // for a DEMO, hardcode the center to gaviota
    // lat 34.477601 lgn -120.282051
    //
    var mapOptions = {
	center: new google.maps.LatLng(34.477601, -120.282051),
	// center: new google.maps.LatLng(position.coords.latitude,
	//			       position.coords.longitude),
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	zoom: 12   // 14
    };

    // latlng is a class, see
    // http://gwt-google-apis.googlecode.com/svn/javadoc/maps/1.0
    // /com/google/gwt/maps/client/geom/LatLng.html

    var mapObj = document.getElementById("map_canvas");
    
    // map defined globally
    map = new google.maps.Map(mapObj, mapOptions);

    // var image = 'images/beachflag.png';
    var marker = new google.maps.Marker({
	    position: mapOptions.center,
	    map: map,
	    title: "you",
	});

    // coord_array defined globally
    coord_array = getCoordinatesArray("gaviota");

    if (coord_array.length > 0) {

	updateMarkers();
    }

    setInterval(randomMarkerAction, 3000);

}
function randomMarkerAction() {
    // https://developer.mozilla.org/en/DOM/window.setInterval 
    // Calls a function repeatedly, with a fixed time delay between
    // each call to that function.

    if (!randomMarker) {
	addRandomMarker();
	randomMarker = true;
    }
    else {
	removeRandomMarker();
	randomMarker = false;
    }

}

function addRandomMarker() {

    var bounds = map.getBounds();
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();
    var lngSpan = northEast.lng() - southWest.lng();
    var latSpan = northEast.lat() - southWest.lat();
    var lat = southWest.lat() + latSpan * Math.random();
    var lng = southWest.lng() + lngSpan * Math.random();

    // var lat = 34.477601;
    // var lng = -120.282051;

    // https://developer.mozilla.org/en/DOM/window.setInterval
    // Calls a function repeatedly, with a fixed time delay between 
    // each call to that function.
    // search: math.random()
    tempMarker = new google.maps.Marker({
	    position: new google.maps.LatLng(lat, lng),
		map: map,
		// animation: google.maps.Animation.BOUNCE,                          
		animation: google.maps.Animation.DROP,
		draggable: false
	});    

    marker_array.push(tempMarker);

}

function removeRandomMarker() {

    // the recent tempMarker has been added to the end of the array
    // remove the first element of the array
    // http://www.w3schools.com/jsref/jsref_obj_array.asp

    tempMarker = marker_array.shift();

    // https://developers.google.com/maps/documentation/javascript/
    //                      overlays#RemovingOverlays
    tempMarker.setMap(null);



}



function updateMarkers() {
    // WHILE THE DATASTRUCTURES ARE BEING RATIONALIZED....
    // ASSUME THE THE SLIDES ARRAY IS THE SAME SIZE AS
    // THE COORD_ARRAY....
    if (slides.length != coord_array.length) {
	alert("DATA MALFUNCTION");
    }

    // iterator is a global
    iterator = 0;
    for (var i = 0; i < coord_array.length; i++) {
	setTimeout(function() {
		addMarker();
	    }, i * 200 ); // end setTimeout (execute function ONCE after x ms)
    } // end for
}

function addMarker() {

    var latlon = new google.maps.LatLng(coord_array[iterator][1],
					coord_array[iterator][2]);
    // alert("EQUAL: ? " + coord_array[iterator][2] + " " + slides[iterator].lng);
    slides[iterator].latlng = new google.maps.LatLng(
						     slides[iterator].lat,
						     slides[iterator].lng);
    var newMarker = (new google.maps.Marker({
		    position: slides[iterator].latlng,
		    // position: latlon,
		    map: map,
		    // animation: google.maps.Animation.BOUNCE,
		    animation: google.maps.Animation.DROP,
		    draggable: false
		    }));
    // marker_array defined globally
    marker_array.push(newMarker);

    slides[iterator].marker = newMarker;
    
    iterator++;

    // google.maps.event.addListener(marker, 'mouseover', toggleBounce);
    // where toggleBounce is a function
    // http://code.google.com/p/gmaps-api-issues/issues/detail?id=3087
}


function toggleBounce() {
    // https://developers.google.com/maps/documentation/javascript
    //           /overlays#MarkerAnimations
    if (marker.getAnimation() != null) {
	marker.setAnimation(null);
    } else {
	marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}


function geoError(error) {
    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

function getCoordinatesArray(place) {

    var array = [];

    if (place == "stanford") {
	// stanford lon -122.165, lat 37.423 
	// fourth parameter is the Z index  
	var stanford = [
		    ['center', 37.423, -122.165, 1],
		    ['location2', 37.4323, -122.1765, 2],
		    ['location3', 37.4423, -122.1865, 3],
		    ['location4', 37.4523, -122.1965, 4]
		    ];
	array = stanford;
    }
    else if (place == "gaviota") {
	var gaviota = [
		       ['center', 34.477594, -120.282346, 1],
		       ['location2', 34.48, -120.2833, 2],
		       ['location3', 34.49, -120.2843, 3],
		       ['location4', 34.46, -120.2853, 4]
		       ];
	array = gaviota;
    }
    else {
	alert("using current");
    }

    return array;

}



function setupSlides() {

    // http://cubiq.org/swipeview

    alert("new slides l= " + slides.length + " page: " + page);

    page = 0;


    // gallery = new SwipeView('#wrapper');
    gallery = new SwipeView('#wrapper', { numberOfPages: slides.length });

    // Load initial data
    for (i=0; i<3; i++) {

	       page = i==0 ? slides.length-1 : i-1;
	       el = document.createElement('img');
	       el.className = 'loading';
	       el.src = slides[page].img;

            // alert("el.src= " + slides[page].img );

	       el.width = slides[page].width;
	       el.height = slides[page].height;
	       el.onload = function () { this.className = ''; }
	       gallery.masterPages[i].appendChild(el);

           alert("i: " + i + " page: " + page);

           /*
	       el = document.createElement('span');
	       el.innerHTML = slides[page].desc;
	       gallery.masterPages[i].appendChild(el)
           */
	    }

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
            el.width = slides[upcoming].width;
            el.height = slides[upcoming].height;
            
            el = gallery.masterPages[i].querySelector('span');
            el.innerHTML = slides[upcoming].desc;
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
    var axl = new Accelerometer(); 
    axl.watchAcceleration(
			  function (Accel)
			  {
			      if (true === Accel.is_updating){
				  return;
			      }
			      var diffX = Math.abs(Accel.x) - prevX;
 
			      if (diffX >= threshold)
				  {
				      // The user has shaken their device. Do something
				      // alert("You have made a milkshake!");
				      $.mobile.changePage('#page4', 'flip');
				  }
			      prevX = Math.abs(Accel.x);
			  }
			  , function(){}
			  , {frequency : 100}
			  );
}



