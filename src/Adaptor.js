/** @module Adaptor */
import axios from 'axios';
import {
  execute as commonExecute,
  composeNextState,
  expandReferences,
} from '@openfn/language-common';
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
  prettyJson,
  expandExtractAndLog,
  nestArray,
  expandAndSetOperation,
} from './Utils';
import { request } from './Client';

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
 * Migrates `apiUrl` to `hostUrl` if `hostUrl` is `blank`.
 * For `OpenFn.org` users with the `old-style configuration`.
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
        /* Keep quiet */
      }
    }
    return response;
  },
  function (error) {
    console.log(error);
    Log.error(`${error?.message}`);
    return Promise.reject(error);
  }
);

/**
 * Create a record
 * @public
 * @function
 * @param {string} resourceType - Type of resource to create. E.g. `trackedEntityInstances`, `programs`, `events`, ...
 * @param {Object} data - Data that will be used to create a given instance of resource. To create a single instance of a resource, `data` must be a javascript object, and to create multiple instances of a resources, `data` must be an array of javascript objects.
 * @param {Object} [options] - Optional `options` to control the behavior of the `create` operation and to pass `import parameters` E.g. `{dryRun: true, importStrategy: CREATE}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 API documentation} or {@link discover}..` Defaults to `{operationName: 'create', apiVersion: null, responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 *
 * @example <caption>-a `program`</caption>
 * create('programs', {
 *   name: 'name 20',
 *   shortName: 'n20',
 *   programType: 'WITHOUT_REGISTRATION',
 * });
 *
 * @example <caption>-an `event`</caption>
 * create('events', {
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'DiszpKrYNg8',
 *   status: 'COMPLETED',
 * });
 *
 * @example <caption>-a `trackedEntityInstance`</caption>
 * create('trackedEntityInstances', {
 *   orgUnit: 'TSyzvBiovKh',
 *   trackedEntityType: 'nEenWmSyUEp',
 *   attributes: [
 *     {
 *       attribute: 'w75KJ2mc4zz',
 *       value: 'Gigiwe',
 *     },
 *   ]
 * });
 *
 * @example <caption>-a `dataSet`</caption>
 * create('dataSets', { name: 'OpenFn Data Set', periodType: 'Monthly' });
 *
 * @example <caption>-a `dataSetNotification`</caption>
 * create('dataSetNotificationTemplates', {
 *   dataSetNotificationTrigger: 'DATA_SET_COMPLETION',
 *   notificationRecipient: 'ORGANISATION_UNIT_CONTACT',
 *   name: 'Notification',
 *   messageTemplate: 'Hello',
 *   deliveryChannels: ['SMS'],
 *   dataSets: [],
 * });
 *
 * @example <caption>-a `dataElement`</caption>
 * create('dataElements', {
 *   aggregationType: 'SUM',
 *   domainType: 'AGGREGATE',
 *   valueType: 'NUMBER',
 *   name: 'Paracetamol',
 *   shortName: 'Para',
 * });
 *
 * @example <caption>-a `dataElementGroup`</caption>
 * create('dataElementGroups', {
 *   name: 'Data Element Group 1',
 *   dataElements: [],
 * });
 *
 * @example <caption>-a `dataElementGroupSet`</caption>
 * create('dataElementGroupSets', {
 *   name: 'Data Element Group Set 4',
 *   dataDimension: true,
 *   shortName: 'DEGS4',
 *   dataElementGroups: [],
 * });
 *
 * @example <caption>-a `dataValueSet`</caption>
 * create('dataValueSets', {
 *   dataElement: 'f7n9E0hX8qk',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   value: '12',
 * });
 *
 * @example <caption>-a `dataValueSet` with related `dataValues`</caption>
 * create('dataValueSets', {
 *   dataSet: 'pBOMPrpg1QX',
 *   completeDate: '2014-02-03',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   dataValues: [
 *     {
 *       dataElement: 'f7n9E0hX8qk',
 *       value: '1',
 *     },
 *     {
 *       dataElement: 'Ix2HsbDMLea',
 *       value: '2',
 *     },
 *     {
 *       dataElement: 'eY5ehpbEsB7',
 *       value: '3',
 *     },
 *   ],
 * });
 *
 * @example <caption>-an `enrollment`</caption>
 * create('enrollments', {
 *   trackedEntityInstance: 'bmshzEacgxa',
 *   orgUnit: 'TSyzvBiovKh',
 *   program: 'gZBxv9Ujxg0',
 *   enrollmentDate: '2013-09-17',
 *   incidentDate: '2013-09-17',
 * });
 */
