"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.create = create;
exports.update = update;
exports.get = get;
exports.discover = discover;
exports.patch = patch;
exports.del = del;
exports.attrVal = attrVal;
exports.attribute = attribute;
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "fn", {
  enumerable: true,
  get: function () {
    return _languageCommon.fn;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});

var _axios = _interopRequireDefault(require("axios"));

var _languageCommon = require("@openfn/language-common");

var _lodash = require("lodash");

var _Utils = require("./Utils");

var _Client = require("./Client");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */

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
function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  };
  return state => {
    return (0, _languageCommon.execute)(configMigrationHelper, ...operations)({ ...initialState,
      ...state
    });
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
  const {
    hostUrl,
    apiUrl
  } = state.configuration;

  if (!hostUrl) {
    _Utils.Log.warn('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');

    state.configuration.hostUrl = apiUrl;
    return state;
  }

  return state;
} // NOTE: In order to prevent unintended exposure of authentication information
// in the logs, we make use of an axios interceptor.


_axios.default.interceptors.response.use(function (response) {
  var _response$headers$con, _response;

  const contentType = (_response$headers$con = response.headers['content-type']) === null || _response$headers$con === void 0 ? void 0 : _response$headers$con.split(';')[0];
  const acceptHeaders = response.config.headers['Accept'].split(';')[0].split(',');

  if (response.config.method === 'get') {
    if ((0, _lodash.indexOf)(acceptHeaders, contentType) === -1) {
      const newError = {
        status: 404,
        message: 'Unexpected content returned',
        responseData: response.data
      };

      _Utils.Log.error(newError.message);

      return Promise.reject(newError);
    }
  }

  if (typeof ((_response = response) === null || _response === void 0 ? void 0 : _response.data) === 'string' && contentType === (_Utils.CONTENT_TYPES === null || _Utils.CONTENT_TYPES === void 0 ? void 0 : _Utils.CONTENT_TYPES.json)) {
    try {
      response = { ...response,
        data: JSON.parse(response.data)
      };
    } catch (error) {
      _Utils.Log.warn('Non-JSON response detected, unable to parse.');
    }
  }

  return response;
}, function (error) {
  var _error$config, _error$config2, _error$response, _error$response$data, _error$response2;

  if ((_error$config = error.config) === null || _error$config === void 0 ? void 0 : _error$config.auth) error.config.auth = '--REDACTED--';
  if ((_error$config2 = error.config) === null || _error$config2 === void 0 ? void 0 : _error$config2.data) error.config.data = '--REDACTED--';
  const details = (_error$response = error.response) === null || _error$response === void 0 ? void 0 : (_error$response$data = _error$response.data) === null || _error$response$data === void 0 ? void 0 : _error$response$data.response;

  _Utils.Log.error(error.message || "That didn't work.");

  if (details) console.log(JSON.stringify(details, null, 2));
  return Promise.reject({
    request: error.config,
    error: error.message,
    response: (_error$response2 = error.response) === null || _error$response2 === void 0 ? void 0 : _error$response2.data
  });
});
/**
 * Create a record
 * @public
 * @function
 * @param {string} resourceType - Type of resource to create. E.g. `trackedEntityInstances`, `programs`, `events`, ...
 * @param {Object} data - Data that will be used to create a given instance of resource. To create a single instance of a resource, `data` must be a javascript object, and to create multiple instances of a resources, `data` must be an array of javascript objects.
 * @param {Object} [options] - Optional `options` to define URL parameters (E.g. `filters`, `dimensions` and `import parameters`), axios configurations (E.g. `auth`) and DHIS 2 api version to use.
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>-a `program`</caption>
 * create('programs', {
 *   name: 'name 20',
 *   shortName: 'n20',
 *   programType: 'WITHOUT_REGISTRATION',
 * });
 * @example <caption>-an `event`</caption>
 * create('events', {
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'DiszpKrYNg8',
 *   status: 'COMPLETED',
 * });
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
 * @example <caption>-a `dataSet`</caption>
 * create('dataSets', { name: 'OpenFn Data Set', periodType: 'Monthly' });
 * @example <caption>-a `dataSetNotification`</caption>
 * create('dataSetNotificationTemplates', {
 *   dataSetNotificationTrigger: 'DATA_SET_COMPLETION',
 *   notificationRecipient: 'ORGANISATION_UNIT_CONTACT',
 *   name: 'Notification',
 *   messageTemplate: 'Hello',
 *   deliveryChannels: ['SMS'],
 *   dataSets: [],
 * });
 * @example <caption>-a `dataElement`</caption>
 * create('dataElements', {
 *   aggregationType: 'SUM',
 *   domainType: 'AGGREGATE',
 *   valueType: 'NUMBER',
 *   name: 'Paracetamol',
 *   shortName: 'Para',
 * });
 * @example <caption>-a `dataElementGroup`</caption>
 * create('dataElementGroups', {
 *   name: 'Data Element Group 1',
 *   dataElements: [],
 * });
 * @example <caption>-a `dataElementGroupSet`</caption>
 * create('dataElementGroupSets', {
 *   name: 'Data Element Group Set 4',
 *   dataDimension: true,
 *   shortName: 'DEGS4',
 *   dataElementGroups: [],
 * });
 * @example <caption>-a `dataValueSet`</caption>
 * create('dataValueSets', {
 *   dataElement: 'f7n9E0hX8qk',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   value: '12',
 * });
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
 * @example <caption>-an `enrollment`</caption>
 * create('enrollments', {
 *   trackedEntityInstance: 'bmshzEacgxa',
 *   orgUnit: 'TSyzvBiovKh',
 *   program: 'gZBxv9Ujxg0',
 *   enrollmentDate: '2013-09-17',
 *   incidentDate: '2013-09-17',
 * });
 */


