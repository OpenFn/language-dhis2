"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUID = generateUID;
exports.isValidUID = isValidUID;
exports.prettyJson = prettyJson;
exports.composeSuccessMessage = composeSuccessMessage;
exports.composeNextState = composeNextState;
exports.warnExpectLargeResult = warnExpectLargeResult;
exports.logWaitingForServer = logWaitingForServer;
exports.buildUrl = buildUrl;
exports.logApiVersion = logApiVersion;
exports.isLike = isLike;
exports.applyFilter = applyFilter;
exports.parseFilter = parseFilter;
exports.MEDIA_TYPES = exports.HTTP_HEADERS = exports.dhis2OperatorMap = exports.HTTP_METHODS = exports.Log = void 0;

var _lodash = require("lodash");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } return method; }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

/**
 * TODO
 *
 * Create a DHIS2 UID-Useful for client generated Ids compatible with DHIS2
 */
function generateUID() {
  return;
}
/**
 * TODO
 *
 * Validate if valid DHIS2 UID
 * @example
 * isValidUID('MmwcGkxy876')
 * // true
 * isValidUID(12345)
 * // false
 *
 */


function isValidUID(target) {
  return true | false;
}
/**
 * Print easy-readable JSON objects, uses JSON.stringify.
 *
 */


function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}
/**
 * Custom logger with timestamps and colors
 *
 */


var Log = /*#__PURE__*/function () {
  function Log() {
    _classCallCheck(this, Log);
  }

  _createClass(Log, null, [{
    key: "info",

    /*
    * For example, \x1b[31m is an escape sequence that will be intercepted by the terminal 
      and instructs it to switch to the red color. 
      In fact, \x1b is the code for the non-printable control character escape. 
      Escape sequences dealing only with colors and styles are also known as ANSI escape code(https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) 
      and are standardized, so therefore they (should) work on any platform
    */
    value: function info(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).INFO, message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN, message);
    }
  }, {
    key: "error",
    value: function error(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR, message);
    }
  }]);

  return Log;
}();
/**
 * Compose success message
 */


exports.Log = Log;

