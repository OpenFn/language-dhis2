import { eq, filter, some, isEmpty, indexOf, lastIndexOf, trim } from 'lodash';
import { mapValues } from 'lodash/fp';
import axios from 'axios';

/**
 * Recursively expand object, each time resolving function calls and returning the resolved values
 * @param {oject} obj - Object to expand
 * @returns {object|number|string|boolean|array} expandedObject
 */
export function recursivelyExpandReferences(obj) {
  return state => {
    if (typeof obj !== 'object')
      return typeof obj == 'function' ? obj(state) : obj;
    let result = mapValues(function (value) {
      if (Array.isArray(value)) {
        return value.map(item => {
          return recursivelyExpandReferences(item)(state);
        });
      } else {
        return recursivelyExpandReferences(value)(state);
      }
    })(obj);
    if (Array.isArray(obj)) result = Object.values(result);
    return result;
  };
}

/**
 * Compose success message
 */
export function composeSuccessMessage(operation) {
  return `${COLORS.FgGreen}${operation}${ESCAPE} succeeded. The body of this result will be available in ${COLORS.FgGreen}state.data${ESCAPE} or in your ${COLORS.FgGreen}callback${ESCAPE}.`;
}

/**
 * Warn user when there is too much data expected to be returned on a given resource type
 * @param {string} endpointUrl - endpoint url for a resourceType
 *
 */
export function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  if (isEmpty(paramOrResourceType))
    Log.warn(
      `\x1b[33m Missing params or resourceType. This may take a while\x1b[0m. This endpoint(\x1b[33m${endpointUrl}\x1b[0m) may return a large collection of records, since 'params' or 'resourceType' is not specified. We recommend you specify 'params' or 'resourceType' or use 'filter' parameter to limit the content of the result.`
    );
}

/**
 * Inform user, you are waiting for the server to respond on a given url with params
 *
 */
export function logWaitingForServer(url, params) {
  console.info(`url ${COLORS.FgGreen}${url}\x1b[0m`);
  console.info(`params ${COLORS.FgGreen}${params}\x1b[0m`);
  console.info(`Waiting for server response on ${url} ...`);
}

/**
 * Log api version
 */
export function logApiVersion(apiVersion) {
  const message =
    apiVersion && apiVersion
      ? `Using DHIS2 api version \x1b[33m${apiVersion}\x1b[0m`
      : '\x1b[33m Attempting to use apiVersion without providing it in state.configuration or in options parameter\x1b[0m. You may encounter errors.\x1b[33m api_version_missing\x1b[0m.';

  if (apiVersion) console.warn(message);
  else console.warn(`Using\x1b[33m latest\x1b[0m version of DHIS2 api.`);
}

export function logOperation(operation) {
  console.info(`Executing ${COLORS.FgGreen}${operation}\x1b[0m ...`);
}
/**
 * Build url for a given operation
 */
export function buildUrl(path, hostUrl, apiVersion) {
  const pathSuffix = apiVersion ? `/${apiVersion}${path}` : `${path}`;
  const url = hostUrl + '/api' + pathSuffix;

  return url;
}

/**
 * Helper function that returns an attribute of the format `{attribute: 'lZGmxYbs97q',value: 'Banda'}`, given an `Id` and the `value`
 * @param {string} attributeId
 * @param {string|boolean|number} attributeValue
 */
export function attribute(attributeId, attributeValue) {
  return {
    attribute: attributeId,
    value: attributeValue,
  };
}

/**
 * Send a HEAD request to read Content-Length header to check the file size before we can send
 * the actual request
 * This will give us a sense of how big the result would be and warn the user, accordingly
 * @param {string} endpointUrl - url for the endpoint
 */
