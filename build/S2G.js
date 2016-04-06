"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 Copyright 2011-2013 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
		module.exports = factory();
	} else {
		root.X2JS = factory();
	}
})(window || self, function () {
	return function (config) {
		'use strict';

		var VERSION = "1.2.0";

		config = config || {};
		initConfigDefaults();
		initRequiredPolyfills();

		function initConfigDefaults() {
			if (config.escapeMode === undefined) {
				config.escapeMode = true;
			}

			config.attributePrefix = config.attributePrefix || "_";
			config.arrayAccessForm = config.arrayAccessForm || "none";
			config.emptyNodeForm = config.emptyNodeForm || "text";

			if (config.enableToStringFunc === undefined) {
				config.enableToStringFunc = true;
			}
			config.arrayAccessFormPaths = config.arrayAccessFormPaths || [];
			if (config.skipEmptyTextNodesForObj === undefined) {
				config.skipEmptyTextNodesForObj = true;
			}
			if (config.stripWhitespaces === undefined) {
				config.stripWhitespaces = true;
			}
			config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];

			if (config.useDoubleQuotes === undefined) {
				config.useDoubleQuotes = false;
			}

			config.xmlElementsFilter = config.xmlElementsFilter || [];
			config.jsonPropertiesFilter = config.jsonPropertiesFilter || [];

			if (config.keepCData === undefined) {
				config.keepCData = false;
			}
		}

		var DOMNodeTypes = {
			ELEMENT_NODE: 1,
			TEXT_NODE: 3,
			CDATA_SECTION_NODE: 4,
			COMMENT_NODE: 8,
			DOCUMENT_NODE: 9
		};

		function initRequiredPolyfills() {}

		function getNodeLocalName(node) {
			var nodeLocalName = node.localName;
			if (nodeLocalName == null) // Yeah, this is IE!!
				nodeLocalName = node.baseName;
			if (nodeLocalName == null || nodeLocalName == "") // =="" is IE too
				nodeLocalName = node.nodeName;
			return nodeLocalName;
		}

		function getNodePrefix(node) {
			return node.prefix;
		}

		function escapeXmlChars(str) {
			if (typeof str == "string") return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');else return str;
		}

		function unescapeXmlChars(str) {
			return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
		}

		function checkInStdFiltersArrayForm(stdFiltersArrayForm, obj, name, path) {
			var idx = 0;
			for (; idx < stdFiltersArrayForm.length; idx++) {
				var filterPath = stdFiltersArrayForm[idx];
				if (typeof filterPath === "string") {
					if (filterPath == path) break;
				} else if (filterPath instanceof RegExp) {
					if (filterPath.test(path)) break;
				} else if (typeof filterPath === "function") {
					if (filterPath(obj, name, path)) break;
				}
			}
			return idx != stdFiltersArrayForm.length;
		}

		function toArrayAccessForm(obj, childName, path) {
			switch (config.arrayAccessForm) {
				case "property":
					if (!(obj[childName] instanceof Array)) obj[childName + "_asArray"] = [obj[childName]];else obj[childName + "_asArray"] = obj[childName];
					break;
				/*case "none":
    	break;*/
			}

			if (!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
				if (checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path)) {
					obj[childName] = [obj[childName]];
				}
			}
		}

		function fromXmlDateTime(prop) {
			// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
			// Improved to support full spec and optional parts
			var bits = prop.split(/[-T:+Z]/g);

			var d = new Date(bits[0], bits[1] - 1, bits[2]);
			var secondBits = bits[5].split("\.");
			d.setHours(bits[3], bits[4], secondBits[0]);
			if (secondBits.length > 1) d.setMilliseconds(secondBits[1]);

			// Get supplied time zone offset in minutes
			if (bits[6] && bits[7]) {
				var offsetMinutes = bits[6] * 60 + Number(bits[7]);
				var sign = /\d\d-\d\d:\d\d$/.test(prop) ? '-' : '+';

				// Apply the sign
				offsetMinutes = 0 + (sign == '-' ? -1 * offsetMinutes : offsetMinutes);

				// Apply offset and local timezone
				d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset());
			} else if (prop.indexOf("Z", prop.length - 1) !== -1) {
				d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
			}

			// d is now a local time equivalent to the supplied time
			return d;
		}

		function checkFromXmlDateTimePaths(value, childName, fullPath) {
			if (config.datetimeAccessFormPaths.length > 0) {
				var path = fullPath.split("\.#")[0];
				if (checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path)) {
					return fromXmlDateTime(value);
				} else return value;
			} else return value;
		}

		function checkXmlElementsFilter(obj, childType, childName, childPath) {
			if (childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) {
				return checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);
			} else return true;
		}

		function parseDOMChildren(node, path) {
			if (node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
				var result = new Object();
				var nodeChildren = node.childNodes;
				// Alternative for firstElementChild which is not supported in some environments
				for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
					var child = nodeChildren.item(cidx);
					if (child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
						var childName = getNodeLocalName(child);
						result[childName] = parseDOMChildren(child, childName);
					}
				}
				return result;
			} else if (node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
				var result = new Object();
				result.__cnt = 0;

				var nodeChildren = node.childNodes;

				// Children nodes
				for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
					var child = nodeChildren.item(cidx); // nodeChildren[cidx];
					var childName = getNodeLocalName(child);

					if (child.nodeType != DOMNodeTypes.COMMENT_NODE) {
						var childPath = path + "." + childName;
						if (checkXmlElementsFilter(result, child.nodeType, childName, childPath)) {
							result.__cnt++;
							if (result[childName] == null) {
								result[childName] = parseDOMChildren(child, childPath);
								toArrayAccessForm(result, childName, childPath);
							} else {
								if (result[childName] != null) {
									if (!(result[childName] instanceof Array)) {
										result[childName] = [result[childName]];
										toArrayAccessForm(result, childName, childPath);
									}
								}
								result[childName][result[childName].length] = parseDOMChildren(child, childPath);
							}
						}
					}
				}

				// Attributes
				for (var aidx = 0; aidx < node.attributes.length; aidx++) {
					var attr = node.attributes.item(aidx); // [aidx];
					result.__cnt++;
					result[config.attributePrefix + attr.name] = attr.value;
				}

				// Node namespace prefix
				var nodePrefix = getNodePrefix(node);
				if (nodePrefix != null && nodePrefix != "") {
					result.__cnt++;
					result.__prefix = nodePrefix;
				}

				if (result["#text"] != null) {
					result.__text = result["#text"];
					if (result.__text instanceof Array) {
						result.__text = result.__text.join("\n");
					}
					//if(config.escapeMode)
					//	result.__text = unescapeXmlChars(result.__text);
					if (config.stripWhitespaces) result.__text = result.__text.trim();
					delete result["#text"];
					if (config.arrayAccessForm == "property") delete result["#text_asArray"];
					result.__text = checkFromXmlDateTimePaths(result.__text, childName, path + "." + childName);
				}
				if (result["#cdata-section"] != null) {
					result.__cdata = result["#cdata-section"];
					delete result["#cdata-section"];
					if (config.arrayAccessForm == "property") delete result["#cdata-section_asArray"];
				}

				if (result.__cnt == 0 && config.emptyNodeForm == "text") {
					result = '';
				} else if (result.__cnt == 1 && result.__text != null) {
					result = result.__text;
				} else if (result.__cnt == 1 && result.__cdata != null && !config.keepCData) {
					result = result.__cdata;
				} else if (result.__cnt > 1 && result.__text != null && config.skipEmptyTextNodesForObj) {
					if (config.stripWhitespaces && result.__text == "" || result.__text.trim() == "") {
						delete result.__text;
					}
				}
				delete result.__cnt;

				if (config.enableToStringFunc && (result.__text != null || result.__cdata != null)) {
					result.toString = function () {
						return (this.__text != null ? this.__text : '') + (this.__cdata != null ? this.__cdata : '');
					};
				}

				return result;
			} else if (node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
				return node.nodeValue;
			}
		}

		function startTag(jsonObj, element, attrList, closed) {
			var resultStr = "<" + (jsonObj != null && jsonObj.__prefix != null ? jsonObj.__prefix + ":" : "") + element;
			if (attrList != null) {
				for (var aidx = 0; aidx < attrList.length; aidx++) {
					var attrName = attrList[aidx];
					var attrVal = jsonObj[attrName];
					if (config.escapeMode) attrVal = escapeXmlChars(attrVal);
					resultStr += " " + attrName.substr(config.attributePrefix.length) + "=";
					if (config.useDoubleQuotes) resultStr += '"' + attrVal + '"';else resultStr += "'" + attrVal + "'";
				}
			}
			if (!closed) resultStr += ">";else resultStr += "/>";
			return resultStr;
		}

		function endTag(jsonObj, elementName) {
			return "</" + (jsonObj.__prefix != null ? jsonObj.__prefix + ":" : "") + elementName + ">";
		}

		function endsWith(str, suffix) {
			return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}

		function jsonXmlSpecialElem(jsonObj, jsonObjField) {
			if (config.arrayAccessForm == "property" && endsWith(jsonObjField.toString(), "_asArray") || jsonObjField.toString().indexOf(config.attributePrefix) == 0 || jsonObjField.toString().indexOf("__") == 0 || jsonObj[jsonObjField] instanceof Function) return true;else return false;
		}

		function jsonXmlElemCount(jsonObj) {
			var elementsCnt = 0;
			if (jsonObj instanceof Object) {
				for (var it in jsonObj) {
					if (jsonXmlSpecialElem(jsonObj, it)) continue;
					elementsCnt++;
				}
			}
			return elementsCnt;
		}

		function checkJsonObjPropertiesFilter(jsonObj, propertyName, jsonObjPath) {
			return config.jsonPropertiesFilter.length == 0 || jsonObjPath == "" || checkInStdFiltersArrayForm(config.jsonPropertiesFilter, jsonObj, propertyName, jsonObjPath);
		}

		function parseJSONAttributes(jsonObj) {
			var attrList = [];
			if (jsonObj instanceof Object) {
				for (var ait in jsonObj) {
					if (ait.toString().indexOf("__") == -1 && ait.toString().indexOf(config.attributePrefix) == 0) {
						attrList.push(ait);
					}
				}
			}
			return attrList;
		}

		function parseJSONTextAttrs(jsonTxtObj) {
			var result = "";

			if (jsonTxtObj.__cdata != null) {
				result += "<![CDATA[" + jsonTxtObj.__cdata + "]]>";
			}

			if (jsonTxtObj.__text != null) {
				if (config.escapeMode) result += escapeXmlChars(jsonTxtObj.__text);else result += jsonTxtObj.__text;
			}
			return result;
		}

		function parseJSONTextObject(jsonTxtObj) {
			var result = "";

			if (jsonTxtObj instanceof Object) {
				result += parseJSONTextAttrs(jsonTxtObj);
			} else if (jsonTxtObj != null) {
				if (config.escapeMode) result += escapeXmlChars(jsonTxtObj);else result += jsonTxtObj;
			}

			return result;
		}

		function getJsonPropertyPath(jsonObjPath, jsonPropName) {
			if (jsonObjPath === "") {
				return jsonPropName;
			} else return jsonObjPath + "." + jsonPropName;
		}

		function parseJSONArray(jsonArrRoot, jsonArrObj, attrList, jsonObjPath) {
			var result = "";
			if (jsonArrRoot.length == 0) {
				result += startTag(jsonArrRoot, jsonArrObj, attrList, true);
			} else {
				for (var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
					result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
					result += parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath, jsonArrObj));
					result += endTag(jsonArrRoot[arIdx], jsonArrObj);
				}
			}
			return result;
		}

		function parseJSONObject(jsonObj, jsonObjPath) {
			var result = "";

			var elementsCnt = jsonXmlElemCount(jsonObj);

			if (elementsCnt > 0) {
				for (var it in jsonObj) {

					if (jsonXmlSpecialElem(jsonObj, it) || jsonObjPath != "" && !checkJsonObjPropertiesFilter(jsonObj, it, getJsonPropertyPath(jsonObjPath, it))) continue;

					var subObj = jsonObj[it];

					var attrList = parseJSONAttributes(subObj);

					if (subObj == null || subObj == undefined) {
						result += startTag(subObj, it, attrList, true);
					} else if (subObj instanceof Object) {

						if (subObj instanceof Array) {
							result += parseJSONArray(subObj, it, attrList, jsonObjPath);
						} else if (subObj instanceof Date) {
							result += startTag(subObj, it, attrList, false);
							result += subObj.toISOString();
							result += endTag(subObj, it);
						} else {
							var subObjElementsCnt = jsonXmlElemCount(subObj);
							if (subObjElementsCnt > 0 || subObj.__text != null || subObj.__cdata != null) {
								result += startTag(subObj, it, attrList, false);
								result += parseJSONObject(subObj, getJsonPropertyPath(jsonObjPath, it));
								result += endTag(subObj, it);
							} else {
								result += startTag(subObj, it, attrList, true);
							}
						}
					} else {
						result += startTag(subObj, it, attrList, false);
						result += parseJSONTextObject(subObj);
						result += endTag(subObj, it);
					}
				}
			}
			result += parseJSONTextObject(jsonObj);

			return result;
		}

		this.parseXmlString = function (xmlDocStr) {
			var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
			if (xmlDocStr === undefined) {
				return null;
			}
			var xmlDoc;
			if (window.DOMParser) {
				var parser = new window.DOMParser();
				var parsererrorNS = null;
				// IE9+ now is here
				if (!isIEParser) {
					try {
						parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
					} catch (err) {
						parsererrorNS = null;
					}
				}
				try {
					xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");
					if (parsererrorNS != null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
						//throw new Error('Error parsing XML: '+xmlDocStr);
						xmlDoc = null;
					}
				} catch (err) {
					xmlDoc = null;
				}
			} else {
				// IE :(
				if (xmlDocStr.indexOf("<?") == 0) {
					xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
				}
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlDocStr);
			}
			return xmlDoc;
		};

		this.asArray = function (prop) {
			if (prop === undefined || prop == null) return [];else if (prop instanceof Array) return prop;else return [prop];
		};

		this.toXmlDateTime = function (dt) {
			if (dt instanceof Date) return dt.toISOString();else if (typeof dt === 'number') return new Date(dt).toISOString();else return null;
		};

		this.asDateTime = function (prop) {
			if (typeof prop == "string") {
				return fromXmlDateTime(prop);
			} else return prop;
		};

		this.xml2json = function (xmlDoc) {
			return parseDOMChildren(xmlDoc);
		};

		this.xml_str2json = function (xmlDocStr) {
			var xmlDoc = this.parseXmlString(xmlDocStr);
			if (xmlDoc != null) return this.xml2json(xmlDoc);else return null;
		};

		this.json2xml_str = function (jsonObj) {
			return parseJSONObject(jsonObj, "");
		};

		this.json2xml = function (jsonObj) {
			var xmlDocStr = this.json2xml_str(jsonObj);
			return this.parseXmlString(xmlDocStr);
		};

		this.getVersion = function () {
			return VERSION;
		};
	};
});var S2GNamespace = function S2GNamespace(s) {
	var ns = typeof window !== "undefined" && window !== null ? window : self;

	var parts = s.split('.');
	for (var i = 0; i < parts.length; ++i) {
		ns[parts[i]] = ns[parts[i]] || {};
		ns = ns[parts[i]];
	}

	return ns;
};

