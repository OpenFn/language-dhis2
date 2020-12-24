/** @module Adaptor */
//#region IMPORTS
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
  logOperation,
} from './Utils';
//#endregion

//#region CONFIGS
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
    console.log(error.response?.data?.response);
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
 * This is the type of result returned by OpenFn operations
 * @typedef {{configuration: object, references: object[], data: object}} state
 */

/**
 * This callback type is called `requestCallback` and is the type returned by callbacks supplied to OpenFn operations
 * @callback requestCallback
 * @param {state} state
 * @returns {state}
 */

//#endregion

//#region COMMONLY USED HELPER OPERATIONS
/**
 * Upsert(Create or update) one or many new Tracked Entity Instances
 * This is useful for idempotency and duplicate management
 * @public
 * @example
 * upsertTEI('w75KJ2mc4zz', state.data, { replace: true })
 * @constructor
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier used during matching
 * @param {object} data - Payload data for new/updated tracked entity instance(s)
 * @param {object} options - Optional options for update method. Defaults to {replace: true}
 * @returns {Operation}
 */
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
//#endregion

//#region GENERIC HELPER OPERATIONS
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
 * @param {Function} callback - The optional function that will be called to handle data returned by this function. Defaults to `state.data`
 * @example
 // 1. Get all api resources
  getResources()

 // 2. Get an attribute resource in json
  getResources({filter: 'singular:eq:attribute'})

 // 3. Get organisation unit resource in XML format, with a callback
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
    logOperation('getResources');

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
 * Get the schema of a given resource type, in any data format supported by DHIS2
 * @typedef {Object<string, any>} VersionParam
 * @property {Boolean} supportApiVersion
 * @property {number} apiVersion
 * @param {string} resourceType
 * @param {Object} params
 * @param {string} responseType - Defaults to `json`
 * @param {VersionParam} options
 * @param {Function} callback
 * @returns
 * @example
 *
 // 1. Get all schemas on the api, in json
  getSchema();

 // 2. Get Schema for Attribute resource in json
  getSchema('attribute');

 // 3. Get Schema for trackedEntityType in XML format
  getSchema('trackedEntityType', '', 'xml');

 // 4. Get all api schemas in csv format
  getSchema('', '', 'csv');

 // 4. Get Schema for trackedEntityType using a given api version(overriding apiVersion supplied in state.configuration), in json
  getSchema('trackedEntityType', '', '', {supportApiVersion: true, apiVersion: 33});

 // 5. Get Schema for organisationUnit in xml, with a callback
  getSchema('organisationUnit', '', 'xml', '', (state)=>{console.log('state.data',state.data);return state;});
 
 */
