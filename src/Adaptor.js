/** @module Adaptor */
import axios from 'axios';
import {
  execute as commonExecute,
  expandReferences,
  composeNextState,
} from 'language-common';
import { indexOf } from 'lodash';

import {
  Log,
  warnExpectLargeResult,
  logWaitingForServer,
  buildUrl,
  logApiVersion,
  CONTENT_TYPES,
  applyFilter,
  parseFilter,
} from './Utils';

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for DHIS2.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(
      configMigrationHelper,
      ...operations
    )({ ...initialState, ...state });
  };
}

/**
 * Migrates "apiUrl" to "hostUrl" if "hostUrl" is blank.
 * For OpenFn.org users with the old-style configuration.
 * @example
 * configMigrationHelper(state)
 * @constructor
 * @param {object} state - the runtime state
 * @returns {object}
 */
function configMigrationHelper(state) {
  const { hostUrl, apiUrl } = state.configuration;
  if (!hostUrl) {
    Log.warn(
      'DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.'
    );
    state.configuration.hostUrl = apiUrl;
    return state;
  }
  return state;
}

/**
 * Axios response interceptor
 * Intercepts every response, checks if the content type received is same as we send.
 * We reject if response type differs from request's accept type because DHIS2 server sends us
 * html pages when a wrong url is sent other than the one with /api
 * We also parse response.data because sometimes we receive text data
 */
axios.interceptors.response.use(
  function (response) {
    const contentType = response.headers['content-type']?.split(';')[0];

    const acceptHeaders = response.config.headers['Accept']
      .split(';')[0]
      .split(',');

    if (response.config.method === 'get') {
      if (indexOf(acceptHeaders, contentType) === -1) {
        const newError = {
          status: 404,
          message: 'Unexpected content,returned',
          responseData: response.data,
        };

        Log.error(newError.message);

        return Promise.reject(newError);
      }
    }

    if (
      typeof response?.data === 'string' &&
      contentType === CONTENT_TYPES?.json
    ) {
      try {
        response = { ...response, data: JSON.parse(response.data) };
      } catch (error) {
        /** Keep quiet */
      }
    }
    return response;
  },
  function (error) {
    Log.error(`${error?.message}`);
    // {
    //   status: error?.response?.status,
    //   message: error?.message,
    //   url: error?.response?.config?.url,
    //   responseData: error?.response?.data,
    //   isAxiosError: error?.isAxiosError,
    // }
    return Promise.reject(error);
  }
);

/**
 * Create or update one or many new Tracked Entity Instances
 * @public
 * @example
 * upsertTEI('w75KJ2mc4zz', state.data, { replace: true })
 * @constructor
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier used during matching
 * @param {object} data - Payload data for new/updated tracked entity instance(s)
 * @param {object} options - Optional options for update method. Defaults to {replace: true}
 * @returns {Operation}
 */
