/*
 * fn.js
 *
 * Cord Phelps
 * Copyright 2015, MIT License
 * http://www.opensource.org/licenses/MIT
 *
*/

function lsTest() {
	
	//
	// local storage 
	//
	// "sensorPackA" : "date" : "{"

	// https://arty.name/localstorage.html
	// iPhone chrome: 2,600,000 characters
	// 
}

function clearLocalstorage() {

	// 
	localStorage.removeItem("crops");
	localStorage.removeItem("domains");
	localStorage.removeItem("sensoPacks");


}


function getSensorPackDetails() {

	// get domain, crop, and port info for a given sensorPack  irrigavi.selectedSensorPack

	var lsContent = localStorage.getItem("sensorPacks");

	var lsObject = JSON.parse(lsContent);
    console.log("sensorPacks object: " + JSON.stringify(lsObject));

    $.each(lsObject["sensorPacks"], function (index, value) {

    	console.log("value: " + JSON.stringify(value));

    	if (value.label == irrigavi.selectedSensorPack) {

    		$.each(value, function(key, localValue) {

    			//console.log("sensorPacks each: " + JSON.stringify(localValue));

    			if (key == "crop") {
    				irrigavi.selectedCrop = localValue;
    			}

    			if (key == "domain") {
    				irrigavi.selectedDomain = localValue;
    			}
    		});
    	}

    });

}

function getCropDetails() {

	// get the min/max moisture values for a specific crop

	var setMax = false;
	var setMin = false;

	var lsContent = localStorage.getItem("crops");

	var lsObject = JSON.parse(lsContent);
    console.log("crops object: " + JSON.stringify(lsObject));

    $.each(lsObject["crops"], function (index, value) {

    	console.log("crop value: " + JSON.stringify(value));

    	if (value.label == irrigavi.selectedCrop) {

    		$.each(value, function(key, localValue) {

    			//console.log("sensorPacks each: " + JSON.stringify(localValue));

    			if (key == "min") {
    				irrigavi.plotInfo.minControl = parseInt(localValue);
    				setMin = true;
    			}

    			if (key == "max") {
    				irrigavi.plotInfo.maxControl = parseInt(localValue);
    				setMax = true;
    			}
    		});

    		if (!setMin) {
    			irrigavi.plotInfo.minControl = irrigavi.plotInfo.minDefaultCropMoistureLevel;
    		}
    		if (!setMax) {
    			irrigavi.plotInfo.maxControl = irrigavi.plotInfo.maxDefaultCropMoistureLevel;
    		}

    		return;
    	}

    });	

}


