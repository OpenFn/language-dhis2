"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildUrl = buildUrl;
exports.selectId = selectId;
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

function buildUrl(urlString, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${urlString}` : `${urlString}`;
  return hostUrl + '/api' + pathSuffix;
}
/**
 * Determines the attribute name for a DHIS2 system ID given a resource type.
 * @param {string} resourceType
 * @returns {string}
 */


function selectId(resourceType) {
  switch (resourceType) {
    case 'trackedEntityInstances':
      return 'trackedEntityInstance';
    // We can extend here if we find other special kinds of resourceType
    // case 'other-special-case':
    //   return 'other-special-id';

    default:
      return 'id';
  }
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

function generateUrl(configuration, options, resourceType, path = null) {
  let {
    hostUrl,
    apiVersion
  } = configuration;
  const urlString = '/' + resourceType; // Note that users can override the apiVersion from configuration with args

  if (options === null || options === void 0 ? void 0 : options.apiVersion) apiVersion = options.apiVersion;
  const apiMessage = apiVersion ? `Using DHIS2 api version ${apiVersion}` : 'Using latest available version of the DHIS2 api on this server.';
  console.log(apiMessage);
  const url = buildUrl(urlString, hostUrl, apiVersion);
  if (path) return `${url}/${path}`;
  return url;
}