/*
export function upsertTEI(uniqueAttributeId, data, options) {
  return state => {
    const { password, username, hostUrl } = state.configuration;
    const { replace } = options;

    const body = expandReferences(data)(state);
    const url = resolveUrl(hostUrl + '/', `api/trackedEntityInstances`);
    const uniqueAttributeUrl = `${hostUrl}/api/trackedEntityAttributes/${uniqueAttributeId}`;
    const trackedEntityType = state.data.trackedEntityType;
    const trackedEntityTypeUrl = `${hostUrl}/api/trackedEntityTypes/${trackedEntityType}?fields=*`;

    const uniqueAttributeValue = state.data.attributes.find(
      obj => obj.attribute === uniqueAttributeId
    ).value;

    const query = {
      ou: state.data.orgUnit,
      ouMode: 'ACCESSIBLE',
      filter: `${uniqueAttributeId}:EQ:${uniqueAttributeValue}`,
      skipPaging: true,
    };

    console.log(
      `Checking if Tracked Entity Type ${trackedEntityType} exists...`
    );

    return get({
      username,
      password,
      query: null,
      url: trackedEntityTypeUrl,
    }).then(result => {
      let tet = JSON.parse(result.text);

      console.log(
        `Tracked Entity Type ${trackedEntityType}(${tet.name}) found.`
      );

      console.log(
        `Checking if attribute ${uniqueAttributeId} is assigned to ${tet.name} Entity Type... `
      );
      const attribute = tet.trackedEntityTypeAttributes.find(
        obj => obj.trackedEntityAttribute.id === uniqueAttributeId
      );
      if (attribute) {
        console.log(
          `Attribute ${attribute.name}(${uniqueAttributeId}) is assigned to ${tet.name}.`
        );

        console.log(
          `Checking if attribute ${attribute.name}(${uniqueAttributeId}) is unique...`
        );

        return get({
          username,
          password,
          query: null,
          url: uniqueAttributeUrl,
        }).then(result => {
          const foundAttribute = JSON.parse(result.text);

          if (foundAttribute.unique) {
            console.log(
              `Tracked Entity Attribute ${attribute.name}(${uniqueAttributeId}) is unique. Proceeding to checking if Tracked Entity Instance exists...`
            );
            return get({
              username,
              password,
              query,
              url,
            }).then(result => {
              console.log(`query ${JSON.stringify(query, null, 2)}`);

              let tei_body = JSON.parse(result.text);

              if (tei_body.trackedEntityInstances.length <= 0) {
                console.log(
                  `Tracked Entity Instance  with filter ${query.filter} not found, proceeding to create...`
                );

                return post({
                  username,
                  password,
                  body,
                  url,
                  query: null,
                }).then(result => {
                  console.log(
                    `POST succeeded. ${
                      result.header.location
                    }\nSummary:\n${JSON.stringify(
                      JSON.parse(result.text),
                      null,
                      2
                    )}`
                  );

                  return {
                    ...state,
                    references: [result, ...state.references],
                  };
                });
              } else {
                const row1 = tei_body.trackedEntityInstances[0];

                const payload = replace
                  ? body
                  : {
                      ...row1,
                      ...body,
                      attributes: [...row1.attributes, ...body.attributes],
                    };

                const updateUrl = `${url}/${row1.trackedEntityInstance}`;

                console.log(
                  `Tracked Entity Instance  with filter ${query.filter} found(${
                    row1.trackedEntityInstance
                  }), proceeding to ${
                    replace ? 'replace' : 'merge data with'
                  } the existing TEI...`
                );

                return put({
                  username,
                  password,
                  body: payload,
                  url: updateUrl,
                  query: null,
                }).then(result => {
                  console.log(`Upsert succeeded. Updated TEI: ${updateUrl}`);
                  console.log(
                    `Summary:\n${JSON.stringify(
                      JSON.parse(result.text),
                      null,
                      2
                    )}`
                  );

                  return {
                    ...state,
                    references: [result, ...state.references],
                  };
                });
              }
            });
          } else {
            throw new Error(
              `Attribute ${attribute.name}(${uniqueAttributeId}) is not unique. Ensure, in DHIS2, this tracked entity attribute is marked as unique.`
            );
          }
        });
      } else {
        throw new Error(
          `Tracked Entity Attribute ${uniqueAttributeId} is not assigned to ${tet.name} Entity Type. Ensure, in DHIS2, this tracked entity attribute is assigned to ${tet.name} and that it is marked as unique.`
        );
      }
    });
  };
}
*/

/**
 * TODO
 *
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @example
 * discover('getData, /api/trackedEntityInstances')
 * @param {*} operation
 * @param {*} resourceType
 */
export function discover(operation, resourceType) {
  return state;
}

