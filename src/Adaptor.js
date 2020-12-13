/** @module Adaptor */
import axios from 'axios';
import { execute as commonExecute, expandReferences } from 'language-common';
import { resolve as resolveUrl } from 'url';
import { mapValues } from 'lodash/fp';
import { eq, filter, negate, some, isEmpty } from 'lodash';
import { Log, prettyJson } from './utils';

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
    // Cleanup sensitive info
    return response;
  },
  function (error) {
    // Cleanup sensitive info
    Log.error(`${error.message}`);
    return Promise.reject({
      status: error.response.status,
      message: error.message,
      url: error.response.config.url,
      responseData: error.response.data,
      isAxiosError: error.isAxiosError,
    });
  }
);

function isLike(string, words) {
  const wordsArrary = words.match(/([^\W]+[^\s,]*)/).splice(0, 1);
  const isFound = word => RegExp(word, 'i').test(string);
  return some(wordsArrary, isFound);
}

const dhis2OperatorMap = {
  eq: eq,
  like: isLike,
};

function applyFilter(arrObject, filterTokens) {
  if (filterTokens) {
    try {
      return filter(arrObject, obj =>
        Reflect.apply(filterTokens[1], obj, [
          obj[filterTokens[0]],
          filterTokens[2],
        ])
      );
    } catch (error) {
      Log.warn(
        `Returned unfiltered data. Failed to apply custom filter(${prettyJson({
          property: filterTokens[0] ?? null,
          operator: filterTokens[1] ?? null,
          value: filterTokens[2] ?? null,
        })}) on this collection. The operator you supplied maybe unsupported on this resource at the moment.`
      );
      return arrObject;
    }
  }
  Log.info(`No filters applied, returned all records on this resource.`);
  return arrObject;
}

function parseFilter(filterExpression) {
  const filterTokens = filterExpression?.split(':');
  filterTokens
    ? (filterTokens[1] = dhis2OperatorMap[filterTokens[1] ?? null])
    : null;
  return filterTokens;
}

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
 * Load JSON from file
 * @param {*} filePath
 */
export function loadJsonFromFile(filePath) {
  return state;
}

/**
 * Load and parse csv file
 * @param {string} filePath
 */
export function parseCsvFromFile(filePath) {
  return state;
}

/**
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
    const { username, password, hostUrl, apiVersion } = state?.configuration;

    const { filter } = params;

    const { supportApiVersion } = options;

    const path =
      supportApiVersion === true
        ? `${apiVersion ?? 'api_version_missing'}/resources`
        : 'resources';

    const url = resolveUrl(hostUrl + '/api/', path);

    Log.info(`url ${url}`);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        transformResponse: [
          function (data, headers) {
            if (headers['content-type']?.split(';')[0] === 'application/json')
              return applyFilter(
                JSON.parse(data)?.resources,
                parseFilter(filter)
              );
            return data;
          },
        ],
      })
      .then(result => {
        Log.info(`Request filter: ${filter ?? {}}`);

        Log.info(
          'getResources succeeded.The body of this result will be available in state.data or in your callback.'
        );

        const nextState = {
          ...state,
          data: result?.data,
          references: [...state?.references, result?.data],
        };

        if (callback) return callback(nextState);

        return nextState;
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
    const { username, password, hostUrl, apiVersion } = state?.configuration;

    const supportApiVersion = options?.supportApiVersion ?? false;

    const path =
      supportApiVersion === true
        ? `${apiVersion ?? 'api_version_missing'}/schemas/${resourceType}`
        : `/schemas/${resourceType}`;

    const url = hostUrl + '/api/' + path;

    Log.info(`url ${url}`);
    if (isEmpty(resourceType))
      Log.warn(
        `This endpoint may return a large collection of schemas, since 'resourceType' is not specified. We recommend you specify 'resourceType' or use 'filter' parameter to limit the content of the result.`
      );
    Log.info(`params ${prettyJson(params)}`);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        params,
      })
      .then(result => {
        Log.info(
          `getSchema('${resourceType}') succeeded. The body of this result will be available in state.data or in your callback.`
        );

        const nextState = {
          ...state,
          data: result?.data,
          references: [...state?.references, result?.data],
        };

        if (callback) return callback(nextState);

        return nextState;
      });
  };
}

export function getData(resourceType, params, options) {
  return state => {
    const {
      username,
      password,
      hostUrl,
      apiVersion,
      inboxUrl,
    } = state.configuration;

    const query = expandDataValues(params)(state);

    const url = resolveUrl(hostUrl + '/', `api/${resourceType}`);

    return get({ username, password, query, url }).then(result => {
      return {
        ...state,
        references: [JSON.parse(result.text), ...state.references],
      };
    });
  };
}

export function getMetadata(resources, params, options) {
  return state => {
    const {
      username,
      password,
      hostUrl,
      apiVersion,
      inboxUrl,
    } = state.configuration;

    const query = expandDataValues({ ...resources, ...params })(state);

    const url = resolveUrl(hostUrl + '/', `api/metadata`);

    Log.info(`Query ${prettyJson(query)}`);

    return get({ username, password, query, url }).then(result => {
      let parsed_result = JSON.parse(result?.text);
      options?.includeSystem ? true : delete parsed_result.system;
      return {
        ...state,
        references: [parsed_result, ...state.references],
      };
    });
  };
}

export function postData(resourceType, data, params, options) {
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

export function updateData(resourceType, query, data, params, options) {
  return state;
}

export function deleteData(resourceType, query, params, options) {
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
