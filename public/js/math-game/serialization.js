var serialization = (function () {
var win = this, doc = win.document;

var toQueryString = (function () {
  var getLegalType = (function () { // Data on types (generally) legal for nesting
    var legalNestings = {
      "[object String]": "string"
      , "[object Number]": "number"
      , "[object Array]": "array"
      , "[object Undefined]": "undefined"
      , "[object Null]": "null"
      , "[object Boolean]": "boolean"
      , "[object NaN]": false
    };
    return function (value) {return legalNestings[getType(value)];};
  })();
  return function toQueryString(o) {
    if (o==null) {return "";}
    var pairs = [], value, multiple, type = {}.toString.call(o)
      , arrayPassed = (type=="[object Array]"), numberPassed = (!arrayPassed && getLegalType(o)==="number");
    if (numberPassed || type=="[object String]") {return encodeURIComponent(o);}
    if (!(type=="[object Object]" || arrayPassed)) {throw new Error("Not an object: "+o);}
    for (var key in o) {
      if (!(o.hasOwnProperty(key))) {continue;}
      key = encodeURIComponent(key);
      value = o[key];
      type = getLegalType(value);
      if (!type) {throw new Error("Illegal value: "+value);}
      else if (type=="array") {
        if (arrayPassed) {throw new Error("Illegal array in array: "+value);}
        multiple = [];
        for (var idx=0, val, len=value.length; idx<len; ++idx) {
          val = value[idx];
          type = getLegalType(val);
          if (!type || type=="array") {throw new Error("Illegal object in array: "+val);}
          multiple.push(key+((val==null)?"":("="+encodeURIComponent(val))));
        }
        pairs = pairs.concat(multiple);
        continue;
      }
      else {
        if (arrayPassed) {
          key = encodeURIComponent(value);
          value = null;
        }
        pairs.push((value==null) ? key : key+"="+encodeURIComponent(value));
      }
    }
    return pairs.join("&");
  };
})();	

var serialize = (function () {
	function putValue(object, name, value) {
		if (name) {
	  	if (name in object) {
				if (!isArray(object[name])) {object[name] = [object[name]];}
				object[name].push(value);
			}
			else {object[name] = value;}
		}
	}
	function getRadioValuesByName(form) {
		var result = {}, inputs = form.getElementsByTagName("input"), item, idx, len;
		for (idx=0, len=inputs.length; idx<len; ++idx) {
			item = inputs[idx];
			if (!(item.name in result) && item.type.toLowerCase()=="radio" && item.checked) {
				result[item.name] = {value: item.value, item: item};
			}
		}
		return result;
	}
	return function (form, json) {
		if (typeof form=="string") {form = doc.getElementById(form);}
		if (!form) {return null;}
		json = !!json;
		var data = {}, items = [].slice.call(form.elements, 0), radios = getRadioValuesByName(form)
			, idx, len, item, tag, type, name, value
			, options, option, optionsIdx, optionsLength;
		var radiosHandled = {};
		for (idx=0, len=items.length; idx<len; ++idx) {
			item = items[idx];
			tag = item.nodeName.toUpperCase();
			type = item.type.toUpperCase();
			name = item.name;
			switch (tag) {
				case "INPUT":
					switch (type) {
						case "TEXT":
						case "HIDDEN":
						case "PASSWORD":
						case "BUTTON":
						case "SUBMIT":
						case "CANCEL":
							putValue(data, name, item.value);
						break;
						case "RADIO":
							var radioValue;
							if (radios[name] && !radiosHandled[name]) {
								putValue(data, name, radios[name].value);
								radiosHandled[name] = true;
							}
						break;
						default:
							//throw new Error("unhandled type of form element tag: "+tag+" ("+type+")");
						break;
					}
				break;
				case "SELECT":
					switch (type) {
						case "SELECT-ONE":
							putValue(data, name, item.options[item.selectedIndex].value);
						break;
						case "SELECT-MULTIPLE":
							if (item.selectedIndex>-1) {
								options = [].slice.call(item.options, 0);
								for (optionsIdx=item.selectedIndex, optionsLength=options.length; optionsIdx<optionsLength; ++optionsIdx) {
									option = options[optionsIdx];
									if (option.selected) {
										putValue(data, name, option.value);
									}
								}
							}
						break;
						default:
							console.error("unhandled type of form element tag: "+tag+" ("+type+")");
						break;
					}
				break;
				default:
					//throw new Error("unhandled form element tag: "+tag+" ("+type+")");
				break;
			}
		}
		return json ? data : toQueryString(data);
	};
})();

return {
	"serialize": serialize
	, "toQueryString": toQueryString
};

})();