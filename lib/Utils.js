"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildUrl = buildUrl;
exports.handleResponse = handleResponse;
exports.prettyJson = prettyJson;
exports.nestArray = nestArray;
exports.generateUrl = generateUrl;
exports.Log = exports.CONTENT_TYPES = void 0;

var _languageCommon = require("@openfn/language-common");

const CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel'
};
exports.CONTENT_TYPES = CONTENT_TYPES;

class Log {
  static success(message) {
    return console.info(`✓ Success at ${new Date()}:\n`, message);
  }

  static warn(message) {
    return console.warn(`⚠ Warning at ${new Date()}:\n`, message);
  }

  static error(message) {
    return console.error(`✗ Error at ${new Date()}:\n`, message);
  }

}

exports.Log = Log;

function buildUrl(path, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${path}` : `${path}`;
  return hostUrl + '/api' + pathSuffix;
} // Write a unit test for this one


function handleResponse(result, state, callback) {
  const {
    data
  } = result;
  if (callback) return callback((0, _languageCommon.composeNextState)(state, data));
  return (0, _languageCommon.composeNextState)(state, data);
}

function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

const isArray = variable => !!variable && variable.constructor === Array;

function nestArray(data, key) {
  return isArray(data) ? {
    [key]: data
  } : data;
}

function generateUrl(configuration, options, resourceType) {
  let {
    hostUrl,
    apiVersion
  } = configuration;
  const urlString = '/' + resourceType; // Note that users can override the apiVersion from configuration with args

  if (options === null || options === void 0 ? void 0 : options.apiVersion) apiVersion = options.apiVersion;
  const apiMessage = apiVersion ? `Using DHIS2 api version ${apiVersion}` : 'Using latest available version of the DHIS2 api on this server.';
  console.log(apiMessage);
  return buildUrl(urlString, hostUrl, apiVersion);
} // export function buildUrlParams(params) {
//   const filters = params?.filters;
//   const dimensions = params?.dimensions;
//   // We remove filters and dimensions before building standard search params.
//   delete params?.filters;
//   delete params?.dimensions;
//   const urlParams = new URLSearchParams(params);
//   // Then we re-apply the filters and dimensions in this dhis2-specific way.
//   filters?.map(f => urlParams.append('filter', f));
//   dimensions?.map(d => urlParams.append('dimension', d));
//   return urlParams;
// }