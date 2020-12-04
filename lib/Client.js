"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;
exports.put = put;
exports.get = get;
exports.getUsingQueryString = getUsingQueryString;

var _superagent = _interopRequireDefault(require("superagent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function post(_ref) {
  var username = _ref.username,
      password = _ref.password,
      body = _ref.body,
      url = _ref.url,
      query = _ref.query;
  return new Promise(function (resolve, reject) {
    _superagent["default"].post(url).query(query).type('json').accept('json').auth(username, password).send(JSON.stringify(body)).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}

function put(_ref2) {
  var username = _ref2.username,
      password = _ref2.password,
      body = _ref2.body,
      url = _ref2.url,
      query = _ref2.query;
  return new Promise(function (resolve, reject) {
    _superagent["default"].put(url).query(query).type('json').accept('json').auth(username, password).send(JSON.stringify(body)).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}

function get(_ref3) {
  var username = _ref3.username,
      password = _ref3.password,
      query = _ref3.query,
      url = _ref3.url;
  return new Promise(function (resolve, reject) {
    _superagent["default"].get(url).query(query).type('json').accept('json').auth(username, password).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}

function getUsingQueryString(_ref4) {
  var username = _ref4.username,
      password = _ref4.password,
      query = _ref4.query,
      url = _ref4.url;
  return new Promise(function (resolve, reject) {
    _superagent["default"].get(url).query(query).options({
      useQuerystring: true
    }).type('json').accept('json').auth(username, password).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}
