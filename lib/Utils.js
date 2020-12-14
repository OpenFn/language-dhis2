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
exports.FIELD_TRANSFORMERS = exports.FIELD_FILTERS_PRESETS = exports.FIELD_FILTERS_SYNTAX = exports.OBJECT_FILTER_OPERATORS = exports.CONTENT_TYPES = exports.dhis2OperatorMap = exports.Log = void 0;

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

  return "".concat(func === null || func === void 0 ? void 0 : func.name, "('").concat(JSON.stringify((_ref = arguments.length <= 1 ? undefined : arguments[1]) !== null && _ref !== void 0 ? _ref : null), "', ").concat(JSON.stringify((_ref2 = arguments.length <= 2 ? undefined : arguments[2]) !== null && _ref2 !== void 0 ? _ref2 : null), ", ").concat(JSON.stringify((_ref3 = arguments.length <= 3 ? undefined : arguments[3]) !== null && _ref3 !== void 0 ? _ref3 : null), ", ").concat((0, _lodash.isEmpty)((_name = (_ref4 = arguments.length <= 4 ? undefined : arguments[4]) === null || _ref4 === void 0 ? void 0 : _ref4.name) !== null && _name !== void 0 ? _name : '-unused-') ? '(state)=>{}' : (_ref5 = arguments.length <= 4 ? undefined : arguments[4]) === null || _ref5 === void 0 ? void 0 : _ref5.name, ") succeeded. The body of this result will be available in state.data or in your callback.");
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
 * Warn user when there is too much data expected to be returned on a given resource type
 * @param {string} endpointUrl - endpoint url for a resourceType
 *
 */


function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  // TODO : Refactor to send a HEAD request to read Content-Length header to check the file size before we can send the actual request
  // This will give us a sense of how big the result would be and warn the user, accordingly
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

    case 'getData':
      pathSuffix = resourceType;
      break;

    case 'getMetadata':
      pathSuffix = "metadata";

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

var CONTENT_TYPES = {
  XML: 'application/xml',
  JSON: 'application/json',
  PDF: 'application/pdf',
  CSV: 'application/csv',
  XLS: 'application/vnd.ms-excel'
};
/**
 * The following query parameters are available for customizing your request.
 * Replace with : curl 'https://dhis2.github.io/dhis2-api-specification/spec/metadata_openapi.json' \
  // -H 'Accept: application/json,*/
// -H 'Referer: https://dhis2.github.io/dhis2-api-specification/swagger-ui/' \
// -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36' \
// --compressed

/**
 * To filter the metadata there are several filter operations that can be applied to the returned list of
 *  metadata.
 *  The format of the filter itself is straight-forward and follows the pattern property:operator:value,
 *  where property is the property on the metadata you want to filter on, operator is the
 * comparison operator you want to perform and value is the value to check
 * against (not all operators require value).
 *  Please see the schema , by running getSchema(), to discover which properties are available.
 *  Recursive filtering, ie. filtering on associated objects or collection of objects, are supported as
 *  well.
 *
 * Operators will be applied as logical and query, if you need a or query, use `in` operator.
 * The filtering mechanism allows for recursion.
 * 
 * You can do filtering within collections, e.g. 
 * to get data elements which are members of the "ANC" data element group you can use the following
 *  query using the id property of the associated data element groups:
/api/26/dataElements.json?filter=dataElementGroups.id:eq:qfxEYY9xAl6
 * 
 * The default logical operator applied to the filters are AND which means that all object filters must 
 * be matched. 
 * There are however cases where you want to match on one of several filters (maybe id and code field)
 * and in those cases it is possible to switch the root logical operator from AND to OR using 
 * the rootJunction parameter
 * 
 * Example: Filtering where the logical operator has been switched to OR and now only one of the filters must match to have a result returned
/api/dataElements.json?filter=id:in:[id1,id2]&filter=code:eq:code1&rootJunction=OR
 */

