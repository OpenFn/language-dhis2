"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUID = generateUID;
exports.isValidUID = isValidUID;
exports.prettyJson = prettyJson;
exports.Log = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } return method; }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

// Create a DHIS2 UID
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

    /*
    * For example, \x1b[31m is an escape sequence that will be intercepted by the terminal 
      and instructs it to switch to the red color. 
      In fact, \x1b is the code for the non-printable control character escape. 
      Escape sequences dealing only with colors and styles are also known as ANSI escape code(https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) 
      and are standardized, so therefore they (should) work on any platform
    */
    value: function info(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).INFO, message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN, message);
    }
  }, {
    key: "error",
    value: function error(message) {
      return _classStaticPrivateMethodGet(Log, Log, _printMessage).call(Log, _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR, message);
    }
  }]);

  return Log;
}();

exports.Log = Log;

var _printMessage = function _printMessage(prefix, message) {
  switch (prefix) {
    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN:
      console.warn("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgYellow, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).WARN);
      break;

    case _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR:
      console.error("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgRed, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).ERROR);
      break;

    default:
      console.info("".concat(_classStaticPrivateFieldSpecGet(Log, Log, _MAIN_TAG), " ").concat(_classStaticPrivateFieldSpecGet(Log, Log, _COLORS).FgGreen, "%s\x1B[0m ").concat(new Date(), "\n ").concat(message), _classStaticPrivateFieldSpecGet(Log, Log, _OPTIONS).INFO);
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
var _COLORS = {
  writable: true,
  value: {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m'
  }
};
var _MAIN_TAG = {
  writable: true,
  value: 'openfn'
};
