// Create a DHIS2 UID
export function generateUID() {
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
export function isValidUID(target) {
  return true | false;
}

/**
 * Print easy-readable JSON objects.
 *
 */

export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Custom logger with timestamps
 *
 */
export class Log {
  static #OPTIONS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  };
  /*
  * For example, \x1b[31m is an escape sequence that will be intercepted by the terminal 
    and instructs it to switch to the red color. 
    In fact, \x1b is the code for the non-printable control character escape. 
    Escape sequences dealing only with colors and styles are also known as ANSI escape code(https://en.wikipedia.org/wiki/ANSI_escape_code#Colors) 
    and are standardized, so therefore they (should) work on any platform
  */
  static #COLORS = {
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
    BgWhite: '\x1b[47m',
  };

  static #MAIN_TAG = 'openfn';

  static #printMessage(prefix, message) {
    switch (prefix) {
      case Log.#OPTIONS.WARN:
        console.warn(
          `${Log.#MAIN_TAG} ${
            Log.#COLORS.FgYellow
          }%s\x1b[0m ${new Date()}\n ${message}`,
          Log.#OPTIONS.WARN
        );
        break;
      case Log.#OPTIONS.ERROR:
        console.error(
          `${Log.#MAIN_TAG} ${
            Log.#COLORS.FgRed
          }%s\x1b[0m ${new Date()}\n ${message}`,
          Log.#OPTIONS.ERROR
        );
        break;
      default:
        console.info(
          `${Log.#MAIN_TAG} ${
            Log.#COLORS.FgGreen
          }%s\x1b[0m ${new Date()}\n ${message}`,
          Log.#OPTIONS.INFO
        );
    }
  }

  static info(message) {
    return Log.#printMessage(Log.#OPTIONS.INFO, message);
  }
  static warn(message) {
    return Log.#printMessage(Log.#OPTIONS.WARN, message);
  }
  static error(message) {
    return Log.#printMessage(Log.#OPTIONS.ERROR, message);
  }
}