exports.CONTENT_TYPES = CONTENT_TYPES;
var OBJECT_FILTER_OPERATORS = [{
  operator: 'eq',
  types: ['string', 'boolean', 'integer', 'float', 'enum', 'collection', 'date'],
  valueRequired: true,
  description: 'Equality.  Checks for size, for collections',
  example: ''
}, {
  operator: '!eq',
  types: ['string', 'boolean', 'integer', 'float', 'enum', 'collection', 'date'],
  valueRequired: true,
  description: 'Inequality.  Checks for size, for collections',
  example: ''
}, {
  operator: 'eq',
  types: ['string', 'boolean', 'integer', 'float', 'enum', 'collection', 'date'],
  valueRequired: true,
  description: 'Inequality.  Checks for size, for collections',
  example: ''
}, {
  operator: 'like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, match anywhere',
  example: ''
}, {
  operator: '!like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, not match anywhere',
  example: ''
}, {
  operator: '^like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, match start',
  example: ''
}, {
  operator: '!^like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, not match start',
  example: ''
}, {
  operator: '$like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, match end',
  example: ''
}, {
  operator: '!$like',
  types: ['string'],
  valueRequired: true,
  description: 'Case sensitive string, not match end',
  example: ''
}, {
  operator: 'ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, match anywhere',
  example: ''
}, {
  operator: '!ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, not match anywhere',
  example: ''
}, {
  operator: '^ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, match start',
  example: ''
}, {
  operator: '!^ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, not match start',
  example: ''
}, {
  operator: '$ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, match end',
  example: ''
}, {
  operator: '!$ilike',
  types: ['string'],
  valueRequired: true,
  description: 'Case insensitive string, not match end',
  example: ''
}, {
  operator: 'gt',
  types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
  valueRequired: true,
  description: 'Greater than',
  example: ''
}, {
  operator: 'ge',
  types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
  valueRequired: true,
  description: 'Greater than or equal',
  example: ''
}, {
  operator: 'lt',
  types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
  valueRequired: true,
  description: 'Less than',
  example: ''
}, {
  operator: 'le',
  types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
  valueRequired: true,
  description: 'Less than or equal',
  example: ''
}, {
  operator: 'null',
  types: ['all'],
  valueRequired: false,
  description: 'Property is null',
  example: ''
}, {
  operator: '!null',
  types: ['all'],
  valueRequired: false,
  description: 'Property is not null',
  example: ''
}, {
  operator: 'empty',
  types: ['collection'],
  valueRequired: false,
  description: 'Collection is empty',
  example: ''
}, {
  operator: 'in',
  types: ['string', 'boolean', 'integer', 'float', 'date'],
  valueRequired: true,
  description: 'Find objects matching 1 or more values',
  example: ''
}, {
  operator: '!in',
  types: ['string', 'boolean', 'integer', 'float', 'date'],
  valueRequired: true,
  description: 'Find objects not matching 1 or more values',
  example: ''
}];
exports.OBJECT_FILTER_OPERATORS = OBJECT_FILTER_OPERATORS;
var FIELD_FILTERS_SYNTAX = [{
  operator: '<field-name>',
  description: 'Include property with name, if it exists.',
  example: 'id'
}, {
  operator: '<object>[<field-name>, ...]',
  description: 'Includes a field within either a collection (will be applied to every object in that collection), or just on a single object.',
  example: 'properties[id,name]'
}, {
  operator: '!<field-name>, <object>[!<field-name>',
  description: 'Do not include this field name, also works inside objects/collections. Useful when you use a preset to inlude fields.',
  example: '!userAccess, attributes[!properties.userAccess]'
}, {
  operator: '*, <object>[*]',
  description: 'Include all fields on a certain object, if applied to a collection, it will include all fields on all objects on that collection.',
  example: '*, enrollments[*]'
}, {
  operator: ':<preset>',
  description: 'Alias to select multiple fields. Three presets are currently available, run discoverFieldFilterPresets() for descriptions.',
  example: ':all'
}];
exports.FIELD_FILTERS_SYNTAX = FIELD_FILTERS_SYNTAX;
var FIELD_FILTERS_PRESETS = [{
  preset: 'all',
  description: 'All fields of the object',
  example: ' Include all fields from dataSets except organisationUnits: /api/33/dataSets?fields=:all,!organisationUnits'
}, {
  preset: '*',
  description: 'Alias for all',
  example: '/api/33/dataSets?fields=:*'
}, {
  preset: 'identifiable',
  description: 'Includes id, name, code, created and lastUpdated fields',
  example: '/api/33/dataSets?fields=:identifiable'
}, {
  preset: 'nameable',
  description: 'Includes id, name, shortName, code, description, created and lastUpdated fields',
  example: '/api/33/dataSets?fields=:nameable'
}, {
  preset: 'persisted',
  description: 'Returns all persisted property on a object, does not take into consideration if the object is the owner of the relation.',
  example: '/api/33/dataSets?fields=:persisted'
}, {
  preset: 'owner',
  description: 'Returns all persisted property on a object where the object is the owner of all properties, this payload can be used to update through the web-api.',
  example: '/api/33/dataSets?fields=:owner'
}];
/**
 * allow further customization of the properties on the server side.
 * /api/26/dataElements/ID?fields=id~rename(i),name~rename(n)
 * This will rename the id property to i and name property to n.
 * Multipe transformers can be used by repeating the transformer syntax:
 * /api/26/dataElementGroups.json?fields=id,displayName,dataElements~isNotEmpty~rename(haveDataElements)
 */