export function requestHttpHead(endpointUrl, { username, password }) {
  return axios
    .request({
      method: 'HEAD',
      url: endpointUrl,
      auth: {
        username,
        password,
      },
    })
    .then(result => result.headers['content-length']);
}
/***
 * Manually validate payload against schema
 * @example
 *
A simple (non-validating) example would be:
validateMetadataPayload({name: "some name"}, 'dataElement')
Which would yield the result:

[
   {
      "message" : "Required property missing.",
      "property" : "type"
   },
   {
      "property" : "aggregationOperator",
      "message" : "Required property missing."
   },
   {
      "property" : "domainType",
      "message" : "Required property missing."
   },
   {
      "property" : "shortName",
      "message" : "Required property missing."
   }
]
 */
export function validateMetadataPayload(payload, resourceType) {
  return axios
    .request({
      method: 'POST',
      url: `https://play.dhis2.org/dev/api/schemas/${resourceType}`,
      auth: {
        username: 'admin',
        password: 'distict',
      },
      data: payload,
    })
    .then(result => result.data);
}

/**
 * Handle http response
 * @param {*} url
 * @param {*} params
 */
export function handleResponse(result, state, callback) {
  if (callback) return callback(composeNextState(state, result));

  return composeNextState(state, result);
}

/**
 * Print easy-readable JSON objects, uses JSON.stringify.
 *
 */
export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

export function getIndicesOf(string, regex) {
  var match,
    indexes = {};

  regex = new RegExp(regex);

  while ((match = regex.exec(string))) {
    let schemaRef;
    if (!indexes[match[0]]) {
      indexes[match[0]] = {};
    }
    let hrefString = string.slice(
      match.index,
      indexOf(string, '}', match.index) - 1
    );
    let lastIndex = lastIndexOf(hrefString, '/') + 1;
    schemaRef = trim(hrefString.slice(lastIndex));
    indexes[match[0]][match.index] = schemaRef;
  }

  return indexes;
}

/**
 * An ANSI escape sequence  constant character that will be intercepted by the terminal and used to escape sequences dealing only with colors and styles.
 * @private
 * @constant
 * @default
 * @example <caption>Example using `ESCAPE` in console logs</caption>
 * ```javascript
 * console.warn(`${COLORS.FgYellow}Warning!${ESCAPE} This may be dangerous!`)
 * ```
 */
export const ESCAPE = '\x1b[0m';

/**
 * A constant for colors used in console messages to highlight or emphasize text
 * These are also known as {@link https://en.wikipedia.org/wiki/ANSI_escape_code#Colors ANSI escape code}.
 * These color codes are standardized ANSI escape codes, and so therefore they(should) work on any platform
 * @private
 * @enum {string}
 * @readonly
 * @default
 * @example <caption>Example using `COLORS` in console logs</caption>
 * ```javascript
 * console.warn(`${COLORS.FgYellow}Warning!${ESCAPE} This is a warning!`)
 * ```
 */
