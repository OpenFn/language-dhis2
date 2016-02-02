'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.event = event;

var _languageCommon = require('language-common');

var _Client = require('./Client');

var _url = require('url');

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
 * Create an event
 * @example 
 * execute(
 *   event(data)
 * )(state)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */
function event(eventData) {
  var body = eventData;

  return function (state) {
    var _state$configuration$ = state.configuration.credentials;
    var username = _state$configuration$.username;
    var password = _state$configuration$.password;
    var api = _state$configuration$.api;

    var url = (0, _url.resolve)(api + '/', 'api/events');

    return (0, _Client.post)({ username: username, password: password, body: body, url: url }).then(function (result) {
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    });
  };
}
