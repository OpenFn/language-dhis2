"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function request({
  method,
  url,
  data,
  options
}) {
  let headers = {
    'Content-Type': 'application/json'
  };
  let req = {
    method,
    url,
    headers,
    ...options
  };

  if (method !== 'get') {
    req = { ...req,
      data
    };
  }

  return _axios.default.request(req);
}