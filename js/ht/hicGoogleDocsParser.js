
function hicGoogleDocsParser(opts){
	var alreadyHasLoading = $(opts.target).find(".googleDocsParserLoadingElement").size() != 0;
	var $loading_container, loading;
	
	if(!alreadyHasLoading){
		$loading_container = $("<div style='width:40px; height:40px; margin:30px auto' class='googleDocsParserLoadingElement'></div>");
		$(opts.loadingTarget).html($loading_container);
		
		loading = Spinners.create('.googleDocsParserLoadingElement', {
		  radius: 11,
		  height: 7,
		  width: 1.9,
		  dashes: 22,
		  opacity: 0.3,
		  rotation: 950,
		  color: '#000000'
		}).play();
	}
	
	
	

		
	localStorage.clear();
	var sample_url = opts.url;
	var url_parameter = document.location.search.split(/\?url=/)[1]
	var url = url_parameter || sample_url;
	var googleSpreadsheet = new GoogleSpreadsheet();
	googleSpreadsheet.url(url);
	googleSpreadsheet.load(function(result){
		if(result == null){
			hicGoogleDocsParser(opts);
		}
		else{
			if($(opts.target).find(".googleDocsParserLoadingElement").size() != 0){
				$(opts.target).find(".googleDocsParserLoadingElement").remove()	
			}
			createJsonFromGoogleDoc(result,opts);
		}
	});

}


		
function createJsonFromGoogleDoc(result,opts){
	
	var data = result.data;
	var obj = {};
	var th = {};
	var tr = [];
	var trs = [];
	var result = {"th":null,"trs":null};
	
	var errors = {};
	
	/* labels */
	_.each(data,function(v,index){
		if(v.indexOf("#label#:") != -1){
			if(v.indexOf(" ") != -1)
				errors["whiteSpaces"] = {
					"errorType" : "some label has white space..... delete white spaces!",
					"docsUrl" : url
				};
				
			var label = v.replace("#label#:","");
			th[index] = label;
		}
		
	});
	
	/* verify if some label has duplicates*/
	var temp_arr = [];
	_.each(th,function(label){
		temp_arr.push(label);
	})
	if(hasDuplicate(temp_arr)){
		errors["duplicates"] = {
			"errorType" : "some label has duplicate",
			"docsUrl" : url
		}
	}
	
	
	/* contains only values without #label# */
	var new_data = [];
	_.each(data,function(v){
		if(v.indexOf("#label#") == -1)
			new_data.push(escape(v));
	});
	
	
	/* populate the trs */
		var col = 0
		var thisTr = {};
	  	_.each(new_data,function(v){	
			thisTr[th[col]] = unescape(v);
			col++;
	  		if(col == _.keys(th).length){
	  			tr.push(thisTr);
	  			thisTr = {};
	  			col = 0;
			}
	  	});
	
	  	result.th = th;
	  	result.trs = tr;
	  	 
	   
	   	/* CALLBACK */
	if(!_.isEmpty(errors)){
		_.each(errors,function(error){
			googleDocsParserShowErrors(error)
		});
	}
	else{
		eval(opts.callback+"(result,opts)");  
	}
	
	
	
	/* show errors */
	function googleDocsParserShowErrors(errors){
		var error_string = "<div style='font-size:20px; font-weight:bold; margin:5px 0px 5px 0px'>googleDocsParser - ERROR</div></br>"+_.toStr(errors);
		$("body").append("<div style='position:fixed;z-index:99999999; width:100%; color:#fff; top:0px; left:0px; font-family:Helvetica; text-align:center; padding-bottom:20px; background-color:#f00; font-size:11px; opacity:0.9'>"+error_string+"</div>");
	}
	
	
	function hasDuplicate(arr){
	    return (arr.length != _.uniq(arr).length);
	}
}	
		
	

















