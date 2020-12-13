/** @module Adaptor */
import axios from 'axios';
import { execute as commonExecute, expandReferences } from 'language-common';
import { resolve as resolveUrl } from 'url';
import { mapValues } from 'lodash/fp';

import {
  Log,
  prettyJson,
  composeSuccessMessage,
  composeNextState,
  HTTP_METHODS,
  warnExpectLargeResult,
  logWaitingForServer,
  buildUrl,
  logApiVersion,
  applyFilter,
  parseFilter,
  HTTP_HEADERS,
  MEDIA_TYPES,
  PUNCTUATIONS,
} from './utils_lang_dhis2';

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

function expandDataValues(obj) {
  return state => {
    return mapValues(function (value) {
      if (typeof value == 'object') {
        return value.map(item => {
          return expandDataValues(item)(state);
        });
      } else {
        return typeof value == 'function' ? value(state) : value;
      }
    })(obj);
  };
}

axios.interceptors.response.use(
  function (response) {
    // TODO Cleanup sensitive info
    return response;
  },
  function (error) {
    // TODO Cleanup sensitive info
    Log.error(`${error?.message}`);
    return Promise.reject({
      status: error?.response?.status,
      message: error?.message,
      url: error?.response?.config?.url,
      responseData: error?.response?.data,
      isAxiosError: error?.isAxiosError,
    });
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
 * Clean JSON object
 * Useful for deep-removing certain keys in an object(recursively), or de-identifying sensitive data
 * @param {*} data
 * @param {*} options
 * @param  {...any} fields
 */
export function clean(data, options, ...fields) {
  return state;
}

/**
 * TODO
 *
 * Load JSON from file
 * @param {*} filePath
 */
export function loadJsonFromFile(filePath) {
  return state;
}

/**
 * TODO
 *
 * Load and parse csv file
 * @param {string} filePath
 */
export function parseCsvFromFile(filePath) {
  return state;
}

/**
 * TODO
 *
 * Transform JSON object, applying the transformer function on each element that meets the condition of the predicate
 * @example
 * transformData(state.data, state.data.attributes.DcnX8jrjh, this => this.value = 'new_value')
 * @param {*} data
 * @param {*} predicate - Can be a function or expression that evaluates to true or false
 * @param {*} transformer - Transformer function, applied on  each element where predicate evaluates to true
 * @param {Object} step - Object specifying details about a given transformation step
 * @param {string} step.name - Step name
 * @param {string} step.description - Step description
 */
export function transformData(data, predicate, transformer, step) {
  return state;
}

/**
 * TODO
 *
 * Get Sample State for a given operation on a resource
 * @example
 * getSampleSate('getData', 'trackedEntityInstances')
 * @param {*} operation
 * @param {*} resourceType
 */
export function getSampleState(operation, resourceType) {
  return state;
}

/**
 * TODO
 *
 * Show Sample Expression for a given operation on a resource
 * @example
 * showSampleExpression('postData', 'trackedEntityInstances',{sampleState})
 * @param {*} resourceType
 * @param {*} sampleState
 * @param {*} operation
 */
export function showSampleExpression(operation, resourceType, sampleState) {
  return state;
}

/**
 * TODO
 *
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @example
 * discoverParams('trackedEntityInstances')
 * @param {*} operation
 * @param {*} resourceType
 */
export function discoverParams(operation, resourceType) {
  return state;
}

/**
 * Get DHIS2 resources
 * @param {Object} params - The optional query parameters for this endpoint.
 * @param {string} params.filter - The optional filter parameter, specifiying the filter expression.
 * @param {Object} options - The optional flags to control behavior of function
 * @param {boolean} options.supportApiVersion - The optional flag, only set to `true` if endpoint supports use of api versions in url. Defaults to `false`
 * @param {Function} callback - The optional function that will be called to handle data returned by this function. Defaults to `state.data`
 */
export function getResources(params, options, callback) {
  return state => {
    const { username, password } = state?.configuration;

    const { filter } = params;

    const url = buildUrl(getResources, null, state?.configuration, options);

    logApiVersion(state?.configuration, options);

    logWaitingForServer(url, params);

    warnExpectLargeResult(params, url);

    return axios
      .request({
        method: HTTP_METHODS.GET,
        url,
        auth: {
          username,
          password,
        },
        responseType: MEDIA_TYPES.APP_JSON.alias,
        transformResponse: [
          function (data, headers) {
            if (
              headers[HTTP_HEADERS.CONTENT_TYPE]?.split(
                PUNCTUATIONS.SEMI_COLON
              )[0] ??
              null === MEDIA_TYPES.APP_JSON.value
            ) {
              let tempData = JSON.parse(data);
              return {
                ...tempData,
                resources: applyFilter(
                  tempData.resources,
                  ...parseFilter(filter)
                ),
              };
            }
            return data;
          },
        ],
      })
      .then(result => {
        Log.info(
          composeSuccessMessage(getResources, null, params, options, callback)
        );

        if (callback) return callback(composeNextState(state, result));

        return composeNextState(state, result);
      });
  };
}

/**
 *
 * @param {string} resourceType
 * @param {*} params
 * @param {*} options
 * @param {*} callback
 */
export function getSchema(resourceType, params, options, callback) {
  return state => {
    const { username, password } = state?.configuration;

    const url = buildUrl(
      getSchema,
      resourceType,
      state?.configuration,
      options
    );

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, params);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: HTTP_METHODS.GET,
        url,
        auth: {
          username,
          password,
        },
        params,
      })
      .then(result => {
        Log.info(
          composeSuccessMessage(
            getSchema,
            resourceType,
            params,
            options,
            callback
          )
        );

        if (callback) return callback(composeNextState(state, result));

        return composeNextState(state, result);
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
export function getData(resourceType, params, options, callback) {
  return state => {
    const { username, password } = state?.configuration;

    const url = buildUrl(getData, resourceType, state?.configuration, options);

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, params);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: HTTP_METHODS.GET,
        url,
        auth: {
          username,
          password,
        },
        params,
      })
      .then(result => {
        Log.info(
          composeSuccessMessage(
            getData,
            resourceType,
            params,
            options,
            callback
          )
        );

        if (callback) return callback(composeNextState(state, result));

        return composeNextState(state, result);
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
 * getMetadata(
  'attributes',
  {
    fields: '*',
    // filter: 'id:eq:PWxgadk4sCG',
  },
  {
    includeSystem: false,
  }
);
 */
export function getMetadata(resources, params, options, callback) {
  return state => {
    const { username, password } = state.configuration;

    const queryParams = expandDataValues({ ...resources, ...params })(state);

    const url = buildUrl(getMetadata, resources, state?.configuration, options);

    logApiVersion(state.configuration, options);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resources, url);

    return axios
      .request({
        method: HTTP_METHODS.GET,
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
      })
      .then(result => {
        Log.info(
          composeSuccessMessage(
            getMetadata,
            resources,
            queryParams,
            options,
            callback
          )
        );

        if (callback) return callback(composeNextState(state, result));

        return composeNextState(state, result);
      });
  };
}

export function postData(resourceType, data, params, options) {
  return state;
}
export function postMetadata(resourceType, data, params, options) {
  return state;
}

export function upsertData(
  resourceType,
  uniqueAttribute,
  data,
  params,
  options
) {
  return state;
}
export function upsertMetadata(
  resourceType,
  uniqueAttribute,
  data,
  params,
  options
) {
  return state;
}
export function updateData(resourceType, query, data, params, options) {
  return state;
}
export function updateMetadata(resourceType, query, data, params, options) {
  return state;
}
export function deleteData(resourceType, query, params, options) {
  return state;
}
export function deleteMetadata(resourceType, query, params, options) {
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