function readSensors() {

	clearPlotInstances();

	//   
	var secondsNow = Math.floor(Date.now() / 1000);   // integer seconds
	var daysRand =  Math.floor(Math.random() * 100);  // generate integer between 0 and 100
	var secondsRandom = (60*60*24) * daysRand;

	var dateRandom = (secondsNow - secondsRandom)*1000;  // UTC milliseconds
	// var dateRandomString = dateRandom.toString();

	var date = secondsNow * 1000; // UTC milliseconds

	irrigavi.plotInfo.ctime.mostRecentDate = Date.now();  
	irrigavi.plotInfo.ctime.mostRecentDateLocalTime = irrigavi.plotInfo.ctime.mostRecentDate - (irrigavi.timezoneOffset * 60 * 1000); // adjust to local time
	var dateStr = dateIntToString(irrigavi.plotInfo.ctime.mostRecentDateLocalTime);

	if (irrigavi.sampleData) {

	//updateLog('secondsNow: ' + secondsNow +
				//'\ndaysRand: ' + daysRand +
				//'\nsecondsRandom: ' + secondsRandom +
				//'\ndate: ' + date, 'measureIncoming');


	//                                       ------------------------------------------- integer days < 100 in seconds
	//var date = ( Math.floor(Date.now() / 1000) ) - ( (60*60*24) * (Math.floor(Math.random() * 100) ) );
	//                                                        -------------------------------- integer < 100 

		var result = {
			sensorPack: irrigavi.selectedSensorPack,
			// http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
			//date: Math.floor(Date.now() / 1000),
			domain: irrigavi.selectedDomain,
			crop: irrigavi.selectedCrop,
			//date: dateRandom,
			//date: Math.floor(Date.now() / 1000),
			//dateStr: dateStr,
			port0: Math.floor(Math.random() * 1000),
			port1: Math.floor(Math.random() * 1000),
			port2: Math.floor(Math.random() * 1000),
			port3: Math.floor(Math.random() * 1000),
			port4: Math.floor(Math.random() * 1000),
			port5: Math.floor(Math.random() * 1000),
			tzOffset: irrigavi.timezoneOffset,
			geoHash: irrigavi.geoHash
		};

		dateStr = dateIntToString(dateRandom);

	} else {

		var result = {
			sensorPack: irrigavi.selectedSensorPack,
			// http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
			//date: Math.floor(Date.now() / 1000),
			domain: irrigavi.selectedDomain,
			crop: irrigavi.selectedCrop,
			port0: getPort(0),
			port1: getPort(1),
			port2: getPort(2),
			port3: getPort(3),
			port4: getPort(4),
			port5: getPort(5),
			tzOffset: irrigavi.timezoneOffset,
			geoHash: irrigavi.geoHash
		};

	}



	
	updateLog("\n" + dateStr + 
		"\nsensorPack: " + result.sensorPack + 
				"\nport 0 : " + result.port0 +
				"\nport 1 : " + result.port1 +
				"\nport 2 : " + result.port2 +
				"\nport 3 : " + result.port3 +
				"\nport 4 : " + result.port4 +
				"\nport 5 : " + result.port5 , 'measureIncoming');

	//result.date = localTime;
	result.date = dateStr;

    irrigavi.sensorData.push(result);

	irrigavi.dataIsSynced = false;
	irrigavi.dataIsAvailable = true;


}

function dateIntToString(int) {

	var localTimeObj = new Date(int); // make the date object

	// http://stackoverflow.com/questions/16276942/convert-utc-value-in-dd-mm-yyyy-format-using-javascript
	// flatDate.toISOString() format is: 2015-04-10T15:24:06.000Z 
	var dateStr = localTimeObj.toISOString();
	var choppedDate = dateStr.slice(0, dateStr.length - 5);
	// now the choppedDate format is: 2015-03-31T15:40:28
	var choppedArray = choppedDate.split("T"); 

	return choppedArray.join(" ");
}

function getPort(portNumber) {

	return (100 * portNumber);

}