/**
 * Get a list of DHIS2 api resources
 * @param {Object} params - The optional query parameters for this endpoint. E.g `{filter: 'singular:like:attribute'}`
 * @param {string} params.filter - The optional filter parameter, specifiying the filter expression. E.g. `singular:eq:attribute`
 * @param {string} responseType - The optional response type. Defaults to `json`
 * @param {Object} options - The optional flags to control behavior of function. E.g `{supportApiVersion: true}`
 * @param {boolean} options.supportApiVersion - The optional flag, only set to `true` if endpoint supports use of api versions in url. Defaults to `false`
 * @param {Function} callback - The optional function that will be called to handle data returned by this function. Defaults to `state.data`
 * @example
 // 1. Get all api resources
  getResources()

 // 2. Get an attribute resource in json
  getResources({filter: 'singular:eq:attribute'})

 // 3. Get organisation unit resource in XML format
  getResources({ filter: 'singular:eq:organisationUnit' }, 'xml', state => {
    console.log('Response', state.data);
    return state;
  });

 // 4. Get all api resources in csv format
  getResources('','csv') 

 // 4. Get all api resources in csv format
  getResources('','pdf')  
  
 */
export function getResources(params, responseType, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const filter = params?.filter;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const path = '/resources';

    const url = buildUrl(path, hostUrl, null, false);

    const transformResponse = function (data, headers) {
      if (filter) {
        if (
          (headers['content-type']?.split(';')[0] ?? null) ===
          CONTENT_TYPES.json
        ) {
          let tempData = JSON.parse(data);
          return {
            ...tempData,
            resources: applyFilter(tempData.resources, ...parseFilter(filter)),
          };
        } else {
          Log.warn(
            'Filters on this resource are only supported for json content types. Skipping filtering ...'
          );
        }
      }
      return data;
    };

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(queryParams, url);

    return axios
      .request({
        url,
        method: 'GET',
        auth: { username, password },
        responseType,
        headers,
        transformResponse,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

/**
 *
 * @param {string} resourceType
 * @param {*} params
 * @param {*} responseType
 * @param {*} options
 * @param {*} callback
 */
export function getSchema(
  resourceType,
  params,
  responseType,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl, apiVersion } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const useApiVersion = options?.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(
      `/schemas/${resourceType}`,
      hostUrl,
      apiVersion,
      useApiVersion
    );

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

/**
 *
 * @param {*} resourceType
 * @param {*} params
 * @param {*} options
 * @example
 * getData(
 * 'trackedEntityInstances',
 * {
 *  fields: '*',
    ou: 'DiszpKrYNg8',
    entityType: 'nEenWmSyUEp',
    // filter: 'id:eq:FQ2o8UBlcrS',
    skipPaging: true,
    async: true,
    // filter: 'id:eq:PWxgadk4sCG',
  },
  {
    includeSystem: false,
  }
);
 */
export function getData(resourceType, params, responseType, options, callback) {
  return state => {
    const { username, password, hostUrl, apiVersion } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const useApiVersion = options?.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(
      `/${resourceType}`,
      hostUrl,
      apiVersion,
      useApiVersion
    );

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

/**
 * Get metadata
 * @param {*} resources 
 * @param {*} params 
 * @param {*} options 
 * @param {*} callback 
 * @example
 *
  getMetadata(
    {attributes: true, organisationUnits: true},
    {
      fields: '*',
      // filter: 'id:eq:PWxgadk4sCG',
    },
    {
      includeSystem: false,
    }
  );
 */
export function getMetadata(
  resources,
  params,
  responseType,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl, apiVersion } = state.configuration;

    const queryParams = expandReferences({ ...resources, ...params })(state);

    const useApiVersion = options?.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl('/metadata', hostUrl, apiVersion, useApiVersion);

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resources, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

export function post(resourceType, data, params, options, callback) {
  return state => {
    const { username, password, hostUrl, apiVersion } = state.configuration;

    const queryParams = expandReferences(params)(state);

    // const payload = expandReferences(data);
    const payload = data;

    const useApiVersion = options?.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType,
      hostUrl,
      apiVersion,
      useApiVersion
    );

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'post',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        data: payload,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

export function update(resourceType, query, data, params, options) {
  return state;
}

export function del(resourceType, query, params, options) {
  return state;
}

export function patch(resourceType, query, params, options) {
  return state;
}

export function upsert(resourceType, uniqueAttribute, data, params, options) {
  return state;
}

exports.axios = axios;

export {
  field,
  fields,
  sourceValue,
  merge,
  each,
  dataPath,
  dataValue,
  lastReferenceValue,
  alterState,
} from 'language-common';
