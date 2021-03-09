import { eq, filter, some, indexOf, lastIndexOf, trim } from 'lodash';
import { mapValues } from 'lodash/fp';
import axios from 'axios';

export function composeSuccessMessage(operation) {
  return `${COLORS.FgGreen}${operation}${ESCAPE} succeeded. The body of this result will be available in ${COLORS.FgGreen}state.data${ESCAPE} or in your ${COLORS.FgGreen}callback${ESCAPE}.`;
}

export function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if (!paramOrResourceType)
    Log.warn(
      `\x1b[33m Missing params or resourceType. This may take a while\x1b[0m. This endpoint(\x1b[33m${endpointUrl}\x1b[0m) may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result.`
    );
}

export function logWaitingForServer(url, params) {
  console.info(`url ${COLORS.FgGreen}${url}\x1b[0m`);

  console.info(
    `params ${COLORS.FgGreen}${
      typeof params === 'object' && !(params instanceof URLSearchParams)
        ? prettyJson(params)
        : params
    }\x1b[0m`
  );

  console.info(`Waiting for server response on ${url} ...`);
}

export function logApiVersion(apiVersion) {
  const message =
    apiVersion && apiVersion
      ? `Using DHIS2 api version \x1b[33m${apiVersion}\x1b[0m`
      : '\x1b[33m Attempting to use apiVersion without providing it in state.configuration or in options parameter\x1b[0m. You may encounter errors.\x1b[33m api_version_missing\x1b[0m.';

  if (apiVersion) console.warn(message);
  else console.warn(`Using\x1b[33m latest\x1b[0m version of DHIS2 api.`);
}

export function logOperation(operation) {
  console.info(`Executing ${COLORS.FgGreen}${operation}\x1b[0m ...`);
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

export const ESCAPE = '\x1b[0m';

export const COLORS = {
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
  BgWhite: '\x1b[47m',
};

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
          `${Log.#MAIN_TAG} ${
            COLORS.FgYellow
          }%s${ESCAPE} ${new Date()}\n ${message}`,
          Log.#OPTIONS.WARN
        );
        break;
      case Log.#OPTIONS.ERROR:
        console.error(
          `${Log.#MAIN_TAG} ${
            COLORS.FgRed
          }%s${ESCAPE} ${new Date()}\n ${message}`,
          Log.#OPTIONS.ERROR
        );
        break;
      default:
        console.info(
          `${Log.#MAIN_TAG} ${
            COLORS.FgGreen
          }%s${ESCAPE} ${new Date()}\n ${message}`,
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
