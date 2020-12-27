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
  composeSuccessMessage,
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

/**
 * Configuration obect for the `upsert`'s `options` parameter
 * @public
 * @readonly
 * @typedef {{ replace: boolean, apiVersion: number, supportApiVersion: boolean,requireUniqueAttributeConfig: boolean}} upsertOptionsConfig
 */

//#endregion

//#region COMMONLY USED HELPER OPERATIONS
/**
 * Upsert(Create or update) one or many Tracked Entity Instances
 * This is useful for idempotency and duplicate management
 * @public
 * @constructor
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier used during matching
 * @param {object<any,any>} data - Payload data for new/updated tracked entity instance(s)
 * @param {upsertOptionsConfig} [options={replace: false, apiVersion: null, supportApiVersion: false,requireUniqueAttributeConfig: true}] - Optional options for update method.`
 * @param {{sourceValue: any, operator: ['eq','!eq','gt','gte','lt','lte'], destinationValuePath: string}} [updateCondition=true:EQ:true] - Useful for `idempotency`. Optional expression used to determine when to apply the UPDATE when a record exists(e.g. `payLoad.registrationDate>person.registrationDate`). By default, we apply the UPDATE if it passes `unique attribute checks`.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @throws {RangeError}
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of upsertTEI</caption>
 * upsertTEI('aX5hD4qUpRW', state.data);
 * @todo Implement updateCondition
 */
export function upsertTEI(
  uniqueAttributeId,
  data,
  options,
  updateCodntion,
  callback
) {
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
        updateCodntion,
        body,
        params,
        options,
        callback
      )(state);
    });
  };
}

/**
 * Create a DHIS2 Tracked Entity Instance
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createTEI` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createTEI`</caption>
 * createTEI(state.data);
 */
export function createTEI(data, params, options, callback) {
  return state => {
    return create(
      'trackedEntityInstances',
      data,
      params,
      options,
      callback
    )(state);
  };
}

/**
 * Update a DHIS2 Tracked Entity Instance
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updateTEI` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `updateTEI`</caption>
 * update('PVqUD2hvU4E', state.data);
 */
export function updateTEI(path, data, params, options, callback) {
  return state => {
    return update(
      'trackedEntityInstances',
      path,
      data,
      params,
      options,
      callback
    )(state);
  };
}

/**
 * Get DHIS2 Tracked Entity Instance(s)
 * @param {array} params - `import` parameters for `getTEIs`. E.g. `{ou:}`
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `getTEIs` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `getTEIs` `expression.js` for fetching a `single` `Tracked Entity Instance`</caption>
 * getTEIs([
 * {
 *   fields: '*',
 * },
 * { ou: 'CMqUILyVnBL' },
 * { trackedEntityInstance: 'HNTA9qD6EEG' },
 * { skipPaging: true },
 * ]);
 */
export function getTEIs(params, responseType, options, callback) {
  return state => {
    return getData(
      'trackedEntityInstances',
      params,
      responseType,
      options,
      callback
    )(state);
  };
}

/**
 * Get DHIS2 Events, single events with no registration(annonymous events) or single event with registration and multiple events with registration(tracker events)
 * @param {array} params - `import` parameters for `getEvents`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getEvents` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Query for `all events` with `children` of a certain `organisation unit`</caption>
 * getEvents([{ orgUnit: 'YuQRtpLP10I' }, { ouMode: 'CHILDREN' }]);
 * @example <caption>- Query for `all events` with all `descendants` of a certain `organisation unit`, implying all organisation units in the `sub-hierarchy`</caption>
 * getEvents([{ orgUnit: 'O6uvpzGd5pu' }, { ouMode: 'DESCENDANTS' }]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit`</caption>
 * getEvents([{ orgUnit: 'DiszpKrYNg8' }, { program: 'eBAyeGv0exc' }]);
 * @example <caption>- Query for all `events` with a `certain program` and `organisation unit`, `sorting` by `due date ascending`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { order: 'dueDate' },
 * ]);
 * @example <caption>- Query for the `10 events` with the `newest event date` in a `certain program` and `organisation unit` - by `paging` and `ordering` by `due date descending`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { order: 'eventDate:desc' },
 * { pageSize: 10 },
 * { page: 1 },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit` for a specific `tracked entity instance`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { trackedEntityInstance: 'gfVxE3ALA9m' },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit` `older` or `equal to 2014-02-03`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { endDate: '2014-02-03' },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program stage`, `organisation unit` and `tracked entity instance` in the `year 2014`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { trackedEntityInstance: 'gfVxE3ALA9m' },
 * { startDate: '2014-01-01' },
 * { endDate: '2014-12-31' },
 * ]);
 * @example <caption>- Retrieve `events` with specified `Organisation unit` and `Program`, and use `Attribute:Gq0oWTf2DtN` as `identifier scheme`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'lxAQ7Zs9VYR' },
 * { idScheme: 'Attribute:Gq0oWTf2DtN' },
 * ]);
 * @example <caption>- Retrieve `events` with specified `Organisation unit` and `Program`, and use `UID` as `identifier scheme` for `orgUnits`, `Code` as `identifier scheme` for `Program stages`, and `Attribute:Gq0oWTf2DtN` as `identifier scheme` for the rest of the `metadata` with `assigned attribute`.</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'lxAQ7Zs9VYR' },
 * { idScheme: 'Attribute:Gq0oWTf2DtN' },
 * { orgUnitIdScheme: 'UID' },
 * { programStageIdScheme: 'Code' },
 * ]);
 */
