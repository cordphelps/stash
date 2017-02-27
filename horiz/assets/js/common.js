/*
 *  horiz
 *  Copyright 2012, Cord Phelps, rc.phelps@gmail.com

 

 *
 * 120710 copied from github tree 47691562ae (120709)
*/

// 
var isPhoneGapReady = false;
var eventsSetup = false;
var portrait = true;
var consoleString = "";
var internetInterval;
var deviceUUID;


var map;
var centerMarker = null;
    // for a DEMO, hardcode the center to gaviota
    // gaviota  lon -120.282051, lat 34.477601 
    // stanford lon -122.165, lat 37.423 
    //
var mapOptions = {
    center: null,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    // heading: 90,  looks like this is for 'streetView only'
    zoom: 13   // larger numbers zoom in
    };

var watchID;

var snap = {
    lng: "",
    lat: "", 
    geohash: "",
    type: 'image/png', 
    text: ""
};


var gallery,
    el,
    i,
    page;

var menu;

var slides = [];
var  landscapes = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjh2gEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjJ4gEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjK4gEM"
        ];
var wires = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRi5lAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRihnAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRiJpAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRihnAEM",
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjxqwEM"
    ];
var farmville = [
        "http://muvmuvvum.appspot.com/img?entity_id=agtzfm11dm11dnZ1bXIPCxIHTWVzc2FnZRjBuwEM"
    ];

// if the network is down when trying to swipe SwipeView
var noNetworkImage = "assets/icons/Metroid_32_0002_Wi-Fi.png";
// if no photos are available in the cloud
var noPhotoImage = "assets/icons/Metroid_32_0014_Weather.png";

function my_init() {

    var j = 0;

    if (isPhoneGapReady) {
        	onDeviceReady();
    }
    else {
	// add event listener for device ready
	document.addEventListener('deviceready', onDeviceReady, false);
    }


}


function onDeviceReady() {

    // alert("onDeviceReady");
    isPhoneGapReady = true;

    if (!eventsSetup) {

        executeEvents();
        eventsSetup = true;

        // init the SlideView gallery
        gallery = new SwipeView('#wrapper', { numberOfPages: slides.length });

        menu = new slideInMenu('slidedownmenu', false); // false = 'closed' initially

        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);


    }


    if (isConnected()) {

        document.getElementById('noNetwork').style.display = "none";

        document.getElementById('wrapper').style.display = "block";
        document.getElementById('slidedownmenu').style.display = "block";


        domSetup();            // setup map + markers; init the slides array

        menu.close();
        
    }

    else {
        // no network!
        // so give them the noNetwork div
        document.getElementById('noNetwork').style.display = "block";

        document.getElementById('wrapper').style.display = "none";
        document.getElementById('slidedownmenu').style.display = "none";


    }


    // and wait for events....


}

function domSetup() {

    $('#wrapper').trigger('updatelayout');
    $('#slidedownmenu').trigger('updatelayout');
    google.maps.event.trigger(map, 'resize'); 

	navigator.geolocation.getCurrentPosition(function(position){

                            snap.lat = position.coords.latitude;
                            snap.lng = position.coords.longitude;

                            var center = new google.maps.LatLng(position.coords.latitude,
                                                                position.coords.longitude);
                            mapOptions.center = center;
                            map.setCenter(center);
                            centerMarker = new google.maps.Marker({
                                    position: center,
                                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', 
                                    map: map
                                });

                            // alert("lat/lng: " + snap.lat + " " + snap.lng);     

                            // load the slides array with initial slides
                            for (j = 0; j < landscapes.length; j++) { 

                                slides[j] = new Object();
                                slides[j].img = landscapes[j];

                                slides[j].lat = snap.lat - ( (j) / 500 );
                                slides[j].lng = snap.lng - ( (j) / 500 );

                                slides[j].latlng = new google.maps.LatLng(slides[j].lat, slides[j].lng);

                                slides[j].marker = new google.maps.Marker({
                                        position: slides[j].latlng,
                                        map: map,
                                        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                        animation: google.maps.Animation.DROP,
                                        draggable: false
                                    });

                                google.maps.event.addListener(slides[j].marker, 'click', 

                                                        (function(j) {
                                                            return function() {
                                                                alert("click id= " + j);
                                                                gallery.goToPage(j);
                                                                }

                                                            }) (j)

                                                        );
                            }

                            // present the slides via SlideView
                            setupSlides();

                            // document.getElementById("farmville").src = farmville[0];

                            // end of success callback
                        }, 

                        function(error) {
                                // alert('geo error code: ' + error.code + '\n' + 
                                //       'message: ' + error.message + '\n');
                            }, 

                        { timeout : 10000,
                        enableHighAccuracy : true,
                        maximumAge : 3000 }

    ); // end getCurrentPosition()


}



