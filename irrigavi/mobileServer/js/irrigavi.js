
/*
 * irrigavi.js
 *
 * Cord Phelps
 * Copyright 2015, MIT License
 * http://www.opensource.org/licenses/MIT
 *
*/

function localVars() {

  // data structure
  //
  // 

    // this.domains = "";  // string from localStorage  ENFORCE plural  (see buidlEditWrapper() and buttonControl() )

    this.domainData = {    // ENFORCE singular + 'Data'
      domains: [],    // an array of domain objects   ENFORCE plural
      template : {    // labels for the text edit fields for creating a new domain
        label: "domain name"
        //address: "street address"
      },
      uniqueAttrString : "domainAttr",
      jqmLabel : "domainjqmLabel",
      empty : true,
      indexSelected  : 0,
      labelSelected : ""
    };

    this.cropData = {    // ENFORCE singular + 'Data'
      crops: [],    // an array of crop objects   ENFORCE plural
      template : {    // labels for the text edit fields for creating a new crop
        label: "crop name",
        max: 0,     // set by this.maxDefaultCropMoistureLevel
        min: 0      // set by this.minDefaultCropMoistureLevel
      },
      uniqueAttrString : "cropAttr",
      jqmLabel : "cropjqmLabel",
      empty : true,
      indexSelected  : 0,
      labelSelected : ""
    };

    this.sensorPackData = {    // ENFORCE singular + 'Data'
      sensorPacks: [],    // an array of sensor pack objects   ENFORCE plural
      template : {    // labels for the text edit fields for creating a new sensorPack
        label: "sensor pack name",
        domain: "domain",
        crop: "crop",
        ports: {       // ports in use, by level
          level1: [],
          level2: [],
          level3: []
        }             
      },
      uniqueAttrString : "sensorPackAttr",
      jqmLabel : "sensorPackjqmLabel",
      empty : true,
      indexSelected  : 0,
      labelSelected : ""
    };

    this.sensorData = [];   // the actual data read from the sensors
    this.sensorStoreData = [];   // array for localStorage
    this.selectedSensorPackIndex = 0;
    this.selectedSensorPack = "";
    this.selectedDomain = "";
    this.selectedCrop = "";
    this.selectedPorts = [];

    this.editWrapperContents = [];
    this.uniqueLabelBase = "jqmLabel";
    this.uniqueAttrBase = "idAttr";
/*
    this.domainLabelSelected = "";
    this.domainIndexSelected = 0;
    */

    this.maxOptions = 10;    // for the selects
    this.maxSensors = 6;
    this.timezoneOffset = 0;  // difference in minutes
    this.geoHash = "aaaaa";
    this.sampleData = false;
    this.dataIsSynced = false;
    this.dataIsAvailable = false;      // no data collected so far

    this.plotInfo = {};
    this.plotInfo.lineArrayObj = {};
    this.plotInfo.jqPlotInstances = [];
    this.plotInfo.visibleChart = 0;
    this.plotInfo.yAxisLabel = "moisture";

    this.plotInfo.ctime = {};
    this.plotInfo.ctime.incrementArray = ["months", "weeks", "days", "hours", "minutes", "seconds"];
    this.plotInfo.ctime.multiplierOK = true;
    this.plotInfo.ctime.defaultIncrement = "months";
    this.plotInfo.ctime.defaultMultiplier = 3;
    this.plotInfo.ctime.defaultIncrementMilliseconds = (1000 * 60 * 60 * 24 * 30);
    this.plotInfo.ctime.defaultTimespan = (1000 * 60 * 60 * 24 * 30 * 3);
    this.plotInfo.ctime.cIncrement = "months"; // defines jqPlot xAxis interval

    this.plotInfo.ctime.xAxisTimespan = (1000 * 60 * 60 * 24 * 30 * 3);
    this.plotInfo.ctime.xAxisTickInterval = "";
    this.plotInfo.ctime.xAxisFormatstring = "";
    this.plotInfo.ctime.mostRecentDate = 0;     // UTC since 1970; javascript numbers are always stored as double precision floating point numbers
    this.plotInfo.ctime.mostRecentDateLocalTime = 0;
    this.plotInfo.ctime.cMultiplier = 0;
    this.plotInfo.ctime.cMaxMultiplier = 0;
    this.plotInfo.ctime.cIncrementMilliseconds = 0;   // milliHash index 2
    this.plotInfo.ctime.cTimespan = 0;
    this.plotInfo.ctime.milliHash = {   
    // [ default-multiplier, max-multiplier, base milliseconds, formatString ]
    // when charting months, for 3 months chosen as the x-axis default timespan, 3 months in milliseconds = 3 * (1000 * 60 * 60 * 24 * 30)
    // the user may adjust the timespan by changing the multiplier up to the max-multiplier
                    months: [3, 15, (1000 * 60 * 60 * 24 * 30), "%b-%y"],  
                    weeks: [5, 16, (1000 * 60 * 60 * 24 * 7), "%b %#d"],
                    days: [8, 16, (1000 * 60 * 60 * 24), "%D"],
                    hours: [6, 16, (1000 * 60 * 60), "%H"],
                    minutes: [5, 15, (1000 * 60), "%H:%M"],
                    seconds: [5, 15, 1000, "%H:%M:%S"]
                  };

    //this.plotInfo.ctime.milliArray = [  
                    //["months", 3, 15, (1000 * 60 * 60 * 24 * 30)],  
                    //["weeks", 5, 16, (1000 * 60 * 60 * 24 * 7)],
                    //["days", 8, 16, (1000 * 60 * 60 * 24)],
                    //["hours", 6, 16, (1000 * 60 * 60)],
                    //["minutes", 5, 15, (1000 * 60)],
                    //["seconds", 5, 15, 1000]
                  //];

    this.plotInfo.tickInterval = 300;
    this.plotInfo.maxMoistureLevel = 900;
    this.plotInfo.minMoistureLevel = 0;
    this.plotInfo.minControl = 0;
    this.plotInfo.maxControl = 0;
    this.plotInfo.maxDefaultCropMoistureLevel = 620;
    this.plotInfo.minDefaultCropMoistureLevel = 310;
    this.plotInfo.defaultColors = ['#009933', '#006699', '#3333FF', '#CC00CC', '#CC0000', '#CCCC00'];

    this.env = {};
    this.env.mobile = false;
    this.env.internet = false;
    this.env.ios = false;

}