function buildPlotArray(sensorPack, obj, type) {

	var lines = [];

	var defaultLineOptions = {
    		label: "line X",
    		color: '#009933',
    		breakOnNull: true,
    		lineWidth: 4, 
    		rendererOptions: {
            	smooth: true
        	},
    		markerOptions: {
    			style:'filledSquare'
    		}
    	};

	if (type == 'levels') {

		// this is for the levels pattern in which each of 3 lines correspond to
		// levelA, levelB, and levelC for a particular sensorPack over time
		//
		// this is useful to look for mis-behaving sensors
		//
		// separate the levels into separate charts; one level per chart

		portsDataByLevel('level0', 'all ports', 'level0Options', defaultLineOptions, sensorPack);
		portsDataByLevel('level1', 'level 1', 'level1Options', defaultLineOptions, sensorPack);
		portsDataByLevel('level2', 'level 2', 'level2Options', defaultLineOptions, sensorPack);
		portsDataByLevel('level3', 'level 3', 'level3Options', defaultLineOptions, sensorPack);


	// end 'levels'

	} else if (type == 'candlestick') {

		// this is for the levels pattern in which each of 3 candlestick lines correspond to
		// levelA (port 0, 1, 2) or levelB (ports 3. 4. 5) for a particular sensorPack 
		//
		// this is useful to look for mis-behaving sensors and to get an idea of error rates
		//
		// using the high/low/close jqPlot model (as opposed to open/high/low/close)
		//

		var level1 = [];
		var level2 = [];


		// in the candlestick model, we define port 0, 1, and 2 to be in Level1,
		// and port 3, 4, 5 to be in Level2
		//
		// to use this jqPlot feature, each data 'triplet' has to be in the form
		//
		//      date, highValue, lowValue, thirdValue   <--- this is 'high, low, close'
		//
		//
		// if we don't have 3 data values, create '0's
		//
		//

	//
	// determine which ports are assigned to which levels
	//
	// irrigavi.sensorPackData.sensorPacks{} completely define each sensor pack
	// label, domain, crop, and ports for level1, 2, and 3
	// 
	irrigavi.plotInfo.lineArrayObj.candleData = [];
	irrigavi.plotInfo.candleOptions = [];


	for (var j = 0; j < irrigavi.sensorPackData.sensorPacks.length; j++ ) {

		// identify the sensorPack that has been selected and get an array of ports for each level
		if (irrigavi.sensorPackData.sensorPacks[j].label == sensorPack) {

			// if a level has exactly 3 sensors defined for it, then we can use the
			// jqPlot HLC candle pattern

			if (irrigavi.sensorPackData.sensorPacks[j].ports.level1.length == 3) {
				irrigavi.plotInfo.level1 = irrigavi.sensorPackData.sensorPacks[j].ports.level1;
				marshallCandleData("level1", "level 1", 1);
			}
			if (irrigavi.sensorPackData.sensorPacks[j].ports.level2.length == 3) {
				irrigavi.plotInfo.level2 = irrigavi.sensorPackData.sensorPacks[j].ports.level2;
				marshallCandleData("level2", "level 2", 2);
			}
			if (irrigavi.sensorPackData.sensorPacks[j].ports.level3.length == 3) {
				irrigavi.plotInfo.level3 = irrigavi.sensorPackData.sensorPacks[j].ports.level3;
				marshallCandleData("level3", "level 3", 3);
			}

		}

	}

	irrigavi.plotInfo.candleTitle = sensorPack + ': 3-sensor levels ';


	// end 'candlestick'

	} else {


	}


}

function marshallCandleData(level, label, index) {

	// build data and options suitable for the jqPlot HLC candle pattern
	//
	// for each measurement, collect the port data into a date, high, low, close array
	//
	// only hand this function a level that contains data for exactly 3 ports
	//

	//alert("marshalling: " + level);

   	var defaultCandleOptions = {
    		label: "level X",
    		color: '#009933',
    		breakOnNull: true,
    		rendererOptions: {
            	tickLength: 6,
            	lineWidth: 6
        	}
    	};

    var containerArray = [];

	for (var i = 0; i < irrigavi.sensorData.length; i++ ) {

		var temp1 = [];

		// for this set of measurements, collect the values for ports defined for
		// level1 into the array

		for (var k = 0; k < irrigavi.plotInfo[level].length; k++) {  // this should be == 3

			if (irrigavi.plotInfo[level][k] == 0) {       // 3 of the 6 will exist
				//alert("2 plotInfo.level1[k]: " + irrigavi.plotInfo.level1[k]);
				temp1.push(irrigavi.sensorData[i].port0); // add an array value 
			}
			if (irrigavi.plotInfo[level][k] == 1) {
				temp1.push(irrigavi.sensorData[i].port1);
			}
			if (irrigavi.plotInfo[level][k] == 2) {
				temp1.push(irrigavi.sensorData[i].port2);
			}
			if (irrigavi.plotInfo[level][k] == 3) {
				temp1.push(irrigavi.sensorData[i].port3);
			}
			if (irrigavi.plotInfo[level][k] == 4) {
				temp1.push(irrigavi.sensorData[i].port4);
			}
			if (irrigavi.plotInfo[level][k] == 5) {
				temp1.push(irrigavi.sensorData[i].port5);
			}

		}


		// ensure that the array values are in the order 'high, low, close'
		temp1.sort(compareNumbers);
		// now the array values are in low, close, high order
		var high = temp1.pop();
		temp1.unshift(high);
		// now the array values are in high, low, close order
		// insert the date 
		temp1.unshift(irrigavi.sensorData[i].date);

		containerArray.push(temp1);

	}   // end of raw data, temp1 now contains jqPlot "lines" for levels with 3 ports



	irrigavi.plotInfo.lineArrayObj.candleData.push(containerArray);  // that was a date plus 3 values
	//alert("2 pushed on: " + temp1);
	irrigavi.plotInfo.candleOptions.push(JSON.parse(JSON.stringify(defaultCandleOptions)));
	var olen = irrigavi.plotInfo.candleOptions.length;
	irrigavi.plotInfo.candleOptions[olen - 1].color = irrigavi.plotInfo.defaultColors[index - 1];
	irrigavi.plotInfo.candleOptions[olen - 1].renderer = $.jqplot.OHLCRenderer;

	
		//var len = irrigavi.plotInfo.candleOptions.length;
		//alert("len: " + len);


}


