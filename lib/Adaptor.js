"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.prepareData = prepareData;
exports.create = create;
exports.update = update;
exports.getTEIs = getTEIs;
exports.upsertTEI = upsertTEI;
exports.getEvents = getEvents;
exports.getPrograms = getPrograms;
exports.getEnrollments = getEnrollments;
exports.updateEnrollments = updateEnrollments;
exports.cancelEnrollment = cancelEnrollment;
exports.completeEnrollment = completeEnrollment;
exports.getRelationships = getRelationships;
exports.getDataValues = getDataValues;
exports.generateDhis2UID = generateDhis2UID;
exports.discover = discover;
exports.getAnalytics = getAnalytics;
exports.getResources = getResources;
exports.getSchema = getSchema;
exports.getData = getData;
exports.getMetadata = getMetadata;
exports.patch = patch;
exports.del = del;
exports.upsert = upsert;
exports.attrVal = attrVal;
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
Object.defineProperty(exports, "attribute", {
  enumerable: true,
  get: function () {
    return _Utils.attribute;
  }
});

var _axios = _interopRequireDefault(require("axios"));

var _languageCommon = require("@openfn/language-common");

var _lodash = require("lodash");

var _Utils = require("./Utils");

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
}

_axios.default.interceptors.response.use(function (response) {
  var _response$headers$con, _response;

  const contentType = (_response$headers$con = response.headers['content-type']) === null || _response$headers$con === void 0 ? void 0 : _response$headers$con.split(';')[0];
  const acceptHeaders = response.config.headers['Accept'].split(';')[0].split(',');

  if (response.config.method === 'get') {
    if ((0, _lodash.indexOf)(acceptHeaders, contentType) === -1) {
      const newError = {
        status: 404,
        message: 'Unexpected content,returned',
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
      /* Keep quiet */
    }
  }

  return response;
}, function (error) {
  console.log(error);

  _Utils.Log.error(`${error === null || error === void 0 ? void 0 : error.message}`);

  return Promise.reject(error);
});

function expandAndSetOperation(options, state, operationName) {
  return {
    operationName,
    ...(0, _languageCommon.expandReferences)(options)(state)
  };
}

const isArray = variable => !!variable && variable.constructor === Array;

function prepareData(data, key) {
  return isArray(data) ? {
    [key]: data
  } : data;
}

function log(operationName, apiVersion, url, resourceType, params) {
  (0, _Utils.logOperation)(operationName);
  (0, _Utils.logApiVersion)(apiVersion);
  (0, _Utils.logWaitingForServer)(url, params);
  (0, _Utils.warnExpectLargeResult)(resourceType, url);
}
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


function create(resourceType, data, options, callback) {
  const initialParams = {
    resourceType,
    data,
    options,
    callback
  };
  return state => {
    var _options$apiVersion;

    const {
      resourceType,
      data,
      options
    } = (0, _languageCommon.expandReferences)(initialParams)(state);
    const apiVersion = (_options$apiVersion = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion !== void 0 ? _options$apiVersion : state.configuration.apiVersion;
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion);
    const urlParams = new URLSearchParams(options === null || options === void 0 ? void 0 : options.params);
    log('create', apiVersion, url, resourceType, urlParams);
    return _axios.default.request({
      method: 'POST',
      url,
      auth: {
        username,
        password
      },
      data: prepareData(data, resourceType),
      params: urlParams,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(result => {
      _Utils.Log.info(`\nOperation succeeded. Created ${resourceType}: ${result.headers.location}.\n\nSummary:\n${(0, _Utils.prettyJson)(result.data)}\n`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    }).catch(error => {
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


function update(resourceType, path, data, options, callback) {
  return state => {
    var _expanded$options$ope, _expanded$options, _expanded$options$res, _expanded$options2, _expanded$options$api, _expanded$options3;

    const expanded = (0, _languageCommon.expandReferences)({
      resourceType,
      path,
      data,
      options
    })(state);
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const operationName = (_expanded$options$ope = (_expanded$options = expanded.options) === null || _expanded$options === void 0 ? void 0 : _expanded$options.operationName) !== null && _expanded$options$ope !== void 0 ? _expanded$options$ope : 'update';
    const responseType = (_expanded$options$res = (_expanded$options2 = expanded.options) === null || _expanded$options2 === void 0 ? void 0 : _expanded$options2.responseType) !== null && _expanded$options$res !== void 0 ? _expanded$options$res : 'json';
    const apiVersion = (_expanded$options$api = (_expanded$options3 = expanded.options) === null || _expanded$options3 === void 0 ? void 0 : _expanded$options3.apiVersion) !== null && _expanded$options$api !== void 0 ? _expanded$options$api : state.configuration.apiVersion;
    const url = (0, _Utils.buildUrl)('/' + expanded.resourceType + '/' + expanded.path, hostUrl, apiVersion);

    if (!_Utils.CONTENT_TYPES.hasOwnProperty(responseType)) {
      _Utils.Log.warn(`DHIS2 doesn't support ${responseType} response type`);

      return state;
    }

    const headers = {
      Accept: _Utils.CONTENT_TYPES[responseType]
    };
    log(operationName, apiVersion, url, expanded.resourceType);
    return _axios.default.request({
      method: 'PUT',
      url,
      auth: {
        username,
        password
      },
      data: expanded.data,
      headers
    }).then(result => {
      _Utils.Log.info(`${operationName} succeeded. Updated ${expanded.resourceType}.\nSummary:\n${(0, _Utils.prettyJson)(result.data)}`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get Tracked Entity Instance(s).
 * @public
 * @function
 * @param {Object} [params] - Optional `query parameters` e.g. `{ou: 'DiszpKrYNg8', filters: ['lZGmxYbs97q':GT:5']}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 docs} for more details on which params to use when querying tracked entities instances.
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `getTEIs` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>Example `getTEIs` `expression.js` for fetching a `single` `Tracked Entity Instance` with all the fields included.</caption>
 * getTEIs({
 *   fields: '*',
 *   ou: 'CMqUILyVnBL',
 *   trackedEntityInstance: 'HNTA9qD6EEG',
 *   skipPaging: true,
 * });
 */


function getTEIs(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getTEIs');
    return getData('trackedEntityInstances', params, expandedOptions, callback)(state);
  };
}
/**
 * Update TEI if exists otherwise create.
 * - Update if the record exists otherwise insert a new record.
 * - This is useful for idempotency and duplicate record management.
 * @public
 * @function
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier attribute used during matching.
 * @param {Object} data - Payload data for new tracked entity instance or updated data for an existing tracked entity instance.
 * @param {{apiVersion: number,strict: boolean,responseType: string}} [options] - `Optional` options for `upsertTEI` operation. Defaults to `{apiVersion: state.configuration.apiVersion,strict: true,responseType: 'json'}`.
 * @param {function} [callback] - Optional `callback` to handle the response.
 * @throws {RangeError} - Throws `RangeError` when `uniqueAttributeId` is `invalid` or `not unique`.
 * @returns {Operation}
 * @example <caption>Example `expression.js` for upserting a tracked entity instance on attribute with Id `lZGmxYbs97q`.</caption>
 * upsertTEI('lZGmxYbs97q', {
 *   orgUnit: 'TSyzvBiovKh',
 *   trackedEntityType: 'nEenWmSyUEp',
 *   attributes: [
 *     {
 *       attribute: 'lZGmxYbs97q',
 *       value: '77790012',
 *     },
 *     {
 *       attribute: 'w75KJ2mc4zz',
 *       value: 'Gigiwe',
 *     },
 *     {
 *       attribute: 'zDhUuAYrxNC',
 *       value: 'Mwanza',
 *     },
 *   ],
 * });
 */


function upsertTEI(uniqueAttributeId, data, options, callback) {
  return state => {
    var _expandedOptions$apiV, _expandedOptions$stri, _body$attributes, _body$attributes$find;

    uniqueAttributeId = (0, _languageCommon.expandReferences)(uniqueAttributeId)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    const expandedOptions = expandAndSetOperation(options, state, 'upsertTEI');
    const {
      password,
      username,
      hostUrl
    } = state.configuration;
    const apiVersion = (_expandedOptions$apiV = expandedOptions === null || expandedOptions === void 0 ? void 0 : expandedOptions.apiVersion) !== null && _expandedOptions$apiV !== void 0 ? _expandedOptions$apiV : state.configuration.apiVersion;
    const strict = (_expandedOptions$stri = expandedOptions === null || expandedOptions === void 0 ? void 0 : expandedOptions.strict) !== null && _expandedOptions$stri !== void 0 ? _expandedOptions$stri : true;
    const params = {
      ou: body.orgUnit
    };
    const uniqueAttributeValue = (_body$attributes = body.attributes) === null || _body$attributes === void 0 ? void 0 : (_body$attributes$find = _body$attributes.find(obj => (obj === null || obj === void 0 ? void 0 : obj.attribute) === uniqueAttributeId)) === null || _body$attributes$find === void 0 ? void 0 : _body$attributes$find.value;
    const trackedEntityType = body.trackedEntityType;
    const uniqueAttributeUrl = (0, _Utils.buildUrl)(`/trackedEntityAttributes/${uniqueAttributeId}`, hostUrl, apiVersion);
    const trackedEntityTypeUrl = (0, _Utils.buildUrl)(`/trackedEntityTypes/${trackedEntityType}?fields=*`, hostUrl, apiVersion);

    const findTrackedEntityType = () => {
      return _axios.default.get(trackedEntityTypeUrl, {
        auth: {
          username,
          password
        }
      }).then(result => {
        var _result$data, _result$data$trackedE;

        const attribute = (_result$data = result.data) === null || _result$data === void 0 ? void 0 : (_result$data$trackedE = _result$data.trackedEntityTypeAttributes) === null || _result$data$trackedE === void 0 ? void 0 : _result$data$trackedE.find(obj => {
          var _obj$trackedEntityAtt;

          return (obj === null || obj === void 0 ? void 0 : (_obj$trackedEntityAtt = obj.trackedEntityAttribute) === null || _obj$trackedEntityAtt === void 0 ? void 0 : _obj$trackedEntityAtt.id) === uniqueAttributeId;
        });
        return { ...result.data,
          upsertAttributeAssigned: attribute ? true : false
        };
      });
    };

    const isAttributeUnique = () => {
      return _axios.default.get(uniqueAttributeUrl, {
        auth: {
          username,
          password
        }
      }).then(result => {
        const foundAttribute = result.data;
        return {
          unique: foundAttribute.unique,
          name: foundAttribute.name
        };
      });
    };

    return Promise.all([findTrackedEntityType(), strict === true ? isAttributeUnique() : Promise.resolve({
      unique: true
    })]).then(([entityType, attribute]) => {
      if (!entityType.upsertAttributeAssigned) {
        _Utils.Log.error('');

        throw new RangeError(`Tracked Entity Attribute ${uniqueAttributeId} is not assigned to the ${entityType.name} Entity Type.`);
      }

      if (!attribute.unique) {
        var _attribute$name;

        _Utils.Log.error('');

        throw new RangeError(`Attribute ${(_attribute$name = attribute.name) !== null && _attribute$name !== void 0 ? _attribute$name : ''}(${uniqueAttributeId}) is not marked as unique.`);
      }

      return upsert('trackedEntityInstances', {
        attributeId: uniqueAttributeId,
        attributeValue: uniqueAttributeValue
      }, body, params, expandedOptions, callback)(state);
    });
  };
}
/**
 * Get annonymous events or tracker events.
 * @public
 * @function
 * @param {Object} params - `import` parameters for `getEvents`. See examples here
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `getEvents` operation. Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>Query for `all events` with `children` of a certain `organisation unit`</caption>
 * getEvents({ orgUnit: 'YuQRtpLP10I', ouMode: 'CHILDREN' });
 */


function getEvents(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getEvents');
    return getData('events', params, expandedOptions, callback)(state);
  };
}
/**
 * Get DHIS2 Tracker Programs.
 * @public
 * @function
 * @param {Object} params - `import` parameters for `getPrograms`. See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#tracker-web-api DHIS2 api documentation for allowed query parameters }
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getPrograms` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Query for `all programs` with a certain `organisation unit`</caption>
 * getPrograms({ orgUnit: 'DiszpKrYNg8' , fields: '*' });
 */


function getPrograms(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getPrograms');
    return getData('programs', params, expandedOptions, callback)(state);
  };
}
/**
 * Get DHIS2 Enrollments
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getEnrollments`. See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#enrollment-management  here}
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getEnrollments` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>To constrain the response to `enrollments` which are part of a `specific program` you can include a `program query parameter`</caption>
 * getEnrollments({
 *   ou: 'O6uvpzGd5pu',
 *   ouMode: 'DESCENDANTS',
 *   program: 'ur1Edk5Oe2n',
 *   fields: '*',
 * });
 */


function getEnrollments(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getEnrollments');
    return getData('enrollments', params, expandedOptions, callback)(state);
  };
}
/**
 * Update a DHIS2 Enrollemts
 * - To update an existing enrollment, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @public
 * @function
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `updateEnrollments`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `updateEnrollments` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `expression.js` of `updateEnromments`</caption>
 * updateEnrollments('PVqUD2hvU4E', state.data);
 */


function updateEnrollments(path, data, params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'updateEnrollments');
    return update('enrollments', path, data, params, expandedOptions, callback)(state);
  };
}
/**
 * Cancel a DHIS2 Enrollment
 * - To cancel an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @public
 * @function
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {Object} [params] - Optional `import` parameters for `cancelEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `cancelEnrollment` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `expression.js` of `cancelEnrollment`</caption>
 * cancelEnrollments('PVqUD2hvU4E');
 */


function cancelEnrollment(enrollmentId, params, options, callback) {
  return state => {
    enrollmentId = (0, _languageCommon.expandReferences)(enrollmentId)(state);
    const path = `${enrollmentId}/cancelled`;
    const expandedOptions = expandAndSetOperation(options, state, 'cancelEnrollment');
    return update('enrollments', path, null, params, expandedOptions, callback)(state);
  };
}
/**
 * Complete a DHIS2 Enrollment
 * - To complete an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @public
 * @function
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {Object} [params] - Optional `import` parameters for `completeEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `completeEnrollment` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `expression.js` of `completeEnrollment`</caption>
 * completeEnrollment('PVqUD2hvU4E');
 */


function completeEnrollment(enrollmentId, params, options, callback) {
  return state => {
    enrollmentId = (0, _languageCommon.expandReferences)(enrollmentId)(state);
    const path = `${enrollmentId}/completed`;
    const expandedOptions = expandAndSetOperation(options, state, 'enrollments');
    return update('enrollments', path, null, params, expandedOptions, callback)(state);
  };
}
/**
 * Get DHIS2 Relationships(links) between two entities in tracker. These entities can be tracked entity instances, enrollments and events.
 * - All the tracker operations, `getTEIs`, `getEnrollments` and `getEvents` also list their relationships if requested in the `field` filter.
 * - To list all relationships, this requires you to provide the UID of the trackedEntityInstance, Enrollment or event that you want to list all the relationships for.
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getRelationships`. See examples {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#relationships here}
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getRelationships` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>A query for `all relationships` associated with a `specific tracked entity instance` can look like this:</caption>
 * getRelationships({ tei: 'F8yKM85NbxW', fields: '*' });
 */


function getRelationships(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getRelationships');
    return getData('relationships', params, expandedOptions, callback)(state);
  };
}
/**
 * Get DHIS2 Data Values.
 * - This operation retrives data values from DHIS2 Web API by interacting with the `dataValueSets` resource
 * - Data values can be retrieved in XML, JSON and CSV format.
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getDataValues`. E.g. `{dataset: 'pBOMPrpg1QX', limit: 3, period: 2021, orgUnit: 'DiszpKrYNg8'} Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#data-values DHIS2 API docs} for available `Data Value Set Query Parameters`.
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `options` for `getDataValues` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>Example getting **two** `data values` associated with a specific `orgUnit`, `dataSet`, and `period `</caption>
 * getDataValues({
 *   orgUnit: 'DiszpKrYNg8',
 *   period: '202010',
 *   dataSet: 'pBOMPrpg1QX',
 *   limit: 2,
 * });
 */


function getDataValues(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getDataValues');
    return getData('dataValueSets', params, expandedOptions, callback)(state);
  };
}
/**
 * Generate valid, random DHIS2 identifiers
 * - Useful for client generated Ids compatible with DHIS2
 * @public
 * @function
 * @param {{apiVersion: number,limit: number,responseType: string}} [options] - Optional `options` for `generateDhis2UID` operation. Defaults to `{apiVersion: state.configuration.apiVersion,limit: 1,responseType: 'json'}`
 * @param {function} [callback] - Callback to handle response
 * @returns {Operation}
 * @example <caption>Example generating `three UIDs` from the DHIS2 server</caption>
 * generateDhis2UID({limit: 3});
 */


function generateDhis2UID(options, callback) {
  return state => {
    var _options$limit;

    const expandedOptions = expandAndSetOperation(options, state, 'generateDhis2UID');
    const limit = {
      limit: (_options$limit = options === null || options === void 0 ? void 0 : options.limit) !== null && _options$limit !== void 0 ? _options$limit : 1
    };
    options === null || options === void 0 ? true : delete options.limit;
    return getData('system/id', limit, expandedOptions, callback)(state);
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


function discover(httpMethod, endpoint) {
  return state => {
    _Utils.Log.info(`Discovering query/import parameters for ${httpMethod} on ${endpoint}`);

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

      _Utils.Log.info(`\t=======================================================================================\n\tQuery Parameters for ${httpMethod} on ${endpoint} [${(_result$data$descript = result.data.description) !== null && _result$data$descript !== void 0 ? _result$data$descript : '<description_missing>'}]\n\t=======================================================================================`);

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
 * Get analytical, aggregated data
 * - The analytics resource is powerful as it lets you query and retrieve data aggregated along all available data dimensions.
 * - For instance, you can ask the analytics resource to provide the aggregated data values for a set of data elements, periods and organisation units.
 * - Also, you can retrieve the aggregated data for a combination of any number of dimensions based on data elements and organisation unit group sets.
 * @public
 * @function
 * @param {Object} params - Analytics `query parameters`, e.g. `{dx: 'fbfJHSPpUQD;cYeuwXTCPkU',filters: ['pe:2014Q1;2014Q2','ou:O6uvpzGd5pu;lc3eMKXaEfw']}`. Run `discover` or visit {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#analytics DHIS2 API docs} to get the params available.
 * @param {{apiVersion: number,responseType: string}}[options] - `Optional` options for `getAnalytics` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback] - Callback to handle response
 * @returns {Operation}
 * @example <caption>Example getting only records where the data value is greater or equal to 6500 and less than 33000</caption>
 * getAnalytics({
 *   dimensions: [
 *    'dx:fbfJHSPpUQD;cYeuwXTCPkU',
 *    'pe:2014',
 *    'ou:O6uvpzGd5pu;lc3eMKXaEfw',
 *   ],
 *   measureCriteria: 'GE:6500;LT:33000',
 * });
 */


function getAnalytics(params, options, callback) {
  return state => {
    const expandedOptions = expandAndSetOperation(options, state, 'getAnalytics');
    return getData(`analytics`, params, expandedOptions, callback)(state);
  };
}
/**
 * Get DHIS2 api resources
 * @public
 * @function
 * @param {Object} [params] - The `optional` query parameters for this endpoint. E.g `{filter: 'singular:like:attribute'}`.
 * @param {{filter: string, fields: string, responseType: string}} [options] - The `optional` options, specifiying the filter expression. E.g. `singular:eq:attribute`.
 * @param {function} [callback] - The `optional callback function that will be called to handle data returned by this function.
 * @returns {Operation}
 * @example <caption>Example getting a resource named `attribute`, in `xml` format, returning all the fields</caption>
 * getResources('dataElement', {
 *      filter: 'singular:eq:attribute',
 *      fields: '*',
 *      responseType: 'xml',
 * });
 */


function getResources(params, options, callback) {
  return state => {
    var _options$responseType, _options, _params, _CONTENT_TYPES$respon;

    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = 'getResources';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType = (_options = options) === null || _options === void 0 ? void 0 : _options.responseType) !== null && _options$responseType !== void 0 ? _options$responseType : 'json';
    const filter = (_params = params) === null || _params === void 0 ? void 0 : _params.filter;
    const queryParams = params;
    const headers = {
      Accept: (_CONTENT_TYPES$respon = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon !== void 0 ? _CONTENT_TYPES$respon : 'application/json'
    };
    const path = '/resources';
    const url = (0, _Utils.buildUrl)(path, hostUrl, null, false);

    const transformResponse = function (data, headers) {
      if (filter) {
        var _headers$contentType, _headers$contentType2;

        if (((_headers$contentType = (_headers$contentType2 = headers['content-type']) === null || _headers$contentType2 === void 0 ? void 0 : _headers$contentType2.split(';')[0]) !== null && _headers$contentType !== void 0 ? _headers$contentType : null) === _Utils.CONTENT_TYPES.json) {
          let tempData = JSON.parse(data);
          return { ...tempData,
            resources: (0, _Utils.applyFilter)(tempData.resources, ...(0, _Utils.parseFilter)(filter))
          };
        } else {
          _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
        }
      }

      return data;
    };

    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(queryParams, url);
    return _axios.default.request({
      url,
      method: 'GET',
      auth: {
        username,
        password
      },
      responseType,
      headers,
      params: queryParams,
      transformResponse
    }).then(result => {
      _Utils.Log.info(`${operationName} succeeded. The result of this operation will be in ${operationName} state.data or in your ${operationName} callback.`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get schema of a given resource type, in any data format supported by DHIS2
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated(`singular` version of the `resource name`). E.g. `dataElement`, `organisationUnit`, etc. Run `getResources` to see available resources and their corresponding `singular` names.
 * @param {Object} params - Optional `query parameters` for the `getSchema` operation. e.g. `{ fields: 'properties' ,skipPaging: true}`. Run`discover` or See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#metadata-export-examples DHIS2 API Docs}
 * @param {{apiVersion: number,resourceType: string}} [options] - Optional options for `getSchema` method. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>Example getting the `schema` for `dataElement` in XML</caption>
 * getSchema('dataElement', '{ fields: '*' }, { responseType: 'xml' });
 */


function getSchema(resourceType, params, options, callback) {
  return state => {
    var _options$responseType2, _options2, _params2, _params3, _options$apiVersion2, _options3, _CONTENT_TYPES$respon2, _resourceType;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = 'getSchema';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType2 = (_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.responseType) !== null && _options$responseType2 !== void 0 ? _options$responseType2 : 'json';
    const filters = (_params2 = params) === null || _params2 === void 0 ? void 0 : _params2.filters;
    (_params3 = params) === null || _params3 === void 0 ? true : delete _params3.filters;
    let queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion2 = (_options3 = options) === null || _options3 === void 0 ? void 0 : _options3.apiVersion) !== null && _options$apiVersion2 !== void 0 ? _options$apiVersion2 : state.configuration.apiVersion;
    const headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    const url = (0, _Utils.buildUrl)(`/schemas/${(_resourceType = resourceType) !== null && _resourceType !== void 0 ? _resourceType : ''}`, hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios.default.request({
      method: 'GET',
      url,
      auth: {
        username,
        password
      },
      responseType,
      params: queryParams,
      headers
    }).then(result => {
      _Utils.Log.info(`${operationName} succeeded. The result of this operation will be in ${operationName} state.data or in your ${operationName} callback.`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get data. Generic helper method for getting data of any kind from DHIS2.
 * - This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to get(use its `plural` name). E.g. `dataElements`, `trackedEntityInstances`,`organisationUnits`, etc.
 * @param {Object} [params] - Optional `query parameters` e.g. `{ou: 'DiszpKrYNg8'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 docs} for more details on which params to use for a given type of resource.
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


function getData(resourceType, params, options, callback) {
  return state => {
    var _options$operationNam, _options4, _options$responseType3, _options5, _params4, _params5, _params6, _options$apiVersion3, _options6, _CONTENT_TYPES$respon3;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam = (_options4 = options) === null || _options4 === void 0 ? void 0 : _options4.operationName) !== null && _options$operationNam !== void 0 ? _options$operationNam : 'getData';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType3 = (_options5 = options) === null || _options5 === void 0 ? void 0 : _options5.responseType) !== null && _options$responseType3 !== void 0 ? _options$responseType3 : 'json';
    const filters = (_params4 = params) === null || _params4 === void 0 ? void 0 : _params4.filters;
    const dimensions = (_params5 = params) === null || _params5 === void 0 ? void 0 : _params5.dimensions;
    (_params6 = params) === null || _params6 === void 0 ? true : delete _params6.filters;
    let queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    dimensions === null || dimensions === void 0 ? void 0 : dimensions.map(d => queryParams.append('dimension', d));
    const apiVersion = (_options$apiVersion3 = (_options6 = options) === null || _options6 === void 0 ? void 0 : _options6.apiVersion) !== null && _options$apiVersion3 !== void 0 ? _options$apiVersion3 : state.configuration.apiVersion;
    const headers = {
      Accept: (_CONTENT_TYPES$respon3 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon3 !== void 0 ? _CONTENT_TYPES$respon3 : 'application/json'
    };
    const url = (0, _Utils.buildUrl)(`/${resourceType}`, hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios.default.request({
      method: 'GET',
      url,
      auth: {
        username,
        password
      },
      responseType,
      params: queryParams,
      headers
    }).then(result => {
      _Utils.Log.info(`${operationName} succeeded. The result of this operation will be in ${operationName} state.data or in your callback.`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get metadata. A generic helper function to get metadata records from a given DHIS2 instance
 * @public
 * @function
 * @param {string[]} resources - Required. List of metadata resources to fetch. E.g. `['organisationUnits', 'attributes']` or like `'dataSets'` if you only want a single type of resource. See `getResources` to see the types of resources available.
 * @param {Object} [params] - Optional `query parameters` e.g. `{filters: ['name:like:ANC'],fields:'*'}`. See `discover` or visit {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#metadata-export DHIS2 API docs}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional `options` for `getMetadata` operation. Defaults to `{operationName: 'getMetadata', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>Example getting a list of `data elements` and `indicators` where `name` includes the word **ANC**</caption>
 * getMetadata(['dataElements', 'indicators'], {
 *      filters: ['name:like:ANC'],
 * });
 */


function getMetadata(resources, params, options, callback) {
  return state => {
    var _options$responseType4, _options7, _queryParams, _queryParams2, _options$apiVersion4, _options8, _CONTENT_TYPES$respon4;

    resources = (0, _languageCommon.expandReferences)(resources)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = 'getMetadata';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType4 = (_options7 = options) === null || _options7 === void 0 ? void 0 : _options7.responseType) !== null && _options$responseType4 !== void 0 ? _options$responseType4 : 'json';

    if (typeof resources === 'string') {
      let res = {};
      res[resources] = true;
      resources = res;
    } else {
      resources = resources.reduce((acc, currentValue) => {
        acc[currentValue] = true;
        return acc;
      }, {});
    }

    let queryParams = { ...resources,
      ...params
    };
    const filters = (_queryParams = queryParams) === null || _queryParams === void 0 ? void 0 : _queryParams.filters;
    (_queryParams2 = queryParams) === null || _queryParams2 === void 0 ? true : delete _queryParams2.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion4 = (_options8 = options) === null || _options8 === void 0 ? void 0 : _options8.apiVersion) !== null && _options$apiVersion4 !== void 0 ? _options$apiVersion4 : state.configuration.apiVersion;
    const headers = {
      Accept: (_CONTENT_TYPES$respon4 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon4 !== void 0 ? _CONTENT_TYPES$respon4 : 'application/json'
    };
    const url = (0, _Utils.buildUrl)('/metadata', hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(queryParams, url);
    return _axios.default.request({
      method: 'GET',
      url,
      auth: {
        username,
        password
      },
      responseType,
      params: queryParams,
      headers
    }).then(result => {
      _Utils.Log.info(`${operationName} succeeded. The result of this operation will be in ${operationName} state.data or in your callback.`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function patch(resourceType, path, data, params, options, callback) {
  return state => {
    var _options$operationNam2, _options9, _options$responseType5, _options10, _queryParams3, _queryParams4, _options$apiVersion5, _options11, _CONTENT_TYPES$respon5;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam2 = (_options9 = options) === null || _options9 === void 0 ? void 0 : _options9.operationName) !== null && _options$operationNam2 !== void 0 ? _options$operationNam2 : 'patch';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType5 = (_options10 = options) === null || _options10 === void 0 ? void 0 : _options10.responseType) !== null && _options$responseType5 !== void 0 ? _options$responseType5 : 'json';
    let queryParams = params;
    const filters = (_queryParams3 = queryParams) === null || _queryParams3 === void 0 ? void 0 : _queryParams3.filters;
    (_queryParams4 = queryParams) === null || _queryParams4 === void 0 ? true : delete _queryParams4.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion5 = (_options11 = options) === null || _options11 === void 0 ? void 0 : _options11.apiVersion) !== null && _options$apiVersion5 !== void 0 ? _options$apiVersion5 : state.configuration.apiVersion;
    const url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    const headers = {
      Accept: (_CONTENT_TYPES$respon5 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon5 !== void 0 ? _CONTENT_TYPES$respon5 : 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
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

      _Utils.Log.info(`${operationName} succeeded. Updated ${resourceType}.\nSummary:\n${(0, _Utils.prettyJson)(resultObject)}`);

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


function del(resourceType, path, data, params, options, callback) {
  return state => {
    var _options$operationNam3, _options12, _options$responseType6, _options13, _queryParams5, _queryParams6, _options$apiVersion6, _options14, _CONTENT_TYPES$respon6;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam3 = (_options12 = options) === null || _options12 === void 0 ? void 0 : _options12.operationName) !== null && _options$operationNam3 !== void 0 ? _options$operationNam3 : 'delete';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const responseType = (_options$responseType6 = (_options13 = options) === null || _options13 === void 0 ? void 0 : _options13.responseType) !== null && _options$responseType6 !== void 0 ? _options$responseType6 : 'json';
    let queryParams = params;
    const filters = (_queryParams5 = queryParams) === null || _queryParams5 === void 0 ? void 0 : _queryParams5.filters;
    (_queryParams6 = queryParams) === null || _queryParams6 === void 0 ? true : delete _queryParams6.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const apiVersion = (_options$apiVersion6 = (_options14 = options) === null || _options14 === void 0 ? void 0 : _options14.apiVersion) !== null && _options$apiVersion6 !== void 0 ? _options$apiVersion6 : state.configuration.apiVersion;
    const headers = {
      Accept: (_CONTENT_TYPES$respon6 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon6 !== void 0 ? _CONTENT_TYPES$respon6 : 'application/json'
    };
    const url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
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
      _Utils.Log.info(`${operationName} succeeded. DELETED ${resourceType}.\nSummary:\n${(0, _Utils.prettyJson)(result.data)}`);

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Upsert a record. A generic helper function used to atomically either insert a row, or on the basis of the row already existing, UPDATE that existing row instead.
 * @public
 * @function
 * @param {string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {{attributeId: string,attributeValue:any}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters e.g. `{ou: 'lZGmxYbs97q', filters: ['w75KJ2mc4zz:EQ:Jane']}`
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


function upsert(resourceType, uniqueAttribute, data, params, options, callback) {
  return state => {
    var _options$operationNam4, _options15, _options$replace, _options16, _options$responseType7, _options17, _params7, _options$apiVersion7, _options18, _CONTENT_TYPES$respon7;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    uniqueAttribute = (0, _languageCommon.expandReferences)(uniqueAttribute)(state);
    const body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    const operationName = (_options$operationNam4 = (_options15 = options) === null || _options15 === void 0 ? void 0 : _options15.operationName) !== null && _options$operationNam4 !== void 0 ? _options$operationNam4 : 'upsert';
    const {
      username,
      password,
      hostUrl
    } = state.configuration;
    const replace = (_options$replace = (_options16 = options) === null || _options16 === void 0 ? void 0 : _options16.replace) !== null && _options$replace !== void 0 ? _options$replace : false;
    const responseType = (_options$responseType7 = (_options17 = options) === null || _options17 === void 0 ? void 0 : _options17.responseType) !== null && _options$responseType7 !== void 0 ? _options$responseType7 : 'json';
    const {
      attributeId,
      attributeValue
    } = uniqueAttribute;
    const filters = (_params7 = params) === null || _params7 === void 0 ? void 0 : _params7.filters;
    delete params.filters;
    let queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(f => queryParams.append('filter', f));
    const op = resourceType === 'trackedEntityInstances' ? 'EQ' : 'eq';
    queryParams.append('filter', `${attributeId}:${op}:${attributeValue}`);
    const apiVersion = (_options$apiVersion7 = (_options18 = options) === null || _options18 === void 0 ? void 0 : _options18.apiVersion) !== null && _options$apiVersion7 !== void 0 ? _options$apiVersion7 : state.configuration.apiVersion;
    const url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion);
    const headers = {
      Accept: (_CONTENT_TYPES$respon7 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon7 !== void 0 ? _CONTENT_TYPES$respon7 : 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);

    const getResouceName = () => {
      return _axios.default.get(hostUrl + '/api/resources', {
        auth: {
          username,
          password
        },
        transformResponse: [function (data, headers) {
          let filter = `plural:eq:${resourceType}`;

          if (filter) {
            var _headers$contentType3, _headers$contentType4;

            if (((_headers$contentType3 = (_headers$contentType4 = headers['content-type']) === null || _headers$contentType4 === void 0 ? void 0 : _headers$contentType4.split(';')[0]) !== null && _headers$contentType3 !== void 0 ? _headers$contentType3 : null) === _Utils.CONTENT_TYPES.json) {
              let tempData = JSON.parse(data);
              return { ...tempData,
                resources: (0, _Utils.applyFilter)(tempData.resources, ...(0, _Utils.parseFilter)(filter))
              };
            } else {
              _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
            }
          }

          return data;
        }]
      }).then(result => result.data.resources[0].singular);
    };

    const findRecordsWithValueOnAttribute = () => {
      console.log(queryParams);
      return _axios.default.request({
        method: 'GET',
        url,
        auth: {
          username,
          password
        },
        params: queryParams,
        headers
      });
    };

    _Utils.Log.info(`Checking if a record exists that matches this filter: attribute{ id: ${attributeId}, value: ${attributeValue} } ...`);

    return Promise.all([getResouceName(), findRecordsWithValueOnAttribute()]).then(([resourceName, recordsWithValue]) => {
      const recordsWithValueCount = recordsWithValue.data[resourceType].length;

      if (recordsWithValueCount > 1) {
        _Utils.Log.error('');

        throw new RangeError(`Cannot upsert on Non-unique attribute. The operation found more than one records with the same value of ${attributeValue} for ${attributeId}`);
      } else if (recordsWithValueCount === 1) {
        var _row1$id;

        // TODO
        // Log.info(
        //   `Unique record found, proceeding to checking if attribute is NULLABLE ...`
        // );
        // if (recordsWithNulls.data[resourceType].length > 0) {
        //   throw new Error(
        //     `Cannot upsert on Nullable attribute. The operation found records with a NULL value on ${attributeId}.`
        //   );
        // }
        _Utils.Log.info(`Attribute has unique values. Proceeding to ${replace ? 'replace' : 'merge'} ...`);

        const row1 = recordsWithValue.data[resourceType][0];
        const useCustomPATCH = ['trackedEntityInstances'].includes(resourceType) ? true : false;
        const method = replace ? 'PUT' : useCustomPATCH === true ? 'PUT' : 'PATCH';
        const id = (_row1$id = row1['id']) !== null && _row1$id !== void 0 ? _row1$id : row1[resourceName];
        const updateUrl = `${url}/${id}`;
        const payload = useCustomPATCH ? { ...row1,
          ...body,
          attributes: [...row1.attributes, ...body.attributes]
        } : body;
        return _axios.default.request({
          method,
          url: updateUrl,
          auth: {
            username,
            password
          },
          data: payload,
          params: queryParams,
          headers
        }).then(result => {
          _Utils.Log.info(`${operationName} succeeded. Updated ${resourceName}: ${updateUrl}.\nSummary:\n${(0, _Utils.prettyJson)(result.data)}`);

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      } else if (recordsWithValueCount === 0) {
        _Utils.Log.info(`Existing record not found, proceeding to CREATE(POST) ...`); // We must delete the filter and ou params so the POST request is not interpreted as a GET request by the server


        queryParams.delete('filter');
        queryParams.delete('ou');
        return _axios.default.request({
          method: 'POST',
          url,
          auth: {
            username,
            password
          },
          data: body,
          params: queryParams,
          headers
        }).then(result => {
          var _result$data$response;

          _Utils.Log.info(`${operationName} succeeded. Created ${resourceName}: ${result.data.response.importSummaries ? result.data.response.importSummaries[0].href : (_result$data$response = result.data.response) === null || _result$data$response === void 0 ? void 0 : _result$data$response.reference}.\nSummary:\n${(0, _Utils.prettyJson)(result.data)}`);

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      }
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


function attrVal(tei, attributeName) {
  var _tei$attributes, _tei$attributes$find;

  return tei === null || tei === void 0 ? void 0 : (_tei$attributes = tei.attributes) === null || _tei$attributes === void 0 ? void 0 : (_tei$attributes$find = _tei$attributes.find(a => (a === null || a === void 0 ? void 0 : a.displayName.toLowerCase()) == attributeName.toLowerCase())) === null || _tei$attributes$find === void 0 ? void 0 : _tei$attributes$find.value;
}