export const COLORS = {
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

/**
 * Custom static logger class with timestamps and colors
 * @private
 * @class
 * @method info - `Public static` member method used to print a `information` messages to the console.
 * @method warn - `Public static` member method used to print `warning` messages to the console.
 * @method error - `Public static` member method used to print `error` messages to the console.
 * @method printMessage - `Private static` member method used internally to `render` a message to the console.
 * @example <caption>Example using `Log` to print the message `Executing the Job...` with an `openfn` TAG pre-fixed, the word `INFO` in `green`, and a timestamp</caption>
 * ```javascript
 * Log.info('Executing the Job...');
 * ```
 */
export class Log {
  /**
   * Enum for `Switch` options
   * @private
   * @static
   * @enum {string}
   * @readonly
   */
  static #OPTIONS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  };
  /**
   * `Static` main tag, pre-fixed to a console logged message
   * @private
   * @static
   * @constant
   * @readonly
   */
  static #MAIN_TAG = 'openfn';
  /**
   * `Private static` helper method used to print the message to the console, applying all the colors and tags.
   * @private
   * @static
   */
  static #printMessage(prefix, message) {
    switch (prefix) {
      case Log.#OPTIONS.WARN:
        console.warn(
          `${Log.#MAIN_TAG} ${
            COLORS.FgYellow
          }%s${ESCAPE} ${new Date()}\n ${message}`,
          Log.#OPTIONS.WARN
        );
        break;
      case Log.#OPTIONS.ERROR:
        console.error(
          `${Log.#MAIN_TAG} ${
            COLORS.FgRed
          }%s${ESCAPE} ${new Date()}\n ${message}`,
          Log.#OPTIONS.ERROR
        );
        break;
      default:
        console.info(
          `${Log.#MAIN_TAG} ${
            COLORS.FgGreen
          }%s${ESCAPE} ${new Date()}\n ${message}`,
          Log.#OPTIONS.INFO
        );
    }
  }
  /**
   * `Public static` helper method used to print `information` messages to the console, applying all the colors and tags.
   * @public
   * @static
   * @returns {string}
   * @example <caption>Example printing `information message` to the console with tag `openfn` prefixed, the word `INFO` in `green`, and a `timestamp`</caption>
   * ```javascript
   * Log.info('Upsert operation succeeded.')
   * ```
   */
  static info(message) {
    return Log.#printMessage(Log.#OPTIONS.INFO, message);
  }
  /**
   * `Public static` helper method used to print `warning` messages to the console, applying all the colors and tags.
   * @public
   * @static
   * @returns {string}
   * @example <caption>Example printing `warning message` to the console with tag `openfn` prefixed, the word `WARN` in `yellow`, and a `timestamp`</caption>
   * ```javascript
   * Log.warn('Upsert operation succeeded.')
   * ```
   */
  static warn(message) {
    return Log.#printMessage(Log.#OPTIONS.WARN, message);
  }
  /**
   * `Public static` helper method used to print `error` messages to the console, applying all the colors and tags.
   * @public
   * @static
   * @returns {string}
   * @example <caption>Example printing `error message` to the console with tag `openfn` prefixed, the word `ERROR` in `red`, and a `timestamp`</caption>
   * ```javascript
   * Log.error('Upsert operation succeeded.')
   * ```
   */
  static error(message) {
    return Log.#printMessage(Log.#OPTIONS.ERROR, message);
  }
}

export function isLike(string, words) {
  const wordsArrary = words?.match(/([^\W]+[^\s,]*)/)?.splice(0, 1);
  const isFound = word => RegExp(word, 'i')?.test(string);
  return some(wordsArrary, isFound);
}

export const dhis2OperatorMap = {
  eq: eq,
  like: isLike,
};

export function applyFilter(
  arrObject,
  targetProperty,
  operator,
  valueToCompareWith
) {
  if (targetProperty && operator && valueToCompareWith) {
    try {
      return filter(arrObject, obj =>
        Reflect.apply(operator, obj, [obj[targetProperty], valueToCompareWith])
      );
    } catch (error) {
      Log.warn(
        `Returned unfiltered data. Failed to apply custom filter(${prettyJson({
          targetProperty: targetProperty ?? null,
          operator: operator ?? null,
          value: valueToCompareWith ?? null,
        })}) on this collection. The operator you supplied maybe unsupported on this resource at the moment.`
      );
      return arrObject;
    }
  }
  Log.info(`No filters applied, returned all records on this resource.`);
  return arrObject;
}

export function parseFilter(filterExpression) {
  const filterTokens = filterExpression?.split(':');
  filterTokens
    ? (filterTokens[1] = dhis2OperatorMap[filterTokens[1] ?? null])
    : null;
  return filterTokens;
}

export const CONTENT_TYPES = {
  xml: 'application/xml',
  json: 'application/json',
  pdf: 'application/pdf',
  csv: 'application/csv',
  xls: 'application/vnd.ms-excel',
};

/* 
 * The default logical operator applied to the filters are AND which means that all object filters must 
 * be matched. 
 * There are however cases where you want to match on one of several filters (maybe id and code field)
 * and in those cases it is possible to switch the root logical operator from AND to OR using 
 * the rootJunction parameter
 * 
 * Example: Filtering where the logical operator has been switched to OR and now only one of the filters must match to have a result returned
/api/dataElements.json?filter=id:in:[id1,id2]&filter=code:eq:code1&rootJunction=OR
 */