export function getEvents(params, responseType, options, callback) {
  return state => {
    return getData('events', params, responseType, options, callback)(state);
  };
}
/**
 * Get DHIS2 Programs, single events with no registration(annonymous events) or single event with registration and multiple events with registration(tracker events)
 * @param {array} params - `import` parameters for `getEvents`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getEvents` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Query for `all programss` with a certain `organisation unit`</caption>
 * getPrograms([{ orgUnit: 'DiszpKrYNg8' }, { fields: '*' }]);
 */
export function getPrograms(params, responseType, options, callback) {
  return state => {
    return getData('programs', params, responseType, options, callback)(state);
  };
}
//#endregion

//#region GENERIC HELPER OPERATIONS
/**
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @todo Implementation
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
        composeSuccessMessage('getResources');
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

    let queryParams = new URLSearchParams(
      params?.map(item => Object.entries(item)?.flat())
    );

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
        Log.info(composeSuccessMessage('GET ' + resourceType));
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

    let queryParams = new URLSearchParams(
      params?.map(item => Object.entries(item)?.flat())
    );

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

    logOperation(`CREATE ${resourceType}`);

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
        Log.info(
          `${
            COLORS.FgGreen
          }CREATE succeeded${ESCAPE}. Created ${resourceType}: ${
            COLORS.FgGreen
          }${
            result.data.response.importSummaries
              ? result.data.response.importSummaries[0].href
              : result.data.response?.reference
          }${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
        );
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

    let queryParams = new URLSearchParams(
      params?.map(item => Object.entries(item)?.flat())
    );

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

    logOperation(`UPDATE ${resourceType}`);

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
        Log.info(
          `${
            COLORS.FgGreen
          }UPDATE succeeded${ESCAPE}. Updated ${resourceType}: ${
            COLORS.FgGreen
          }${
            result.data.response.importSummaries
              ? result.data.response.importSummaries[0].href
              : result.data.response?.reference
          }${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
        );
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
 * @param {!string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {!{attributeId: string, attributeValue: any}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {{sourceValue: any, operator: ['eq','!eq','gt','gte','lt','lte'], destinationValuePath: string}} [updateCondition=true:EQ:true] - Useful for `idempotency`. Optional expression used to determine when to apply the UPDATE when a record exists(e.g. `payLoad.registrationDate>person.registrationDate`). By default, we apply the UPDATE if it passes `unique attribute checks`.
 * @param {Object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `Update/create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {upsertOptionsConfig} [options={replace: false, apiVersion: null, supportApiVersion: false,requireUniqueAttributeConfig: true}] - Optional options for update method {@link upsertOptionsConfig}.`
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
 * @todo Tweak/refine to mimic implementation based on the following inspiration: {@link https://sqlite.org/lang_upsert.html sqlite upsert} and {@link https://wiki.postgresql.org/wiki/UPSERT postgresql upsert}
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
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
              `${
                COLORS.FgGreen
              }Upsert succeeded${ESCAPE}. Updated ${resourceName}: ${
                COLORS.FgGreen
              }${updateUrl}${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
            );
            if (callback) return callback(composeNextState(state, result.data));
            return composeNextState(state, result.data);
          });
      } else if (recordsWithValueCount === 0) {
        Log.info(
          `${COLORS.FgGreen}Existing record not found${ESCAPE}, proceeding to ${COLORS.FgGreen}CREATE(POST)${ESCAPE} ...`
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
              `${
                COLORS.FgGreen
              }Upsert succeeded${ESCAPE}. Created ${resourceName}: ${
                COLORS.FgGreen
              }${
                result.data.response.importSummaries
                  ? result.data.response.importSummaries[0].href
                  : result.data.response?.reference
              }${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
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