export function getSchema(
  resourceType,
  params,
  responseType,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(
      `/schemas/${resourceType ?? ''}`,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('getSchema');

    logApiVersion(apiVersion, supportApiVersion);

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
 * A generic helper method for getting data of any kind from DHIS2. This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @param {string} resourceType
 * @param {Obejct} params
 * @param {string} responseType
 * @param {Object} options
 * @param {Function} callback
 * @example
  // 1. Example Getting Tracked Entity Instances: Get a list of trackedEntityInstances of type `Person`, in json, for a given `orgUnit`, leaving out `system info` from the `result body`
    getData(
    'trackedEntityInstances',
    {
      fields: '*',
      ou: 'DiszpKrYNg8',
      entityType: 'nEenWmSyUEp',
      skipPaging: true,
    },
    {
      includeSystem: false,
    }
    );

  // 2. Example Getting Events: Get a list of  events with a certain program and organisation unit,sorting by due date ascending.

  getData('events',
  {
    orgUnit: 'DiszpKrYNg8',
    program: 'eBAyeGv0exc',
    order: 'dueDate'
  }
  );

  // 3. Example Getting DataValueSets: Get a list of `data values` for multiple  `dataSets`, with `startDate` and `endDate`, and multiple `orgUnits`

  getData('dataValueSets', {
    dataSet: 'pBOMPrpg1QX',
    dataSet: 'BfMAe6Itzgt',
    startDate: '2013-01-01',
    endDate: '2020-01-31',
    orgUnit: 'YuQRtpLP10I',
    orgUnit: 'vWbkYPRmKyS',
    children: true,
  });

  // 4. Example Getting Metadata: Get a list of `org units` 

  getData('organisationUnits');

 */
export function getData(resourceType, params, responseType, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(
      `/${resourceType}`,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('getData');

    logApiVersion(apiVersion, supportApiVersion);

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
 * A generic helper function to get metadata records from a given DHIS2 instance
 * @param {Object} resources - E.g. `{organisationUnits: true, attributes: true}`
 * @param {Object} params 
 * @param {Object} options 
 * @param {Function} callback 
 * @example
  // 1. Get a list of organisation units and attributes, in a single request
  getMetadata(
    {attributes: true, organisationUnits: true},
    {
      fields: '*',
    },
    {
      includeSystem: false,
    }
  );

  // 2. Get a list of `dataSets`
  getMetadata(
    { dataSets: true },
    {
      assumeTrue: false,
      fields: '*',
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
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences({ ...resources, ...params })(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl('/metadata', hostUrl, apiVersion, supportApiVersion);

    logOperation('getMetadata');

    logApiVersion(apiVersion, supportApiVersion);

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

/**
 * A generic helper method to create a record of any kind in DHIS2
 * @param {string} resourceType
 * @param {Object} data
 * @param {Object} params
 * @param {Object} options
 * @param {Function} callback
 * @example
  // 1. 
 */
export function create(resourceType, data, params, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const payload = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('create');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'POST',
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

/**
 *  A generic helper function to update an resource object of any type. It requires to send all required fields or the full body
 * @param {string} resourceType
 * @param {String} path
 * @param {Object} data
 * @param {Object} params
 * @param {Object} options
 * @param {Function} callback
 * @example
  // 1. Update data element
  update('dataElements', 'FTRrcoaog83', {
  displayName: 'New display name',
  aggregationType: 'SUM',
  domainType: 'AGGREGATE',
  valueType: 'NUMBER',
  name: 'Accute Flaccid Paralysis (Deaths < 5 yrs)',
  shortName: 'Accute Flaccid Paral (Deaths < 5 yrs)',
});

 */
export function update(resourceType, path, data, params, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    // const objectPath = expandReferences(path)(state);

    const queryParams = expandReferences(params)(state);

    const payload = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType + '/' + path,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('update');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'PUT',
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

/**
 * A generic helper function to send partial updates on one or more object properties. You are not required to send the full body of object properties
 * This is useful for cases where you don't want or need to update all properties on a object.
 * @param {string} resourceType
 * @param {Object} query
 * @param {Object} params
 * @param {Object} options
 * @example
  // 1. Update data element's property
  patch('dataElements', 'FTRrcoaog83', {displayName: 'Some new display name'});
 */
export function patch(resourceType, path, data, params, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    // const objectPath = expandReferences(path)(state);

    const queryParams = expandReferences(params)(state);

    const payload = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType + '/' + path,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('patch');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'PATCH',
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

/**
 *  A generic helper function to delete an object
 * @param {string} resourceType
 * @param {string} path - Can be an `id` of an `object` or `path` to the `nested object` followed by `id` of the `property` of a `nested object`
 * @param {Object} data
 * @param {Object} params
 * @param {Object} options
 * @param {Function} callback
 * @example
  // 1. Delete data element
  del('dataElements', 'FTRrcoaog83');
 */
export function del(resourceType, path, data, params, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = expandReferences(params)(state);

    const payload = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType + '/' + path,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('del');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'DELETE',
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

/**
 * A generic helper function used to atomically either insert a row, or on the basis of the row already existing,
 * UPDATE that existing row instead.
 *
 * @todo Tweak/refine to mimic implementation based on the following inspiration: https://sqlite.org/lang_upsert.html and https://wiki.postgresql.org/wiki/UPSERT
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
 * 
 * @param {!string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {!{attributeId: string, attributeValue: any}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {{sourceValue: any, operator: ['eq','!eq','gt','gte','lt','lte'], destinationValuePath: string}} [updateCondition=true] - Useful for `idempotency`. Optional expression used to determine when to apply the UPDATE when a record exists(e.g. `payLoad.registrationDate>person.registrationDate`). By default, we apply the UPDATE.
 * @param {Object<any,any>} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `Update/create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{replace: boolean}} [options={replace: false}] - Optional `flags` for the behavior of the `upsert(Update)` operation. Options are `replace` or `merge`. Defaults to `{repalce: false}` which implies `merge`
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {state} state
 * @example <caption>Example usage of upsert</caption>
    upsert(
      'trackedEntityInstances',
      {
        attributeId: 'aX5hD4qUpRW',
        attributeValue: state =>
          state.data.attributes.find(obj => obj.attribute === 'aX5hD4qUpRW').value,
      },
      {
        sourceValue: 'some value',
        operator: 'gt',
        destinationValuePath: '{object}.{propertyName}',
      },
      state.data,
      '',
      { replace: false }
    );
 */
export function upsert(
  resourceType,
  uniqueAttribute,
  updateCondition,
  data,
  params,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const { attributeId, attributeValue } = expandReferences(uniqueAttribute)(
      state
    );

    const { sourceValue, operator, destinationValuePath } = expandReferences(
      updateCondition
    )(state);

    const queryParams = expandReferences(params)(state);

    const payload = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('upsert');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    // Step 1: Check if the Resource Type Object Exists
    // Step 2: Check if attribute is assigned to the Type Object
    // Step 3: Check if attribute is unique on the Type Object
    // Step 4: Check if instance exists
    // Step 5: If instance exists
    //    Step 5.1 Instance exists
    //        Step 5.1.1 Check if to apply update based on updateCondition
    //          Step 5.1.1.1 If to apply
    //            Step 5.1.1.1 Check if to replace or merge
    //              Step 5.1.1.1.1 Replace or merge
    //    Step 5.2 If instance does not exist
    //        Step 5.2.1 POST new instance

    return state;
  };
}
//#endregion

//#region EXPORTS
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
//#endregion
