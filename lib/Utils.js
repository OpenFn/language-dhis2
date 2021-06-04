"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeSuccessMessage = composeSuccessMessage;
exports.warnExpectLargeResult = warnExpectLargeResult;
exports.logWaitingForServer = logWaitingForServer;
exports.logApiVersion = logApiVersion;
exports.logOperation = logOperation;
exports.buildUrl = buildUrl;
exports.attribute = attribute;
exports.requestHttpHead = requestHttpHead;
exports.validateMetadataPayload = validateMetadataPayload;
exports.handleResponse = handleResponse;
exports.prettyJson = prettyJson;
exports.getIndicesOf = getIndicesOf;
exports.isLike = isLike;
exports.applyFilter = applyFilter;
exports.parseFilter = parseFilter;
exports.CONTENT_TYPES = exports.dhis2OperatorMap = exports.Log = void 0;

var _lodash = require("lodash");

var _fp = require("lodash/fp");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function composeSuccessMessage(operation) {
  return "".concat(operation, " succeeded. The body of this result will be available in state.data or in your callback.");
}

function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if (!paramOrResourceType) Log.warn(" Missing params or resourceType. This may take a while. This endpoint(".concat(endpointUrl, ") may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result."));
}

function logWaitingForServer(url, params) {
  console.info('Request params: ', _typeof(params) === 'object' && !(params instanceof URLSearchParams) ? prettyJson(params) : params);
  console.info("Waiting for response from ".concat(url));
}

function logApiVersion(apiVersion) {
  var message = apiVersion && apiVersion ? "Using DHIS2 api version ".concat(apiVersion) : ' Attempting to use apiVersion without providing it in state.configuration or in options parameter. You may encounter errors. api_version_missing.';
  if (apiVersion) console.warn(message);else console.warn("Using latest version of DHIS2 api.");
}

function logOperation(operation) {
  console.info("Executing ".concat(operation, " ..."));
}

function buildUrl(path, hostUrl, apiVersion) {
  var pathSuffix = apiVersion ? "/".concat(apiVersion).concat(path) : "".concat(path);
  var url = hostUrl + '/api' + pathSuffix;
  return url;
}

function attribute(attributeId, attributeValue) {
  return {
    attribute: attributeId,
    value: attributeValue
  };
}

function requestHttpHead(endpointUrl, _ref) {
  var username = _ref.username,
      password = _ref.password;
  return _axios["default"].request({
    method: 'HEAD',
    url: endpointUrl,
    auth: {
      username: username,
      password: password
    }
  }).then(function (result) {
    return result.headers['content-length'];
  });
}

function validateMetadataPayload(payload, resourceType) {
  return _axios["default"].request({
    method: 'POST',
    url: "https://play.dhis2.org/dev/api/schemas/".concat(resourceType),
    auth: {
      username: 'admin',
      password: 'distict'
    },
    data: payload
  }).then(function (result) {
    return result.data;
  });
}

function handleResponse(result, state, callback) {
  if (callback) return callback(composeNextState(state, result));
  return composeNextState(state, result);
}

function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

function getIndicesOf(string, regex) {
  var match,
      indexes = {};
  regex = new RegExp(regex);

  while (match = regex.exec(string)) {
    var schemaRef = void 0;

    if (!indexes[match[0]]) {
      indexes[match[0]] = {};
    }

    var hrefString = string.slice(match.index, (0, _lodash.indexOf)(string, '}', match.index) - 1);
    var lastIndex = (0, _lodash.lastIndexOf)(hrefString, '/') + 1;
    schemaRef = (0, _lodash.trim)(hrefString.slice(lastIndex));
    indexes[match[0]][match.index] = schemaRef;
  }

  return indexes;
}

var Log = /*#__PURE__*/function () {
  function Log() {
    _classCallCheck(this, Log);
  }

  _createClass(Log, null, [{
    key: "info",
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

exports.Log = Log;

var _printMessage = function _printMessage(prefix, message) {
  switch (prefix) {
    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN:
      console.warn("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " %s ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN);
      break;

    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR:
      console.error("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " %s ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR);
      break;

    default:
      console.info("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " %s ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).INFO);
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
var _MAIN_TAG = {
  writable: true,
  value: '@openfn'
};

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

var CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel'
};
exports.CONTENT_TYPES = CONTENT_TYPES;