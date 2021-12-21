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

// Write a unit test for this one
export function handleResponse(result, state, callback) {
  const { data } = result;
  if (callback) return callback(composeNextState(state, data));
  return composeNextState(state, data);
}

export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

const isArray = variable => !!variable && variable.constructor === Array;

export function nestArray(data, key) {
  return isArray(data) ? { [key]: data } : data;
}

export function generateUrl(configuration, options, resourceType) {
  let { hostUrl, apiVersion } = configuration;
  const urlString = '/' + resourceType;

  // Note that users can override the apiVersion from configuration with args
  if (options?.apiVersion) apiVersion = options.apiVersion;

  const apiMessage = apiVersion
    ? `Using DHIS2 api version ${apiVersion}`
    : 'Using latest available version of the DHIS2 api on this server.';

  console.log(apiMessage);

  return buildUrl(urlString, hostUrl, apiVersion);
}

export function buildUrlParams(params) {
  const filters = params?.filters;
  const dimensions = params?.dimensions;

  // We remove filters and dimensions before building standard search params.
  delete params?.filters;
  delete params?.dimensions;

  const urlParams = new URLSearchParams(params);

  // Then we re-apply the filters and dimensions in this dhis2-specific way.
  filters?.map(f => urlParams.append('filter', f));
  dimensions?.map(d => urlParams.append('dimension', d));

  return urlParams;
}
