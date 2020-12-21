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
exports.post = post;
exports.update = update;
exports.del = del;
exports.patch = patch;
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
 * Intercepts every response, checks if the content type received is same as we send, the reject.
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
  _Utils.Log.error("".concat(error === null || error === void 0 ? void 0 : error.message)); // {
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
 * Get DHIS2 api resources
 * @param {Object} params - The optional query parameters for this endpoint. E.g `{filter: 'singular:like:attribute'}`
 * @param {string} params.filter - The optional filter parameter, specifiying the filter expression. E.g. `singular:eq:attribute`
 * @param {string} responseType - The optional response type. Defaults to `json`
 * @param {Object} options - The optional flags to control behavior of function. E.g `{supportApiVersion: true}`
 * @param {boolean} options.supportApiVersion - The optional flag, only set to `true` if endpoint supports use of api versions in url. Defaults to `false`
 * @param {Function} callback - The optional function that will be called to handle data returned by this function. Defaults to `state.data`
 */


function getResources(params, responseType, options, callback) {
  return function (state) {
    var _CONTENT_TYPES$respon;

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        hostUrl = _state$configuration2.hostUrl,
        apiVersion = _state$configuration2.apiVersion;
    var supportApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var filter = params === null || params === void 0 ? void 0 : params.filter;
    var headers = {
      Accept: (_CONTENT_TYPES$respon = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon !== void 0 ? _CONTENT_TYPES$respon : 'application/json'
    };
    var path = '/resources';
    var url = (0, _Utils.buildUrl)(path, hostUrl, apiVersion, supportApiVersion);

    var transformResponse = function transformResponse(data, headers) {
      if (filter) {
        var _headers$contentType, _headers$contentType2;

        if ((_headers$contentType = (_headers$contentType2 = headers['content-type']) === null || _headers$contentType2 === void 0 ? void 0 : _headers$contentType2.split(';')[0]) !== null && _headers$contentType !== void 0 ? _headers$contentType : null === _Utils.CONTENT_TYPES.json) {
          var tempData = JSON.parse(data);
          return _objectSpread({}, tempData, {
            resources: _Utils.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _Utils.parseFilter)(filter))))
          });
        }
      }

      return data;
    };

    (0, _Utils.logApiVersion)(state.configuration, options);
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
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('getResources', null, queryParams, options, callback));

      var nextState = _objectSpread({}, state, {
        data: result === null || result === void 0 ? void 0 : result.data,
        references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
    });
  };
}
/**
 *
 * @param {string} resourceType
 * @param {*} params
 * @param {*} responseType
 * @param {*} options
 * @param {*} callback
 */


function getSchema(resourceType, params, responseType, options, callback) {
  return function (state) {
    var _CONTENT_TYPES$respon2;

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl,
        apiVersion = _state$configuration3.apiVersion;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var useApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/schemas/".concat(resourceType), hostUrl, apiVersion, useApiVersion);
    (0, _Utils.logApiVersion)(state.configuration, options);
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
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('getSchema', resourceType, queryParams, options, callback));

      var nextState = _objectSpread({}, state, {
        data: result === null || result === void 0 ? void 0 : result.data,
        references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
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


function getData(resourceType, params, responseType, options, callback) {
  return function (state) {
    var _CONTENT_TYPES$respon3;

    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl,
        apiVersion = _state$configuration4.apiVersion;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var useApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon3 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon3 !== void 0 ? _CONTENT_TYPES$respon3 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/".concat(resourceType), hostUrl, apiVersion, useApiVersion);
    (0, _Utils.logApiVersion)(state.configuration, options);
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
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('getData', resourceType, queryParams, options, callback));

      var nextState = _objectSpread({}, state, {
        data: result === null || result === void 0 ? void 0 : result.data,
        references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
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
  {attributes: true, organisationUnits: true},
  {
    fields: '*',
    // filter: 'id:eq:PWxgadk4sCG',
  },
  {
    includeSystem: false,
  }
);
 */


function getMetadata(resources, params, responseType, options, callback) {
  return function (state) {
    var _CONTENT_TYPES$respon4;

    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl,
        apiVersion = _state$configuration5.apiVersion;
    var queryParams = (0, _languageCommon.expandReferences)(_objectSpread({}, resources, {}, params))(state);
    var useApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon4 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon4 !== void 0 ? _CONTENT_TYPES$respon4 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)('/metadata', hostUrl, apiVersion, useApiVersion);
    (0, _Utils.logApiVersion)(state.configuration, options);
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
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('getMetadata', resources, queryParams, options, callback));

      var nextState = _objectSpread({}, state, {
        data: result === null || result === void 0 ? void 0 : result.data,
        references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
    });
  };
}

function post(resourceType, data, params, options, callback) {
  return function (state) {
    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password,
        hostUrl = _state$configuration6.hostUrl,
        apiVersion = _state$configuration6.apiVersion;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state); // const payload = expandReferences(data);

    var payload = data;
    var useApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion, useApiVersion);
    (0, _Utils.logApiVersion)(state.configuration, options);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'post',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: payload
    }).then(function (result) {
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('postData', resourceType, queryParams, options, callback));

      var nextState = _objectSpread({}, state, {
        data: result === null || result === void 0 ? void 0 : result.data,
        references: [].concat(_toConsumableArray(state === null || state === void 0 ? void 0 : state.references), [result === null || result === void 0 ? void 0 : result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
    });
  };
}

function update(resourceType, query, data, params, options) {
  return state;
}

function del(resourceType, query, params, options) {
  return state;
}

function patch(resourceType, query, params, options) {
  return state;
}

function upsert(resourceType, uniqueAttribute, data, params, options) {
  return state;
}

exports.axios = _axios["default"];
