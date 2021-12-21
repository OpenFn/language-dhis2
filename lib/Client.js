"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The request client takes configuration from state and an axios request object
 * then (1) logs the method and URL, (2) applies standard headers and auth
 * before spreading the rest of the axios configuration, and (3) executes an
 * axios request.
 * @function
 * @param {object} configuration - configuration must have a username and password
 * @param {object} axiosRequest - the axiosRequest contains valid axios params: https://axios-http.com/docs/req_config
 * @returns {Promise} a promise that will resolve to either a response object or an error object.
 */
function request({
  username,
  password
}, axiosRequest) {
  const {
    method,
    url,
    params
  } = axiosRequest;
  console.log(`Sending ${method} request to ${url}`);
  if (params) console.log(` with params: ${params}`);
  return (0, _axios.default)({
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