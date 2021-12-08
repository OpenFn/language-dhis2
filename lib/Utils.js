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
exports.expandAndSetOperation = expandAndSetOperation;
exports.nestArray = nestArray;
exports.expandExtractAndLog = expandExtractAndLog;
exports.CONTENT_TYPES = exports.dhis2OperatorMap = exports.Log = void 0;

var _lodash = require("lodash");

var _axios = _interopRequireDefault(require("axios"));

var _languageCommon = require("@openfn/language-common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function composeSuccessMessage(operation) {
  return `${operation} succeeded. The body of this result will be available in state.data or in your callback.`;
}

function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if (!paramOrResourceType) Log.warn(` Missing params or resourceType. This may take a while. This endpoint(${endpointUrl}) may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result.`);
}

function logWaitingForServer(url, params) {
  if (params) {
    console.info('Request params: ', typeof params === 'object' && !(params instanceof URLSearchParams) ? prettyJson(params) : params);
  }

  console.info(`Waiting for response from ${url}`);
}

function logApiVersion(apiVersion) {
  const message = apiVersion && apiVersion ? `Using DHIS2 api version ${apiVersion}` : ' Attempting to use apiVersion without providing it in state.configuration or in options parameter. You may encounter errors. api_version_missing.';
  if (apiVersion) console.warn(message);else console.warn(`Using latest version of DHIS2 api.`);
}

function logOperation(operation) {
  console.info(`Executing ${operation} ...`);
}

function buildUrl(path, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${path}` : `${path}`;
  const url = hostUrl + '/api' + pathSuffix;
  return url;
}

function attribute(attributeId, attributeValue) {
  return {
    attribute: attributeId,
    value: attributeValue
  };
}

function requestHttpHead(endpointUrl, {
  username,
  password
}) {
  return _axios.default.request({
    method: 'HEAD',
    url: endpointUrl,
    auth: {
      username,
      password
    }
  }).then(result => result.headers['content-length']);
}

function validateMetadataPayload(payload, resourceType) {
  return _axios.default.request({
    method: 'POST',
    url: `https://play.dhis2.org/dev/api/schemas/${resourceType}`,
    auth: {
      username: 'admin',
      password: 'distict'
    },
    data: payload
  }).then(result => result.data);
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
    let schemaRef;

    if (!indexes[match[0]]) {
      indexes[match[0]] = {};
    }

    let hrefString = string.slice(match.index, (0, _lodash.indexOf)(string, '}', match.index) - 1);
    let lastIndex = (0, _lodash.lastIndexOf)(hrefString, '/') + 1;
    schemaRef = (0, _lodash.trim)(hrefString.slice(lastIndex));
    indexes[match[0]][match.index] = schemaRef;
  }

  return indexes;
}

class Log {
  static info(message) {
    return console.info('(info)', new Date(), `\n${message}`);
  }

  static warn(message) {
    return console.warn('⚠ WARNING', new Date(), `\n${message}`);
  }

  static error(message) {
    return console.error('✗ ERROR', new Date(), `\n${message}`);
  }

}

exports.Log = Log;

function isLike(string, words) {
  var _words$match;

  const wordsArrary = words === null || words === void 0 ? void 0 : (_words$match = words.match(/([^\W]+[^\s,]*)/)) === null || _words$match === void 0 ? void 0 : _words$match.splice(0, 1);

  const isFound = word => {
    var _RegExp;

    return (_RegExp = RegExp(word, 'i')) === null || _RegExp === void 0 ? void 0 : _RegExp.test(string);
  };

  return (0, _lodash.some)(wordsArrary, isFound);
}

const dhis2OperatorMap = {
  eq: _lodash.eq,
  like: isLike
};
exports.dhis2OperatorMap = dhis2OperatorMap;

function applyFilter(arrObject, targetProperty, operator, valueToCompareWith) {
  if (targetProperty && operator && valueToCompareWith) {
    try {
      return (0, _lodash.filter)(arrObject, obj => Reflect.apply(operator, obj, [obj[targetProperty], valueToCompareWith]));
    } catch (error) {
      Log.warn(`Returned unfiltered data. Failed to apply custom filter(${prettyJson({
        targetProperty: targetProperty !== null && targetProperty !== void 0 ? targetProperty : null,
        operator: operator !== null && operator !== void 0 ? operator : null,
        value: valueToCompareWith !== null && valueToCompareWith !== void 0 ? valueToCompareWith : null
      })}) on this collection. The operator you supplied maybe unsupported on this resource at the moment.`);
      return arrObject;
    }
  }

  Log.info(`No filters applied, returned all records on this resource.`);
  return arrObject;
}

