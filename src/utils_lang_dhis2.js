import { isEmpty } from 'lodash';
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

/**
 * Compose success message
 */

export function composeSuccessMessage(func, ...args) {
  return `${func?.name}('${args[0] ?? null}', ${JSON.stringify(
    args[1] ?? null
  )}, ${JSON.stringify(args[2] ?? null)}, ${
    isEmpty(args[3]?.name ?? '-unused-') ? '(state)=>{}' : args[3]?.name
  }) succeeded. The body of this result will be available in state.data or in your callback.`;
}

/**
 * Compose next state base on the result of a given operation
 * @param {Object} result - Success result of an http call
 */
export function composeNextState(state, result) {
  return {
    ...state,
    data: result?.data,
    references: [...state?.references, result?.data],
  };
}

/**
 * Helper constant for http verbs
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
};

/**
 * Warn user when there is too much data expected to be returned on a given resource type
 * @param {string} endpointUrl - endpoint url for a resourceType
 *
 */
export function warnExpectLargeResult(resourceType, endpointUrl) {
  if (isEmpty(resourceType))
    Log.warn(
      `This may take a while. This endpoint(${endpointUrl}) may return a large collection of records, since 'resourceType' is not specified. We recommend you specify 'resourceType' or use 'filter' parameter to limit the content of the result.`
    );
}

/**
 * Inform user, you are waiting for the server to respond on a given url with params
 *
 */
export function logWaitingForServer(url, params) {
  Log.info(`url ${url}`);
  Log.info(`params ${prettyJson(params)}`);
  Log.info(`Waiting for server response on ${url}...`);
}

/**
 * Build url for a given operation
 */
export function buildUrl(operation, resourceType, configuration, options) {
  let pathSuffix = '';

  switch (operation?.name) {
    case 'getSchema':
      pathSuffix = `schemas/${resourceType}`;
      break;
    case 'getResources':
      pathSuffix = `resources`;
      break;
    default:
  }

  const { hostUrl, apiVersion } = configuration;

  const supportApiVersion = options?.supportApiVersion ?? false;

  const path =
    supportApiVersion === true
      ? `${apiVersion ?? 'api_version_missing'}/${pathSuffix}`
      : `${pathSuffix}`;

  const url = hostUrl + '/api/' + path;

  return url;
}
/**
 * Log api version
 */
export function logApiVersion(configuration, options) {
  const { apiVersion } = configuration;

  const supportApiVersion = options?.supportApiVersion ?? false;

  const message =
    supportApiVersion === true && apiVersion
      ? `Using DHIS2 api version \x1b[33m ${apiVersion}\x1b[0m`
      : '\x1b[33m Attempting to use apiVersion without providing it in state.configuration\x1b[0m. You may encounter errors.\x1b[33m api_version_missing\x1b[0m. If `supportApiVersion = true` in the `options` parameter, then you need to set `apiVersion` in state.configuration.';

  if (supportApiVersion === true) Log.warn(message);
  else Log.warn(`Using \x1b[33m latest \x1b[0m version of DHIS2 api.`);
}
