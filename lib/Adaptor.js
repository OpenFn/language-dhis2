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
exports.postData = postData;
exports.postMetadata = postMetadata;
exports.upsertData = upsertData;
exports.upsertMetadata = upsertMetadata;
exports.updateData = updateData;
exports.updateMetadata = updateMetadata;
exports.deleteData = deleteData;
exports.deleteMetadata = deleteMetadata;
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

var _Utils = require("./Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
} // function expandDataValues(obj) {
//   return state => {
//     return mapValues(function (value) {
//       if (typeof value == 'object') {
//         return value.map(item => {
//           return expandDataValues(item)(state);
//         });
//       } else {
//         return typeof value == 'function' ? value(state) : value;
//       }
//     })(obj);
//   };
// }

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
    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password;
    var _state$configuration3 = state.configuration,
        hostUrl = _state$configuration3.hostUrl,
        apiVersion = _state$configuration3.apiVersion;
    var supportApiVersion = options === null || options === void 0 ? void 0 : options.supportApiVersion;
    var auth = {
      username: username,
      password: password
    };
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var path = '/resources';
    var url = (0, _Utils.buildUrl)(path, hostUrl, apiVersion, supportApiVersion);
    return (0, _Utils.getApiResources)(url, responseType !== null && responseType !== void 0 ? responseType : 'json', auth, queryParams, state.configuration, options).then(function (result) {
      _Utils.Log.info((0, _Utils.composeSuccessMessage)('getResources', null, queryParams, options, callback));

      return (0, _Utils.handleResponse)(result, state);
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
    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var url = (0, _Utils.buildUrl)(getSchema, resourceType, state.configuration, options);
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
      params: queryParams
    }).then(function (result) {
      _Utils.Log.info((0, _Utils.composeSuccessMessage)(getSchema, resourceType, queryParams, options, callback));

      (0, _Utils.handleResponse)(result, state);
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


function getData(resourceType, params, options, callback) {
  return function (state) {
    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var url = (0, _Utils.buildUrl)(getData, resourceType, state.configuration, options);
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
      params: queryParams
    }).then(function (result) {
      _Utils.Log.info((0, _Utils.composeSuccessMessage)(getData, resourceType, queryParams, options, callback));

      if (callback) return callback((0, _Utils.composeNextState)(state, result));
      return (0, _Utils.composeNextState)(state, result);
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
  'attributes',
  {
    fields: '*',
    // filter: 'id:eq:PWxgadk4sCG',
  },
  {
    includeSystem: false,
  }
);
 */


function getMetadata(resources, params, options, callback) {
  return function (state) {
    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password;
    var queryParams = (0, _languageCommon.expandReferences)(_objectSpread({}, resources, {}, params))(state);
    var url = (0, _Utils.buildUrl)(getMetadata, resources, state.configuration, options);
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
      params: queryParams
    }).then(function (result) {
      _Utils.Log.info((0, _Utils.composeSuccessMessage)(getMetadata, resources, queryParams, options, callback));

      if (callback) return callback((0, _Utils.composeNextState)(state, result));
      return (0, _Utils.composeNextState)(state, result);
    });
  };
}

function postData(resourceType, data, params, options, callback) {
  return function (state) {
    var _state$configuration7 = state.configuration,
        username = _state$configuration7.username,
        password = _state$configuration7.password;
    var queryParams = (0, _languageCommon.expandReferences)(params)(state);
    var payload = (0, _languageCommon.expandReferences)(data);
    var url = (0, _Utils.buildUrl)(postData, resourceType, state.configuration, options);
    (0, _Utils.logApiVersion)(state.configuration, options);
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
      _Utils.Log.info((0, _Utils.composeSuccessMessage)(getMetadata, resources, queryParams, options, callback));

      if (callback) return callback((0, _Utils.composeNextState)(state, result));
      return (0, _Utils.composeNextState)(state, result);
    });
  };
}

function postMetadata(resourceType, data, params, options) {
  return state;
}

function upsertData(resourceType, uniqueAttribute, data, params, options) {
  return state;
}

function upsertMetadata(resourceType, uniqueAttribute, data, params, options) {
  return state;
}

function updateData(resourceType, query, data, params, options) {
  return state;
}

function updateMetadata(resourceType, query, data, params, options) {
  return state;
}

function deleteData(resourceType, query, params, options) {
  return state;
}

function deleteMetadata(resourceType, query, params, options) {
  return state;
}

exports.axios = _axios["default"];