function parseFilter(filterExpression) {
  var _filterTokens$;

  const filterTokens = filterExpression === null || filterExpression === void 0 ? void 0 : filterExpression.split(':');
  filterTokens ? filterTokens[1] = dhis2OperatorMap[(_filterTokens$ = filterTokens[1]) !== null && _filterTokens$ !== void 0 ? _filterTokens$ : null] : null;
  return filterTokens;
}

function expandAndSetOperation(options, state, operationName) {
  return {
    operationName,
    ...(0, _languageCommon.expandReferences)(options)(state)
  };
}

const isArray = variable => !!variable && variable.constructor === Array;

function nestArray(data, key) {
  return isArray(data) ? {
    [key]: data
  } : data;
}

function log(operationName, apiVersion, url, resourceType, params) {
  logOperation(operationName);
  logApiVersion(apiVersion);
  logWaitingForServer(url, params);
  warnExpectLargeResult(resourceType, url);
}

function extractValuesForAxios(operationName, values) {
  return state => {
    var _values$options$apiVe, _values$options;

    const apiVersion = (_values$options$apiVe = (_values$options = values.options) === null || _values$options === void 0 ? void 0 : _values$options.apiVersion) !== null && _values$options$apiVe !== void 0 ? _values$options$apiVe : state.configuration.apiVersion;
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const auth = {
      username,
      password
    };
    let urlString = '/' + values.resourceType;

    if (operationName === 'update') {
      urlString += '/' + values.path;
    }

    const url = buildUrl(urlString, hostUrl, apiVersion);
    let urlParams = null;

    if (operationName === 'get' || operationName === 'upsert') {
      var _values$options2, _values$options2$para, _values$options3, _values$options3$para, _values$options4, _values$options4$para, _values$options5, _values$options5$para, _values$options6;

      const filters = (_values$options2 = values.options) === null || _values$options2 === void 0 ? void 0 : (_values$options2$para = _values$options2.params) === null || _values$options2$para === void 0 ? void 0 : _values$options2$para.filters;
      const dimensions = (_values$options3 = values.options) === null || _values$options3 === void 0 ? void 0 : (_values$options3$para = _values$options3.params) === null || _values$options3$para === void 0 ? void 0 : _values$options3$para.dimensions;
      (_values$options4 = values.options) === null || _values$options4 === void 0 ? true : (_values$options4$para = _values$options4.params) === null || _values$options4$para === void 0 ? true : delete _values$options4$para.filters;
      (_values$options5 = values.options) === null || _values$options5 === void 0 ? true : (_values$options5$para = _values$options5.params) === null || _values$options5$para === void 0 ? true : delete _values$options5$para.dimensions;
      urlParams = new URLSearchParams((_values$options6 = values.options) === null || _values$options6 === void 0 ? void 0 : _values$options6.params);
      filters === null || filters === void 0 ? void 0 : filters.map(f => urlParams.append('filter', f));
      dimensions === null || dimensions === void 0 ? void 0 : dimensions.map(d => urlParams.append('dimension', d));
    }

    const resourceType = values.resourceType;
    const data = values.data;
    const callback = values.callback;
    const extractedValues = {
      resourceType,
      data,
      apiVersion,
      auth,
      url,
      urlParams,
      callback
    };
    return extractedValues;
  };
}

function expandExtractAndLog(operationName, initialParams) {
  return state => {
    const {
      resourceType,
      data,
      apiVersion,
      auth,
      url,
      urlParams,
      callback
    } = extractValuesForAxios(operationName, (0, _languageCommon.expandReferences)(initialParams)(state))(state);
    log(operationName, apiVersion, url, resourceType, urlParams);
    return {
      url,
      data,
      resourceType,
      auth,
      urlParams,
      callback
    };
  };
}

const CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel'
};
exports.CONTENT_TYPES = CONTENT_TYPES;