function executeEvents() {

    // "In general use document mainly to register events and use window to do things like scroll, 
    // scrollTop, and resize."
    // http://stackoverflow.com/questions/5371139/window-scrolltop-vs-document-scrolltop
    //

    if (isPhoneGapReady) {

	   document.addEventListener('pause', onPause, false);
	   document.addEventListener('resume', onResume, false);
	   document.addEventListener('online', onOnline, false);
	   document.addEventListener('offline', onOffline, false);
	   document.addEventListener('batterylow', onBatterylow, false);

        // yeah SlideView()
        // http://cubiq.org/dropbox/SwipeView/demo/gallery/ 
        // document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
        // from slideInMenu
        document.addEventListener('touchmove', function(e){ e.preventDefault(); e.stopPropagation(); });

        // yeah map
        startPositionWatch();


        // http://stackoverflow.com/questions/10023328/orientation-change-event-
        //          implementation-by-jquery-mobile-in-phone-gap
        // https://build.phonegap.com/docs/config-xml/
        //
        // assume the app starts in portrait as there is some ugliness otherwise
        // https://groups.google.com/forum/?fromgroups#!topic/phonegap/yzglb2r9QmA

        // some fine tuning
        // http://stackoverflow.com/questions/7919172/what-is-the-best-method-of-re-rendering-a-
        //                 web-page-on-orientation-change

        $(document).bind( 'orientationchange', function(e){

            if ($.event.special.orientationchange.orientation() == "portrait") {

                // note: hide/show are jquery animations
                // This is roughly equivalent to calling .css('display', 'none'), except that the value 
                // of the display property is saved in 
                // jQuery's data cache so that display can later be restored to its initial value.

                portrait = true;

                if (watchID == null) {
                    // reset GPS watching
                    startPositionWatch();
                }                

                // alert("trying portrait");
                document.getElementById('wrapper').style.height = "150px";
                document.getElementById('wrapper').style.display = "block";
                document.getElementById('slidedownmenu').style.display = "block";
                document.getElementById('map_canvas').style.display = "block";
                document.getElementById('map_canvas').style.height = "300px";

                google.maps.event.trigger(map, 'resize'); 

                // document.getElementById('farmville').style.display = "none";
                document.getElementById('moveCameraButton').style.display = "block";


            } else {
                // Do Whatever in landscape mode
                // the value depends on the device!
                // http://www.matthewgifford.com/2011/12/22/a-misconception-about-window-orientation/
                //
                // alert("orientation: " + window.orientation);

                portrait = false;                 

                clearPositionWatch();  // stop GPS tracking position in landscape           

                if (window.orientation == -90) {
                    // just show the gallery slider
                    document.getElementById('wrapper').style.display = "block";
                    document.getElementById('wrapper').style.height = "100%";
                    document.getElementById('slidedownmenu').style.display = "none";
                    document.getElementById('map_canvas').style.display = "none";

                    gallery.refreshSize(); // does not help....
                }
                else {
                    // window.orientation == 90
                    // 
                    document.getElementById('wrapper').style.display = "none";
                    document.getElementById('slidedownmenu').style.display = "none";
                    document.getElementById('map_canvas').style.display = "block";
                    document.getElementById('map_canvas').style.height = "100%";

                    google.maps.event.trigger(map, 'resize'); 
                }
    

            }
        });  // end bind orientationchange

        $('#moveCameraButton').bind('click', function(e){
            // 
            e.preventDefault();
            e.stopPropagation();
            handlePhotoV2();
            });

        $('#noNetworkButton').bind('click', function(e){
            // 
            e.preventDefault();
            e.stopPropagation();
            onDeviceReady();
            });

    } // end if phonegapReady()

     // alert("events finished");

} // end executeEvents()

function startPositionWatch () {

        // https://developers.google.com/maps/documentation/javascript/events
        //
        // to clear this
        // http://stackoverflow.com/questions/1544151/google-maps-api-v3-how-to-remove-an-event-listener
        // https://developers.google.com/maps/documentation/javascript/reference#MapsEventListener

        // 'center_changed' refers to the user manipulating the map
        // google.maps.event.addListener(map, 'position_changed', function() {});
        //

        // var options = { frequency: 3000 };
        watchID = navigator.geolocation.watchPosition(function() {

                            // implementing the pulsing blue dot is doable in andriod
                            // "myLocationOverlay" 
                            // roll your own with custom overlays:
                            // https://developers.google.com/maps/documentation/javascript/overlays#AddingOverlays
                            
                            // alert('trying to pan');
                            // Changes the center of the map to the given LatLng
                            map.setCenter(getPosition());
                            map.panTo(mapOptions.center);

                            }, 
                            
                            function(){alert('watchPostion error');} , 

                            { frequency: 3000 }
                    );
}

function clearPositionWatch() {
        if (watchID != null) {
            navigator.geolocation.clearWatch(watchID);
            watchID = null;
        }
    }