function create(resourceType, data, options, callback) {
  return state => {
    console.log(`Preparing create operation...`);
    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    data = (0, _languageCommon.expandReferences)(data)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const {
      params,
      requestConfig
    } = options || {};
    const {
      configuration
    } = state;
    return (0, _Client.request)(configuration, {
      method: 'post',
      url: (0, _Utils.generateUrl)(configuration, options, resourceType),
      params: params && (0, _Utils.buildUrlParams)(params),
      data: (0, _Utils.nestArray)(data, resourceType),
      ...requestConfig
    }).then(result => {
      _Utils.Log.success(`Created ${resourceType}: ${result.headers.location}`);

      return (0, _Utils.handleResponse)(result, state, callback);
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
 * @param {Object} [options] - Optional `options` to define URL parameters (E.g. `filters`, `dimensions` and `import parameters`), axios configurations (E.g. `auth`) and DHIS 2 api version to use.
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>-a program</caption>
 * update('programs', 'qAZJCrNJK8H', {
 *   name: '14e1aa02c3f0a31618e096f2c6d03bed',
 *   shortName: '14e1aa02',
 *   programType: 'WITHOUT_REGISTRATION',
 * });
 * @example <caption>an `event`</caption>
 * update('events', 'PVqUD2hvU4E', {
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'Ngelehun CHC',
 *   status: 'COMPLETED',
 *   storedBy: 'admin',
 *   dataValues: [],
 * });
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
 * @example <caption>-a `dataSet`</caption>
 * update('dataSets', 'lyLU2wR22tC', { name: 'OpenFN Data Set', periodType: 'Weekly' });
 * @example <caption>-a `dataSetNotification`</caption>
 * update('dataSetNotificationTemplates', 'VbQBwdm1wVP', {
 *   dataSetNotificationTrigger: 'DATA_SET_COMPLETION',
 *   notificationRecipient: 'ORGANISATION_UNIT_CONTACT',
 *   name: 'Notification',
 *   messageTemplate: 'Hello Updated,
 *   deliveryChannels: ['SMS'],
 *   dataSets: [],
 * });
 * @example <caption>-a `dataElement`</caption>
 * update('dataElements', 'FTRrcoaog83', {
 *   aggregationType: 'SUM',
 *   domainType: 'AGGREGATE',
 *   valueType: 'NUMBER',
 *   name: 'Paracetamol',
 *   shortName: 'Para',
 * });
 * @example <caption>-a `dataElementGroup`</caption>
 * update('dataElementGroups', 'QrprHT61XFk', {
 *   name: 'Data Element Group 1',
 *   dataElements: [],
 * });
 * @example <caption>-a `dataElementGroupSet`</caption>
 * update('dataElementGroupSets', 'VxWloRvAze8', {
 *   name: 'Data Element Group Set 4',
 *   dataDimension: true,
 *   shortName: 'DEGS4',
 *   dataElementGroups: [],
 * });
 * @example <caption>-a `dataValueSet`</caption>
 * update('dataValueSets', 'AsQj6cDsUq4', {
 *   dataElement: 'f7n9E0hX8qk',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   value: '12',
 * });
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
 * @example <caption>a single enrollment</caption>
 * update('enrollments', 'CmsHzercTBa' {
 *   trackedEntityInstance: 'bmshzEacgxa',
 *   orgUnit: 'TSyzvBiovKh',
 *   program: 'gZBxv9Ujxg0',
 *   enrollmentDate: '2013-10-17',
 *   incidentDate: '2013-10-17',
 * });
 */


function update(resourceType, path, data, options, callback) {
  return state => {
    console.log(`Preparing update operation...`);
    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    data = (0, _languageCommon.expandReferences)(data)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const {
      params,
      requestConfig
    } = options || {};
    const {
      configuration
    } = state;
    return (0, _Client.request)(configuration, {
      method: 'put',
      url: `${(0, _Utils.generateUrl)(configuration, options, resourceType)}/${path}`,
      params: params && (0, _Utils.buildUrlParams)(params),
      data,
      ...requestConfig
    }).then(result => {
      _Utils.Log.success(`Updated ${resourceType} at ${path}`);

      return (0, _Utils.handleResponse)(result, state, callback);
    });
  };
}
/**
 * Get data. Generic helper method for getting data of any kind from DHIS2.
 * - This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to get(use its `plural` name). E.g. `dataElements`, `trackedEntityInstances`,`organisationUnits`, etc.
 * @param {Object} filters - Filters to limit what resources are retrieved.
 * @param {Object} [options] - Optional `options` to define URL parameters beyond filters, request configuration (e.g. `auth`) and DHIS2 api version to use.
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation} state
 * @example <caption>Get all data values for the 'pBOMPrpg1QX' dataset.</caption>
 * get('dataValueSets', {
 *   dataSet: 'pBOMPrpg1QX',
 *   orgUnit: 'DiszpKrYNg8',
 *   period: '201401',
 *   fields: '*',
 * });
 * @example <caption>get all programs for an organization unit</caption>
 * get('programs', { orgUnit: 'TSyzvBiovKh', fields: '*' });
 */


function get(resourceType, filters, options, callback) {
  return state => {
    console.log(`Preparing get operation...`);
    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    filters = (0, _languageCommon.expandReferences)(filters)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const {
      params,
      requestConfig
    } = options || {};
    const {
      configuration
    } = state;
    return (0, _Client.request)(configuration, {
      method: 'get',
      url: (0, _Utils.generateUrl)(configuration, options, resourceType),
      params: (0, _Utils.buildUrlParams)({ ...filters,
        ...params
      }),
      responseType: 'json',
      ...requestConfig
    }).then(result => {
      _Utils.Log.success(`Retrieved ${resourceType}`);

      return (0, _Utils.handleResponse)(result, state, callback);
    });
  };
} // /**
//  * Upsert a record. A generic helper function used to atomically either insert a row, or on the basis of the row already existing, UPDATE that existing row instead.
//  * @public
//  * @function
//  * @param {string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
//  * @param {Object} data - The update data containing new values
//  * @param {{replace:boolean, apiVersion: number,strict: boolean,responseType: string}} [options] - `Optional` options for `upsertTEI` operation. Defaults to `{replace: false, apiVersion: state.configuration.apiVersion,strict: true,responseType: 'json'}`.
//  * @param {function} [callback] - Optional callback to handle the response
//  * @throws {RangeError} - Throws range error
//  * @returns {Operation}
//  * @example <caption>Example `expression.js` of upsert</caption>
//  * upsert(
//  *    'trackedEntityInstances',
//  *    {
//  *       attributeId: 'lZGmxYbs97q',
//  *          attributeValue: state =>
//  *             state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
//  *             .value,
//  *    },
//  *    state.data,
//  *    { ou: 'TSyzvBiovKh' }
//  * );
//  */
// export function upsert(resourceType, data, options, callback) {
//   return state => {
//     console.log(`Preparing upsert via 'get' then 'create' OR 'update'...`);
//     return get(
//       resourceType,
//       data
//     )(state).then(resp => {
//       const resources = resp.data[resourceType];
//       if (resources.length > 1) {
//         throw new RangeError(
//           `Cannot upsert on Non-unique attribute. The operation found more than one records for your request.`
//         );
//       } else if (resources.length <= 0) {
//         return create(resourceType, data, options, callback)(state);
//       } else {
//         const pathName =
//           resourceType === 'trackedEntityInstances'
//             ? 'trackedEntityInstance'
//             : 'id';
//         const path = resources[0][pathName];
//         return update(resourceType, path, data, options, callback)(state);
//       }
//     });
//   };
// }

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


function discover(httpMethod, endpoint) {
  return state => {
    console.log(`Discovering query/import parameters for ${httpMethod} on ${endpoint}`);
    return _axios.default.get('https://dhis2.github.io/dhis2-api-specification/spec/metadata_openapi.json', {
      transformResponse: [data => {
        let tempData = JSON.parse(data);
        let filteredData = tempData.paths[endpoint][httpMethod];
        return { ...filteredData,
          parameters: filteredData.parameters.reduce((acc, currentValue) => {
            let index = currentValue['$ref'].lastIndexOf('/') + 1;
            let paramRef = currentValue['$ref'].slice(index);
            let param = tempData.components.parameters[paramRef];

            if (param.schema['$ref']) {
              let schemaRefIndex = param.schema['$ref'].lastIndexOf('/') + 1;
              let schemaRef = param.schema['$ref'].slice(schemaRefIndex);
              param.schema = tempData.components.schemas[schemaRef];
            }

            param.schema = JSON.stringify(param.schema);
            let descIndex;
            if ((0, _lodash.indexOf)(param.description, ',') === -1 && (0, _lodash.indexOf)(param.description, '.') > -1) descIndex = (0, _lodash.indexOf)(param.description, '.');else if ((0, _lodash.indexOf)(param.description, ',') > -1 && (0, _lodash.indexOf)(param.description, '.') > -1) {
              descIndex = (0, _lodash.indexOf)(param.description, '.') < (0, _lodash.indexOf)(param.description, ',') ? (0, _lodash.indexOf)(param.description, '.') : (0, _lodash.indexOf)(param.description, ',');
            } else {
              descIndex = param.description.length;
            }
            param.description = param.description.slice(0, descIndex);
            acc[paramRef] = param;
            return acc;
          }, {})
        };
      }]
    }).then(result => {
      var _result$data$descript;

      console.log(`\t=======================================================================================\n\tQuery Parameters for ${httpMethod} on ${endpoint} [${(_result$data$descript = result.data.description) !== null && _result$data$descript !== void 0 ? _result$data$descript : '<description_missing>'}]\n\t=======================================================================================`);
      console.table(result.data.parameters, ['in', 'required', 'description']);
      console.table(result.data.parameters, ['schema']);
      console.log(`=========================================Responses===============================\n${(0, _Utils.prettyJson)(result.data.responses)}\n=======================================================================================`);
      return { ...state,
        data: result.data
      };
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
// TODO: @Elias, can this be deleted in favor of update? How does DHIS2 handle PATCH vs PUT?
// I need to investigate on this. But I think DHIS 2 forces to send all properties back when we do an update. If that's confirmed then this may be needed.


function patch(resourceType, path, data, params, options, callback) {
  return state => {
    var _options$operationNam, _options, _options$responseType, _options2, _queryParams, _queryParams2, _options$apiVersion, _options3, _CONTENT_TYPES$respon;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam = (_options = options) === null || _options === void 0 ? void 0 : _options.operationName) !== null && _options$operationNam !== void 0 ? _options$operationNam : 'patch';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType = (_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.responseType) !== null && _options$responseType !== void 0 ? _options$responseType : 'json';
    let queryParams = params;
    const filters = (_queryParams = queryParams) === null || _queryParams === void 0 ? void 0 : _queryParams.filters;
    (_queryParams2 = queryParams) === null || _queryParams2 === void 0 ? true : delete _queryParams2.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion = (_options3 = options) === null || _options3 === void 0 ? void 0 : _options3.apiVersion) !== null && _options$apiVersion !== void 0 ? _options$apiVersion : state.configuration.apiVersion;
    const url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    const headers = {
      Accept: (_CONTENT_TYPES$respon = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon !== void 0 ? _CONTENT_TYPES$respon : 'application/json'
    };
    return _axios.default.request({
      method: 'PATCH',
      url,
      auth: {
        username,
        password
      },
      params: queryParams,
      data: body,
      headers
    }).then(result => {
      let resultObject = {
        status: result.status,
        statusText: result.statusText
      };

      _Utils.Log.success(`${operationName} succeeded. Updated ${resourceType}.\nSummary:\n${(0, _Utils.prettyJson)(resultObject)}`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, resultObject));
      return (0, _languageCommon.composeNextState)(state, resultObject);
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
// TODO: @Elias, can this be implemented using the same pattern as update but without data?


function del(resourceType, path, data, params, options, callback) {
  return state => {
    var _options$operationNam2, _options4, _options$responseType2, _options5, _queryParams3, _queryParams4, _options$apiVersion2, _options6, _CONTENT_TYPES$respon2;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam2 = (_options4 = options) === null || _options4 === void 0 ? void 0 : _options4.operationName) !== null && _options$operationNam2 !== void 0 ? _options$operationNam2 : 'delete';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType2 = (_options5 = options) === null || _options5 === void 0 ? void 0 : _options5.responseType) !== null && _options$responseType2 !== void 0 ? _options$responseType2 : 'json';
    let queryParams = params;
    const filters = (_queryParams3 = queryParams) === null || _queryParams3 === void 0 ? void 0 : _queryParams3.filters;
    (_queryParams4 = queryParams) === null || _queryParams4 === void 0 ? true : delete _queryParams4.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion2 = (_options6 = options) === null || _options6 === void 0 ? void 0 : _options6.apiVersion) !== null && _options$apiVersion2 !== void 0 ? _options$apiVersion2 : state.configuration.apiVersion;
    const headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    const url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    return _axios.default.request({
      method: 'DELETE',
      url,
      auth: {
        username,
        password
      },
      params: queryParams,
      data: body,
      headers
    }).then(result => {
      _Utils.Log.success(`${operationName} succeeded. DELETED ${resourceType}.\nSummary:\n${(0, _Utils.prettyJson)(result.data)}`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Gets an attribute value by its case-insensitive display name
 * @public
 * @example
 * attrVal(tei.attributes, 'first name')
 * @function
 * @param {Object} tei - A tracked entity instance (TEI) object
 * @param {string} attributeName - The 'displayName' to search for in the TEI's attributes
 * @returns {string}
 */


function attrVal(tei, attributeName) {
  var _tei$attributes, _tei$attributes$find;

  return tei === null || tei === void 0 ? void 0 : (_tei$attributes = tei.attributes) === null || _tei$attributes === void 0 ? void 0 : (_tei$attributes$find = _tei$attributes.find(a => (a === null || a === void 0 ? void 0 : a.displayName.toLowerCase()) == attributeName.toLowerCase())) === null || _tei$attributes$find === void 0 ? void 0 : _tei$attributes$find.value;
}
/**
 * Converts an attribute ID and value into a DSHI2 attribute object
 * @public
 * @example
 * attribute('w75KJ2mc4zz', 'Elias')
 * @function
 * @param {string} attributeId - A tracked entity instance (TEI) attribute ID.
 * @param {string} attributeValue - The value for that attribute.
 * @returns {object}
 */


function attribute(attributeId, attributeValue) {
  return {
    attribute: attributeId,
    value: attributeValue
  };
}