function initialize() {

  irrigavi = new localVars;  // scope is global without 'var', irrigavi is the *app name*

  var d = new Date();
  irrigavi.timezoneOffset = d.getTimezoneOffset();

  // set geoHash here


  $("#start").on("pagebeforeshow", function( event ) {

    $("#scanErrorText").hide().trigger('updatelayout');

    $('#measureBtn').button('disable');

    $('#observedSensorPack').selectmenu("disable");

    refreshSelectsFromLS('sensorPacks', irrigavi.maxOptions, irrigavi.sensorPackData, 'observedSensorPack');

    // console.log("FINISHED (the JSON.parse error is not me)");

  });



  $('#measureContent').bind('swipeleft swiperight click', function(e) { 
    
    //alert("rotate: " + JSON.stringify(e));

    if (!irrigavi.dataIsAvailable) {  
      return
    }

    if (e.origType == "swipeleft") {
      rotateCharts("left");
    }
    else {
      rotateCharts("right");
    }

  } );
  

    $("#sampleData").on("change", function() {

      // console.log($("#agreeSelector").val());
      if ($("#sampleData").val() === "1") {
        irrigavi.sampleData = true;
        irrigavi.plotInfo.ctime.xAxisTimespan = ( (1000 * 60 * 60 * 24 * 30) * 3 ) ;

      } else {
        alert("false");
        irrigavi.sampleData = false;
      }

      // local storage is set when the back button is selected
      // localStorage.setItem("agreePublicDomain", agreePublicDomain);

    });

    $("#chartTimespan").on("keyup", function() {

      var currentValue = $("#chartTimespan").val();

      if (currentValue === "") {
        // that was probably a backspace over the current value
        // or, it might be the result of trying to change and then 
        // deciding not to so reset to 3 months
        irrigavi.plotInfo.ctime.cTimespan = (irrigavi.plotInfo.ctime.cMultiplier * irrigavi.plotInfo.ctime.cIncrementMilliseconds);
        return false;

      } else {
        // verify integer
        var tempString = cleanString( currentValue );

        if (!isInteger(tempString) ) {

          alert("invalid integer: " + tempString);
          irrigavi.plotInfo.ctime.cTimespan = (irrigavi.plotInfo.ctime.cMultiplier * irrigavi.plotInfo.ctime.cIncrementMilliseconds);
          $("#chartTimespan").parent().css("background-color", "#FF9966");  // orange
          return false;

        }

        else if (currentValue > irrigavi.plotInfo.ctime.cMaxMultiplier || currentValue < 1) {
          alert("value out of range: " + currentValue + "\nmust be > 0 and < " + irrigavi.plotInfo.ctime.cMaxMultiplier);
          irrigavi.plotInfo.ctime.cTimespan = (irrigavi.plotInfo.ctime.cMultiplier * irrigavi.plotInfo.ctime.cIncrementMilliseconds);
          $("#chartTimespan").parent().css("background-color", "#FF9966");  // orange
          return false;

        }
        else {

          $("#chartTimespan").parent().css("background-color", "#FFFFFF");  // white
          irrigavi.plotInfo.ctime.cMultiplier = currentValue;
          irrigavi.plotInfo.ctime.cTimespan = (currentValue * irrigavi.plotInfo.ctime.cIncrementMilliseconds);
          return true;

        }


      }

    });

  $("#options").on("pagebeforeshow", function( event ) {

    //var months = irrigavi.plotInfo.ctime.xAxisTimespan / (1000 * 60 * 60 * 24 * 30);

    //$('#chartTimespan').val(months).textinput("refresh");

    if (irrigavi.plotInfo.ctime.cMultiplier == 0) {  // use the default values if the options have not changed

      $('#chartTimespan').val(irrigavi.plotInfo.ctime.defaultMultiplier).textinput("refresh");
        // http://stackoverflow.com/questions/16471575/jquery-changing-select-not-working-properly
        // in the default case, we know the 0 index matches the default time increment "months"
      $('#select-time').prop('selectedIndex', 0).selectmenu('refresh', true).trigger('updatelayout');

    } else {  // the time options have changed, so update select and textinput to those values

      $('#chartTimespan').val(irrigavi.plotInfo.ctime.cMultiplier).textinput("refresh");

      // use the previously selected string ctime.cIncrement to update the select 
      for (var i = 0; i < irrigavi.plotInfo.ctime.incrementArray.length; i++){

        if (irrigavi.plotInfo.ctime.incrementArray[i] == irrigavi.plotInfo.ctime.cIncrement) {

          $('#select-time').prop('selectedIndex', i).selectmenu('refresh', true).trigger('updatelayout');

        }

      }  // end for

    }  // end of else



    if (!irrigavi.sampleData) {

      $("#sampleData").val("0");

    } else {

      $("#sampleData").val("1");

    }


  });


  $("#options").on("pagebeforehide", function( event ) {

    // timespan value is managed via the keyup event
    
    
  });

 


  console.log("initialize complete");


} /* end of initialize() */

function rotateCharts(direction) {

  buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'levels');
  buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'candlestick');

  if (direction == "left") {

      if (irrigavi.plotInfo.visibleChart == 0) {

        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');

        $("#textWrapper").show().trigger('updatelayout');
        irrigavi.plotInfo.visibleChart = 5;
        maxedOut = true;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 1) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel0Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel0', 'levels', irrigavi.plotInfo.level0Title, irrigavi.plotInfo.lineArrayObj.level0, irrigavi.plotInfo.level0Options);
        irrigavi.plotInfo.visibleChart = 0;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 2) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel1Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel1', 'levels', irrigavi.plotInfo.level1Title, irrigavi.plotInfo.lineArrayObj.level1, irrigavi.plotInfo.level1Options);
        irrigavi.plotInfo.visibleChart = 1;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 3) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel2Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel2', 'levels', irrigavi.plotInfo.level2Title, irrigavi.plotInfo.lineArrayObj.level2, irrigavi.plotInfo.level2Options);
        irrigavi.plotInfo.visibleChart = 2;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 4) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');

        $("#chartLevel3Wrapper").show().trigger('updatelayout');
        //buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'levels');
        plotIt('chartLevel3', 'levels', irrigavi.plotInfo.level3Title, irrigavi.plotInfo.lineArrayObj.level3, irrigavi.plotInfo.level3Options);
        irrigavi.plotInfo.visibleChart = 3;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 5) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartCandleWrapper").show().trigger('updatelayout');
        //buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'candlestick');
        plotIt('chart', 'candlestick', irrigavi.plotInfo.candleTitle, irrigavi.plotInfo.lineArrayObj.candleData, irrigavi.plotInfo.candleOptions);
        irrigavi.plotInfo.visibleChart = 4;
        return;

      } else {

        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

      }


  } else {

       if (irrigavi.plotInfo.visibleChart == 4) {

        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');

        $("#textWrapper").show().trigger('updatelayout');
        irrigavi.plotInfo.visibleChart = 5;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 5) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel0Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel0', 'levels', irrigavi.plotInfo.level0Title, irrigavi.plotInfo.lineArrayObj.level0, irrigavi.plotInfo.level0Options);
        irrigavi.plotInfo.visibleChart = 0;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 0) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel1Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel1', 'levels', irrigavi.plotInfo.level1Title, irrigavi.plotInfo.lineArrayObj.level1, irrigavi.plotInfo.level1Options);
        irrigavi.plotInfo.visibleChart = 1;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 1) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartLevel2Wrapper").show().trigger('updatelayout');
        plotIt('chartLevel2', 'levels', irrigavi.plotInfo.level2Title, irrigavi.plotInfo.lineArrayObj.level2, irrigavi.plotInfo.level2Options);
        irrigavi.plotInfo.visibleChart = 2;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 2) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');

        $("#chartLevel3Wrapper").show().trigger('updatelayout');
        //buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'levels');
        plotIt('chartLevel3', 'levels', irrigavi.plotInfo.level3Title, irrigavi.plotInfo.lineArrayObj.level3, irrigavi.plotInfo.level3Options);
        irrigavi.plotInfo.visibleChart = 3;
        return;

      } else if (irrigavi.plotInfo.visibleChart == 3) {

        $("#textWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

        $("#chartCandleWrapper").show().trigger('updatelayout');
        //buildPlotArray(irrigavi.selectedSensorPack, irrigavi.sensorData, 'candlestick');
        plotIt('chart', 'candlestick', irrigavi.plotInfo.candleTitle, irrigavi.plotInfo.lineArrayObj.candleData, irrigavi.plotInfo.candleOptions);
        irrigavi.plotInfo.visibleChart = 4;
        return;

      } else {

        $("#chartCandleWrapper").hide().trigger('updatelayout');
        $("#chartLevel0Wrapper").hide().trigger('updatelayout');
        $("#chartLevel1Wrapper").hide().trigger('updatelayout');
        $("#chartLevel2Wrapper").hide().trigger('updatelayout');
        $("#chartLevel3Wrapper").hide().trigger('updatelayout');

      }

     

  }

}



