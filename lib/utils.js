"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadJson = loadJson;
exports.csvFile = csvFile;
exports.generateUID = generateUID;
exports.isValidUID = isValidUID;
exports.cleanObject = cleanObject;
exports.prettyJson = prettyJson;
exports.Log = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } return method; }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

// load json file
function loadJson(filePath) {
  return;
} // Load and parse csvFile


function csvFile(filePath) {
  return;
} // Create a DHIS2 UID


function generateUID() {
  return;
}
/**
 * Validate if valid DHIS2 UID
 * @example
 * isValidUID('MmwcGkxy876')
 * // true
 * isValidUID(12345)
 * // false
 * isValidUID('MmwcGkxy876 ')
 * // false
 *
 */


function isValidUID(target) {
  return true | false;
}
/**
 * Clean a JSON object
 * Useful for deep-removing certain keys in an object,
 * e.g. remove all sharing by recursively removing all user and userGroupAccesses fields.
 */


function cleanObject(data) {
  return;
}
/**
 * Print easy-readable JSON objects.
 *
 */


function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}
/**
 * Custom logger with timestamps
 *
 */


var Log = /*#__PURE__*/function () {
  function Log() {
    _classCallCheck(this, Log);
  }

  _createClass(Log, null, [{
    key: "info",
    value: function info(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMsg).call(Log, _classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).INFO, message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMsg).call(Log, _classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).WARN, message);
    }
  }, {
    key: "error",
    value: function error(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMsg).call(Log, _classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).ERROR, message);
    }
  }]);

  return Log;
}();

exports.Log = Log;

var _printMsg = function _printMsg(prefix, message) {
  switch (prefix) {
    case _classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).WARN:
      console.warn("".concat(_classStaticPrivateFieldSpecGet(this, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).WARN, " ").concat(new Date(), "\n ").concat(message));
      break;

    case _classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).ERROR:
      console.error("".concat(_classStaticPrivateFieldSpecGet(this, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).ERROR, " ").concat(new Date(), "\n ").concat(message));
      break;

    default:
      console.info("".concat(_classStaticPrivateFieldSpecGet(this, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(this, Log, _OPTIONS).INFO, " ").concat(new Date(), "\n ").concat(message));
  }
};

var _OPTIONS = {
  writable: true,
  value: {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  }
};
var _MAIN_TAG = {
  writable: true,
  value: 'openfn'
};