export function create(resourceType, data, options, callback) {
  const initialParams = { resourceType, data, options, callback };
  return state => {
    const {
      url,
      data,
      resourceType,
      auth,
      urlParams,
      callback,
    } = expandExtractAndLog('create', initialParams)(state);

    return request({
      method: 'post',
      url,
      data: nestArray(data, resourceType),
      options: {
        auth,
        params: urlParams,
      },
    })
      .then(result => {
        Log.info(
          `\nOperation succeeded. Created ${resourceType}: ${result.headers.location}.\n`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      })
      .catch(error => {
        throw error;
      });
  };
}

/**
 * Update data. A generic helper function to update a resource object of any type.
 * Updating an object requires to send `all required fields` or the `full body`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {Object} data - Data to update. It requires to send `all required fields` or the `full body`. If you want `partial updates`, use `patch` operation.
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'update', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>-a program</caption>
 * update('programs', 'qAZJCrNJK8H', {
 *   name: '14e1aa02c3f0a31618e096f2c6d03bed',
 *   shortName: '14e1aa02',
 *   programType: 'WITHOUT_REGISTRATION',
 * });
 *
 * @example <caption>an `event`</caption>
 * update('events', 'PVqUD2hvU4E', {
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'Ngelehun CHC',
 *   status: 'COMPLETED',
 *   storedBy: 'admin',
 *   dataValues: [],
 * });
 *
 * @example <caption>a `trackedEntityInstance`</caption>
 * update('trackedEntityInstances', 'IeQfgUtGPq2', {
 *   created: '2015-08-06T21:12:37.256',
 *   orgUnit: 'TSyzvBiovKh',
 *   createdAtClient: '2015-08-06T21:12:37.256',
 *   trackedEntityInstance: 'IeQfgUtGPq2',
 *   lastUpdated: '2015-08-06T21:12:37.257',
 *   trackedEntityType: 'nEenWmSyUEp',
 *   inactive: false,
 *   deleted: false,
 *   featureType: 'NONE',
 *   programOwners: [
 *     {
 *       ownerOrgUnit: 'TSyzvBiovKh',
 *       program: 'IpHINAT79UW',
 *       trackedEntityInstance: 'IeQfgUtGPq2',
 *     },
 *   ],
 *   enrollments: [],
 *   relationships: [],
 *   attributes: [
 *     {
 *       lastUpdated: '2016-01-12T00:00:00.000',
 *       displayName: 'Last name',
 *       created: '2016-01-12T00:00:00.000',
 *       valueType: 'TEXT',
 *       attribute: 'zDhUuAYrxNC',
 *       value: 'Russell',
 *     },
 *     {
 *       lastUpdated: '2016-01-12T00:00:00.000',
 *       code: 'MMD_PER_NAM',
 *       displayName: 'First name',
 *       created: '2016-01-12T00:00:00.000',
 *       valueType: 'TEXT',
 *       attribute: 'w75KJ2mc4zz',
 *       value: 'Catherine',
 *     },
 *   ],
 * });
 *
 * @example <caption>-a `dataSet`</caption>
 * update('dataSets', 'lyLU2wR22tC', { name: 'OpenFN Data Set', periodType: 'Weekly' });
 *
 * @example <caption>-a `dataSetNotification`</caption>
 * update('dataSetNotificationTemplates', 'VbQBwdm1wVP', {
 *   dataSetNotificationTrigger: 'DATA_SET_COMPLETION',
 *   notificationRecipient: 'ORGANISATION_UNIT_CONTACT',
 *   name: 'Notification',
 *   messageTemplate: 'Hello Updated,
 *   deliveryChannels: ['SMS'],
 *   dataSets: [],
 * });
 *
 * @example <caption>-a `dataElement`</caption>
 * update('dataElements', 'FTRrcoaog83', {
 *   aggregationType: 'SUM',
 *   domainType: 'AGGREGATE',
 *   valueType: 'NUMBER',
 *   name: 'Paracetamol',
 *   shortName: 'Para',
 * });
 *
 * @example <caption>-a `dataElementGroup`</caption>
 * update('dataElementGroups', 'QrprHT61XFk', {
 *   name: 'Data Element Group 1',
 *   dataElements: [],
 * });
 *
 * @example <caption>-a `dataElementGroupSet`</caption>
 * update('dataElementGroupSets', 'VxWloRvAze8', {
 *   name: 'Data Element Group Set 4',
 *   dataDimension: true,
 *   shortName: 'DEGS4',
 *   dataElementGroups: [],
 * });
 *
 * @example <caption>-a `dataValueSet`</caption>
 * update('dataValueSets', 'AsQj6cDsUq4', {
 *   dataElement: 'f7n9E0hX8qk',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   value: '12',
 * });
 *
 * @example <caption>-a `dataValueSet` with related `dataValues`</caption>
 * update('dataValueSets', 'Ix2HsbDMLea', {
 *   dataSet: 'pBOMPrpg1QX',
 *   completeDate: '2014-02-03',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   dataValues: [
 *     {
 *       dataElement: 'f7n9E0hX8qk',
 *       value: '1',
 *     },
 *     {
 *       dataElement: 'Ix2HsbDMLea',
 *       value: '2',
 *     },
 *     {
 *       dataElement: 'eY5ehpbEsB7',
 *       value: '3',
 *     },
 *   ],
 * });
 *
 * @example <caption>a single enrollment</caption>
 * update('enrollments', 'CmsHzercTBa' {
 *   trackedEntityInstance: 'bmshzEacgxa',
 *   orgUnit: 'TSyzvBiovKh',
 *   program: 'gZBxv9Ujxg0',
 *   enrollmentDate: '2013-10-17',
 *   incidentDate: '2013-10-17',
 * });
 */
export function update(resourceType, path, data, options, callback) {
  const initialParams = { resourceType, path, data, options, callback };
  return state => {
    const { url, data, resourceType, auth, _, callback } = expandExtractAndLog(
      'update',
      initialParams
    )(state);

    return request({ method: 'put', url, data, options: { auth } })
      .then(result => {
        Log.info(`\nOperation succeeded. Updated ${resourceType} ${path}.\n`);
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      })
      .catch(error => {
        throw error;
      });
  };
}

/**
 * Get data. Generic helper method for getting data of any kind from DHIS2.
 * - This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to get(use its `plural` name). E.g. `dataElements`, `trackedEntityInstances`,`organisationUnits`, etc.
 * @param {{apiVersion: number,operationName: string,responseType: string}}[options] - `Optional` options for `getData` operation. Defaults to `{operationName: 'getData', apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation} state
 * @example <caption>Example getting one `trackedEntityInstance` with `Id` 'dNpxRu1mWG5' for a given `orgUnit(DiszpKrYNg8)`</caption>
 * getData('trackedEntityInstances', {
 *    fields: '*',
 *    ou: 'DiszpKrYNg8',
 *    entityType: 'nEenWmSyUEp',
 *    trackedEntityInstance: 'dNpxRu1mWG5',
 * });
 */
export function get(resourceType, options, callback) {
  const initialParams = { resourceType, options, callback };
  return state => {
    const {
      url: url,
      _data,
      _resourceType,
      auth,
      urlParams,
      callback,
    } = expandExtractAndLog('get', initialParams)(state);

    return request({
      method: 'get',
      url,
      options: { auth, params: urlParams, responseType: 'json' },
    })
      .then(result => {
        Log.info(
          `\nOperation succeeded. Retrieved ${result.data[resourceType].length} ${resourceType}.\n`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      })
      .catch(error => {
        throw error;
      });
  };
}

/**
 * Upsert a record. A generic helper function used to atomically either insert a row, or on the basis of the row already existing, UPDATE that existing row instead.
 * @public
 * @function
 * @param {string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {Object} data - The update data containing new values
 * @param {{replace:boolean, apiVersion: number,strict: boolean,responseType: string}} [options] - `Optional` options for `upsertTEI` operation. Defaults to `{replace: false, apiVersion: state.configuration.apiVersion,strict: true,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response
 * @throws {RangeError} - Throws range error
 * @returns {Operation}
 * @example <caption>Example `expression.js` of upsert</caption>
 * upsert(
 *    'trackedEntityInstances',
 *    {
 *       attributeId: 'lZGmxYbs97q',
 *          attributeValue: state =>
 *             state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
 *             .value,
 *    },
 *    state.data,
 *    { ou: 'TSyzvBiovKh' }
 * );
 * @todo Tweak/refine to mimic implementation based on the following inspiration: {@link https://sqlite.org/lang_upsert.html sqlite upsert} and {@link https://wiki.postgresql.org/wiki/UPSERT postgresql upsert}
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
 */
export function upsert(resourceType, data, options, callback) {
  return state => {
    return get(
      resourceType,
      options
    )(state)
      .then(res => {
        const resources = res.data[resourceType];
        if (resources.length > 1) {
          throw new RangeError(
            `Cannot upsert on Non-unique attribute. The operation found more than one records for your request.`
          );
        } else if (resources.length <= 0) {
          return create(resourceType, data, options, callback)(state);
        } else {
          const pathName =
            resourceType === 'trackedEntityInstances'
              ? 'trackedEntityInstance'
              : 'id';
          const path = resources[0][pathName];
          return update(resourceType, path, data, options, callback)(state);
        }
      })
      .catch(err => {
        throw err;
      });
  };
}

/**
 * Discover `DHIS2` `api` `endpoint` `query parameters` and allowed `operators` for a given resource's endpoint.
 * @public
 * @function
 * @param {string} httpMethod - The HTTP to inspect parameter usage for a given endpoint, e.g., `get`, `post`,`put`,`patch`,`delete`
 * @param {string} endpoint - The path for a given endpoint. E.g. `/trackedEntityInstances` or `/dataValueSets`
 * @returns {Operation}
 * @example <caption>Example getting a list of `parameters allowed` on a given `endpoint` for specific `http method`</caption>
 * discover('post', '/trackedEntityInstances')
 */
export function discover(httpMethod, endpoint) {
  return state => {
    Log.info(
      `Discovering query/import parameters for ${httpMethod} on ${endpoint}`
    );
    return axios
      .get(
        'https://dhis2.github.io/dhis2-api-specification/spec/metadata_openapi.json',
        {
          transformResponse: [
            data => {
              let tempData = JSON.parse(data);
              let filteredData = tempData.paths[endpoint][httpMethod];
              return {
                ...filteredData,
                parameters: filteredData.parameters.reduce(
                  (acc, currentValue) => {
                    let index = currentValue['$ref'].lastIndexOf('/') + 1;
                    let paramRef = currentValue['$ref'].slice(index);
                    let param = tempData.components.parameters[paramRef];

                    if (param.schema['$ref']) {
                      let schemaRefIndex =
                        param.schema['$ref'].lastIndexOf('/') + 1;
                      let schemaRef = param.schema['$ref'].slice(
                        schemaRefIndex
                      );
                      param.schema = tempData.components.schemas[schemaRef];
                    }

                    param.schema = JSON.stringify(param.schema);

                    let descIndex;
                    if (
                      indexOf(param.description, ',') === -1 &&
                      indexOf(param.description, '.') > -1
                    )
                      descIndex = indexOf(param.description, '.');
                    else if (
                      indexOf(param.description, ',') > -1 &&
                      indexOf(param.description, '.') > -1
                    ) {
                      descIndex =
                        indexOf(param.description, '.') <
                        indexOf(param.description, ',')
                          ? indexOf(param.description, '.')
                          : indexOf(param.description, ',');
                    } else {
                      descIndex = param.description.length;
                    }

                    param.description = param.description.slice(0, descIndex);

                    acc[paramRef] = param;
                    return acc;
                  },
                  {}
                ),
              };
            },
          ],
        }
      )
      .then(result => {
        Log.info(
          `\t=======================================================================================\n\tQuery Parameters for ${httpMethod} on ${endpoint} [${
            result.data.description ?? '<description_missing>'
          }]\n\t=======================================================================================`
        );
        console.table(result.data.parameters, [
          'in',
          'required',
          'description',
        ]);
        console.table(result.data.parameters, ['schema']);
        console.log(
          `=========================================Responses===============================\n${prettyJson(
            result.data.responses
          )}\n=======================================================================================`
        );
        return { ...state, data: result.data };
      });
  };
}

/**
 * Patch a record. A generic helper function to send partial updates on one or more object properties.
 * - You are not required to send the full body of object properties.
 * - This is useful for cases where you don't want or need to update all properties on a object.
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {Object} data - Data to update. Include only the fields you want to update. E.g. `{name: "New Name"}`
 * @param {Object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,responseType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'patch', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `patching` a `data element`</caption>
 * patch('dataElements', 'FTRrcoaog83',
 * {
 *   name: 'New Name',
 * });
 */
export function patch(resourceType, path, data, params, options, callback) {
  return state => {
    resourceType = expandReferences(resourceType)(state);

    path = expandReferences(path)(state);

    const body = expandReferences(data)(state);

    params = expandReferences(params)(state);

    options = expandReferences(options)(state);

    const operationName = options?.operationName ?? 'patch';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    let queryParams = params;

    const filters = queryParams?.filters;

    delete queryParams?.filters;

    queryParams = new URLSearchParams(queryParams);

    filters?.map(f => queryParams.append('filter', f));

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const url = buildUrl('/' + resourceType + '/' + path, hostUrl, apiVersion);

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation(operationName);

    logApiVersion(apiVersion);

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
        data: body,
        headers,
      })
      .then(result => {
        let resultObject = {
          status: result.status,
          statusText: result.statusText,
        };
        Log.info(
          `${operationName} succeeded. Updated ${resourceType}.\nSummary:\n${prettyJson(
            resultObject
          )}`
        );
        if (callback) return callback(composeNextState(state, resultObject));
        return composeNextState(state, resultObject);
      });
  };
}