export const OBJECT_FILTER_OPERATORS = [
  {
    operator: 'eq',
    types: [
      'string',
      'boolean',
      'integer',
      'float',
      'enum',
      'collection',
      'date',
    ],
    valueRequired: true,
    description: 'Equality.  Checks for size, for collections',
    example: '',
  },
  {
    operator: '!eq',
    types: [
      'string',
      'boolean',
      'integer',
      'float',
      'enum',
      'collection',
      'date',
    ],
    valueRequired: true,
    description: 'Inequality.  Checks for size, for collections',
    example: '',
  },
  {
    operator: 'eq',
    types: [
      'string',
      'boolean',
      'integer',
      'float',
      'enum',
      'collection',
      'date',
    ],
    valueRequired: true,
    description: 'Inequality.  Checks for size, for collections',
    example: '',
  },
  {
    operator: 'like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, match anywhere',
    example: '',
  },
  {
    operator: '!like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, not match anywhere',
    example: '',
  },
  {
    operator: '^like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, match start',
    example: '',
  },
  {
    operator: '!^like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, not match start',
    example: '',
  },
  {
    operator: '$like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, match end',
    example: '',
  },
  {
    operator: '!$like',
    types: ['string'],
    valueRequired: true,
    description: 'Case sensitive string, not match end',
    example: '',
  },
  {
    operator: 'ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, match anywhere',
    example: '',
  },
  {
    operator: '!ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, not match anywhere',
    example: '',
  },
  {
    operator: '^ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, match start',
    example: '',
  },
  {
    operator: '!^ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, not match start',
    example: '',
  },
  {
    operator: '$ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, match end',
    example: '',
  },
  {
    operator: '!$ilike',
    types: ['string'],
    valueRequired: true,
    description: 'Case insensitive string, not match end',
    example: '',
  },
  {
    operator: 'gt',
    types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
    valueRequired: true,
    description: 'Greater than',
    example: '',
  },
  {
    operator: 'ge',
    types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
    valueRequired: true,
    description: 'Greater than or equal',
    example: '',
  },
  {
    operator: 'lt',
    types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
    valueRequired: true,
    description: 'Less than',
    example: '',
  },
  {
    operator: 'le',
    types: ['string', 'boolean', 'integer', 'float', 'collection', 'date'],
    valueRequired: true,
    description: 'Less than or equal',
    example: '',
  },
  {
    operator: 'null',
    types: ['all'],
    valueRequired: false,
    description: 'Property is null',
    example: '',
  },
  {
    operator: '!null',
    types: ['all'],
    valueRequired: false,
    description: 'Property is not null',
    example: '',
  },
  {
    operator: 'empty',
    types: ['collection'],
    valueRequired: false,
    description: 'Collection is empty',
    example: '',
  },
  {
    operator: 'in',
    types: ['string', 'boolean', 'integer', 'float', 'date'],
    valueRequired: true,
    description: 'Find objects matching 1 or more values',
    example: '',
  },
  {
    operator: '!in',
    types: ['string', 'boolean', 'integer', 'float', 'date'],
    valueRequired: true,
    description: 'Find objects not matching 1 or more values',
    example: '',
  },
];

export const FIELD_FILTERS_SYNTAX = [
  {
    operator: '<field-name>',
    description: 'Include property with name, if it exists.',
    example: 'id',
  },
  {
    operator: '<object>[<field-name>, ...]',
    description:
      'Includes a field within either a collection (will be applied to every object in that collection), or just on a single object.',
    example: 'properties[id,name]',
  },
  {
    operator: '!<field-name>, <object>[!<field-name>',
    description:
      'Do not include this field name, also works inside objects/collections. Useful when you use a preset to inlude fields.',
    example: '!userAccess, attributes[!properties.userAccess]',
  },
  {
    operator: '*, <object>[*]',
    description:
      'Include all fields on a certain object, if applied to a collection, it will include all fields on all objects on that collection.',
    example: '*, enrollments[*]',
  },
  {
    operator: ':<preset>',
    description:
      'Alias to select multiple fields. Three presets are currently available, run discoverFieldFilterPresets() for descriptions.',
    example: ':all',
  },
];