var _printMessage = function _printMessage(prefix, message) {
  switch (prefix) {
    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN:
      console.warn("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgYellow, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN);
      break;

    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR:
      console.error("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgRed, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR);
      break;

    default:
      console.info("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgGreen, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).INFO);
  }
};

var _OPTIONS = {
  writable: true,
  value: {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  }
};
var _COLORS = {
  writable: true,
  value: {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m'
  }
};
var _MAIN_TAG = {
  writable: true,
  value: 'openfn'
};

function composeSuccessMessage(func) {
  var _ref, _ref2, _ref3, _name, _ref4, _ref5;

  return "".concat(func === null || func === void 0 ? void 0 : func.name, "('").concat((_ref = arguments.length <= 1 ? undefined : arguments[1]) !== null && _ref !== void 0 ? _ref : null, "', ").concat(JSON.stringify((_ref2 = arguments.length <= 2 ? undefined : arguments[2]) !== null && _ref2 !== void 0 ? _ref2 : null), ", ").concat(JSON.stringify((_ref3 = arguments.length <= 3 ? undefined : arguments[3]) !== null && _ref3 !== void 0 ? _ref3 : null), ", ").concat((0, _lodash.isEmpty)((_name = (_ref4 = arguments.length <= 4 ? undefined : arguments[4]) === null || _ref4 === void 0 ? void 0 : _ref4.name) !== null && _name !== void 0 ? _name : '-unused-') ? '(state)=>{}' : (_ref5 = arguments.length <= 4 ? undefined : arguments[4]) === null || _ref5 === void 0 ? void 0 : _ref5.name, ") succeeded. The body of this result will be available in state.data or in your callback.");
}
/**
 * Compose next state based on the result of a given operation
 * @param {Object} result - Success result of an http call
 */


function composeNextState(state, result) {
  return _objectSpread({}, state, {
    data: result === null || result === void 0 ? void 0 : result.data,
    references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
  });
}
/**
 * Helper constant for http verbs
 */


var HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
};
/**
 * Warn user when there is too much data expected to be returned on a given resource type
 * @param {string} endpointUrl - endpoint url for a resourceType
 *
 */

exports.HTTP_METHODS = HTTP_METHODS;

function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if ((0, _lodash.isEmpty)(paramOrResourceType)) Log.warn("\x1B[33m Missing params or resourceType. This may take a while\x1B[0m. This endpoint(\x1B[33m".concat(endpointUrl, "\x1B[0m) may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result."));
}
/**
 * Inform user, you are waiting for the server to respond on a given url with params
 *
 */


function logWaitingForServer(url, params) {
  Log.info("url ".concat(url));
  Log.info("params ".concat(prettyJson(params)));
  Log.info("Waiting for server response on ".concat(url, "..."));
}
/**
 * Build url for a given operation
 */


function buildUrl(operation, resourceType, configuration, options) {
  var _options$supportApiVe;

  var pathSuffix = '';

  switch (operation === null || operation === void 0 ? void 0 : operation.name) {
    case 'getSchema':
      pathSuffix = "schemas/".concat(resourceType);
      break;

    case 'getResources':
      pathSuffix = "resources";
      break;

    default:
  }

  var hostUrl = configuration.hostUrl,
      apiVersion = configuration.apiVersion;
  var supportApiVersion = (_options$supportApiVe = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe !== void 0 ? _options$supportApiVe : false;
  var path = supportApiVersion === true ? "".concat(apiVersion !== null && apiVersion !== void 0 ? apiVersion : 'api_version_missing', "/").concat(pathSuffix) : "".concat(pathSuffix);
  var url = hostUrl + '/api/' + path;
  return url;
}
/**
 * Log api version
 */


function logApiVersion(configuration, options) {
  var _options$supportApiVe2;

  var apiVersion = configuration.apiVersion;
  var supportApiVersion = (_options$supportApiVe2 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe2 !== void 0 ? _options$supportApiVe2 : false;
  var message = supportApiVersion === true && apiVersion ? "Using DHIS2 api version \x1B[33m ".concat(apiVersion, "\x1B[0m") : '\x1b[33m Attempting to use apiVersion without providing it in state.configuration\x1b[0m. You may encounter errors.\x1b[33m api_version_missing\x1b[0m. If `supportApiVersion = true` in the `options` parameter, then you need to set `apiVersion` in state.configuration.';
  if (supportApiVersion === true) Log.warn(message);else Log.warn("Using \x1B[33m latest \x1B[0m version of DHIS2 api.");
}

function isLike(string, words) {
  var _words$match;

  var wordsArrary = words === null || words === void 0 ? void 0 : (_words$match = words.match(/([^\W]+[^\s,]*)/)) === null || _words$match === void 0 ? void 0 : _words$match.splice(0, 1);

  var isFound = function isFound(word) {
    var _RegExp;

    return (_RegExp = RegExp(word, 'i')) === null || _RegExp === void 0 ? void 0 : _RegExp.test(string);
  };

  return (0, _lodash.some)(wordsArrary, isFound);
}

var dhis2OperatorMap = {
  eq: _lodash.eq,
  like: isLike
};
exports.dhis2OperatorMap = dhis2OperatorMap;

function applyFilter(arrObject, targetProperty, operator, valueToCompareWith) {
  if (targetProperty && operator && valueToCompareWith) {
    try {
      return (0, _lodash.filter)(arrObject, function (obj) {
        return Reflect.apply(operator, obj, [obj[targetProperty], valueToCompareWith]);
      });
    } catch (error) {
      Log.warn("Returned unfiltered data. Failed to apply custom filter(".concat(prettyJson({
        targetProperty: targetProperty !== null && targetProperty !== void 0 ? targetProperty : null,
        operator: operator !== null && operator !== void 0 ? operator : null,
        value: valueToCompareWith !== null && valueToCompareWith !== void 0 ? valueToCompareWith : null
      }), ") on this collection. The operator you supplied maybe unsupported on this resource at the moment."));
      return arrObject;
    }
  }

  Log.info("No filters applied, returned all records on this resource.");
  return arrObject;
}

function parseFilter(filterExpression) {
  var _filterTokens$;

  var filterTokens = filterExpression === null || filterExpression === void 0 ? void 0 : filterExpression.split(':');
  filterTokens ? filterTokens[1] = dhis2OperatorMap[(_filterTokens$ = filterTokens[1]) !== null && _filterTokens$ !== void 0 ? _filterTokens$ : null] : null;
  return filterTokens;
}

var HTTP_HEADERS = {
  CONTENT_TYPE: 'content-type'
};
exports.HTTP_HEADERS = HTTP_HEADERS;
var MEDIA_TYPES = {
  APP_JSON: {
    value: 'application/json',
    alias: 'json'
  }
};
exports.MEDIA_TYPES = MEDIA_TYPES;