function getPosition () {

    navigator.geolocation.getCurrentPosition(function(position){

            snap.lat = position.coords.latitude;
            snap.lng = position.coords.longitude;
    });

    var latlng = new google.maps.LatLng(snap.lat, snap.lng);

    mapOptions.center = latlng;

    centerMarker.setMap(null);
    centerMarker = null;

    centerMarker = new google.maps.Marker({
            position: latlng,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', 
            map: map
    });

    return latlng;

}



function isConnected() {

	if (navigator.network.connection.type != "none" &&
        navigator.network.connection.type != "unknown") {
        // alert("connected: " + navigator.network.connection.type);
	   return true;
	}

    else {
        // alert("not connected");
        return false;
    }

}



function onPause(){
    isPhoneGapReady = false;
    clearPositionWatch(); 

}


function onResume(){
    // iOS Quirk per phonegap documentation
    // to keep the app from hanging
    setTimeout(function() { 

        if (isPhoneGapReady == false) {
	       my_init();
        }

        alert("that was a resume");
        // reset GPS watching
        startPositionWatch();
        getRecords("orange");

    }, 0); // end quirk
}

function onOnline(){
 
}

function onOffline(){

    alert('that was offline');
}

function onBatterylow(){
    
}


function handlePhotoV2() {

    menu.close();

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

    // imageURI has the form "file://localhost/var/mobile/Applications/---long-key--/tmp/cdv_photo_001.jpg"

    // http://www.json.org/js.html
    /*
    var jsonObj = { "records" : [
                        { "recNum" : "1", "content" : "stuff1"},
                        { "recNum" : "2", "content" : "stuff2"},
                        { "recNum" : "3", "content" : "stuff3"} 
                        ]
                    };
    var jsonText = JSON.stringify(jsonObj);
    */

    if (isConnected()) {

        $.getJSON("http://uploaderred.appspot.com/upload-url", function (uploadURL) {
        
            // uploadURL has the form "http://uploaderred.appspot.com/_ah/upload/---long-key----/"

            var options = new FileUploadOptions();
            options.fileKey="file";  // name of the form element, default="file"
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1); // fileName for the server
            options.mimeType="image/png"; // 'png' or 'jpg' ; it does not seem to matter

            var params = new Object();
            params.description = "orange";
            params.tags = "t-stuff";

            options.params = params; // optional key/value pairs (object)

            // FileTransfer() seems broken with phonegap v 1.9.0; works with v 1.8.1
            // see config.xml
            var ft = new FileTransfer();
            ft.upload(imageURI, uploadURL, win, fail, options);
        });
    }

    else {
        alert("not connected");
    }
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

}

function getRecords(description) { 

    // get some new image content from the server
    // update the slides array
    // create some corresponding map markers
    // re-load the image gallery

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
                        //alert("each records: " + JSONrecordNumber);

                        slides[ JSONrecordNumber ] = new Object();
                        slides[ JSONrecordNumber ].img = myJSONobject.pictures[JSONrecordNumber].url;

                    });

                    // we jump in here after successfully taking a picture
                    // (so at least one image is available). to be functional, SwipeView wants 
                    // at least 3 slides -  so add some placeholders if necessary
                    if (slides.length == 2 ) {
                        // need 1 dummy slide
                        slides[2] = new Object();
                        slides[2].img = noPhotoImage;
                    }
                    else if (slides.length == 1 ) {
                        // need 2 dummy slides
                        slides[1] = new Object();
                        slides[1].img = noPhotoImage;
                        slides[2] = new Object();
                        slides[2].img = noPhotoImage;
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
                                            draggable: false,
                                            id: j              // extending the object here.....
                                    });

                        // http://stackoverflow.com/questions/5333653/google-maps-api-v3-why-no-context-with-events
                        google.maps.event.addListener(slides[j].marker, 'click', 

                                                        (function(j) {
                                                            return function() {
                                                                alert("click id= " + j);
                                                                gallery.goToPage(j);
                                                                }

                                                            }) (j)

                                                        );           // .toString(); ?    this.id
                    } // end of for

                    setupSlides();

                }); // end of $.get().done
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

    // to-do: remove the marker click events 

    // remove the gallery events
    // gallery.destroy();
    
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
        el.noNetworkImage = noNetworkImage;
        el.width = 300;
        el.height = 300;
        // el.width = slides[page].width;
        // el.height = slides[page].height;
        el.title = page.toString();
        el.onload = function () { this.className = ''; };
        // el.bind('tap', function(){ setMarkerAnimation(gallery.currentMasterPage); });
        el.onclick = function (e) { 
                                    // each slide has a map marker
                                    // change the color of the marker that corresponds to the
                                    // currently visible slide
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (portrait) {
                                            setMarkerAnimation(gallery.currentMasterPage);
                                            }
                                    };     
        
        gallery.masterPages[i].appendChild(el);

        // add some text to the slide
        /*
        el = document.createElement('span');
        el.innerHTML = el.id;
        gallery.masterPages[i].appendChild(el);
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

    alert("getGeoCell: " + geoCell + "  " + getURL);

  return geoCell;
 }