exports.FIELD_FILTERS_PRESETS = FIELD_FILTERS_PRESETS;
var FIELD_TRANSFORMERS = [{
  name: 'size',
  arguments: null,
  description: 'Gives sizes of strings (length) and collections',
  example: '/api/26/dataElements?fields=dataSets~size'
}, {
  name: 'isEmpty',
  arguments: null,
  description: 'Is string or collection empty',
  example: '/api/26/dataElements?fields=dataSets~isEmpty'
}, {
  name: 'isNotEmpty',
  arguments: null,
  description: 'Is string or collection not empty',
  example: '/api/26/dataElements?fields=dataSets~isNotEmpty'
}, {
  name: 'rename',
  arguments: 'Arg1: name',
  description: 'Renames the property name',
  example: '/api/26/dataElements/ID?fields=id~rename(i),name~rename(n)'
}, {
  name: 'paging',
  arguments: 'Arg1: page,Arg2: pageSize',
  description: 'Pages a collection, default pageSize is 50',
  example: '/api/26/dataElementGroups?fields=id,displayName,dataElements~paging(1;20)'
}];
/** 
 * OTHER NOTES
 * 
 * 1.10.5. Validating payloads
System wide validation of metadata payloads are enabled from 2.19 release, this means that create/update operations on the web-api endpoints will be checked for valid payload before allowed changes to be made, to find out what validations are in place for a endpoint, please have a look at the /api/schemas endpoint, i.e. to figure out which constraints a data element have, you would go to /api/schemas/dataElement.

You can also validate your payload manually by sending it to the proper schema endpoint. If you wanted to validate the constant from the create section before, you would send it like this:

POST /api/schemas/constant
{ payload }
A simple (non-validating) example would be:

curl -X POST -d "{\"name\": \"some name\"}" -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/schemas/dataElement
Which would yield the result:

[
   {
      "message" : "Required property missing.",
      "property" : "type"
   },
   {
      "property" : "aggregationOperator",
      "message" : "Required property missing."
   },
   {
      "property" : "domainType",
      "message" : "Required property missing."
   },
   {
      "property" : "shortName",
      "message" : "Required property missing."
   }
]
1.10.6. Partial updates
For cases where you don't want or need to update all properties on a object (which means downloading a potentially huge payload, change one property, then upload again) we now support partial update, both for single properties and for multiple properties.

The format for updating a single property is the same as when you are updating a complete object, just with only 1 property in the JSON/XML file, i.e.:

curl -X PATCH -d "{\"name\": \"New Name\"}" -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/26/dataElements/fbfJHSPpUQD/name
Please note that we are including the property name two times, one time in the payload, and one time in the endpoint, the generic endpoint for this is /api/type/id/property-name, and the Content-Type must also be included as usual (since we support multiple formats).

The format for updating multiple properties are similar, just that we don't include the property names in the url, i.e.:

{ // file.json
  "name": "Updated Name",
  "zeroIsSignificant": true
}
curl -X PATCH -d @file.json -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/26/dataElements/fbfJHSPpUQD
 */

exports.FIELD_TRANSFORMERS = FIELD_TRANSFORMERS;
