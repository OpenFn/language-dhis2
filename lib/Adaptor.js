'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alterState = exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.each = exports.merge = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */

exports.execute = execute;
exports.fetchAnalytics = fetchAnalytics;
exports.fetchData = fetchData;
exports.fetchEvents = fetchEvents;
exports.event = event;
exports.dataValueSet = dataValueSet;
exports.dataElement = dataElement;
exports.createTEI = createTEI;
exports.updateTEI = updateTEI;
exports.enroll = enroll;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});

var _Client = require('./Client');

var _url4 = require('url');

var _fp = require('lodash/fp');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Fetch analytics
 * @public
 * @example
 * fetchAnalytics({
 *   query: {
 *     dimension: "dx:CYI5LEmm3cG",
 *     dimension: "pe:LAST_6_MONTHS",
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

    var _state$configuration = state.configuration,
        username = _state$configuration.username,
        password = _state$configuration.password,
        apiUrl = _state$configuration.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/26/analytics.json?');

    var query = data.query || expandDataValues(params)(state);

    console.log('Getting analytics data for query: ' + query);

    return (0, _Client.get)({ username: username, password: password, query: query, url: url }).then(function (result) {
      console.log("Get Result:", result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;

        var _url = postUrl;

        return (0, _Client.post)({ username: username, password: password, body: body, url: _url }).then(function (result) {
          console.log("Post Result:", result.statusCode);
          return _extends({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _extends({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
};

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

    var query = (0, _languageCommon.expandReferences)(params)(state);

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        apiUrl = _state$configuration2.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/dataValueSets.json?');

    console.log("Getting Data Value Sets:");

    return (0, _Client.get)({ username: username, password: password, query: query, url: url }).then(function (result) {
      console.log("Get Result:", result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;

        var _url2 = postUrl;

        return (0, _Client.post)({ username: username, password: password, body: body, url: _url2 }).then(function (result) {
          console.log("Post Result:", result.statusCode);
          return _extends({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _extends({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
};

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
    var query = (0, _languageCommon.expandReferences)(params)(state);

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        apiUrl = _state$configuration3.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/events.json?');

    console.log("Getting Events Data:");

    return (0, _Client.get)({ username: username, password: password, query: query, url: url }).then(function (result) {
      console.log("Get Result:", result.body);
      return result;
    }).then(function (result) {
      if (postUrl) {
        var body = result.body;

        var _url3 = postUrl;

        return (0, _Client.post)({ username: username, password: password, body: body, url: _url3 }).then(function (result) {
          console.log("Post Result:", result.statusCode);
          return _extends({}, state, {
            references: [result].concat(_toConsumableArray(state.references))
          });
        });
      } else {
        return _extends({}, state, {
          references: [result].concat(_toConsumableArray(state.references))
        });
      }
    });
  };
};

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
        apiUrl = _state$configuration4.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/events');

    console.log("Posting event:");
    console.log(body);

    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}

function expandDataValues(obj) {
  return function (state) {
    return (0, _fp.mapValues)(function (value) {
      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
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
        apiUrl = _state$configuration5.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/dataValueSets');

    console.log("Posting data value set:");
    console.log(body);

    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log("Success:", result.body);
      return _extends({}, state, {
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
  return { dataElement: dataElement, value: value, comment: comment };
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
        apiUrl = _state$configuration6.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/trackedEntityInstances');

    console.log("Posting tracked entity instance data:");
    console.log(body);

    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, {
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
        apiUrl = _state$configuration7.apiUrl;


    var url = apiUrl.concat('/api/trackedEntityInstances/' + tei);

    console.log('Updating tracked entity instance ' + tei + ' with data:');
    console.log(body);

    return (0, _Client.put)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}

// /**
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
//     const { username, password, apiUrl } = state.configuration;
//
//     const url = resolveUrl(apiUrl + '/', 'api/trackedEntityInstances')
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
    body["trackedEntityInstance"] = tei;

    var _state$configuration8 = state.configuration,
        username = _state$configuration8.username,
        password = _state$configuration8.password,
        apiUrl = _state$configuration8.apiUrl;


    var url = (0, _url4.resolve)(apiUrl + '/', 'api/enrollments');

    console.log("Enrolling tracked entity instance with data:");
    console.log(body);

    return (0, _Client.post)({
      username: username,
      password: password,
      body: body,
      url: url
    }).then(function (result) {
      console.log("Success:", result);
      return _extends({}, state, {
        references: [result].concat(_toConsumableArray(state.references))
      });
    });
  };
}