function portsDataByLevel(level, levelID, levelOptions, defaultLineOptions, sensorPack) {

	// params
	//
	// level         -> "level1"
	// levelID       -> "level 1"  (part of the chart title)
	// levelOptions  -> "level1Options"
	// sensorPack    (part of the chart title)
	//
	//
	// reading:
	//              irrigavi.sensorData[]                              (the data)
	//				irrigavi.sensorPackData.sensorPacks.ports[level]   (the 'levels')
	//
	//
	// writing:
	//             irrigavi.plotInfo.level1[]
	//             irrigavi.plotInfo.lineArrayObj.level1[]
	//             irrigavi.plotInfo.level1Options[]
	//

	var levelXport0 = [];
	var levelXport1 = [];
	var levelXport2 = [];
	var levelXport3 = [];
	var levelXport4 = [];
	var levelXport5 = [];

	if (level != "level0") {
		//
		// determine which ports are assigned to which levels
		//
		// irrigavi.sensorPackData.sensorPacks{} completely define each sensor pack
		// label, domain, crop, and ports for level1, 2, and 3
		// 
		for (var j = 0; j < irrigavi.sensorPackData.sensorPacks.length; j++ ) {

			// identify the sensorPack that has been selected and get an array of ports for each level
			if (irrigavi.sensorPackData.sensorPacks[j].label == sensorPack) {
				irrigavi.plotInfo[level] = irrigavi.sensorPackData.sensorPacks[j].ports[level];
			}

		}
	} else {

		irrigavi.plotInfo.level0 = [0,1,2,3,4,5];
	}


// find the ports associated with level1 and make a line chart with only those ports

		for (var i = 0; i < irrigavi.sensorData.length; i++ ) {  // examine each measurement event

			var temp1port0 = [];
			var temp1port1 = [];
			var temp1port2 = [];
			var temp1port3 = [];
			var temp1port4 = [];
			var temp1port5 = [];

			// make completion trackers for each port
			// these are necessary because we don't know if the ports are listed in order 
			// in irrigavi.plotInfo.level1[] and we only want to suck in their data once
			var port0Found = false;
			var port1Found = false;
			var port2Found = false;
			var port3Found = false;
			var port4Found = false;
			var port5Found = false;

			// for this set of measurements, collect the values for ports defined for
			// level1 into the array

			for (var k = 0; k < irrigavi.plotInfo[level].length; k++) {  // for each level1 port

				if (irrigavi.plotInfo[level][k] == 0 && !port0Found) {      // is port 0 in level1?
					temp1port0.push(irrigavi.sensorData[i].date);
					temp1port0.push(irrigavi.sensorData[i].port0); // if so, collect the measurement
					port0Found = true;
				} else if (irrigavi.plotInfo[level][k] == 1 && !port1Found) {
					temp1port1.push(irrigavi.sensorData[i].date);
					temp1port1.push(irrigavi.sensorData[i].port1);
					port1Found = true;
				} else if (irrigavi.plotInfo[level][k] == 2 && !port2Found) {
					temp1port2.push(irrigavi.sensorData[i].date);
					temp1port2.push(irrigavi.sensorData[i].port2);
					port2Found = true;
				} else if (irrigavi.plotInfo[level][k] == 3 && !port3Found) {
					temp1port3.push(irrigavi.sensorData[i].date);
					temp1port3.push(irrigavi.sensorData[i].port3);
					port3Found = true;
				} else if (irrigavi.plotInfo[level][k] == 4 && !port4Found) {
					temp1port4.push(irrigavi.sensorData[i].date);
					temp1port4.push(irrigavi.sensorData[i].port4);
					port4Found = true;
				} else if (irrigavi.plotInfo[level][k] == 5 && !port5Found) {
					temp1port5.push(irrigavi.sensorData[i].date);
					temp1port5.push(irrigavi.sensorData[i].port5);
					port5Found = true;
				}

			}

			// now for this measurment event, we have datapoints for each port in level 1
			// so add them to an individual line for plotting
			//
			// we only expect the 3 max could be loaded, but they could all be loaded.


			levelXport0.push(temp1port0);
			levelXport1.push(temp1port1);
			levelXport2.push(temp1port2);
			levelXport3.push(temp1port3);
			levelXport4.push(temp1port4);
			levelXport5.push(temp1port5);

		}

		/////////////////////////////////////////////////
		// prepare data for a single chart  
		/////////////////////////////////////////////////
		// each chart represent a level and needs a title
		// each line needs options with a custom label and line color
		/////////////////////////////////////////////////

		irrigavi.plotInfo.lineArrayObj[level] = [];
		irrigavi.plotInfo[levelOptions] = [];

		// make completion trackers for each port
		// these are necessary because we don't know if the ports are listed in order 
		// in irrigavi.plotInfo.level1[] and we only want to suck in their data once
		var port0Done = false;
		var port1Done = false;
		var port2Done = false;
		var port3Done = false;
		var port4Done = false;
		var port5Done = false;

		var objTitle = level + "Title";

		for (i = 0; i < irrigavi.plotInfo[level].length; i++) {

			irrigavi.plotInfo[objTitle] = sensorPack + ": " + levelID;   // this is the beginning of a new plottable line
			irrigavi.plotInfo[levelOptions].push(JSON.parse(JSON.stringify(defaultLineOptions)));  // each line gets options
			// remember which line is being built !! this is not the 'port' !!
			// it represents the 'line number' for each level and is associated with the options{}
			// at the same index in the options array for this level
			var lineIndex = irrigavi.plotInfo[levelOptions].length - 1;    

			if (levelXport0[0].length > 0 && !port0Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport0);  // this is the actual date//mesurement series
				irrigavi.plotInfo[levelOptions][i].label = "port 0";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[0];
				port0Done = true;
			} else if (levelXport1[0].length > 0 && !port1Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport1);
				irrigavi.plotInfo[levelOptions][i].label = "port 1";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[1];
				port1Done = true;
			} else if (levelXport2[0].length > 0 && !port2Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport2);
				irrigavi.plotInfo[levelOptions][i].label = "port 2";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[2];
				port2Done = true;
			} else if (levelXport3[0].length > 0 && !port3Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport3);
				irrigavi.plotInfo[levelOptions][i].label = "port 3";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[3];
				port3Done = true;
			} else if (levelXport4[0].length > 0 && !port4Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport4);
				irrigavi.plotInfo[levelOptions][i].label = "port 4";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[4];
				port4Done = true;
			} else if (levelXport5[0].length > 0 && !port5Done) {
				irrigavi.plotInfo.lineArrayObj[level].push(levelXport5);
				irrigavi.plotInfo[levelOptions][i].label = "port 5";
				irrigavi.plotInfo[levelOptions][i].color = irrigavi.plotInfo.defaultColors[5];
				port5Done = true;
			}

		}  // end level 1

}



