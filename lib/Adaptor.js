"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
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

var _lodash = require("lodash");

var _utils = require("./utils");

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
    console.log('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');
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

function isLike(string, words) {
  var wordsArrary = words.match(/([^\W]+[^\s,]*)/).splice(0, 1);

  var isFound = function isFound(word) {
    return RegExp(word, 'i').test(string);
  };

  return (0, _lodash.some)(wordsArrary, isFound);
}

var dhis2OperatorMap = {
  eq: _lodash.eq,
  like: isLike
};

function applyFilter(arrObject, filterTokens) {
  if (filterTokens) {
    try {
      return (0, _lodash.filter)(arrObject, function (obj) {
        return Reflect.apply(filterTokens[1], obj, [obj[filterTokens[0]], filterTokens[2]]);
      });
    } catch (error) {
      var _filterTokens$, _filterTokens$2, _filterTokens$3;

      console.log("Returned unfiltered data. Failed to apply custom filter(".concat(JSON.stringify({
        property: (_filterTokens$ = filterTokens[0]) !== null && _filterTokens$ !== void 0 ? _filterTokens$ : null,
        operator: (_filterTokens$2 = filterTokens[1]) !== null && _filterTokens$2 !== void 0 ? _filterTokens$2 : null,
        value: (_filterTokens$3 = filterTokens[2]) !== null && _filterTokens$3 !== void 0 ? _filterTokens$3 : null
      }, null, 2), ") on this collection. The operator you supplied maybe unsupported on this resource at the moment."));
      return arrObject;
    }
  }

  console.log("No filters applied, returned all records on this resource.");
  return arrObject;
}

function parseFilter(filterExpression) {
  var _filterTokens$4;

  var filterTokens = filterExpression === null || filterExpression === void 0 ? void 0 : filterExpression.split(':');
  filterTokens ? filterTokens[1] = dhis2OperatorMap[(_filterTokens$4 = filterTokens[1]) !== null && _filterTokens$4 !== void 0 ? _filterTokens$4 : null] : null;
  return filterTokens;
}
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


function getSampleState(resourceType, operation) {
  return state;
}

function showSampleExpression(resourceType, sampleState, operation) {
  return state;
}

function discoverParams(resourceType) {
  return state;
}

function getResources(params, callback) {
  return function (state) {
    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        hostUrl = _state$configuration2.hostUrl,
        apiVersion = _state$configuration2.apiVersion;
    var url = (0, _url.resolve)(hostUrl + '/', 'api/resources');
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      transformResponse: [function (data) {
        var _JSON$parse;

        return applyFilter((_JSON$parse = JSON.parse(data)) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.resources, parseFilter(params === null || params === void 0 ? void 0 : params.filter));
      }]
    }).then(function (result) {
      _utils.Log.info("Request params:\n".concat((0, _utils.prettyJson)(params !== null && params !== void 0 ? params : {}), "\ngetResources succeeded.\nThe body of this result will be available in state.data or in your callback"));

      var nextState = _objectSpread({}, state, {
        data: result.data,
        references: [].concat(_toConsumableArray(state.references), [result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
    });
  };
}

function getSchema(resourceType, params, options, callback) {
  return function (state) {
    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl,
        apiVersion = _state$configuration3.apiVersion;
    var url = (0, _url.resolve)(hostUrl + '/', "api/schemas/".concat(resourceType));
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: params
    }).then(function (result) {
      _utils.Log.info("getSchema('".concat(resourceType, "') succeeded. The body of this result will be available in state.data or in your callback"));

      var nextState = _objectSpread({}, state, {
        data: result.data,
        references: [].concat(_toConsumableArray(state.references), [result.data])
      });

      if (callback) return callback(nextState);
      return nextState;
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

    _utils.Log.info("Query ".concat((0, _utils.prettyJson)(query)));

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