S2GNamespace('Autodesk.BIM360.Convert');

(function (Namespace) {
	var S2G = function () {
		function S2G() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, S2G);

			this.options = options;
			this.initialize();
		}

		_createClass(S2G, [{
			key: "initialize",
			value: function initialize() {
				this.x2js = new X2JS({ stripWhitespaces: true });
			}
		}, {
			key: "parseSvgText",
			value: function parseSvgText(svgText) {
				var featureList = [];

				if (!svgText) {
					return featureList;
				}

				var svg_object = this.x2js.xml_str2json(svgText);
				if (!svg_object || !svg_object.svg) {
					console.warn('Invalid SVG text.');
					return featureList;
				}

				var svg_data = svg_object.svg;
				var svg_props = this._getSvgProps(svg_data);

				Object.keys(svg_data).map(function (key, index) {
					switch (key) {
						case S2G.NodeTypes.Rectangle:
						case S2G.NodeTypes.Ellipse:
						case S2G.NodeTypes.Polygon:
						case S2G.NodeTypes.Polyline:
							var feature = new Namespace.S2GFeature(svg_props);
							feature.parse(key, svg_data[key]);
							featureList.push(feature);
							break;
					}
				});

				return featureList;
			}
		}, {
			key: "_getSvgProps",
			value: function _getSvgProps(svgData) {
				var svgProps = {};
				var svgMetadata = {};
				Object.keys(svgData).map(function (key, index) {
					switch (key) {
						case S2G.NodeTypes.Rectangle:
						case S2G.NodeTypes.Ellipse:
						case S2G.NodeTypes.Polygon:
						case S2G.NodeTypes.Polyline:
							// Ingore shape properties
							break;
						case S2G.NodeTypes.Metadata:
							svgMetadata = Object.assign({}, svgData[key]);
							break;
						default:
							var descriptor = Object.getOwnPropertyDescriptor(svgData, key);
							Object.defineProperty(svgProps, key, descriptor);
							break;
					}
				});

				return { svgProps: svgProps, svgMetadata: svgMetadata };
			}
		}]);

		return S2G;
	}();

	// Static attribute for S2G


	S2G.NodeTypes = {
		Rectangle: "rect",
		Ellipse: "ellipse",
		Polygon: "polygon",
		Polyline: "path",
		Metadata: "metadata"
	};

	Namespace.S2G = S2G;
})(Autodesk.BIM360.Convert);
;(function (Namespace) {
	var S2GShape = function () {
		function S2GShape(type, coordinates) {
			_classCallCheck(this, S2GShape);

			this.type = type;
			this.coordinates = [].concat(_toConsumableArray(coordinates));
		}

		_createClass(S2GShape, [{
			key: "parse",
			value: function parse(svgData) {}
		}]);

		return S2GShape;
	}();

	Namespace.S2GShape = S2GShape;
})(Autodesk.BIM360.Convert);
;(function (Namespace) {
	var S2GRectangle = function (_Namespace$S2GShape) {
		_inherits(S2GRectangle, _Namespace$S2GShape);

		function S2GRectangle() {
			var coordinates = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

			_classCallCheck(this, S2GRectangle);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(S2GRectangle).call(this, 'Polygon', coordinates));
		}

		_createClass(S2GRectangle, [{
			key: "parse",
			value: function parse(svgData) {
				var position = svgData.metadata.markup_element._position;
				var size = svgData.metadata.markup_element._size;

				var positions = position.split(' ');
				positions.map(function (value, index, array) {
					array[index] = parseFloat(value, 10);
				});

				var sizes = size.split(' ');
				sizes.map(function (value, index, array) {
					array[index] = parseFloat(value, 10);
				});

				this.coordinates.push(this._generateCoordinates(positions, sizes));
			}
		}, {
			key: "_generateCoordinates",
			value: function _generateCoordinates(positions, sizes) {
				var coordinates = [];

				coordinates.push([positions[0], positions[1]]);
				coordinates.push([positions[0] + sizes[0], positions[1]]);
				coordinates.push([positions[0] + sizes[0], positions[1] - sizes[1]]);
				coordinates.push([positions[0], positions[1] - sizes[1]]);
				coordinates.push([positions[0], positions[1]]);

				return coordinates;
			}
		}]);

		return S2GRectangle;
	}(Namespace.S2GShape);

	Namespace.S2GRectangle = S2GRectangle;
})(Autodesk.BIM360.Convert);
;(function (Namespace) {
	var S2GFeature = function () {
		function S2GFeature() {
			var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_classCallCheck(this, S2GFeature);

			this.type = 'Feature';
			this.geometry = {};
			this.properties = properties;
		}

		_createClass(S2GFeature, [{
			key: "parse",
			value: function parse(type, shapeSvgData) {
				// Insert node props
				var node_props = this._getNodeProps(shapeSvgData);
				this.properties = Object.assign(this.properties, node_props);

				var geo_shape = this._getShapeInstance(type);
				if (geo_shape) {
					geo_shape.parse(shapeSvgData);
					this.geometry = geo_shape;
				}
			}
		}, {
			key: "_getShapeInstance",
			value: function _getShapeInstance(type) {
				switch (type) {
					case Namespace.S2G.NodeTypes.Rectangle:
						return new Namespace.S2GRectangle();
					case Namespace.S2G.NodeTypes.Ellipse:
						console.warn('Unsupport shape: Ellipse');
						return null;
					case Namespace.S2G.NodeTypes.Polygon:
						console.warn('Unsupport shape: Polygon');
						return null;
					case Namespace.S2G.NodeTypes.Polyline:
						console.warn('Unsupport shape: Polyline');
						return null;
				}
			}
		}, {
			key: "_getNodeProps",
			value: function _getNodeProps(svgData) {
				var metadata = Namespace.S2G.NodeTypes.Metadata;
				var svgNodeProps = Object.assign({}, svgData);
				delete svgNodeProps.metadata;

				var svgNodeMetadata = Object.assign({}, svgData.metadata || {});

				return { svgNodeProps: svgNodeProps, svgNodeMetadata: svgNodeMetadata };
			}
		}]);

		return S2GFeature;
	}();

	Namespace.S2GFeature = S2GFeature;
})(Autodesk.BIM360.Convert);
//# sourceMappingURL=S2G.js.map
