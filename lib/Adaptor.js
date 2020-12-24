"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.discover = discover;
exports.getResources = getResources;
exports.getSchema = getSchema;
exports.getData = getData;
exports.getMetadata = getMetadata;
exports.create = create;
exports.update = update;
exports.patch = patch;
exports.del = del;
exports.upsert = upsert;
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});

var _axios = _interopRequireDefault(require("axios"));

var _languageCommon = require("language-common");

var _lodash = require("lodash");

var _Utils = require("./Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
function execute() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };
  return function (state) {
    return _languageCommon.execute.apply(void 0, [configMigrationHelper].concat(operations))(_objectSpread({}, initialState, {}, state));
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
  var _state$configuration = state.configuration,
      hostUrl = _state$configuration.hostUrl,
      apiUrl = _state$configuration.apiUrl;

  if (!hostUrl) {
    _Utils.Log.warn('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');

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


_axios["default"].interceptors.response.use(function (response) {
  var _response$headers$con, _response;

  var contentType = (_response$headers$con = response.headers['content-type']) === null || _response$headers$con === void 0 ? void 0 : _response$headers$con.split(';')[0];
  var acceptHeaders = response.config.headers['Accept'].split(';')[0].split(',');

  if (response.config.method === 'get') {
    if ((0, _lodash.indexOf)(acceptHeaders, contentType) === -1) {
      var newError = {
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
      response = _objectSpread({}, response, {
        data: JSON.parse(response.data)
      });
    } catch (error) {
      /** Keep quiet */
    }
  }

  return response;
}, function (error) {
  var _error$response, _error$response$data;

  _Utils.Log.error("".concat(error === null || error === void 0 ? void 0 : error.message));

  console.log((_error$response = error.response) === null || _error$response === void 0 ? void 0 : (_error$response$data = _error$response.data) === null || _error$response$data === void 0 ? void 0 : _error$response$data.response); // {
  //   status: error?.response?.status,
  //   message: error?.message,
  //   url: error?.response?.config?.url,
  //   responseData: error?.response?.data,
  //   isAxiosError: error?.isAxiosError,
  // }

  return Promise.reject(error);
});
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


function discover(operation, resourceType) {
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


function getResources(params, responseType, callback) {
  return function (state) {
    var _CONTENT_TYPES$respon;

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        hostUrl = _state$configuration2.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var filter = params === null || params === void 0 ? void 0 : params.filter;
    var headers = {
      Accept: (_CONTENT_TYPES$respon = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon !== void 0 ? _CONTENT_TYPES$respon : 'application/json'
    };
    var path = '/resources';
    var url = (0, _Utils.buildUrl)(path, hostUrl, null, false);

    var transformResponse = function transformResponse(data, headers) {
      if (filter) {
        var _headers$contentType, _headers$contentType2;

        if (((_headers$contentType = (_headers$contentType2 = headers['content-type']) === null || _headers$contentType2 === void 0 ? void 0 : _headers$contentType2.split(';')[0]) !== null && _headers$contentType !== void 0 ? _headers$contentType : null) === _Utils.CONTENT_TYPES.json) {
          var tempData = JSON.parse(data);
          return _objectSpread({}, tempData, {
            resources: _Utils.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _Utils.parseFilter)(filter))))
          });
        } else {
          _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
        }
      }

      return data;
    };

    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(queryParams, url);
    return _axios["default"].request({
      url: url,
      method: 'GET',
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      headers: headers,
      transformResponse: transformResponse
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function getSchema(resourceType, params, responseType, options, callback) {
  return function (state) {
    var _options$apiVersion, _options$supportApiVe, _CONTENT_TYPES$respon2;

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var apiVersion = (_options$apiVersion = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion !== void 0 ? _options$apiVersion : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe !== void 0 ? _options$supportApiVe : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/schemas/".concat(resourceType !== null && resourceType !== void 0 ? resourceType : ''), hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function getData(resourceType, params, responseType, options, callback) {
  return function (state) {
    var _options$apiVersion2, _options$supportApiVe2, _CONTENT_TYPES$respon3;

    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var apiVersion = (_options$apiVersion2 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion2 !== void 0 ? _options$apiVersion2 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe2 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe2 !== void 0 ? _options$supportApiVe2 : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon3 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon3 !== void 0 ? _CONTENT_TYPES$respon3 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/".concat(resourceType), hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function getMetadata(resources, params, responseType, options, callback) {
  return function (state) {
    var _options$apiVersion3, _options$supportApiVe3, _CONTENT_TYPES$respon4;

    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(_objectSpread({}, resources, {}, params))(state);
    var apiVersion = (_options$apiVersion3 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion3 !== void 0 ? _options$apiVersion3 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe3 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe3 !== void 0 ? _options$supportApiVe3 : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon4 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon4 !== void 0 ? _CONTENT_TYPES$respon4 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)('/metadata', hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resources, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function create(resourceType, data, params, options, callback) {
  return function (state) {
    var _options$apiVersion4, _options$supportApiVe4;

    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password,
        hostUrl = _state$configuration6.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion4 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion4 !== void 0 ? _options$apiVersion4 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe4 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe4 !== void 0 ? _options$supportApiVe4 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'POST',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function update(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$apiVersion5, _options$supportApiVe5;

    var _state$configuration7 = state.configuration,
        username = _state$configuration7.username,
        password = _state$configuration7.password,
        hostUrl = _state$configuration7.hostUrl; // const objectPath = expandReferences(path)(state);

    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion5 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion5 !== void 0 ? _options$apiVersion5 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe5 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe5 !== void 0 ? _options$supportApiVe5 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'PUT',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
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


function patch(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$apiVersion6, _options$supportApiVe6;

    var _state$configuration8 = state.configuration,
        username = _state$configuration8.username,
        password = _state$configuration8.password,
        hostUrl = _state$configuration8.hostUrl; // const objectPath = expandReferences(path)(state);

    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion6 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion6 !== void 0 ? _options$apiVersion6 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe6 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe6 !== void 0 ? _options$supportApiVe6 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'PATCH',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}

function del(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$apiVersion7, _options$supportApiVe7;

    var _state$configuration9 = state.configuration,
        username = _state$configuration9.username,
        password = _state$configuration9.password,
        hostUrl = _state$configuration9.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion7 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion7 !== void 0 ? _options$apiVersion7 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe7 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe7 !== void 0 ? _options$supportApiVe7 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'DELETE',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}

function upsert(resourceType, uniqueAttribute, data, params, options) {
  return function (state) {
    var _options$apiVersion8, _options$supportApiVe8;

    var _state$configuration10 = state.configuration,
        username = _state$configuration10.username,
        password = _state$configuration10.password,
        hostUrl = _state$configuration10.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion8 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion8 !== void 0 ? _options$apiVersion8 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe8 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe8 !== void 0 ? _options$supportApiVe8 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'POST',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}

exports.axios = _axios["default"];
