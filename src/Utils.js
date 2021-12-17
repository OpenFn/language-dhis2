import axios from 'axios';
import { eq, filter, some, indexOf, lastIndexOf, trim } from 'lodash';
import { composeNextState } from '@openfn/language-common';

export const CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel',
};

export class Log {
  static success(message) {
    return console.info(`✓ ${message} @ ${new Date()}`);
  }

  static warn(message) {
    return console.warn(`⚠ Warning: ${message} @ ${new Date()}`);
  }

  static error(message) {
    return console.error(`✗ Error: ${message} @ ${new Date()}`);
  }
}

export function buildUrl(path, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${path}` : `${path}`;
  return hostUrl + '/api' + pathSuffix;
}

export function handleResponse(result, state, callback) {
  // TODO: @Elias, should composeNextState get passed result OR result.data?
  if (callback) return callback(composeNextState(state, result.data));
  return composeNextState(state, result.data);
}

export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

// =============================================================================
// TODO: @Elias... what are these functions doing and do they have a place in the new implementation?
// export function getIndicesOf(string, regex) {
//   var match,
//     indexes = {};

//   regex = new RegExp(regex);

//   while ((match = regex.exec(string))) {
//     let schemaRef;
//     if (!indexes[match[0]]) {
//       indexes[match[0]] = {};
//     }
//     let hrefString = string.slice(
//       match.index,
//       indexOf(string, '}', match.index) - 1
//     );
//     let lastIndex = lastIndexOf(hrefString, '/') + 1;
//     schemaRef = trim(hrefString.slice(lastIndex));
//     indexes[match[0]][match.index] = schemaRef;
//   }

//   return indexes;
// }

// export function isLike(string, words) {
//   const wordsArrary = words?.match(/([^\W]+[^\s,]*)/)?.splice(0, 1);
//   const isFound = word => RegExp(word, 'i')?.test(string);
//   return some(wordsArrary, isFound);
// }

// export const dhis2OperatorMap = {
//   eq: eq,
//   like: isLike,
// };

// export function applyFilter(
//   arrObject,
//   targetProperty,
//   operator,
//   valueToCompareWith
// ) {
//   if (targetProperty && operator && valueToCompareWith) {
//     try {
//       return filter(arrObject, obj =>
//         Reflect.apply(operator, obj, [obj[targetProperty], valueToCompareWith])
//       );
//     } catch (error) {
//       Log.warn(
//         `Returned unfiltered data. Failed to apply custom filter(${prettyJson({
//           targetProperty: targetProperty ?? null,
//           operator: operator ?? null,
//           value: valueToCompareWith ?? null,
//         })}) on this collection. The operator you supplied maybe unsupported on this resource at the moment.`
//       );
//       return arrObject;
//     }
//   }
//   console.log('No filters applied; returned all records for this resource.');
//   return arrObject;
// }

// export function parseFilter(filterExpression) {
//   const filterTokens = filterExpression?.split(':');
//   filterTokens
//     ? (filterTokens[1] = dhis2OperatorMap[filterTokens[1] ?? null])
//     : null;
//   return filterTokens;
// }
// // TODO: @Elias, end of the investigation block!
// =============================================================================

const isArray = variable => !!variable && variable.constructor === Array;

export function nestArray(data, key) {
  return isArray(data) ? { [key]: data } : data;
}

export function generateUrl(configuration, options, resourceType) {
  let { hostUrl, apiVersion } = configuration;
  const urlString = '/' + resourceType;

  // Note that users can override the apiVersion from configuration with args
  if (options?.apiVersion) apiVersion = options.apiVersion;

  // TODO: discuss how this actually works on DHIS2. I'm not sure I'm following.
  const apiMessage = apiVersion
    ? `Using DHIS2 api version ${apiVersion}`
    : 'Using latest available version of the DHIS2 api on this server.';

  console.log(apiMessage);

  return buildUrl(urlString, hostUrl, apiVersion);
}

export function buildUrlParams(options) {
  const filters = options?.params?.filters;
  const dimensions = options?.params?.dimensions;

  // We remove filters and dimensions before building standard search params.
  delete options?.params?.filters;
  delete options?.params?.dimensions;

  const urlParams = new URLSearchParams(options?.params);

  // Then we re-apply the filters and dimensions in this dhis2-specific way.
  filters?.map(f => urlParams.append('filter', f));
  dimensions?.map(d => urlParams.append('dimension', d));

  return urlParams;
}
