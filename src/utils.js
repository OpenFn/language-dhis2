// load json file
export function loadJson(filePath) {
  return;
}

// Load and parse csvFile
export function csvFile(filePath) {
  return;
}

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
 * Clean a JSON object
 * Useful for deep-removing certain keys in an object,
 * e.g. remove all sharing by recursively removing all user and userGroupAccesses fields.
 */
export function cleanObject(data, ...fieldsToRemove) {
  return;
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

  static #MAIN_TAG = 'openfn';

  static #printMsg(prefix, message) {
    switch (prefix) {
      case this.#OPTIONS.WARN:
        console.warn(
          `${this.#MAIN_TAG} ${this.#OPTIONS.WARN} ${new Date()}\n ${message}`
        );
        break;
      case this.#OPTIONS.ERROR:
        console.error(
          `${this.#MAIN_TAG} ${this.#OPTIONS.ERROR} ${new Date()}\n ${message}`
        );
        break;
      default:
        console.info(
          `${this.#MAIN_TAG} ${this.#OPTIONS.INFO} ${new Date()}\n ${message}`
        );
    }
  }

  static info(message) {
    return Log.#printMsg(this.#OPTIONS.INFO, message);
  }
  static warn(message) {
    return Log.#printMsg(this.#OPTIONS.WARN, message);
  }
  static error(message) {
    return Log.#printMsg(this.#OPTIONS.ERROR, message);
  }
}
