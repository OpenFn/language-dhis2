/** @module Adaptor */
//#region IMPORTS
import axios from 'axios';
import {
  execute as commonExecute,
  expandReferences,
  composeNextState,
} from 'language-common';
import { indexOf, result } from 'lodash';

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
  COLORS,
  prettyJson,
  ESCAPE,
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
 * @param {object} options - Optional options for update method. Defaults to {replace: false, requireUniqueAttributeConfig: true}
 * @returns {Operation}
 */
export function upsertTEI(uniqueAttributeId, data, options, callback) {
  return state => {
    const { password, username, hostUrl } = state.configuration;

    const body = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;
    const requireUniqueAttributeConfig =
      options?.requireUniqueAttributeConfig ?? true;
    const headers = {
      Accept: 'application/json',
    };

    const uniqueAttributeValue = state.data.attributes?.find(
      obj => obj?.attribute === uniqueAttributeId
    )?.value;

    const trackedEntityType = state.data.trackedEntityType;

    const uniqueAttributeUrl = buildUrl(
      `/trackedEntityAttributes/${uniqueAttributeId}`,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    const trackedEntityTypeUrl = buildUrl(
      `/trackedEntityTypes/${trackedEntityType}?fields=*`,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    const params = [
      {
        ou: state.data.orgUnit,
      },
      { skipPaging: true },
    ];

    const findTrackedEntityType = () => {
      return axios
        .get(trackedEntityTypeUrl, { auth: { username, password } })
        .then(result => {
          const attribute = result.data?.trackedEntityTypeAttributes?.find(
            obj => obj?.trackedEntityAttribute?.id === uniqueAttributeId
          );
          return {
            ...result.data,
            upsertAttributeAssigned: attribute ? true : false,
          };
        });
    };

    const isAttributeUnique = () => {
      return axios
        .get(uniqueAttributeUrl, { auth: { username, password } })
        .then(result => {
          const foundAttribute = result.data;
          return { unique: foundAttribute.unique, name: foundAttribute.name };
        });
    };
    return Promise.all([
      findTrackedEntityType(),
      requireUniqueAttributeConfig === true
        ? isAttributeUnique()
        : Promise.resolve({ unique: true }),
    ]).then(([entityType, attribute]) => {
      if (!entityType.upsertAttributeAssigned) {
        Log.error('');
        throw new RangeError(
          `Tracked Entity Attribute ${uniqueAttributeId} is not assigned to ${entityType.name} Entity Type. Ensure, in DHIS2, this tracked entity attribute is assigned to ${entityType.name} and that it is marked as unique.`
        );
      }
      if (!attribute.unique) {
        Log.error('');
        throw new RangeError(
          `Attribute ${
            attribute.name ?? ''
          }(${uniqueAttributeId}) is not unique. Ensure, in DHIS2, this tracked entity attribute is marked as unique.`
        );
      }
      return upsert(
        'trackedEntityInstances',
        {
          attributeId: uniqueAttributeId,
          attributeValue: uniqueAttributeValue,
        },
        '',
        body,
        params
      )(state);
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
 * @todo Tweak/refine to mimic implementation based on the following inspiration: https://sqlite.org/lang_upsert.html and https://wiki.postgresql.org/wiki/UPSERT
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
 *
 * @param {!string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {!{attributeId: string, attributeValue: any}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {{sourceValue: any, operator: ['eq','!eq','gt','gte','lt','lte'], destinationValuePath: string}} [updateCondition=true] - Useful for `idempotency`. Optional expression used to determine when to apply the UPDATE when a record exists(e.g. `payLoad.registrationDate>person.registrationDate`). By default, we apply the UPDATE.
 * @param {Object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `Update/create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{replace: boolean}} [options={replace: false}] - Optional `flags` for the behavior of the `upsert(Update)` operation. Options are `{replace:true}` or `{replace:false}`. Defaults to `{repalce: false}` which implies `merge` existing properties with new ones(if any)
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @throws {RangeError}
 * @example <caption>- Example `expression.js` of upsert</caption>
 * ```javascript
 *   upsert(
 *    'trackedEntityInstances',
 *    {
 *      attributeId: 'aX5hD4qUpRW',
 *      attributeValue: state =>
 *        state.data.attributes.find(obj => obj.attribute === 'aX5hD4qUpRW').value,
 *    },
 *    {
 *      sourceValue: 'some value',
 *      operator: 'gt',
 *      destinationValuePath: '{object}.{propertyName}',
 *    },
 *    state.data,
 *    [{ ou: 'CMqUILyVnBL' }],
 *    { replace: false }
 *   );
 * ```
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

    const replace = options?.replace ?? false;

    const responseType = 'json';

    const { attributeId, attributeValue } = expandReferences(uniqueAttribute)(
      state
    );

    const { sourceValue, operator, destinationValuePath } = expandReferences(
      updateCondition
    )(state);

    let queryParams = new URLSearchParams(
      params?.map(item => Object.entries(item)?.flat())
    );

    const op = resourceType === 'trackedEntityInstances' ? 'EQ' : 'eq';

    queryParams.append('filter', `${attributeId}:${op}:${attributeValue}`);

    const body = expandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const url = buildUrl(
      '/' + resourceType,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation('upsert');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    const getResouceName = () => {
      return axios
        .get(hostUrl + '/api/resources', {
          auth: { username, password },
          transformResponse: [
            function (data, headers) {
              let filter = `plural:eq:${resourceType}`;
              if (filter) {
                if (
                  (headers['content-type']?.split(';')[0] ?? null) ===
                  CONTENT_TYPES.json
                ) {
                  let tempData = JSON.parse(data);
                  return {
                    ...tempData,
                    resources: applyFilter(
                      tempData.resources,
                      ...parseFilter(filter)
                    ),
                  };
                } else {
                  Log.warn(
                    'Filters on this resource are only supported for json content types. Skipping filtering ...'
                  );
                }
              }
              return data;
            },
          ],
        })
        .then(result => result.data.resources[0].singular);
    };

    const findRecordsWithValueOnAttribute = () => {
      console.log(queryParams);
      return axios.request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        headers,
      });
    };

    Log.info(
      `Checking if a record exists that matches this filter: ${COLORS.FgGreen}attribute{ id: ${attributeId}, value: ${attributeValue} }\x1b[0m ...`
    );
    return Promise.all([
      getResouceName(),
      findRecordsWithValueOnAttribute(),
    ]).then(([resourceName, recordsWithValue]) => {
      const recordsWithValueCount = recordsWithValue.data[resourceType].length;
      if (recordsWithValueCount > 1) {
        throw new RangeError(
          `Cannot upsert on Non-unique attribute. The operation found more than one records with the same value of ${attributeValue} for ${attributeId}`
        );
      } else if (recordsWithValueCount === 1) {
        // TODO
        // Log.info(
        //   `Unique record found, proceeding to checking if attribute is NULLABLE ...`
        // );
        // if (recordsWithNulls.data[resourceType].length > 0) {
        //   throw new Error(
        //     `Cannot upsert on Nullable attribute. The operation found records with a NULL value on ${attributeId}.`
        //   );
        // }
        Log.info(
          `${
            COLORS.FgGreen
          }Attribute has unique values${ESCAPE}. Proceeding to ${
            COLORS.FgGreen
          }${replace ? 'replace' : 'merge'}${ESCAPE} ...`
        );

        const row1 = recordsWithValue.data[resourceType][0];
        const useCustomPATCH = ['trackedEntityInstances'].includes(resourceType)
          ? true
          : false;
        const method = replace
          ? 'PUT'
          : useCustomPATCH === true
          ? 'PUT'
          : 'PATCH';

        const id = row1['id'] ?? row1[resourceName];

        const updateUrl = `${url}/${id}`;

        const payload = useCustomPATCH
          ? {
              ...row1,
              ...body,
            }
          : body;

        return axios
          .request({
            method,
            url: updateUrl,
            auth: {
              username,
              password,
            },
            data: payload,
            params: queryParams,
            headers,
          })
          .then(result => {
            Log.info(
              `Upsert succeeded. Updated ${resourceName}: ${
                COLORS.FgGreen
              }${updateUrl}${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
            );
            if (callback) return callback(composeNextState(state, result.data));
            return composeNextState(state, result.data);
          });
      } else if (recordsWithValueCount === 0) {
        Log.info(
          `Existing record not found, proceeding to ${COLORS.FgGreen}CREATE(POST)${ESCAPE} ...`
        );
        queryParams.delete('filter');
        queryParams.append('importStrategy', 'CREATE');
        return axios
          .request({
            method: 'POST',
            url,
            auth: {
              username,
              password,
            },
            data: body,
            params: queryParams,
            headers,
          })
          .then(result => {
            Log.info(
              `Upsert succeeded. Created ${resourceName}: ${COLORS.FgGreen}${
                result.data.response.importSummaries[0].href
              }${ESCAPE}\nSummary:\n${prettyJson(result.data)}`
            );
            if (callback) return callback(composeNextState(state, result.data));
            return composeNextState(state, result.data);
          });
      }
    });
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