export const FIELD_FILTERS_PRESETS = [
  {
    preset: 'all',
    description: 'All fields of the object',
    example:
      ' Include all fields from dataSets except organisationUnits: /api/33/dataSets?fields=:all,!organisationUnits',
  },
  {
    preset: '*',
    description: 'Alias for all',
    example: '/api/33/dataSets?fields=:*',
  },
  {
    preset: 'identifiable',
    description: 'Includes id, name, code, created and lastUpdated fields',
    example: '/api/33/dataSets?fields=:identifiable',
  },
  {
    preset: 'nameable',
    description:
      'Includes id, name, shortName, code, description, created and lastUpdated fields',
    example: '/api/33/dataSets?fields=:nameable',
  },
  {
    preset: 'persisted',
    description:
      'Returns all persisted property on a object, does not take into consideration if the object is the owner of the relation.',
    example: '/api/33/dataSets?fields=:persisted',
  },
  {
    preset: 'owner',
    description:
      'Returns all persisted property on a object where the object is the owner of all properties, this payload can be used to update through the web-api.',
    example: '/api/33/dataSets?fields=:owner',
  },
];

/**
 * allow further customization of the properties on the server side.
 * /api/26/dataElements/ID?fields=id~rename(i),name~rename(n)
 * This will rename the id property to i and name property to n.
 * Multipe transformers can be used by repeating the transformer syntax:
 * /api/26/dataElementGroups.json?fields=id,displayName,dataElements~isNotEmpty~rename(haveDataElements)
 */
export const FIELD_TRANSFORMERS = [
  {
    name: 'size',
    arguments: null,
    description: 'Gives sizes of strings (length) and collections',
    example: '/api/26/dataElements?fields=dataSets~size',
  },
  {
    name: 'isEmpty',
    arguments: null,
    description: 'Is string or collection empty',
    example: '/api/26/dataElements?fields=dataSets~isEmpty',
  },
  {
    name: 'isNotEmpty',
    arguments: null,
    description: 'Is string or collection not empty',
    example: '/api/26/dataElements?fields=dataSets~isNotEmpty',
  },
  {
    name: 'rename',
    arguments: 'Arg1: name',
    description: 'Renames the property name',
    example: '/api/26/dataElements/ID?fields=id~rename(i),name~rename(n)',
  },
  {
    name: 'paging',
    arguments: 'Arg1: page,Arg2: pageSize',
    description: 'Pages a collection, default pageSize is 50',
    example:
      '/api/26/dataElementGroups?fields=id,displayName,dataElements~paging(1;20)',
  },
];

/** 
 * OTHER NOTES
 * 
1.10.6. Partial updates
For cases where you don't want or need to update all properties on a object (which means downloading a potentially huge payload, change one property, then upload again) we now support partial update, both for single properties and for multiple properties.

The format for updating a single property is the same as when you are updating a complete object, just with only 1 property in the JSON/XML file, i.e.:

curl -X PATCH -d "{\"name\": \"New Name\"}" -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/26/dataElements/fbfJHSPpUQD/name
Please note that we are including the property name two times, one time in the payload, and one time in the endpoint, the generic endpoint for this is /api/type/id/property-name, and the Content-Type must also be included as usual (since we support multiple formats).

The format for updating multiple properties are similar, just that we don't include the property names in the url, i.e.:

{ // file.json
  "name": "Updated Name",
  "zeroIsSignificant": true
}
curl -X PATCH -d @file.json -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/26/dataElements/fbfJHSPpUQD
 */
