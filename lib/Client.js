"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;
exports.put = put;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function post(url, data, configs) {
  console.log('URL', url);
  console.log('DATA', data);
  console.log('CONFIGS', configs);
  return _axios.default.request({
    method: 'POST',
    url,
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...configs
  });
}

function put(url, data, configs) {
  return _axios.default.request({
    method: 'PUT',
    url,
    data,
    headers: {
      'Content-Type': 'application/json'
    },
    ...configs
  });
}