/**
 * Delete a record. A generic helper function to delete an object
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be deleted. E.g. `trackedEntityInstances`, `organisationUnits`, etc.
 * @param {string} path - Can be an `id` of an `object` or `path` to the `nested object` to `delete`.
 * @param {Object} [data] - Optional. This is useful when you want to remove multiple objects from a collection in one request. You can send `data` as, for example, `{"identifiableObjects": [{"id": "IDA"}, {"id": "IDB"}, {"id": "IDC"}]}`. See more {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#deleting-objects on DHIS2 API docs}
 * @param {Object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional `options` for `del` operation. Defaults to `{operationName: 'delete', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example`deleting` a `tracked entity instance`</caption>
 * del('trackedEntityInstances', 'LcRd6Nyaq7T');
 */
export function del(resourceType, path, data, params, options, callback) {
  return state => {
    resourceType = expandReferences(resourceType)(state);

    path = expandReferences(path)(state);

    const body = expandReferences(data)(state);

    params = expandReferences(params)(state);

    options = expandReferences(options)(state);

    const operationName = options?.operationName ?? 'delete';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    let queryParams = params;

    const filters = queryParams?.filters;

    delete queryParams?.filters;

    queryParams = new URLSearchParams(queryParams);

    filters?.map(f => queryParams.append('filter', f));

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl('/' + resourceType + '/' + path, hostUrl, apiVersion);

    logOperation(operationName);

    logApiVersion(apiVersion);

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
        data: body,
        headers,
      })
      .then(result => {
        Log.info(
          `${operationName} succeeded. DELETED ${resourceType}.\nSummary:\n${prettyJson(
            result.data
          )}`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 * Gets an attribute value by its case-insensitive display name
 * @public
 * @example
 * valByName(tei.attributes, 'first name')
 * @function
 * @param {Object} tei - A tracked entity instance (TEI) object
 * @param {string} attributeName - The 'displayName' to search for in the TEI's attributes
 * @returns {string}
 */
export function attrVal(tei, attributeName) {
  return tei?.attributes?.find(
    a => a?.displayName.toLowerCase() == attributeName.toLowerCase()
  )?.value;
}

export { attribute } from './Utils';

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
  fn,
  http,
} from '@openfn/language-common';