function clearLog(element) {

  //$('#logTextArea').val(""); // new 
  $('#' + element).val("");
}

function updateLog(newString, element) {

  //var tempString = $('#logTextArea').val();
  var tempString = $('#' + element).val();
  tempString = tempString + "\n" + newString;
  //$('#logTextArea').val(tempString);
  $('#' + element).val(tempString);

  console.log("updateLog: " + tempString);

}

function cleanString(string) {

  if (typeof(string) == 'undefined') {
    return ""
  }
  else if (string.length > 20 ) {
    // http://stackoverflow.com/questions/1301512/truncate-a-string-straight-javascript  "chop"
    string = string.substring(0,19);
  }
  else if (string.length == 0) {
    return ""
  }
    //console.log("label step 1: " + newFavorite.label);
  string = string.replace(/[<>]/g, "");       //    html ; remove all '<' and '>' (if any)
  string = string.replace(/[\/]/g, "");   // 
  string = string.replace(/[\\]/g, "");   // 
  string = string.replace(/[\"]/g, " ");      //    json protection
  string = string.replace(/[\']/g, " ");      //    json protection
  string = string.replace(/[\[\]]/g, " ");    //    json protection
  string = string.replace(/[{}]/g, " ");      //    json protection
  string = string.replace(/[,]/g, " ");       //    json protection
  string = string.replace(/[:]/g, " ");       //    json protection
  string = string.replace(/[\s]/g, " ");      // replace whitespace with space

  if (string.length == 0 ) {
    // update pagecontainerbeforeshow to re-enable the button and un-hide the matrix
    return "";
  }
  // check for all spaces
  var spaces = string.replace(/[\ ]/g, "");
  if (spaces.length == 0) {
    // that was all spaces
    return "";
  }

  return string

}

function cleanHTMLid(string) {

  // using user labels plus an index to create html id attributes; these may not contain whitespace
  // http://www.w3schools.com/tags/att_global_id.asp

  // https://css-tricks.com/snippets/javascript/strip-whitespace-from-string/
  string = string.replace(/\s+/g, "");      
  
  return string

}



function manageCheckboxes(element) {

  // http://stackoverflow.com/questions/8422380/jquery-mobile-checkbox-without-a-label?rq=1
  // http://rickluna.com/wp/2012/10/jquery-mobile-checkboxes-without-labels/

  // 'onclick' for all the checkboxes

  // if a port is selected on one level (a column), it may not be selected on another level
  // (this is radio button behavior across the 3 checkbox stacks by port)

  console.log("manageCheckboxes: checkbox element: " + element);

  // determine the referenced stack (a, b, or c) from the element
  // (grab last character of the element)
  var columnChar = element.slice(element.length - 1);
  var rowChar = element.slice(element.length - 2, element.length - 1);

  //console.log('rowChar: ' + rowChar + '   columnChar: ' + columnChar);
  // the id needs to be re-built because the string "element" is immutable (it can't be reduced by one character)


  if (columnChar == 'a') {
    $('#radio-choice-' + rowChar + 'b').prop("checked", false).checkboxradio("refresh");
    $('#radio-choice-' + rowChar + 'c').prop("checked", false).checkboxradio("refresh");
  } else if (columnChar == 'b') {
    $('#radio-choice-' + rowChar + 'a').prop("checked", false).checkboxradio("refresh");
    $('#radio-choice-' + rowChar + 'c').prop("checked", false).checkboxradio("refresh");
  } else {
    $('#radio-choice-' + rowChar + 'a').prop("checked", false).checkboxradio("refresh");
    $('#radio-choice-' + rowChar + 'b').prop("checked", false).checkboxradio("refresh");
  }


}


function clearCheckboxes() {

  console.log("clearCheckboxes");

  var element = "radio-choice-";

  for (var i = 0; i < 6; i++) {
    //$('#' + element + i + 'a')[0].checked = false;
    //$('#' + element + i + 'b')[0].checked = false;
    //$('#' + element + i + 'c')[0].checked = false;
    $('#' + element + i + 'a').prop("checked", false).checkboxradio("refresh");
    $('#' + element + i + 'b').prop("checked", false).checkboxradio("refresh");
    $('#' + element + i + 'c').prop("checked", false).checkboxradio("refresh");
  }
  
}

function readCheckboxes() {

  console.log("readCheckboxes");

  var element = "radio-choice-";
  var levelA = [];
  var levelB = [];
  var levelC = [];

  for (var i = 0; i < 6; i++) {
    if($('#' + element + i + 'a')[0].checked) {
      levelA.push(i);
    }
    if($('#' + element + i + 'b')[0].checked) {
      levelB.push(i);
    }
    if($('#' + element + i + 'c')[0].checked) {
      levelC.push(i);
    }
  }

  alert(levelA + '\n' + levelB + '\n' + levelC);

}

function writeCheckboxes() {

  // http://stackoverflow.com/questions/26423640/on-pagebeforeshow-need-to-check-the-checkbox-using-name-and-value-in-jquery-mobi

}



function refreshSelectsFromLS(lsKey, maxOptions, targetObject, targetElement) {

  // get content form local storage to populate a selectmenu widget
  // save the current labels in an array (to enable duplicate check)
  //
  // arguments  lsKey : the localstorage key, its value is searched for JSON values ('domains', 'sensorPacks')
  //            maxOptions : a limit on the number of selects
  //            targetObject : the (global) repository for current data associated with a select (irrigavi.domainData)
  //            targetElement : the selectmenu widget to be manipulated 'select-domain'  (no quotes)
  //            
  //var lsKey = 'domains';
  //var maxOptions = 10;
  //var targetObject = irrigavi.domainData;
  //var targetElement = 'select-domain';
  //
  // expecting:
  //
  // domains from disk: {"domains" : [{"label":"label 0"},{"label":"label 1"}]} type: string len: 55
  // domains object: {"domains":[{"label":"label 0"},{"label":"label 1"}]}
  //

  //alert("refreshSelectsFromLS inbound lsKey: " + lsKey + "  object: " + JSON.stringify(targetObject));

  targetObject.empty = true;
  targetObject.currentLabels = [];

  var lsKeyChopped = lsKey.replace(/s$/, "");        // trailing 's'  

  var element = targetElement;

  // lsKey = 'domains', need 'Domain' to show the delete button
  // http://forwebonly.com/capitalize-the-first-letter-of-a-string-in-javascript-the-fast-way/
  var capitalizeMe = lsKey.replace(/s$/, "");        // remove trailing 's'
  var pageNameWithUpper = capitalizeMe.charAt(0).toUpperCase() + capitalizeMe.substring(1);
  //console.log("composite: " + "#delete" + pageNameWithUpper + "BtnWrap");


  var lsContent = localStorage.getItem(lsKey);
  //alert("key: " + lsKey + " got localstorage: " + lsContent);

  if (lsContent == null || lsContent.length == 0) {

    console.log("initializing localstorage for: " + lsKey);
    localStorage.removeItem(lsKey);
    localStorage.setItem(lsKey, '{"' + lsKey + '" : ' + '[]' + ' } ');  // new

    console.log("re-built (empty) localstorage: " + lsContent);


  } else  { // found some  

    console.log("from disk: \n" + lsContent + "\ntype: " + typeof(lsContent) + "\nlen: " + lsContent.length);

    //var favoritesObject = JSON.parse(cleanText);
    var lsObject = JSON.parse(lsContent);
    console.log("domains object: " + JSON.stringify(lsObject));

    // http://stackoverflow.com/questions/2241875/how-to-create-an-object-property-from-a-variable-value-in-javascript
    // "You cannot use a variable to access a property via dot notation, instead use the array notation"
    //       $.each(lsObject.domains, function (index, value) {
    $.each(lsObject[lsKey], function (index, value) {

        console.log("index: " + index + " lsKey: " + lsKey + 
          " got one from disc: " + JSON.stringify(lsObject[lsKey]) + 
          " value: " + JSON.stringify(value) + 
          " value.len: " + JSON.stringify(value).length);

      var temp = new Object;

      // examine localstorage 'value' (lsKey is the 'key')

      if (index < maxOptions && value.length != 2) {   // '{}' is an empty favorites list

        console.log(JSON.stringify(targetObject));

        targetObject[lsKey][index] = new Object;

        $.each(value, function(key, localValue){

          console.log(" index " + index + " key " + key + " localValue " + localValue);

          if (key == "label") {
            // got one
            temp.label = localValue;
            targetObject.empty = false;
          } 

          //////// and position irrigavi.sensorPackData.sensorPacks{} to //////////////
          //////// hold complete localStorage info about each sensorPack //////////////

            if (key == "domain") {
              temp.domain = localValue;
            }
            if (key == "crop") {
              temp.crop = localValue;
            }
            if (key == "ports") {
              temp.ports = {};
              temp.ports.level1 = localValue.level1;
              temp.ports.level2 = localValue.level2;
              temp.ports.level3 = localValue.level3;
            }

        });  // end $.each

        ///////////////////////////////////////////////////////////////////
        //  update the currentLabels array
        ///////////////////////////////////////////////////////////////////

        targetObject.currentLabels[targetObject.currentLabels.length] = temp.label;  

        ///////////////////////////////////////////////////////////////////
        //  re-build the targetObject
        ///////////////////////////////////////////////////////////////////

        targetObject[lsKey][index] = temp;

        console.log("targetObject: " + JSON.stringify(targetObject[lsKey][index]) + " index: " + index);

      }   // end if index < maxOptions

      else {   // break out of initial $.each 
        
      }

    });  // end initial $.each (walking through the 'value' (the JSON array) matching the lsKey 'key') 

    console.log("updated: \ncurrentLabels: " + targetObject.currentLabels + " targetObject: \n" + JSON.stringify(targetObject));

  }         // end ls != null

  console.log("WHERE?");
  console.log(JSON.stringify(targetObject));

    //////////////////////////////////////////////////////////////////////////
    // now the drop down list can be re-populated
    //////////////////////////////////////////////////////////////////////////

  if (!targetObject.empty) {

    // http://stackoverflow.com/questions/26666593/how-to-remove-option-element-in-jquery-mobile
    $('#' + targetElement).find('option').remove();
    $('#' + targetElement).selectmenu('refresh', true);

    for (var j=targetObject[lsKey].length - 1; j > -1; j--) {
      // "You cannot use a variable to access a property via dot notation, instead use the array notation"
      console.log("PREPENDING: " + targetObject[lsKey][j].label);
      $('#' + targetElement).prepend("<option id='sel" + j + targetElement + "' value='" + j + "'>" + targetObject[lsKey][j].label + "</option"); 
    }

    // http://stackoverflow.com/questions/20706764/jquery-mobile-not-displaying-correct-selected-item-in-list/20706846#20706846
    $('#sel0' + targetElement).prop('selected', true);
    $('#' + targetElement).selectmenu('refresh', true);

    targetObject.indexSelected = 0;  // new
    targetObject.labelSelected = $('#' + targetElement).find(":selected").text();


  } else {

    console.log("lsKey is apparently empty: " + lsKey + " content: " + lsContent);
    // http://stackoverflow.com/questions/26666593/how-to-remove-option-element-in-jquery-mobile
    $('#' + targetElement).find('option').remove();
    $('#' + targetElement).append("<option id='sel" + 0 + targetElement + "' value='0'>(no " + lsKey + " defined)</option"); 
    $('#sel0' + targetElement).prop('selected', true);
    $('#' + targetElement).selectmenu('refresh', true);

    //irrigavi.cropData.cropIndexSelected = 0;
    //irrigavi.cropData.cropLabelSelected = "";
    targetObject.indexSelected = 0;
    targetObject.labelSelected = "(no " + lsKey + " defined)";

  }

  

  $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');


}    // end function grabExistingFavorites()


function buildEditWrapper (lsKey, targetObject, targetWrapper) {
  //var lsKey = 'domains';
  //var maxOptions = 10;
  //var targetObject = irrigavi.domainData;
  //var targetElement = 'select-domain';

  //
  // this function builds a series of labeled textEdit fields to allow the user
  // to edit, delete, or create a new item
  // the series is composed based on the definition of the template associated with the 
  // targetObject
  //
  // it also creates irrigavi.editWrapperContents[]{} to record details about the
  // newly created textEdit fields
  //

  console.log("buildEditWrapper lsKey: " + lsKey + " targetObject: " + JSON.stringify(targetObject) );

  // http://encosia.com/using-jquery-1-6-to-find-an-array-of-an-objects-keys/
  // these are the actual 'keys' of the template (for 'domains', they are 'label' and 'address')
  var textFieldKeys = $.map(targetObject.template, function(value, key) {return key;});

  // http://stackoverflow.com/questions/27111383/jquery-mobile-form-added-fields-arent-styled
  // http://stackoverflow.com/questions/17786767/adding-dynamically-a-textbox-with-jquery-mobile-style/17786853#17786853

  $("#" + targetWrapper).empty();  
  irrigavi.editWrapperContents = [];   // a global array of labels for targeting textedit content updated by save/edit/delete

  var newFieldStructure = "<div class='ui-field-contain'>";

  // walk through the template array looking for labels for text edit fields
  for (var j=0; j < textFieldKeys.length; j++) {

    console.log('buildEditWrapper looking at lsKey: ' + lsKey);

    var unique = irrigavi.uniqueLabelBase + j;
    console.log ("built id: " + unique  ) ;

    newFieldStructure += "<label for='" + unique + "'>" + textFieldKeys[j] + 
    "</label><input type='text' name='name' id='" + unique + "' value='' >";

    // build a record of the details for each textInput field
    irrigavi.editWrapperContents[j] = new Object;
    irrigavi.editWrapperContents[j].id = unique;
    irrigavi.editWrapperContents[j].fieldKey = textFieldKeys[j];

    /////////////////////////////////////////////////////
    //
    //               handle edit special case
    //
    /////////////////////////////////////////////////////
    if (j == 0) {
      // for j=0, pre-populate the first textInput
      // this is only useful for the edit function (which could go away)
      if (typeof(targetObject[0]) != 'undefined') {
        irrigavi.editWrapperContents[0].fieldKeyValue = targetObject[0].label;
      }
      else {
        // this is the case where the select is actually empty
      }
    }

    if (lsKey == 'sensorPacks') { 
      // ignore the remaining labels for textEdit purposes ; we will use selects

      refreshSelectsFromLS('domains', irrigavi.maxOptions, irrigavi.domainData, 'select-sensorPack-domain');
      refreshSelectsFromLS('crops', irrigavi.maxOptions, irrigavi.cropData, 'select-sensorPack-crop');

      irrigavi.editWrapperContents[1] = new Object;
      irrigavi.editWrapperContents[2] = new Object;

      break;
    }
    

  }  // end of for()


  newFieldStructure += "</div>";

  console.log('EDITWRAPPERCONTENTS: newFieldStructure for append: ' + newFieldStructure);
  // EDITWRAPPERCONTENTS: newFieldStructure for append: <div class='ui-field-contain'><label for='jqmLabel0'>label</label><input type='text' name='name' id='jqmLabel0' value='' ></div>
        
  $(newFieldStructure).appendTo("#" + targetWrapper);
  $("#" + targetWrapper + " :text").textinput();

  //$('#' + irrigavi.editWrapperContents[0].id).find(":selected").text() + " wow";
  // $('#' + irrigavi.editWrapperContents[j].id).val()

  console.log("editWrapperContents: " + JSON.stringify(irrigavi.editWrapperContents));
  // editWrapperContents: [{"id":"jqmLabel0","fieldKey":"label","fieldKeyValue":"sp1"},{},{}]

  $("#" + targetWrapper).show();

}

function saveNewSelectElementDetail (lsKey, targetObject, targetElement) {
  //var lsKey = 'domains';
  //var targetObject = irrigavi.domainData;
  //var targetElement = 'select-domain';

  // editWrapperContents[] is a global array of objects representing a label and value for each required field
  // irrigavi.editWrapperContents{} should be loaded with the user input (a field could be submitted empty)
  // it also captures the element id of the text edit field, see: buildEditWrapper()
  // each field is a separate object
  //
  // for sensorPack: editWrapperContents: [{"id":"jqmLabel0","fieldKey":"label","fieldKeyValue":"sp1"},{},{}]
  // for crops:      editWrapperContents: [{ id="jqmLabel0",  fieldKey="label"}, Object { id="jqmLabel1",  fieldKey="max"}, Object { id="jqmLabel2",  fieldKey="min"}]
  // for domains:    editWrapperContents: [{"id":"jqmLabel0","fieldKey":"label","fieldKeyValue":"d1"},{"id":"jqmLabel1","fieldKey":"address"}] 
  
  //
  // walk through the template array looking for labels for text edit fields
  // get all key values for template keys (roughly, 'field-names') from  the textEdit boxes
  //
  // in the case of lsKey = 'sensorPacks', the contents of the 'domain' and 'crop' fields come from
  // the selects, not from a text edit
  // 
  // check the new content for illegal characters
  //
  // add the new content to the lsKey array
  // update the select
  // update locaStorage
  //

  // TODO check for duplicates
  // for the sensor page, selected d/crops get added ok, if the are not selected they get ignored

  //console.log("saveNewSelectElementDetail(): targetObject: " + JSON.stringify(targetObject) );



  //////////////////////////////////////////////////////////////////////////////
  //
  // examine all text-edit fields for valid content
  // highlight any that are invalid
  //
  //////////////////////////////////////////////////////////////////////////////

  // TODO: this logic doesn't quite work to handle sensorPakc cleanly

  for (var j=0; j < irrigavi.editWrapperContents.length; j++) {

    var tempString = cleanString( $('#' + irrigavi.editWrapperContents[j].id).val() );

    if (tempString.length < 1) {
      alert("invalid string: " + tempString);
      // http://stackoverflow.com/questions/18445711/jquery-mobile-set-textbox-background
      $('#' + irrigavi.editWrapperContents[j].id).parent().css("background-color", "#FF9966");  // orange
      return false
    }
    else if (lsKey == 'crops' && j > 0 && !isInteger(tempString) ) {
      alert("invalid integer: " + tempString);
      $('#' + irrigavi.editWrapperContents[j].id).parent().css("background-color", "#FF9966");  // orange
      return false
    }
    else {
      irrigavi.editWrapperContents[j].fieldKeyValue = tempString;
      $('#' + irrigavi.editWrapperContents[j].id).parent().css("background-color", "#FFFFFF");  // white
    }
    if (lsKey == 'sensorPacks') { 
      // ignore the remaining labels for textEdit purposes ; we will use selects to get the data
      break;
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  // we have usable strings; check the key ='label' value for duplicates
  //
  ////////////////////////////////////////////////////////////////////////////

  //console.log("editWrapperContents: " + JSON.stringify(irrigavi.editWrapperContents));
  // editWrapperContents: [{"id":"jqmLabel0","fieldKey":"label","fieldKeyValue":"cx"}]

  for (var j=0; j < irrigavi.editWrapperContents.length; j++) {
    if (irrigavi.editWrapperContents[j].fieldKey == 'label') {
      // now look for duplicates
      for (var k=0; k < targetObject.currentLabels.length; k++) {
        if (irrigavi.editWrapperContents[j].fieldKeyValue == targetObject.currentLabels[k]) {
          alert("duplicate label!");
          return false;
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  // no duplicates
  //
  ////////////////////////////////////////////////////////////////////////////


  // editWrapperContents[] contains the key/value pairs found in the textInputs
  // for sensorPacks, insert the domain and crop values from the selects
  //console.log("EDITWRAPPERCONTENTS :" + JSON.stringify(irrigavi.editWrapperContents));

  if (lsKey == 'sensorPacks') {   // get values from the selects

    // irrigavi.editWrapperContents.length should be = 3, 
    // irrigavi.editWrapperContents[0] represents the 'label'
    // 
    
    irrigavi.editWrapperContents[1].fieldKey = 'domain';
    if (irrigavi.domainData.labelSelected == "") {
      irrigavi.domainData.labelSelected = "undefined";
    }
    irrigavi.editWrapperContents[1].fieldKeyValue = irrigavi.domainData.labelSelected;
    

    irrigavi.editWrapperContents[2].fieldKey = 'crop';
    if (irrigavi.cropData.labelSelected == "") {
      irrigavi.cropData.labelSelected = "undefined";
    }
    irrigavi.editWrapperContents[2].fieldKeyValue = irrigavi.cropData.labelSelected;  


  }

  //console.log("irrigavi.editWrapperContents: " + JSON.stringify(irrigavi.editWrapperContents));

  ////////////////////////////////////////////////////////////////////////////
  // look through the lsKey template and align the Values to the intended Keys
  // stuffing them into a newObject that can be added to the localstorage item 
  ////////////////////////////////////////////////////////////////////////////



  var newObject = {};
  var textFieldKeys = $.map(targetObject.template, function(value, key) {return key;});

  //console.log("got here: " + textFieldKeys + " editWrapperContents: " + JSON.stringify(irrigavi.editWrapperContents)); 
  // got here: label editWrapperContents: [{"id":"jqmLabel0","fieldKey":"label","fieldKeyValue":"xx"}]

  for (var j=0; j < textFieldKeys.length; j++) {
    // we need the record from irrigavi.editWrapperContents[] having a fieldKey matching this textFieldKey
    for (var k=0; k < irrigavi.editWrapperContents.length; k++) {
      // expecting a 1-to-1 alignment of template keys to textEdit fields....
      if (textFieldKeys[j] == irrigavi.editWrapperContents[k].fieldKey) {
        newObject[textFieldKeys[j]] = irrigavi.editWrapperContents[k].fieldKeyValue;
      }
    }

    if (lsKey == 'sensorPacks') { 

      //newObject.domain = irrigavi.domainData.labelSelected;
      //newObject.crop = irrigavi.cropData.labelSelected;
      newObject.domain = $('#select-sensorPack-domain').find(":selected").text();
      newObject.crop = $('#select-sensorPack-crop').find(":selected").text();

      ////////////////////////////////////////////////////////////////////////
      ////////////////// faux sensor assignment to levels ////////////////////
      ////////////////////////////////////////////////////////////////////////

      newObject.ports = {};
      newObject.ports.level1 = [1, 4, 5];
      newObject.ports.level2 = [2, 0];
      newObject.ports.level3 = [3];



      console.log("LABELSELECTED: " + newObject.domain + " " + newObject.crop);

      // we have everthing we need for a new sensorPack
      break;
    }
    
  }

  //console.log("to be added to ls: " + JSON.stringify(newObject));


  ////////////////////////////////////////////////////////////////////////////
  //                                update
  // 
  ////////////////////////////////////////////////////////////////////////////

  // add the new item to the global object
  //console.log("current targetObject: " + JSON.stringify(targetObject) );
  targetObject[lsKey].push(newObject);
  //console.log("\n saving new object to ls: " + JSON.stringify(targetObject[lsKey]) );



  ///////////////////////////////////////////////////////////////////
  //                        re-write local storage
  //
  // localstorage.getItem('sensorPacks') gets:   "{"sensorPacks" : [{"label":"hose test","domain":"d1","crop":"cc"}] } "
  // notice that this structure is unnecessarily deep (double nested)
  // localStorage.setItem(lsKey, '{"' + lsKey + '" : ' + JSON.stringify(targetObject[lsKey]) + ' } ');
  // // http://stackoverflow.com/questions/23805377/localstorage-getitem-logsobject-object
  ///////////////////////////////////////////////////////////////////
  var interiorArray = [];
  // get current values from localstorage
  var lsContent = localStorage.getItem(lsKey);
  //console.log("content from disk: " + lsContent + " type: " + typeof(lsContent) + " len: " + lsContent.length);

  var lsObject = JSON.parse(lsContent);
    //console.log("domains object: " + JSON.stringify(lsObject));
      $.each(lsObject[lsKey], function (index, value) {
        interiorArray.push(value);
      });

  interiorArray.push(newObject);

  localStorage.setItem(lsKey, '{"' + lsKey + '" : ' + JSON.stringify(interiorArray) + ' } ');



  ///////////////////////////////////////////////////////////////////
  // update the select
  ///////////////////////////////////////////////////////////////////  

  refreshSelectsFromLS(lsKey, irrigavi.maxOptions, targetObject, targetElement);


  if (lsKey == 'sensorPacks') {    // align the (disabled) secondary select visible content with the visible content of the primary select
    ///////////////////////////////////////////////////////////////////
    // look up the expected values of the secondaries and set them
    ///////////////////////////////////////////////////////////////////  
    alignSensorPackSelects();
  }

  // just prior to hide(), erase the text content
  for (var j=0; j < irrigavi.editWrapperContents.length; j++) {
    $('#' + irrigavi.editWrapperContents[j].id).val('');
  }

  // clear the global array
  irrigavi.editWrapperContents = [];
  

  return true

}

function alignSensorPackSelects() {

  // for the sensorPack page, the visible content of the secondary selects 
  // should match that of the primary select

  var temp = new Object;

  
  ///////////////////////////////////////////////////////////////////
  // get selected item from the primary
  ///////////////////////////////////////////////////////////////////
  var primaryValue = $('#select-sensorPack').find(":selected").text(); 
  console.log("that would be: " + primaryValue);

  ///////////////////////////////////////////////////////////////////
  // get current values from localstorage
  ///////////////////////////////////////////////////////////////////
  var lsContent = localStorage.getItem('sensorPacks');
  //console.log("content from disk: " + lsContent + " type: " + typeof(lsContent) + " len: " + lsContent.length);

  ///////////////////////////////////////////////////////////////////
  // look up the expected values of the secondaries 
  ///////////////////////////////////////////////////////////////////  
    var lsObject = JSON.parse(lsContent);
    //alert("sensorPacks object: " + JSON.stringify(lsObject));

    $.each(lsObject["sensorPacks"], function (index, value) {

      //console.log("sensorPacks value: " + JSON.stringify(value) + " label: " + value.label);
      // sensorPacks value: {"label":"sp4-d2-cc","domain":"d2","crop":"cc"}
      var foundIt = false;

          if (primaryValue == value.label) {

          foundIt = true;

          temp.domain = value.domain;
          temp.crop = value.crop;
          //console.log("found it: " + temp.domain + " " + temp.crop);  // looks OK to here

            ///////////////////////////////////////////////////////////////////
            // find the indicies for domain and crop
            ///////////////////////////////////////////////////////////////////

            // taking a shortcut, by referring to irrigavi.domainData.domains 
            // rather than looking them up from localstorage
            //     domains: [{"label":"d1"},{"label":"d2"}] crops: [{"label":"cc"},{"label":"dd"}]
            for (var j=0; j < irrigavi.domainData.domains.length; j++) {
              //console.log("domains[j].label: " + j + "   " + irrigavi.domainData.domains[j].label);
              if (irrigavi.domainData.domains[j].label == temp.domain) {
                temp.domainIndex = j;
              }
            }
            for (j=0; j < irrigavi.cropData.crops.length; j++) {
              if (irrigavi.cropData.crops[j].label == temp.crop) {
                temp.cropIndex = j;
              }
            }

            //console.log("that would be crop index: " + temp.cropIndex + " domain index: " + temp.domainIndex);

            ///////////////////////////////////////////////////////////////////
            // 
            ///////////////////////////////////////////////////////////////////

        }


      if (foundIt) {
        return false;   // (breaks the loop)
      }

    });  // end initial $.each (walking through the 'value' (the JSON array) matching the lsKey 'key') 

  //console.log("NEED TO SET: " + primaryValue + " domain: " + temp.domain + " crop: " + temp.crop);
  //console.log("domains: " + JSON.stringify(irrigavi.domainData.domains) + " crops: " + JSON.stringify(irrigavi.cropData.crops));




  ///////////////////////////////////////////////////////////////////
  // adjust the secondary selects
  ///////////////////////////////////////////////////////////////////

  // http://stackoverflow.com/questions/16471575/jquery-changing-select-not-working-properly
  $('#select-sensorPack-domain').prop('selectedIndex', temp.domainIndex).selectmenu('refresh', true).trigger('updatelayout');
  $('#select-sensorPack-crop').prop('selectedIndex', temp.cropIndex).selectmenu('refresh', true).trigger('updatelayout');

}



function managePageWithSelect(pageName, pageNameWithUpper, data, backPage) {

  // this function sets up page control behavior for
  //
  // - page initialization   .on(pagebeforeshow)
  // - builds selectmenu     .on(vmousedown)
  // - configs .click() backBtn
  // - configs .click() and show/hide of the edit buttons
  // 

  // this function also determines which buttons are present at the presentation of a select menu
  // that contains user contnet.
  //
  //  the buttons control the visibility of the buttonWrappers
  //
  //
  //          NEW     EDIT    SAVE    CANCEL    DELETE 
  //
  //  NEW     no       no     yes     yes       no
  //
  //  EDIT    no       no     yes     yes       no
  //
  //  SAVE    yes      yes*   no      no        yes*
  //
  //  CANCEL  yes      yes*   no      no        yes*
  //
  //  DELETE  yes      yes*   no      no        yes*
  //
  //     (*) only if the select is not empty ( irrigavi.domainData.empty = true )
  //
  //
  //  argument pageNameWithUpper 'Domain' is used to build '#newDomainBtn'
  //
  //  argument pageName 'domain' is used to build '#domainEditWrap'
  //
  //  argument pageName 'domain' is used to build 'domains', the localStorage key
  //
  //  argument data refers to irrigavi.domainData
  //
  //
  //  NOTE: this version disables the concept of EDIT (button is always hidden)
  //        if it needs to be turned on, then SAVE must be enhanced to recognize
  //        EDIT-MODE, *updating* a record rather than *adding* a record
  //
  //


    //////////////////////////////////////
    // pageshow: disable secondary selects plus
    //////////////////////////////////////

    $("#" + pageName).on("pageshow", function( event ) {

      if (pageName == 'sensorPack') {


        // now disable the select function (enable for 'new' sensor group)
        // http://stackoverflow.com/questions/19330101/how-to-enable-and-disable-selectmenu-jquery-mobile
        $('#select-' + pageName + '-crop').selectmenu("disable");
        $('#select-' + pageName + '-domain').selectmenu("disable");

        $('#probesBtn').button('disable');

      }

    });


    //////////////////////////////////////
    // pagebeforeshow: refresh the selects 
    //////////////////////////////////////

    $("#" + pageName).on("pagebeforeshow", function( event ) {


      if (pageName == 'sensorPack') { 

        $('#select-' + pageName).selectmenu("enable");

        refreshSelectsFromLS('sensorPacks', irrigavi.maxOptions, irrigavi.sensorPackData, 'select-sensorPack');
        //console.log("did sensorPacks ");
        // ignore the remaining labels for textEdit purposes ; we will use selects
        refreshSelectsFromLS('domains', irrigavi.maxOptions, irrigavi.domainData, 'select-sensorPack-domain');
        //console.log("did domains ");
        refreshSelectsFromLS('crops', irrigavi.maxOptions, irrigavi.cropData, 'select-sensorPack-crop');
        //console.log("did crops ");

        alignSensorPackSelects();

      } else if (pageName == 'domain') {

        refreshSelectsFromLS(pageName + 's', irrigavi.maxOptions, irrigavi.domainData, 'select-' + pageName);

      } else if (pageName == 'crop') {

        refreshSelectsFromLS(pageName + 's', irrigavi.maxOptions, irrigavi.cropData, 'select-' + pageName);

      } 
      

      $("#" + pageName + "EditWrap").hide().trigger('updatelayout');

      $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#save" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      $("#cancel" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

        // disabled
        //$("#edit" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      if (!irrigavi[pageName + "Data"].empty) {
        $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      } else {
        $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      }

    } );  // end .on("pagebeforeshow)

    ////////////////////////////////
    // configure the primary selects
    ////////////////////////////////

    $('#select-' + pageName).on('vmouseup', function () {

      updateLog("that was mouse up", 'logTextArea');

      //

      data.indexSelected = $('#select-' + pageName).prop("selectedIndex");
      data.labelSelected = $('#select-' + pageName).find(":selected").text();

      updateLog(data.indexSelected, 'logTextArea');

      updateLog('select-' + pageName + ' vmouseup selected ' + 
      ' domain: ' + irrigavi.domainData.labelSelected +
      ' crop: ' + irrigavi.cropData.labelSelected, 'logTextArea');


    });

    $('#select-' + pageName).on('vmouseout', function () {

      // it seems cordova triggers 'vmouseout' at the completion of the select
      // (completion = 'done' for the iOS cylindrical selector gizmo)

      updateLog("that was mouse out", 'logTextArea');


      data.indexSelected = $('#select-' + pageName).prop("selectedIndex");
      data.labelSelected = $('#select-' + pageName).find(":selected").text();

      updateLog(data.indexSelected, 'logTextArea');

      updateLog('select-' + pageName + ' vmouseup selected ' + 
      ' domain: ' + irrigavi.domainData.labelSelected +
      ' crop: ' + irrigavi.cropData.labelSelected, 'logTextArea');


    });


    // $("#select-domain").on('vmousedown', function () {  // also on 'change'
    $('#select-' + pageName).on('vmousedown', function () {  // also on 'change'

    console.log("master select index: " + $('#select-' + pageName).prop("selectedIndex"));
    // irrigavi.domainIndexSelected = $('#select-' + pageName).prop("selectedIndex");
    //irrigavi[pageName + 'IndexSelected'] = $('#select-' + pageName).prop("selectedIndex");
    data.indexSelected = $('#select-' + pageName).prop("selectedIndex"); // new

    // gajotres: http://stackoverflow.com/questions/15031993/jquery-mobile-getting-the-value-of-a-selectmenu
    // irrigavi.domainLabelSelected = $("#select-domain").find(":selected").text();
    // irrigavi[pageName + 'LabelSelected'] = $('#select-' + pageName).find(":selected").text();
    data.labelSelected = $('#select-' + pageName).find(":selected").text(); // new

    //console.log("domainLabelSelected: " + irrigavi.domainLabelSelected + " index: " + irrigavi.domainIndexSelected);
    //irrigavi.domainObjectSelected = irrigavi.domainData.domains[irrigavi.domainIndexSelected];
    //irrigavi[pageName + 'ObjectSelected'] = data[pageName + 's'][irrigavi[pageName + 'IndexSelected']];

    updateLog('select-' + pageName + ' vmousedown selected ' + 
      ' domain: ' + irrigavi.domainData.labelSelected +
      ' crop: ' + irrigavi.cropData.labelSelected, 'logTextArea');


    if (pageName == 'sensorPack') {
      $('#select-' + pageName + '-crop').selectmenu("enable");
      $('#select-' + pageName + '-domain').selectmenu("enable");
      alignSensorPackSelects();
      $('#select-' + pageName + '-crop').selectmenu("disable");
      $('#select-' + pageName + '-domain').selectmenu("disable");
    }



    ////////////////////////////////
    // configure the edit buttons
    ////////////////////////////////

    $("#" + pageName + "EditWrap").hide().trigger('updatelayout');

    $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

    $("#save" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
    $("#cancel" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      // disabled
      //$("#edit" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
    $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

    if (!irrigavi[pageName + "Data"].empty) {
      $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
    } else {
      $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
    }

    });  // end vmousedown function for the primary select

    //////////////////////////////////
    // configure the secondary selects
    //////////////////////////////////

  if (pageName == 'sensorPack') {  // there are 2 secondary selects to configure

    $('#select-' + pageName + '-crop').on('vmousedown', function () {  // also on 'change'
      console.log("Index: " + $('#select-' + pageName + '-crop').prop("selectedIndex"));
      irrigavi.cropData.indexSelected = $('#select-' + pageName + '-crop').prop("selectedIndex"); // new
      irrigavi.cropData.labelSelected = $('#select-' + pageName + '-crop').find(":selected").text(); // new
    });  // end vmousedown function for sensorPack select crop

    $('#select-' + pageName + '-domain').on('vmousedown', function () {  // also on 'change'
      console.log("Index: " + $('#select-' + pageName + '-domain').prop("selectedIndex"));
      irrigavi.domainData.indexSelected = $('#select-' + pageName + '-domain').prop("selectedIndex"); // new
      irrigavi.domainData.labelSelected = $('#select-' + pageName + '-domain').find(":selected").text(); // new

    });  // end vmousedown function for sensorPack select domain


  }

    //////////////////////////////////
    // configure the back buttons
    //////////////////////////////////

    $('#' + pageName + 'BackBtn').click(function() {

            $.mobile.changePage('#' + backPage, { transition: "slide", reverse: false });

    }); // end backbtn click

    $('#' + pageName + 'LogBtn').click(function() {

        $.mobile.changePage('#debugLog', { transition: "slide", reverse: false });

    }); // end backbtn click

    $('#' + pageName + 'DebugBtn').click(function() {

            console.log("clearing localstorage for: " + pageName + "s");
            localStorage.removeItem(pageName + "s");

            data[pageName + "s"] = [];   // completely reset the array, rebuild from localstroage
            data.currentLabels = [];
            data.labelSelected = "";
            data.empty = true;

    }); // end  click



    //////////////////////////////////
    // configure the edit buttons
    //////////////////////////////////

    $("#new" + pageNameWithUpper + "Btn").click(function() {

      //TODO for sensorPack, enable the domain and crop selects

      // TODO for all pages, the primary select should be disabled / re-enabled on save / cancel

      // look for ui-btn-text
      // great summary on hiding jqm buttons
      // http://stackoverflow.com/questions/7053335/jquery-mobile-cannot-hide-submit-button


        //buildEditWrapper ('domains', irrigavi.domainData, 'domainEditWrap');
        buildEditWrapper (pageName + 's', data, pageName + 'EditWrap');

      $("#" + pageName + "SelectWrap").hide().trigger('updatelayout');

      $("#" + pageName + "EditWrap").show().trigger('updatelayout');

      $("#new" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      $("#save" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      $("#cancel" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');      
      $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      if (pageName == 'sensorPack') {
        // now disable the select function (enable for 'new' sensor group)
        // http://stackoverflow.com/questions/19330101/how-to-enable-and-disable-selectmenu-jquery-mobile
        $('#select-' + pageName).selectmenu("disable");

        $('#select-' + pageName + '-crop').selectmenu("enable");
        $('#select-' + pageName + '-domain').selectmenu("enable");

        //$('#probesBtn').text("probe layout").button('enable');
        $('#probesBtn').button('enable');
        $('#probesBtn .ui-btn').parent().text("define probe layout");
      }

      if (pageName == 'crop') {

        $('#jqmLabel1').val(irrigavi.plotInfo.maxDefaultCropMoistureLevel).textinput("refresh");
        $('#jqmLabel2').val(irrigavi.plotInfo.minDefaultCropMoistureLevel).textinput("refresh");

      }



    });

    $("#save" + pageNameWithUpper + "Btn").click(function() {

      //var success = saveNewSelectElementDetail ('domains', irrigavi.domainData, 'select-domain');
      var success = saveNewSelectElementDetail (pageName + 's', data, 'select-' + pageName);

      if (success) {

        $("#" + pageName + "SelectWrap").show().trigger('updatelayout');

        $("#" + pageName + "EditWrap").empty().hide().trigger('updatelayout');

        $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

        $("#save" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
        $("#cancel" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

          // disabled
          //$("#edit" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
        $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

        if (!irrigavi[pageName + "Data"].empty) {
          $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
        } else {
          $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
        }

      }

      if (pageName == 'sensorPack') {
        // now disable the select function (enable for 'new' sensor group)
        // http://stackoverflow.com/questions/19330101/how-to-enable-and-disable-selectmenu-jquery-mobile
        $('#select-' + pageName).selectmenu("enable");

        $('#select-' + pageName + '-crop').selectmenu("disable");
        $('#select-' + pageName + '-domain').selectmenu("disable");

        $('#probesBtn').button('disable');
        //$('#probesBtn').parent().text("define probe layout").trigger('updatelayout');
      }

    });


    $("#edit" + pageNameWithUpper + "Btn").click(function() {

      $("#" + pageName + "SelectWrap").hide().trigger('updatelayout');

      if (data.empty) {   // this is the case where all user defined labels have been deleted
        alert("no content to edit");
        return;
      }

      // otherwise, data.labelSelected points to one of the current user defined strings

      //buildEditWrapper ('domains', irrigavi.domainData, 'domainEditWrap');
      buildEditWrapper (pageName + 's', data, pageName + 'EditWrap');

      // working below
      //$('#' + irrigavi.editWrapperContents[0].id).val(irrigavi.domainLabelSelected).textinput("refresh");
      $('#' + irrigavi.editWrapperContents[0].id).val(data.labelSelected).textinput("refresh"); // new 

      $("#" + pageName + "EditWrap").show().trigger('updatelayout');

      $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#save" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      $("#cancel" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');


    });

    $("#delete" + pageNameWithUpper + "Btn").click(function() {

      // TODO: delete of domain or crop that is associated with a sensorPack should
      // be disallowed

      // 'data{}' is a parameter passed in with managePageWithSelect()
      //alert("data: " + JSON.stringify(data));
      //data: {"crops":[{"label":"z"},{"label":"cc"},{"label":"dd"},{"label":"lime"}],"template":{"label":"crop name",
      //"max":0,"min":0},"uniqueAttrString":"cropAttr","jqmLabel":"cropjqmLabel","empty":false,
      //"indexSelected":0,"labelSelected":"z","currentLabels":["z","cc","dd","lime"]}

      var sensorPackAlert = "delete " + pageName + " definition '" + data.labelSelected + "'\nand any stored data?";
      var basicAlert = "delete " + pageName + " definition '" + data.labelSelected + "' ?";

      if (pageName == "sensorPack") {
        basicAlert = sensorPackAlert;
      }


      if (data.empty) {   // this is the case where all user defined labels have been deleted
        alert("no content to delete");
        return;
      }

      // otherwise, data.labelSelected points to one of the current user defined strings
      //else if (confirm("delete option: " + irrigavi[pageName + 'LabelSelected'])) {
      else if (confirm(basicAlert)) {  // new
        console.log('OK');

        if (pageName == "sensorPack") {
          var lsKey = "sensorLSdata-" + data.labelSelected;
          localStorage.removeItem(lsKey);
        }

        //irrigavi.domainData.domains.splice(irrigavi.domainIndexSelected, 1);
        // data[pageName + 's'].splice(irrigavi[pageName + 'IndexSelected'], 1);
        data[pageName + 's'].splice(data.indexSelected, 1);  // new
        
        // re-write local storage
        // localStorage.setItem('domains', '{"domains" : ' + JSON.stringify(irrigavi.domainData.domains) + ' } ');
        var clearString = JSON.stringify(data[pageName + 's']);
        localStorage.setItem(pageName + 's', '{"'  + pageName + 's' +  '" : ' + clearString + ' } ');
        // refresh
        //refreshSelectsFromLS('domains', irrigavi.maxOptions, irrigavi.domainData, 'select-domain');
        refreshSelectsFromLS(pageName + 's', irrigavi.maxOptions, data, 'select-' + pageName);

      }
      else {
        console.log(' NOT OK');
      }


      $("#" + pageName + "SelectWrap").show().trigger('updatelayout');

      $("#" + pageName + "EditWrap").empty().hide().trigger('updatelayout');


      $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#save" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      $("#cancel" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

        // disabled
        //$("#edit" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      if (!irrigavi[pageName + "Data"].empty) {
        $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      } else {
        $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      }


    });

    $("#cancel" + pageNameWithUpper + "Btn").click(function() {

      $("#" + pageName + "SelectWrap").show().trigger('updatelayout');

      $("#" + pageName + "EditWrap").empty().hide().trigger('updatelayout');

      $("#new" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');

      $("#save" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      $("#cancel" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

        // disabled
        //$("#edit" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      $("#edit" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');

      if (!irrigavi[pageName + "Data"].empty) {
        $("#delete" + pageNameWithUpper + "BtnWrap").show().trigger('updatelayout');
      } else {
          $("#delete" + pageNameWithUpper + "BtnWrap").hide().trigger('updatelayout');
      }

      if (pageName == 'sensorPack') {
        // now disable the select function (enable for 'new' sensor group)
        // http://stackoverflow.com/questions/19330101/how-to-enable-and-disable-selectmenu-jquery-mobile
        $('#select-' + pageName).selectmenu("enable");

        $('#select-' + pageName + '-crop').selectmenu("disable");
        $('#select-' + pageName + '-domain').selectmenu("disable");

        $('#probesBtn').button('disable');
        //$('#probesBtn').parent().text("define probe layout").trigger('updatelayout');
      }

    });

}