function plotIt(element, type, title, lineArray, optionsArray) {


	// http://www.jqplot.com/tests/date-axes.php

	clearPlotInstances();

	var lineLegend = {
    		show: true,
            placement: 'insideGrid'
    	};

 	var candleLegend = {
    		show: false
    	};   

	var defaultHighlighter = {
            show: true,
            showMarker: false,
            useAxesFormatters: false,
            formatString: '%d, %.1f'
        };

    var defaultCanvasOverlayOptions = {
    	// http://www.jqplot.com/deploy/dist/examples/kcp_cdf.html
            show: true,
            objects: [
                {dashedHorizontalLine: {
                    name: "line1",
                    lineWidth: 4,
                    dashPattern: [4, 16],
                    y: irrigavi.plotInfo.maxControl,
                    color: "#000000",
                    xOffset: 0,
                    shadow: false,
                    // not very useful as the control line has constant y values
                    //showTooltip: true,
                    //tooltipFormatString: "PCE=%'d",
                    //showTooltipPrecision: 0.5
                }},
                {dashedHorizontalLine: {
                    name: "line2",
                    lineWidth: 4,
                    dashPattern: [4, 16],
                    y: irrigavi.plotInfo.minControl,
                    color: "#000000",
                    xOffset: 0,
                    shadow: false,
                    // not very useful as the control line has constant y values
                    //showTooltip: true,
                    //tooltipFormatString: "PCE=%'d",
                    //showTooltipPrecision: 0.5
                }}
                ]
        };

	var customOverlay = {show: false};
	var customHighlighter = {show: false};

	if (type == "levels" || type == "candlestick") {
		customOverlay = JSON.parse(JSON.stringify(defaultCanvasOverlayOptions));
	}

	if (type == "levels") {
		customHighlighter = JSON.parse(JSON.stringify(defaultHighlighter));
	}

	if (type == "candlestick") {
		var legendObj = JSON.parse(JSON.stringify(candleLegend));
	} else {
		legendObj = JSON.parse(JSON.stringify(lineLegend));
	}

	var earliestDate = irrigavi.plotInfo.ctime.mostRecentDateLocalTime;

	// walk through the data and find the earliest date
	for (var i = 0; i < lineArray.length; i++) {
		for (var j = 0; j < lineArray[i].length; j++) {
			if (Date.parse(lineArray[i][j][0]) < earliestDate) {
				earliestDate = d.parse();
			}
		}
	}

	////////////////////////////////////////////////////////
	// determine if the x-axis timespan needs to be adjusted
	////////////////////////////////////////////////////////

	var desiredTimespan = 0;
	if (irrigavi.plotInfo.ctime.cTimespan == 0) {  // 
		desiredTimespan = irrigavi.plotInfo.ctime.defaultTimespan;
	} else {
		desiredTimespan = irrigavi.plotInfo.ctime.cTimespan;  // set by the user; product of multiplier and increment milliseconds
	}

	var indicatedTimespan = irrigavi.plotInfo.ctime.mostRecentDateLocalTime - earliestDate;
	if (indicatedTimespan == 0) {  // the case where there is only one datapoint
		indicatedTimespan = irrigavi.plotInfo.ctime.defaultTimespan;
	}

	// alert(irrigavi.plotInfo.ctime.mostRecentDateLocalTime + "\n" + earliestDate + "\n" + indicatedTimespan + "\n" + desiredTimespan);
	
	if (indicatedTimespan < desiredTimespan) {
		// no x-axis adjustment necessary
	} else {

		irrigavi.plotInfo.ctime.cMultiplier = 15;  // max x-axis increments for the plot

		if (indicatedTimespan > (15 * (1000 * 60 * 60 * 24 * 30)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "months";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%b-%y";
		} else if (indicatedTimespan > (15 * (1000 * 60 * 60 * 24 * 7)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "months";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%b %#d";
		} else if (indicatedTimespan > (15 * (1000 * 60 * 60 * 24)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "weeks";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%b %#d";
		} else if (indicatedTimespan > (15 * (1000 * 60 * 60)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "days";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%H:%M";
		} else if (indicatedTimespan > (15 * (1000 * 60)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "hours";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%H:%M:%S";
		} else if (indicatedTimespan > (15 * (1000)) ) {
			irrigavi.plotInfo.ctime.cIncrement = "minutes";
			irrigavi.plotInfo.ctime.xAxisFormatstring = "%H:%M:%S";
		}

	} 
	////////////////////////////////////////////////////////
	// x-axis timespan done
	////////////////////////////////////////////////////////

	// make a date string for the x-axis minimum

	//var earlier = dateIntToString( (irrigavi.plotInfo.ctime.mostRecentDate - 
		//(irrigavi.plotInfo.ctime.defaultTimespan) ) );
	var earlier = dateIntToString( (irrigavi.plotInfo.ctime.mostRecentDate - (desiredTimespan) ) );

	if (irrigavi.plotInfo.ctime.cMultiplier == 0) {
		earlier = dateIntToString( (irrigavi.plotInfo.ctime.mostRecentDate - 
			(irrigavi.plotInfo.ctime.defaultMultiplier * irrigavi.plotInfo.ctime.defaultIncrementMilliseconds) ) );
	}

	if (irrigavi.plotInfo.ctime.xAxisTickInterval == "") {
		irrigavi.plotInfo.ctime.xAxisTickInterval = "1 " + irrigavi.plotInfo.ctime.cIncrement;
	}

	//alert("earlier: " + earlier);

	var mostRecent = irrigavi.plotInfo.ctime.mostRecentDate;

	var mr = new Date(irrigavi.plotInfo.ctime.mostRecentDate);

	//alert ("earlier: " + earlier.toUTCString() + "\nmostRecent: " + mostRecent.toUTCString());
	var instanceObject = {};         // an object to catalog the jsPlot object
	instanceObject.label = element;

	instanceObject.obj = $.jqplot(element, lineArray, {

    	title: title,
    	axes:{
    		xaxis: { 
    			renderer: $.jqplot.DateAxisRenderer,
    			label: 'most recent: ' + mr.getHours() + " : " + mr.getMinutes() + " : " + mr.getSeconds() + "\nearlier: " + earlier,
          		labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          		tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          		tickOptions: {
              		// labelPosition: 'middle',
              		//angle: 15,
              		angle: -30,
    				//formatString: '%H:%M:%S' 
    				formatString: irrigavi.plotInfo.ctime.xAxisFormatstring
          		},
          		//min: "01-01-2015 ",
          		min: earlier,
        		//max: mostRecent,
        		max: dateIntToString( (irrigavi.plotInfo.ctime.mostRecentDate + 2000) ),
        		//tickInterval: "1 months"
        		tickInterval: irrigavi.plotInfo.ctime.xAxisTickInterval

    		},

    		yaxis: { 

    			label: irrigavi.plotInfo.yAxisLabel,
    			labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          		min: irrigavi.plotInfo.minMoistureLevel,
        		max: irrigavi.plotInfo.maxMoistureLevel,
        		//lineWidth: 8,
        		tickInterval: irrigavi.plotInfo.tickInterval

    		}
    	},
    	//highlighter: {
        	//show: true,
        	//sizeAdjust: 7.5
      	//},
    	// highlighter: customHighlighter,
    	// intentionally not loading the grid renderer
    	//grid: {                     // see http://www.jqplot.com/docs/files/jqPlotOptions-txt.html
        //drawGridLines: true,        // wether to draw lines across the grid or not.
        //gridLineColor: '#cccccc',   // *Color of the grid lines.
        //background: '#fffdf6',      // CSS color spec for background color of grid.
        //borderColor: '#999999',     // CSS color spec for border around grid.
    	//},
      	//cursor: {
        	//show: false
      	//},
    	// colors are derived from the second row on the corners of the html color picker
    	// http://www.w3schools.com/tags/ref_colorpicker.asp
    	series: optionsArray,
    	canvasOverlay: customOverlay,
    	legend: legendObj
  	});

	// TODO: show this use the JSON.parse(JSON.stingify()) object copy model.... ??
	// http://heyjavascript.com/4-creative-ways-to-clone-objects/
	irrigavi.plotInfo.jqPlotInstances.push(instanceObject);


}

function findTickInterval(stuff) {

	//plotInterval-seconds

	//plotTimespan-seconds

	//array-index

	//while (plotTimespan-seconds / plotInterval-seconds > 10) {

		//array-index--;

		///alert(array-index);

	//}

	//for (var i = 0; i < irrigavi.plotInfo.ctime.milliArray.length; i++) {
		//if (irrigavi.plotInfo.ctime.milliArray[i][0] == plotInterval) {
			//index = 1;
		//}
    //}





	//return interval;
}

function compareNumbers(a, b) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  return a - b;
}


function clearPlotInstances() {

	// nuke the existing jqPlot instances

	var i = 0;

	while (i < irrigavi.plotInfo.jqPlotInstances.length) { 

		// this is a jqPlot method
		// http://www.jqplot.com/docs/files/jqplot-core-js.html#jqPlot.destroy
		irrigavi.plotInfo.jqPlotInstances[i].obj.destroy();
		// remove the remaining object shell from the array
		irrigavi.plotInfo.jqPlotInstances.splice(i, 1);

	}
}

function chartRedraw(index) {

		irrigavi.plotInfo.jqPlotInstances[index -1].obj.redraw();

}

function isInteger(data) {
	// http://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript/27424770#27424770
	if (+data===parseInt(data)) {return true} else {return false}
}

function syncSensorData(sensorPack) {

	//////////////////////////////////////////////////////////////////
	//////////////// sync unsaved data ( irrigavi.sensorData[] ) /////
	//////////////// and localStroage data                      //////
	//////////////////////////////////////////////////////////////////

	var prefix = "sensorLSdata-";

	var lsKey = prefix.concat(sensorPack);

	if (irrigavi.sensorData.length < 1) {
		// nothing to sync
		alert("nothing to save");
		return
	}

  ///////////////////////////////////////////////////////////////////
  //                        re-write local storage
  //
  // localstorage.getItem('sensorPacks') gets:   "{"sensorPacks" : [{"label":"hose test","domain":"d1","crop":"cc"}] } "
  // // http://stackoverflow.com/questions/23805377/localstorage-getitem-logsobject-object
  ///////////////////////////////////////////////////////////////////

  var interiorArray = [];
  // get current values from localstorage
  var lsContent = localStorage.getItem(lsKey);

  if (lsContent != null) {
  	console.log("content from disk: " + lsContent + " type: " + typeof(lsContent) + " len: " + lsContent.length);
  } else {

  }

  if (lsContent != null) {
  	var lsObject = JSON.parse(lsContent);
    console.log("object: " + JSON.stringify(lsObject));
      $.each(lsObject, function (index, value) {
      	console.log("sync value: " + JSON.stringify(value));
        interiorArray.push(value);
      });
  }

  for (var i = 0; i < irrigavi.sensorData.length; i++) {
  	interiorArray.push(JSON.stringify(irrigavi.sensorData[i]));
  }

  if (interiorArray.length > 0) {
  	localStorage.setItem(lsKey, JSON.stringify(interiorArray));
  }

  // TODO: check the size of the item and issue a warning if > 2Mb

  irrigavi.dataIsSynced = true;


}

function initPlotInfoObj() {
	
    irrigavi.plotInfo.lineArrayObj = {};
    irrigavi.plotInfo.jqPlotInstances = [];
    irrigavi.plotInfo.visibleChart = 0;
    irrigavi.plotInfo.yAxisLabel = "moisture";
    irrigavi.plotInfo.tickInterval = 300;
    irrigavi.plotInfo.maxMoistureLevel = 900;
    irrigavi.plotInfo.minMoistureLevel = 0;
    irrigavi.plotInfo.minControl = 0;
    irrigavi.plotInfo.maxControl = 0;
    irrigavi.plotInfo.maxDefaultCropMoistureLevel = 620;
    irrigavi.plotInfo.minDefaultCropMoistureLevel = 310;

    irrigavi.plotInfo.candleOptions = [];
    irrigavi.plotInfo.level1Options = [];
    irrigavi.plotInfo.level2Options = [];
    irrigavi.plotInfo.level3Options = [];

    irrigavi.plotInfo.candleTitle = "";
    irrigavi.plotInfo.level1Title = "";
    irrigavi.plotInfo.level2Title = "";
    irrigavi.plotInfo.level3Title = "";

    irrigavi.plotInfo.level1 = [];
    irrigavi.plotInfo.level2 = [];
    irrigavi.plotInfo.level3 = [];

}
