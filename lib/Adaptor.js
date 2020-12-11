"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.fetchData = fetchData;
exports.fetchEvents = fetchEvents;
exports.event = event;
exports.dataValueSet = dataValueSet;
exports.dataElement = dataElement;
exports.createTEI = createTEI;
exports.updateTEI = updateTEI;
exports.upsertTEI = upsertTEI;
exports.enroll = enroll;
exports.fetchAnalytics = fetchAnalytics;
exports.listResources = listResources;
exports.describe = describe;
exports.fetchData2 = fetchData2;
exports.fetchMetadata = fetchMetadata;
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

var _Client = require("./Client");

var _url4 = require("url");

var _fp = require("lodash/fp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
    console.log('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');
    state.configuration.hostUrl = apiUrl;
    return state;
  }

  return state;
}
/**
 * Fetch a dataValueSet
 * @public
 * @example
 * fetchData({
 *   fields: {
 *     dataSet: 'pBOMPrpg1QX',
 *     orgUnit: 'DiszpKrYNg8',
 *     period: '201401'
 *   },
 *   postUrl: "yourposturl"
 * });
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */


function fetchData(params, postUrl) {
  return function (state) {
    var data = (0, _languageCommon.expandReferences)(params)(state);
    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        hostUrl = _state$configuration2.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/dataValueSets.json?');
    var query = data.fields || expandDataValues(params)(state);
    console.log('Getting Data Value Sets:');
    return (0, _Client.get)({
      username: username,
      password: password,
      query: query,
      url: url
    }).then(function (result) {
      console.log('Get Result:', result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;
        var _url = postUrl;
        return (0, _Client.post)({
          username: username,
          password: password,
          body: body,
          url: _url
        }).then(function (result) {
          console.log('Post Result:', result.statusCode);
          return _objectSpread({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _objectSpread({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
}
/**
 * Fetch an event
 * @public
 * @example
 * fetchEvents({
 *   fields: {
 *     orgUnit: 'DiszpKrYNg8',
 *     period: '201401'
 *   }},
 *   postUrl: "yourposturl"
 * )
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */


function fetchEvents(params, postUrl) {
  return function (state) {
    var data = (0, _languageCommon.expandReferences)(params)(state);
    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/events.json?');
    var query = data.fields || expandDataValues(params)(state);
    console.log('Getting Events Data:');
    return (0, _Client.get)({
      username: username,
      password: password,
      query: query,
      url: url
    }).then(function (result) {
      console.log('Get Result:', result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;
        var _url2 = postUrl;
        return (0, _Client.post)({
          username: username,
          password: password,
          body: body,
          url: _url2
        }).then(function (result) {
          console.log('Post Result:', result.statusCode);
          return _objectSpread({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _objectSpread({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
}
/**
 * Create an event
 * @public
 * @example
 * event(eventData)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */


function event(eventData) {
  return function (state) {
    var body = (0, _languageCommon.expandReferences)(eventData)(state);
    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/events');
    console.log("Posting event to org unit '".concat(body.orgUnit, "'."));
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
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
/**
 * Send data values using the dataValueSets resource
 * @public
 * @example
 *  dataValueSet({
 *    dataSet: dataValue("set"),
 *    orgUnit: "DiszpKrYNg8",
 *    period: "201402",
 *    completeData: "2014-03-03",
 *    dataValues: [
 *      dataElement("f7n9E0hX8qk", dataValue("name")),
 *      dataElement("Ix2HsbDMLea", dataValue("age")),
 *      dataElement("eY5ehpbEsB7", 30)
 *    ]
 * });
 * @constructor
 * @param {object} data - Payload data for the data value set
 * @returns {Operation}
 */


function dataValueSet(data) {
  return function (state) {
    var body = expandDataValues(data)(state);
    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/dataValueSets');
    console.log("Posting data value set ".concat(body.dataSet, " to org unit '").concat(body.orgUnit, "' with ").concat(body.dataValues && body.dataValues.length, " data values."));
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}
/**
 * Create a "dataElement" pairing for DHIS2.
 * @public
 * @example
 * dataElement(key, value)
 * @constructor
 * @param {string} dataElement - Payload data for the Data Element key
 * @param {variable} value - Payload data for the Data Element value
 * @param {string} comment - comment for the Data Element
 * @returns {Operation}
 */


function dataElement(dataElement, value, comment) {
  return {
    dataElement: dataElement,
    value: value,
    comment: comment
  };
}
/**
 * Create one or many new Tracked Entity Instances
 * @public
 * @example
 * createTEI(data)
 * @constructor
 * @param {object} data - Payload data for new tracked entity instance(s)
 * @returns {Operation}
 */


function createTEI(data) {
  return function (state) {
    var body = (0, _languageCommon.expandReferences)(data)(state);
    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password,
        hostUrl = _state$configuration6.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/trackedEntityInstances');
    console.log("Posting tracked entity instance of type '".concat(body.trackedEntityType, "' to org unit '").concat(body.orgUnit, "' with ").concat(body.attributes && body.attributes.length, " attributes and ").concat(body.enrollments && body.enrollments.length, " enrollments."));
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}
/**
 * Update existing Tracked Entity Instances
 * @public
 * @example
 * updateTEI(tei, data)
 * @constructor
 * @param {object} tei - identifier for the TEI to be updated
 * @param {object} data - Payload data for updating a TEI
 * @returns {Operation}
 */


function updateTEI(tei, data) {
  return function (state) {
    var body = (0, _languageCommon.expandReferences)(data)(state);
    var _state$configuration7 = state.configuration,
        username = _state$configuration7.username,
        password = _state$configuration7.password,
        hostUrl = _state$configuration7.hostUrl;
    var url = hostUrl.concat("/api/trackedEntityInstances/".concat(tei));
    console.log("Updating tracked entity instance of type '".concat(body.trackedEntityType, "' to org unit '").concat(body.orgUnit, "' with ").concat(body.attributes && body.attributes.length, " attributes and ").concat(body.enrollments && body.enrollments.length, " enrollments."));
    return (0, _Client.put)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
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


function upsertTEI(uniqueAttributeId, data, options) {
  return function (state) {
    var _state$configuration8 = state.configuration,
        password = _state$configuration8.password,
        username = _state$configuration8.username,
        hostUrl = _state$configuration8.hostUrl;
    var replace = options.replace;
    var body = (0, _languageCommon.expandReferences)(data)(state);
    var url = (0, _url4.resolve)(hostUrl + '/', "api/trackedEntityInstances");
    var uniqueAttributeUrl = "".concat(hostUrl, "/api/trackedEntityAttributes/").concat(uniqueAttributeId);
    var trackedEntityType = state.data.trackedEntityType;
    var trackedEntityTypeUrl = "".concat(hostUrl, "/api/trackedEntityTypes/").concat(trackedEntityType, "?fields=*");
    var uniqueAttributeValue = state.data.attributes.find(function (obj) {
      return obj.attribute === uniqueAttributeId;
    }).value;
    var query = {
      ou: state.data.orgUnit,
      ouMode: 'ACCESSIBLE',
      filter: "".concat(uniqueAttributeId, ":EQ:").concat(uniqueAttributeValue),
      skipPaging: true
    };
    console.log("Checking if Tracked Entity Type ".concat(trackedEntityType, " exists..."));
    return (0, _Client.get)({
      username: username,
      password: password,
      query: null,
      url: trackedEntityTypeUrl
    }).then(function (result) {
      var tet = JSON.parse(result.text);
      console.log("Tracked Entity Type ".concat(trackedEntityType, "(").concat(tet.name, ") found."));
      console.log("Checking if attribute ".concat(uniqueAttributeId, " is assigned to ").concat(tet.name, " Entity Type... "));
      var attribute = tet.trackedEntityTypeAttributes.find(function (obj) {
        return obj.trackedEntityAttribute.id === uniqueAttributeId;
      });

      if (attribute) {
        console.log("Attribute ".concat(attribute.name, "(").concat(uniqueAttributeId, ") is assigned to ").concat(tet.name, "."));
        console.log("Checking if attribute ".concat(attribute.name, "(").concat(uniqueAttributeId, ") is unique..."));
        return (0, _Client.get)({
          username: username,
          password: password,
          query: null,
          url: uniqueAttributeUrl
        }).then(function (result) {
          var foundAttribute = JSON.parse(result.text);

          if (foundAttribute.unique) {
            console.log("Tracked Entity Attribute ".concat(attribute.name, "(").concat(uniqueAttributeId, ") is unique. Proceeding to checking if Tracked Entity Instance exists..."));
            return (0, _Client.get)({
              username: username,
              password: password,
              query: query,
              url: url
            }).then(function (result) {
              console.log("query ".concat(JSON.stringify(query, null, 2)));
              var tei_body = JSON.parse(result.text);

              if (tei_body.trackedEntityInstances.length <= 0) {
                console.log("Tracked Entity Instance  with filter ".concat(query.filter, " not found, proceeding to create..."));
                return (0, _Client.post)({
                  username: username,
                  password: password,
                  body: body,
                  url: url,
                  query: null
                }).then(function (result) {
                  console.log("POST succeeded. ".concat(result.header.location, "\nSummary:\n").concat(JSON.stringify(JSON.parse(result.text), null, 2)));
                  return _objectSpread({}, state, {
                    references: [result].concat(_toConsumableArray(state.references))
                  });
                });
              } else {
                var row1 = tei_body.trackedEntityInstances[0];
                var payload = replace ? body : _objectSpread({}, row1, {}, body, {
                  attributes: [].concat(_toConsumableArray(row1.attributes), _toConsumableArray(body.attributes))
                });
                var updateUrl = "".concat(url, "/").concat(row1.trackedEntityInstance);
                console.log("Tracked Entity Instance  with filter ".concat(query.filter, " found(").concat(row1.trackedEntityInstance, "), proceeding to ").concat(replace ? 'replace' : 'merge data with', " the existing TEI..."));
                return (0, _Client.put)({
                  username: username,
                  password: password,
                  body: payload,
                  url: updateUrl,
                  query: null
                }).then(function (result) {
                  console.log("Upsert succeeded. Updated TEI: ".concat(updateUrl));
                  console.log("Summary:\n".concat(JSON.stringify(JSON.parse(result.text), null, 2)));
                  return _objectSpread({}, state, {
                    references: [result].concat(_toConsumableArray(state.references))
                  });
                });
              }
            });
          } else {
            throw new Error("Attribute ".concat(attribute.name, "(").concat(uniqueAttributeId, ") is not unique. Ensure, in DHIS2, this tracked entity attribute is marked as unique."));
          }
        });
      } else {
        throw new Error("Tracked Entity Attribute ".concat(uniqueAttributeId, " is not assigned to ").concat(tet.name, " Entity Type. Ensure, in DHIS2, this tracked entity attribute is assigned to ").concat(tet.name, " and that it is marked as unique."));
      }
    });
  };
} // /**
//  * Create and enroll TrackedEntityInstances
//  * @example
//  * execute(
//  *   createEnrollTEI(te, orgUnit, attributes, enrollments)
//  * )(state)
//  * @constructor
//  * @param {object} enrollmentData - Payload data for new enrollment
//  * @returns {Operation}
//  */
// export function upsertEnroll(upsertData) {
//
//   return state => {
//     const body = expandReferences(trackedEntityInstanceData)(state);
//     const { username, password, hostUrl } = state.configuration;
//     const url = resolveUrl(hostUrl + '/', 'api/trackedEntityInstances')
//
//     return post({ username, password, body, url })
//     .then((result) => {
//       console.log("Result:", JSON.stringify(result.body, null, 2));
//       return { ...state, references: [ result, ...state.references ] }
//     })
//
//   }
// }

/**
 * Enroll a tracked entity instance in a program
 * @public
 * @example
 * enroll(tei, enrollmentData)
 * @constructor
 * @param {object} tei
 * @param {object} enrollmentData - Payload data for new enrollment
 * @returns {Operation}
 */


function enroll(tei, enrollmentData) {
  return function (state) {
    var body = (0, _languageCommon.expandReferences)(enrollmentData)(state);
    body['trackedEntityInstance'] = tei;
    var _state$configuration9 = state.configuration,
        username = _state$configuration9.username,
        password = _state$configuration9.password,
        hostUrl = _state$configuration9.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/enrollments');
    console.log('Enrolling tracked entity instance.');
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}
/**
 * Fetch analytics
 * @public
 * @example
 * fetchAnalytics({
 *   query: {
 *     dimension: ["dx:CYI5LEmm3cG", "pe:LAST_6_MONTHS"],
 *     filter: "ou:t7vi7vJqWvi",
 *     displayProperty: "NAME",
 *     outputIdScheme: "UID"
 *   }},
 *   postUrl: "yourposturl"
 * )
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */


function fetchAnalytics(params, postUrl) {
  return function (state) {
    var data = (0, _languageCommon.expandReferences)(params)(state);
    var _state$configuration10 = state.configuration,
        username = _state$configuration10.username,
        password = _state$configuration10.password,
        hostUrl = _state$configuration10.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/26/analytics.json?');
    var query = data.query || expandDataValues(params)(state);
    console.log("Getting analytics data for query: ".concat(query));
    return (0, _Client.get)({
      username: username,
      password: password,
      query: query,
      url: url
    }).then(function (result) {
      console.log('Get Result:', result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;
        var _url3 = postUrl;
        return (0, _Client.post)({
          username: username,
          password: password,
          body: body,
          url: _url3
        }).then(function (result) {
          console.log('Post Result:', result.statusCode);
          return _objectSpread({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _objectSpread({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
}

function listResources() {
  return function (state) {
    var _state$configuration11 = state.configuration,
        username = _state$configuration11.username,
        password = _state$configuration11.password,
        hostUrl = _state$configuration11.hostUrl,
        apiVersion = _state$configuration11.apiVersion,
        inboxUrl = _state$configuration11.inboxUrl;
    var url = (0, _url4.resolve)(hostUrl + '/api/resources');
    return (0, _Client.get)({
      username: username,
      password: password,
      query: null,
      url: url
    }).then(function (result) {
      return _objectSpread({}, state, {
        references: [JSON.parse(result.text)].concat(_toConsumableArray(state.references))
      });
    });
  };
}

function describe(resourceType) {
  return function (state) {
    var _state$configuration12 = state.configuration,
        username = _state$configuration12.username,
        password = _state$configuration12.password,
        hostUrl = _state$configuration12.hostUrl,
        apiVersion = _state$configuration12.apiVersion,
        inboxUrl = _state$configuration12.inboxUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', "api/schemas/".concat(resourceType));
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      }
    }).then(function (result) {
      console.log(result.data);
      return _objectSpread({}, state, {
        data: result.data
      });
    });
  };
}

function fetchData2(resourceType, params, options) {
  return function (state) {
    var _state$configuration13 = state.configuration,
        username = _state$configuration13.username,
        password = _state$configuration13.password,
        hostUrl = _state$configuration13.hostUrl,
        apiVersion = _state$configuration13.apiVersion,
        inboxUrl = _state$configuration13.inboxUrl;
    var query = expandDataValues(params)(state);
    var url = (0, _url4.resolve)(hostUrl + '/', "api/".concat(resourceType));
    return (0, _Client.get)({
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

function fetchMetadata(resources, params, options) {
  return function (state) {
    var _state$configuration14 = state.configuration,
        username = _state$configuration14.username,
        password = _state$configuration14.password,
        hostUrl = _state$configuration14.hostUrl,
        apiVersion = _state$configuration14.apiVersion,
        inboxUrl = _state$configuration14.inboxUrl;
    var query = expandDataValues(_objectSpread({}, resources, {}, params))(state);
    var url = (0, _url4.resolve)(hostUrl + '/', "api/metadata");
    console.log("Query ".concat(JSON.stringify(query)));
    return (0, _Client.get)({
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

exports.axios = _axios["default"];
