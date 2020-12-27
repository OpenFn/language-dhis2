"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.upsertTEI = upsertTEI;
exports.createTEI = createTEI;
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

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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


function upsertTEI(uniqueAttributeId, data, options, updateCodntion, callback) {
  return function (state) {
    var _options$apiVersion, _options$supportApiVe, _options$requireUniqu, _state$data$attribute, _state$data$attribute2;

    var _state$configuration2 = state.configuration,
        password = _state$configuration2.password,
        username = _state$configuration2.username,
        hostUrl = _state$configuration2.hostUrl;
    var body = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion !== void 0 ? _options$apiVersion : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe !== void 0 ? _options$supportApiVe : state.configuration.supportApiVersion;
    var requireUniqueAttributeConfig = (_options$requireUniqu = options === null || options === void 0 ? void 0 : options.requireUniqueAttributeConfig) !== null && _options$requireUniqu !== void 0 ? _options$requireUniqu : true;
    var headers = {
      Accept: 'application/json'
    };
    var uniqueAttributeValue = (_state$data$attribute = state.data.attributes) === null || _state$data$attribute === void 0 ? void 0 : (_state$data$attribute2 = _state$data$attribute.find(function (obj) {
      return (obj === null || obj === void 0 ? void 0 : obj.attribute) === uniqueAttributeId;
    })) === null || _state$data$attribute2 === void 0 ? void 0 : _state$data$attribute2.value;
    var trackedEntityType = state.data.trackedEntityType;
    var uniqueAttributeUrl = (0, _Utils.buildUrl)("/trackedEntityAttributes/".concat(uniqueAttributeId), hostUrl, apiVersion, supportApiVersion);
    var trackedEntityTypeUrl = (0, _Utils.buildUrl)("/trackedEntityTypes/".concat(trackedEntityType, "?fields=*"), hostUrl, apiVersion, supportApiVersion);
    var params = [{
      ou: state.data.orgUnit
    }, {
      skipPaging: true
    }];

    var findTrackedEntityType = function findTrackedEntityType() {
      return _axios["default"].get(trackedEntityTypeUrl, {
        auth: {
          username: username,
          password: password
        }
      }).then(function (result) {
        var _result$data, _result$data$trackedE;

        var attribute = (_result$data = result.data) === null || _result$data === void 0 ? void 0 : (_result$data$trackedE = _result$data.trackedEntityTypeAttributes) === null || _result$data$trackedE === void 0 ? void 0 : _result$data$trackedE.find(function (obj) {
          var _obj$trackedEntityAtt;

          return (obj === null || obj === void 0 ? void 0 : (_obj$trackedEntityAtt = obj.trackedEntityAttribute) === null || _obj$trackedEntityAtt === void 0 ? void 0 : _obj$trackedEntityAtt.id) === uniqueAttributeId;
        });
        return _objectSpread({}, result.data, {
          upsertAttributeAssigned: attribute ? true : false
        });
      });
    };

    var isAttributeUnique = function isAttributeUnique() {
      return _axios["default"].get(uniqueAttributeUrl, {
        auth: {
          username: username,
          password: password
        }
      }).then(function (result) {
        var foundAttribute = result.data;
        return {
          unique: foundAttribute.unique,
          name: foundAttribute.name
        };
      });
    };

    return Promise.all([findTrackedEntityType(), requireUniqueAttributeConfig === true ? isAttributeUnique() : Promise.resolve({
      unique: true
    })]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          entityType = _ref2[0],
          attribute = _ref2[1];

      if (!entityType.upsertAttributeAssigned) {
        _Utils.Log.error('');

        throw new RangeError("Tracked Entity Attribute ".concat(uniqueAttributeId, " is not assigned to ").concat(entityType.name, " Entity Type. Ensure, in DHIS2, this tracked entity attribute is assigned to ").concat(entityType.name, " and that it is marked as unique."));
      }

      if (!attribute.unique) {
        var _attribute$name;

        _Utils.Log.error('');

        throw new RangeError("Attribute ".concat((_attribute$name = attribute.name) !== null && _attribute$name !== void 0 ? _attribute$name : '', "(").concat(uniqueAttributeId, ") is not unique. Ensure, in DHIS2, this tracked entity attribute is marked as unique."));
      }

      return upsert('trackedEntityInstances', {
        attributeId: uniqueAttributeId,
        attributeValue: uniqueAttributeValue
      }, updateCodntion, body, params, options, callback)(state);
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
 */


function createTEI(data, params, options, callback) {
  return function (state) {
    return create('trackedEntityInstances', data, params, options, callback)(state);
  };
} //#endregion
//#region GENERIC HELPER OPERATIONS

/**
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @todo Implementation
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

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl;
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

    (0, _Utils.logOperation)('getResources');
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
    var _options$apiVersion2, _options$supportApiVe2, _CONTENT_TYPES$respon2;

    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var apiVersion = (_options$apiVersion2 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion2 !== void 0 ? _options$apiVersion2 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe2 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe2 !== void 0 ? _options$supportApiVe2 : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/schemas/".concat(resourceType !== null && resourceType !== void 0 ? resourceType : ''), hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)('getSchema');
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
    var _options$apiVersion3, _options$supportApiVe3, _CONTENT_TYPES$respon3;

    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var apiVersion = (_options$apiVersion3 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion3 !== void 0 ? _options$apiVersion3 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe3 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe3 !== void 0 ? _options$supportApiVe3 : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon3 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon3 !== void 0 ? _CONTENT_TYPES$respon3 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/".concat(resourceType), hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)('getData');
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
    var _options$apiVersion4, _options$supportApiVe4, _CONTENT_TYPES$respon4;

    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password,
        hostUrl = _state$configuration6.hostUrl;
    var queryParams = (0, _languageCommon.expandReferences)(_objectSpread({}, resources, {}, params))(state);
    var apiVersion = (_options$apiVersion4 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion4 !== void 0 ? _options$apiVersion4 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe4 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe4 !== void 0 ? _options$supportApiVe4 : state.configuration.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon4 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon4 !== void 0 ? _CONTENT_TYPES$respon4 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)('/metadata', hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)('getMetadata');
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
    var _options$apiVersion5, _options$supportApiVe5;

    var _state$configuration7 = state.configuration,
        username = _state$configuration7.username,
        password = _state$configuration7.password,
        hostUrl = _state$configuration7.hostUrl;
    var queryParams = new URLSearchParams(params === null || params === void 0 ? void 0 : params.map(function (item) {
      var _Object$entries;

      return (_Object$entries = Object.entries(item)) === null || _Object$entries === void 0 ? void 0 : _Object$entries.flat();
    }));
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion5 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion5 !== void 0 ? _options$apiVersion5 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe5 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe5 !== void 0 ? _options$supportApiVe5 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)("CREATE ".concat(resourceType));
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
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "CREATE succeeded").concat(_Utils.ESCAPE, ". Created ").concat(resourceType, ": ").concat(_Utils.COLORS.FgGreen).concat(result.data.response.importSummaries[0].href).concat(_Utils.ESCAPE, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

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
    (0, _Utils.logOperation)('update');
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
    var _options$apiVersion7, _options$supportApiVe7;

    var _state$configuration9 = state.configuration,
        username = _state$configuration9.username,
        password = _state$configuration9.password,
        hostUrl = _state$configuration9.hostUrl; // const objectPath = expandReferences(path)(state);

    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion7 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion7 !== void 0 ? _options$apiVersion7 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe7 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe7 !== void 0 ? _options$supportApiVe7 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)('patch');
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


function del(resourceType, path, data, params, options, callback) {
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
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion, supportApiVersion);
    (0, _Utils.logOperation)('del');
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


function upsert(resourceType, uniqueAttribute, updateCondition, data, params, options, callback) {
  return function (state) {
    var _options$replace, _options$apiVersion9, _options$supportApiVe9, _CONTENT_TYPES$respon5;

    var _state$configuration11 = state.configuration,
        username = _state$configuration11.username,
        password = _state$configuration11.password,
        hostUrl = _state$configuration11.hostUrl;
    var replace = (_options$replace = options === null || options === void 0 ? void 0 : options.replace) !== null && _options$replace !== void 0 ? _options$replace : false;
    var responseType = 'json';

    var _expandReferences = (0, _languageCommon.expandReferences)(uniqueAttribute)(state),
        attributeId = _expandReferences.attributeId,
        attributeValue = _expandReferences.attributeValue;

    var _expandReferences2 = (0, _languageCommon.expandReferences)(updateCondition)(state),
        sourceValue = _expandReferences2.sourceValue,
        operator = _expandReferences2.operator,
        destinationValuePath = _expandReferences2.destinationValuePath;

    var queryParams = new URLSearchParams(params === null || params === void 0 ? void 0 : params.map(function (item) {
      var _Object$entries2;

      return (_Object$entries2 = Object.entries(item)) === null || _Object$entries2 === void 0 ? void 0 : _Object$entries2.flat();
    }));
    var op = resourceType === 'trackedEntityInstances' ? 'EQ' : 'eq';
    queryParams.append('filter', "".concat(attributeId, ":").concat(op, ":").concat(attributeValue));
    var body = (0, _languageCommon.expandReferences)(data)(state);
    var apiVersion = (_options$apiVersion9 = options === null || options === void 0 ? void 0 : options.apiVersion) !== null && _options$apiVersion9 !== void 0 ? _options$apiVersion9 : state.configuration.apiVersion;
    var supportApiVersion = (_options$supportApiVe9 = options === null || options === void 0 ? void 0 : options.supportApiVersion) !== null && _options$supportApiVe9 !== void 0 ? _options$supportApiVe9 : state.configuration.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion, supportApiVersion);
    var headers = {
      Accept: (_CONTENT_TYPES$respon5 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon5 !== void 0 ? _CONTENT_TYPES$respon5 : 'application/json'
    };
    (0, _Utils.logOperation)('upsert');
    (0, _Utils.logApiVersion)(apiVersion, supportApiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);

    var getResouceName = function getResouceName() {
      return _axios["default"].get(hostUrl + '/api/resources', {
        auth: {
          username: username,
          password: password
        },
        transformResponse: [function (data, headers) {
          var filter = "plural:eq:".concat(resourceType);

          if (filter) {
            var _headers$contentType3, _headers$contentType4;

            if (((_headers$contentType3 = (_headers$contentType4 = headers['content-type']) === null || _headers$contentType4 === void 0 ? void 0 : _headers$contentType4.split(';')[0]) !== null && _headers$contentType3 !== void 0 ? _headers$contentType3 : null) === _Utils.CONTENT_TYPES.json) {
              var tempData = JSON.parse(data);
              return _objectSpread({}, tempData, {
                resources: _Utils.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _Utils.parseFilter)(filter))))
              });
            } else {
              _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
            }
          }

          return data;
        }]
      }).then(function (result) {
        return result.data.resources[0].singular;
      });
    };

    var findRecordsWithValueOnAttribute = function findRecordsWithValueOnAttribute() {
      console.log(queryParams);
      return _axios["default"].request({
        method: 'GET',
        url: url,
        auth: {
          username: username,
          password: password
        },
        params: queryParams,
        headers: headers
      });
    };

    _Utils.Log.info("Checking if a record exists that matches this filter: ".concat(_Utils.COLORS.FgGreen, "attribute{ id: ").concat(attributeId, ", value: ").concat(attributeValue, " }\x1B[0m ..."));

    return Promise.all([getResouceName(), findRecordsWithValueOnAttribute()]).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          resourceName = _ref4[0],
          recordsWithValue = _ref4[1];

      var recordsWithValueCount = recordsWithValue.data[resourceType].length;

      if (recordsWithValueCount > 1) {
        throw new RangeError("Cannot upsert on Non-unique attribute. The operation found more than one records with the same value of ".concat(attributeValue, " for ").concat(attributeId));
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
        _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Attribute has unique values").concat(_Utils.ESCAPE, ". Proceeding to ").concat(_Utils.COLORS.FgGreen).concat(replace ? 'replace' : 'merge').concat(_Utils.ESCAPE, " ..."));

        var row1 = recordsWithValue.data[resourceType][0];
        var useCustomPATCH = ['trackedEntityInstances'].includes(resourceType) ? true : false;
        var method = replace ? 'PUT' : useCustomPATCH === true ? 'PUT' : 'PATCH';
        var id = (_row1$id = row1['id']) !== null && _row1$id !== void 0 ? _row1$id : row1[resourceName];
        var updateUrl = "".concat(url, "/").concat(id);
        var payload = useCustomPATCH ? _objectSpread({}, row1, {}, body) : body;
        return _axios["default"].request({
          method: method,
          url: updateUrl,
          auth: {
            username: username,
            password: password
          },
          data: payload,
          params: queryParams,
          headers: headers
        }).then(function (result) {
          _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Upsert succeeded").concat(_Utils.ESCAPE, ". Updated ").concat(resourceName, ": ").concat(_Utils.COLORS.FgGreen).concat(updateUrl).concat(_Utils.ESCAPE, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      } else if (recordsWithValueCount === 0) {
        _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Existing record not found").concat(_Utils.ESCAPE, ", proceeding to ").concat(_Utils.COLORS.FgGreen, "CREATE(POST)").concat(_Utils.ESCAPE, " ..."));

        queryParams["delete"]('filter');
        queryParams.append('importStrategy', 'CREATE');
        return _axios["default"].request({
          method: 'POST',
          url: url,
          auth: {
            username: username,
            password: password
          },
          data: body,
          params: queryParams,
          headers: headers
        }).then(function (result) {
          _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Upsert succeeded").concat(_Utils.ESCAPE, ". Created ").concat(resourceName, ": ").concat(_Utils.COLORS.FgGreen).concat(result.data.response.importSummaries[0].href).concat(_Utils.ESCAPE, "\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      }
    });
  };
} //#endregion
//#region EXPORTS


exports.axios = _axios["default"]; //#endregion
