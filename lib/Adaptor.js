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
exports.enroll = enroll;
exports.fetchAnalytics = fetchAnalytics;
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

var _languageCommon = require("language-common");

var _Client = require("./Client");

var _url4 = require("url");

var _fp = require("lodash/fp");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

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
 *   }},
 *   postUrl: "yourposturl"
 * )
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
    console.log('Posting event:');
    console.log(body);
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Success:', result);
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
    console.log('Posting data value set:');
    console.log(body);
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Success:', result.body);
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
      state.references = result;
      return state;
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
    console.log('Posting tracked entity instance data:');
    console.log(body);
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Success:', result);
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
 * @param {object} tei - Payload data for the TEI to be updated
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
    console.log("Updating tracked entity instance ".concat(tei, " with data:"));
    console.log(body);
    return (0, _Client.put)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Success:', result);
      return _objectSpread({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
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
//
//     const { username, password, hostUrl } = state.configuration;
//
//     const url = resolveUrl(hostUrl + '/', 'api/trackedEntityInstances')
//
//     console.log("Posting tracked entity instance data:");
//     console.log(body)
//
//     return post({ username, password, body, url })
//     .then((result) => {
//       console.log("Success:", result);
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
    var _state$configuration8 = state.configuration,
        username = _state$configuration8.username,
        password = _state$configuration8.password,
        hostUrl = _state$configuration8.hostUrl;
    var url = (0, _url4.resolve)(hostUrl + '/', 'api/enrollments');
    console.log('Enrolling tracked entity instance with data:');
    console.log(body);
    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log('Success:', result);
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
    var _state$configuration9 = state.configuration,
        username = _state$configuration9.username,
        password = _state$configuration9.password,
        hostUrl = _state$configuration9.hostUrl;
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
