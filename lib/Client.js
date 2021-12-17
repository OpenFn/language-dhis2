"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function request({
  username,
  password
}, axiosRequest) {
  const {
    method,
    url
  } = axiosRequest;
  console.log(`Sending ${method} request to ${url}`);
  return _axios.default.request({
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      username,
      password
    },
    // Note that providing headers or auth in the request object will overwrite.
    ...axiosRequest
  });
}