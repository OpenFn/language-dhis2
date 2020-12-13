"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.clean = clean;
exports.loadJsonFromFile = loadJsonFromFile;
exports.parseCsvFromFile = parseCsvFromFile;
exports.transformData = transformData;
exports.getSampleState = getSampleState;
exports.showSampleExpression = showSampleExpression;
exports.discoverParams = discoverParams;
exports.getResources = getResources;
exports.getSchema = getSchema;
exports.getData = getData;
exports.getMetadata = getMetadata;
exports.postData = postData;
exports.upsertData = upsertData;
exports.updateData = updateData;
exports.deleteData = deleteData;
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

var _url = require("url");

var _fp = require("lodash/fp");

var _utils_lang_dhis = require("./utils_lang_dhis2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
    _utils_lang_dhis.Log.warn('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');

    state.configuration.hostUrl = apiUrl;
    return state;
  }

  return state;
}

function expandDataValues(obj) {
  return function (state) {
    return (0, _fp.mapValues)(function (value) {
      if (_typeof(value) == 'object') {
        return value.map(function (item) {
          return expandDataValues(item)(state);
        });
      } else {
        return typeof value == 'function' ? value(state) : value;
      }
    })(obj);
  };
}

_axios["default"].interceptors.response.use(function (response) {
  // TODO Cleanup sensitive info
  return response;
}, function (error) {
  var _error$response, _error$response2, _error$response2$conf, _error$response3;

  // TODO Cleanup sensitive info
  _utils_lang_dhis.Log.error("".concat(error === null || error === void 0 ? void 0 : error.message));

  return Promise.reject({
    status: error === null || error === void 0 ? void 0 : (_error$response = error.response) === null || _error$response === void 0 ? void 0 : _error$response.status,
    message: error === null || error === void 0 ? void 0 : error.message,
    url: error === null || error === void 0 ? void 0 : (_error$response2 = error.response) === null || _error$response2 === void 0 ? void 0 : (_error$response2$conf = _error$response2.config) === null || _error$response2$conf === void 0 ? void 0 : _error$response2$conf.url,
    responseData: error === null || error === void 0 ? void 0 : (_error$response3 = error.response) === null || _error$response3 === void 0 ? void 0 : _error$response3.data,
    isAxiosError: error === null || error === void 0 ? void 0 : error.isAxiosError
  });
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
 * Clean JSON object
 * Useful for deep-removing certain keys in an object(recursively), or de-identifying sensitive data
 * @param {*} data
 * @param {*} options
 * @param  {...any} fields
 */


function clean(data, options) {
  return state;
}
/**
 * TODO
 *
 * Load JSON from file
 * @param {*} filePath
 */


function loadJsonFromFile(filePath) {
  return state;
}
/**
 * TODO
 *
 * Load and parse csv file
 * @param {string} filePath
 */


function parseCsvFromFile(filePath) {
  return state;
}
/**
 * TODO
 *
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


function transformData(data, predicate, transformer, step) {
  return state;
}
/**
 * TODO
 *
 * Get Sample State for a given operation on a resource
 * @example
 * getSampleSate('getData', 'trackedEntityInstances')
 * @param {*} operation
 * @param {*} resourceType
 */


function getSampleState(operation, resourceType) {
  return state;
}
/**
 * TODO
 *
 * Show Sample Expression for a given operation on a resource
 * @example
 * showSampleExpression('postData', 'trackedEntityInstances',{sampleState})
 * @param {*} resourceType
 * @param {*} sampleState
 * @param {*} operation
 */


function showSampleExpression(operation, resourceType, sampleState) {
  return state;
}
/**
 * TODO
 *
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @example
 * discoverParams('trackedEntityInstances')
 * @param {*} operation
 * @param {*} resourceType
 */


function discoverParams(operation, resourceType) {
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


function getResources(params, options, callback) {
  return function (state) {
    var _state$configuration2 = state === null || state === void 0 ? void 0 : state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password;

    var filter = params.filter;
    var url = (0, _utils_lang_dhis.buildUrl)(getResources, null, state === null || state === void 0 ? void 0 : state.configuration, options);
    (0, _utils_lang_dhis.logApiVersion)(state === null || state === void 0 ? void 0 : state.configuration, options);
    (0, _utils_lang_dhis.logWaitingForServer)(url, params);
    (0, _utils_lang_dhis.warnExpectLargeResult)(params, url);
    return _axios["default"].request({
      method: _utils_lang_dhis.HTTP_METHODS.GET,
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: _utils_lang_dhis.MEDIA_TYPES.APP_JSON.alias,
      transformResponse: [function (data, headers) {
        var _headers$HTTP_HEADERS, _headers$HTTP_HEADERS2;

        if ((_headers$HTTP_HEADERS = (_headers$HTTP_HEADERS2 = headers[_utils_lang_dhis.HTTP_HEADERS.CONTENT_TYPE]) === null || _headers$HTTP_HEADERS2 === void 0 ? void 0 : _headers$HTTP_HEADERS2.split(';')[0]) !== null && _headers$HTTP_HEADERS !== void 0 ? _headers$HTTP_HEADERS : null === _utils_lang_dhis.MEDIA_TYPES.APP_JSON.value) {
          var tempData = JSON.parse(data);
          return _objectSpread({}, tempData, {
            resources: _utils_lang_dhis.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _utils_lang_dhis.parseFilter)(filter))))
          });
        }

        return data;
      }]
    }).then(function (result) {
      _utils_lang_dhis.Log.info((0, _utils_lang_dhis.composeSuccessMessage)(getResources, null, params, options, callback));

      if (callback) return callback((0, _utils_lang_dhis.composeNextState)(state, result));
      return (0, _utils_lang_dhis.composeNextState)(state, result);
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


function getSchema(resourceType, params, options, callback) {
  return function (state) {
    var _state$configuration3 = state === null || state === void 0 ? void 0 : state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password;

    var url = (0, _utils_lang_dhis.buildUrl)(getSchema, resourceType, state === null || state === void 0 ? void 0 : state.configuration, options);
    (0, _utils_lang_dhis.logApiVersion)(state.configuration, options);
    (0, _utils_lang_dhis.logWaitingForServer)(url, params);
    (0, _utils_lang_dhis.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: _utils_lang_dhis.HTTP_METHODS.GET,
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: params
    }).then(function (result) {
      _utils_lang_dhis.Log.info((0, _utils_lang_dhis.composeSuccessMessage)(getSchema, resourceType, params, options, callback));

      if (callback) return callback((0, _utils_lang_dhis.composeNextState)(state, result));
      return (0, _utils_lang_dhis.composeNextState)(state, result);
    });
  };
}

function getData(resourceType, params, options) {
  return function (state) {
    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl,
        apiVersion = _state$configuration4.apiVersion,
        inboxUrl = _state$configuration4.inboxUrl;
    var query = expandDataValues(params)(state);
    var url = (0, _url.resolve)(hostUrl + '/', "api/".concat(resourceType));
    return get({
      username: username,
      password: password,
      query: query,
      url: url
    }).then(function (result) {
      return _objectSpread({}, state, {
        references: [JSON.parse(result.text)].concat(_toConsumableArray(state.references))
      });
    });
  };
}

function getMetadata(resources, params, options) {
  return function (state) {
    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl,
        apiVersion = _state$configuration5.apiVersion,
        inboxUrl = _state$configuration5.inboxUrl;
    var query = expandDataValues(_objectSpread({}, resources, {}, params))(state);
    var url = (0, _url.resolve)(hostUrl + '/', "api/metadata");

    _utils_lang_dhis.Log.info("Query ".concat((0, _utils_lang_dhis.prettyJson)(query)));

    return get({
      username: username,
      password: password,
      query: query,
      url: url
    }).then(function (result) {
      var parsed_result = JSON.parse(result === null || result === void 0 ? void 0 : result.text);
      (options === null || options === void 0 ? void 0 : options.includeSystem) ? true : delete parsed_result.system;
      return _objectSpread({}, state, {
        references: [parsed_result].concat(_toConsumableArray(state.references))
      });
    });
  };
}

function postData(resourceType, data, params, options) {
  return state;
}

function upsertData(resourceType, uniqueAttribute, data, params, options) {
  return state;
}

function updateData(resourceType, query, data, params, options) {
  return state;
}

function deleteData(resourceType, query, params, options) {
  return state;
}

exports.axios = _axios["default"];