/*
Updated versions can be found at https://github.com/mikeymckay/google-spreadsheet-javascript
*/var GoogleSpreadsheet, GoogleUrl;
GoogleUrl = (function() {
  function GoogleUrl(sourceIdentifier) {
    this.sourceIdentifier = sourceIdentifier;
    if (this.sourceIdentifier.match(/http(s)*:/)) {
      this.url = this.sourceIdentifier;
      try {
        this.key = this.url.match(/key=(.*?)&/)[1];
      } catch (error) {
        this.key = this.url.match(/(cells|list)\/(.*?)\//)[2];
      }
    } else {
      this.key = this.sourceIdentifier;
    }
    this.jsonCellsUrl = "http://spreadsheets.google.com/feeds/cells/" + this.key + "/od6/public/basic?alt=json-in-script";
    this.jsonListUrl = "http://spreadsheets.google.com/feeds/list/" + this.key + "/od6/public/basic?alt=json-in-script";
    this.jsonUrl = this.jsonCellsUrl;
  }
  return GoogleUrl;
})();
GoogleSpreadsheet = (function() {
  function GoogleSpreadsheet() {}
  GoogleSpreadsheet.prototype.load = function(callback) {
    var intervalId, jsonUrl, safetyCounter, url, waitUntilLoaded;
    url = this.googleUrl.jsonCellsUrl + "&callback=GoogleSpreadsheet.callbackCells";
    $('body').append("<script src='" + url + "'/>");
    jsonUrl = this.jsonUrl;
    safetyCounter = 0;
    waitUntilLoaded = function() {
      var result;
      result = GoogleSpreadsheet.find({
        jsonUrl: jsonUrl
      });
      if (safetyCounter++ > 20 || ((result != null) && (result.data != null))) {
        clearInterval(intervalId);
        return callback(result);
      }
    };
    intervalId = setInterval(waitUntilLoaded, 200);
    if (typeof result != "undefined" && result !== null) {
      return result;
    }
  };
  GoogleSpreadsheet.prototype.url = function(url) {
    return this.googleUrl(new GoogleUrl(url));
  };
  GoogleSpreadsheet.prototype.googleUrl = function(googleUrl) {
    if (typeof googleUrl === "string") {
      throw "Invalid url, expecting object not string";
    }
    this.url = googleUrl.url;
    this.key = googleUrl.key;
    this.jsonUrl = googleUrl.jsonUrl;
    return this.googleUrl = googleUrl;
  };
  GoogleSpreadsheet.prototype.save = function() {
    return localStorage["GoogleSpreadsheet." + this.type] = JSON.stringify(this);
  };
  return GoogleSpreadsheet;
})();
GoogleSpreadsheet.bless = function(object) {
  var key, result, value;
  result = new GoogleSpreadsheet();
  for (key in object) {
    value = object[key];
    result[key] = value;
  }
  return result;
};
GoogleSpreadsheet.find = function(params) {
  var item, itemObject, key, value, _i, _len;
  try {
    for (item in localStorage) {
      if (item.match(/^GoogleSpreadsheet\./)) {
        itemObject = JSON.parse(localStorage[item]);
        for (key in params) {
          value = params[key];
          if (itemObject[key] === value) {
            return GoogleSpreadsheet.bless(itemObject);
          }
        }
      }
    }
  } catch (error) {
    for (_i = 0, _len = localStorage.length; _i < _len; _i++) {
      item = localStorage[_i];
      if (item.match(/^GoogleSpreadsheet\./)) {
        itemObject = JSON.parse(localStorage[item]);
        for (key in params) {
          value = params[key];
          if (itemObject[key] === value) {
            return GoogleSpreadsheet.bless(itemObject);
          }
        }
      }
    }
  }
  return null;
};
GoogleSpreadsheet.callbackCells = function(data) {
  var cell, googleSpreadsheet, googleUrl;
  googleUrl = new GoogleUrl(data.feed.id.$t);
  googleSpreadsheet = GoogleSpreadsheet.find({
    jsonUrl: googleUrl.jsonUrl
  });
  if (googleSpreadsheet === null) {
    googleSpreadsheet = new GoogleSpreadsheet();
    googleSpreadsheet.googleUrl(googleUrl);
  }
  googleSpreadsheet.data = (function() {
    var _i, _len, _ref, _results;
    _ref = data.feed.entry;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      _results.push(cell.content.$t);
    }
    return _results;
  })();
  googleSpreadsheet.save();
  return googleSpreadsheet;
};
/* TODO (Handle row based data)
GoogleSpreadsheet.callbackList = (data) ->*/



