"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function get(_ref) {
  var url = _ref.url,
      transformRequest = _ref.transformRequest,
      transformResponse = _ref.transformResponse,
      headers = _ref.headers,
      params = _ref.params,
      paramsSerializer = _ref.paramsSerializer,
      timeout = _ref.timeout,
      withCredentials = _ref.withCredentials,
      adapter = _ref.adapter,
      auth = _ref.auth,
      responseType = _ref.responseType,
      responseEncoding = _ref.responseEncoding,
      xsrfCookieName = _ref.xsrfCookieName,
      xsrfHeaderName = _ref.xsrfHeaderName,
      onUploadProgress = _ref.onUploadProgress,
      onDownloadProgress = _ref.onDownloadProgress,
      maxContentLength = _ref.maxContentLength,
      maxBodyLength = _ref.maxBodyLength,
      validateStatus = _ref.validateStatus,
      maxRedirects = _ref.maxRedirects,
      socketPath = _ref.socketPath,
      httpAgent = _ref.httpAgent,
      httpsAgent = _ref.httpsAgent,
      proxy = _ref.proxy,
      cancelToken = _ref.cancelToken,
      decompress = _ref.decompress;
  return _axios["default"].request({
    url: url,
    method: 'GET',
    transformRequest: transformRequest,
    transformResponse: transformResponse,
    headers: headers,
    params: params,
    paramsSerializer: paramsSerializer,
    timeout: timeout,
    withCredentials: withCredentials,
    adapter: adapter,
    auth: auth,
    responseType: responseType,
    responseEncoding: responseEncoding,
    xsrfCookieName: xsrfCookieName,
    xsrfHeaderName: xsrfHeaderName,
    onUploadProgress: onUploadProgress,
    onDownloadProgress: onDownloadProgress,
    maxContentLength: maxContentLength,
    maxBodyLength: maxBodyLength,
    validateStatus: validateStatus,
    maxRedirects: maxRedirects,
    socketPath: socketPath,
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    proxy: proxy,
    cancelToken: cancelToken,
    decompress: decompress
  }).then(function (result) {
    return result;
  })["catch"](function (error) {
    return error;
  });
}
