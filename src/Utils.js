import { eq, filter, some, indexOf, lastIndexOf, trim } from 'lodash';
import { mapValues } from 'lodash/fp';
import axios from 'axios';

export function composeSuccessMessage(operation) {
  return `${operation} succeeded. The body of this result will be available in state.data or in your callback.`;
}

export function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if (!paramOrResourceType)
    Log.warn(
      ` Missing params or resourceType. This may take a while. This endpoint(${endpointUrl}) may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result.`
    );
}

export function logWaitingForServer(url, params) {
  console.info(
    'Request params: ',
    typeof params === 'object' && !(params instanceof URLSearchParams)
      ? prettyJson(params)
      : params
  );

  console.info(`Waiting for response from ${url}`);
}

export function logApiVersion(apiVersion) {
  const message =
    apiVersion && apiVersion
      ? `Using DHIS2 api version ${apiVersion}`
      : ' Attempting to use apiVersion without providing it in state.configuration or in options parameter. You may encounter errors. api_version_missing.';

  if (apiVersion) console.warn(message);
  else console.warn(`Using latest version of DHIS2 api.`);
}

export function logOperation(operation) {
  console.info(`Executing ${operation} ...`);
}

export function buildUrl(path, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${path}` : `${path}`;
  const url = hostUrl + '/api' + pathSuffix;

  return url;
}

export function attribute(attributeId, attributeValue) {
  return {
    attribute: attributeId,
    value: attributeValue,
  };
}

export function requestHttpHead(endpointUrl, { username, password }) {
  return axios
    .request({
      method: 'HEAD',
      url: endpointUrl,
      auth: {
        username,
        password,
      },
    })
    .then(result => result.headers['content-length']);
}

export function validateMetadataPayload(payload, resourceType) {
  return axios
    .request({
      method: 'POST',
      url: `https://play.dhis2.org/dev/api/schemas/${resourceType}`,
      auth: {
        username: 'admin',
        password: 'distict',
      },
      data: payload,
    })
    .then(result => result.data);
}

export function handleResponse(result, state, callback) {
  if (callback) return callback(composeNextState(state, result));

  return composeNextState(state, result);
}

export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

export function getIndicesOf(string, regex) {
  var match,
    indexes = {};

  regex = new RegExp(regex);

  while ((match = regex.exec(string))) {
    let schemaRef;
    if (!indexes[match[0]]) {
      indexes[match[0]] = {};
    }
    let hrefString = string.slice(
      match.index,
      indexOf(string, '}', match.index) - 1
    );
    let lastIndex = lastIndexOf(hrefString, '/') + 1;
    schemaRef = trim(hrefString.slice(lastIndex));
    indexes[match[0]][match.index] = schemaRef;
  }

  return indexes;
}

export class Log {
  static #OPTIONS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  };

  static #MAIN_TAG = '@openfn';

  static #printMessage(prefix, message) {
    switch (prefix) {
      case Log.#OPTIONS.WARN:
        console.warn(
          `${Log.#MAIN_TAG} %s ${new Date()}\n ${message}`,
          Log.#OPTIONS.WARN
        );
        break;
      case Log.#OPTIONS.ERROR:
        console.error(
          `${Log.#MAIN_TAG} %s ${new Date()}\n ${message}`,
          Log.#OPTIONS.ERROR
        );
        break;
      default:
        console.info(
          `${Log.#MAIN_TAG} %s ${new Date()}\n ${message}`,
          Log.#OPTIONS.INFO
        );
    }
  }

  static info(message) {
    return Log.#printMessage(Log.#OPTIONS.INFO, message);
  }

  static warn(message) {
    return Log.#printMessage(Log.#OPTIONS.WARN, message);
  }

  static error(message) {
    return Log.#printMessage(Log.#OPTIONS.ERROR, message);
  }
}

export function isLike(string, words) {
  const wordsArrary = words?.match(/([^\W]+[^\s,]*)/)?.splice(0, 1);
  const isFound = word => RegExp(word, 'i')?.test(string);
  return some(wordsArrary, isFound);
}

export const dhis2OperatorMap = {
  eq: eq,
  like: isLike,
};

export function applyFilter(
  arrObject,
  targetProperty,
  operator,
  valueToCompareWith
) {
  if (targetProperty && operator && valueToCompareWith) {
    try {
      return filter(arrObject, obj =>
        Reflect.apply(operator, obj, [obj[targetProperty], valueToCompareWith])
      );
    } catch (error) {
      Log.warn(
        `Returned unfiltered data. Failed to apply custom filter(${prettyJson({
          targetProperty: targetProperty ?? null,
          operator: operator ?? null,
          value: valueToCompareWith ?? null,
        })}) on this collection. The operator you supplied maybe unsupported on this resource at the moment.`
      );
      return arrObject;
    }
  }
  Log.info(`No filters applied, returned all records on this resource.`);
  return arrObject;
}

export function parseFilter(filterExpression) {
  const filterTokens = filterExpression?.split(':');
  filterTokens
    ? (filterTokens[1] = dhis2OperatorMap[filterTokens[1] ?? null])
    : null;
  return filterTokens;
}

export const CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel',
};
