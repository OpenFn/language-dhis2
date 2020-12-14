import { eq, filter, some, isEmpty } from 'lodash';

/**
 * TODO
 *
 * Create a DHIS2 UID-Useful for client generated Ids compatible with DHIS2
 */
export function generateUID() {
  return;
}

/**
 * TODO
 *
 * Validate if valid DHIS2 UID
 * @example
 * isValidUID('MmwcGkxy876')
 * // true
 * isValidUID(12345)
 * // false
 *
 */
export function isValidUID(target) {
  return true | false;
}

/**
 * Print easy-readable JSON objects, uses JSON.stringify.
 *
 */

export function prettyJson(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Custom logger with timestamps and colors
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
  return `${func?.name}('${JSON.stringify(args[0] ?? null)}', ${JSON.stringify(
    args[1] ?? null
  )}, ${JSON.stringify(args[2] ?? null)}, ${
    isEmpty(args[3]?.name ?? '-unused-') ? '(state)=>{}' : args[3]?.name
  }) succeeded. The body of this result will be available in state.data or in your callback.`;
}

/**
 * Compose next state based on the result of a given operation
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
export function warnExpectLargeResult(paramOrResourceType, endpointUrl) {
  // TODO : Refactor to send a HEAD request to read Content-Length header to check the file size before we can send the actual request
  // This will give us a sense of how big the result would be and warn the user, accordingly
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
    case 'getData':
      pathSuffix = resourceType;
      break;
    case 'getMetadata':
      pathSuffix = `metadata`;
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

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'content-type',
};

export const MEDIA_TYPES = {
  JSON: 'json',
};
export const CONTENT_TYPES = {
  APPLICATION_XML: 'application/xml',
  APPLICATION_JSON: 'application/json',
  APPLICATION_PDF: 'application/pdf',
  APPLICATION_CSV: 'application/csv',
  APPLICATION_XLS: 'application/vnd.ms-excel',
};
export const PUNCTUATIONS = {
  COMMA: ',',
  SEMI_COLON: ';',
  FULL_COLON: ':',
};

/**
 * The following query parameters are available for customizing your request.
 */
export const QUERY_PARAMETERS = [
  {
    param: 'assumeTrue',
    type: 'boolean',
    required: false,
    defaultValue: true,
    options: [true, false],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Indicates whether to get all resources or no resources by default.',
  },
  {
    param: 'viewClass',
    type: 'enum',
    required: false,
    defaultValue: 'export',
    options: ['export', 'basic', 'detailed'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Alternative views of the metadata. Please note that only metadata exported with viewClass=export or detailed can be used for import.',
  },
  {
    param: 'dryRun',
    type: 'boolean',
    required: false,
    defaultValue: false,
    options: [false, true],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'If you set this to true, the actual import will not happen. Instead the system will generate a summary of what would have been done.',
  },
  {
    param: '{resources}',
    type: 'boolean',
    required: false,
    defaultValue: true,
    options: [true, false],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Default depends on assumeTrue. Run getResources() to see available resources. Indicates which resources to include in the response.',
  },
  {
    param: 'lastUpdated',
    type: 'date',
    required: false,
    defaultValue: null,
    options: ['yyyy', 'yyyy-MM', 'yyyy-MM-dd', 'yyyyMM', 'yyyyMMdd'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description: 'Filters the metadata based on the lastUpdated field.',
  },
  {
    param: 'preheatCache',
    type: 'boolean',
    required: false,
    defaultValue: true,
    options: [true, false],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      "Turn cache-map preheating on/off. This is on by default, turning this off will make initial load time for importer much shorter (but will make the import itself slower). This is mostly used for cases where you have a small XML/JSON file you want to import, and don't want to wait for cache-map preheating.",
  },
  {
    param: 'strategy',
    type: 'enum',
    required: false,
    defaultValue: 'CREATE_AND_UPDATE',
    options: ['CREATE_AND_UPDATE', 'CREATE', 'UPDATE', 'DELETE'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Import strategy to use. CREATE_AND_UPDATE=Allows creation and updating of objects. CREATE=Allows creation of objects only. UPDATE=Allows update of objects only. DELETE=Allows deletes of objects only.',
  },
  {
    param: 'sharing',
    type: 'boolean',
    required: false,
    defaultValue: false,
    options: [false, true],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Should sharing be supported or not. The default is false, which is the old behavior. You can set this to true to allow updating user, publicAccess and userGroupAccesses fields (if not they are cleared out on create, and not touched on update).',
  },
  {
    param: 'mergeMode',
    type: 'enum',
    required: false,
    defaultValue: 'REPLACE',
    options: ['REPLACE', 'MERGE'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Strategy for merging of objects when doing updates. REPLACE will just overwrite the propery with the new value provided, MERGE will only set the property if its not null (only if the property was provided).',
  },
  {
    param: 'async',
    type: 'boolean',
    required: false,
    defaultValue: false,
    options: [false, false],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Indicates wether the import should be done async or not, the default is false which means the client will wait until the import is done, this is probably what you want for small imports (as you will get the import summary directly back to you). For large imports, the client might time out, so async=true is recommended, and the client connection will be dropped when the payload is uploaded.',
  },
  {
    param: 'fields',
    type: 'collection',
    required: false,
    defaultValue: ':owner',
    options: [FIELD_FILTERS_SYNTAX, FIELD_FILTERS_PRESETS],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Default field filter to apply for all types, default is :owner.',
  },
  {
    param: 'filter',
    type: 'string',
    required: false,
    defaultValue: 'none',
    options: OBJECT_FILTER_OPERATORS,
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Default object filter to apply for all types, default is none.',
  },
  {
    param: 'order',
    type: 'string',
    required: false,
    defaultValue: 'name',
    options: ['<propertyName>:desc', '<propertyName>:asc'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Default order to apply to all types, default is name if available, or created if not.',
  },
  {
    param: 'translate',
    type: 'boolean',
    required: false,
    defaultValue: false,
    options: [false, true],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description:
      'Enable translations. Be aware that this is turned off by default (in other endpoints this is on by default).',
  },
  {
    param: 'locale',
    type: 'string',
    required: false,
    defaultValue: 'user locale',
    options: '<locale>',
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: true,
    isMetadataImportParam: false,
    description: 'Change from user locale, to your own custom locale.',
  },
  {
    param: 'importMode',
    type: 'enum',
    required: false,
    defaultValue: 'COMMIT',
    options: ['COMMIT', 'VALIDATE'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: false,
    isMetadataImportParam: true,
    description:
      'Sets overall import mode, decides whether or not to only VALIDATE or also COMMIT the metadata, this have similar functionality as our old dryRun flag.',
  },
  {
    param: 'identifier',
    type: 'enum',
    required: false,
    defaultValue: 'UID',
    options: ['UID', 'CODE', 'AUTO'],
    isDataParam: true,
    isMetadataParam: true,
    isMetadataCreateUpdateParam: false,
    isMetadataExportParam: false,
    isMetadataImportParam: true,
    description:
      'Sets the identifier scheme to use for reference matching. AUTO means try UID first, then CODE.',
  },
];

/**
 * To filter the metadata there are several filter operations that can be applied to the returned list of
 *  metadata.
 *  The format of the filter itself is straight-forward and follows the pattern property:operator:value,
 *  where property is the property on the metadata you want to filter on, operator is the
 * comparison operator you want to perform and value is the value to check
 * against (not all operators require value).
 *  Please see the schema , by running getSchema(), to discover which properties are available.
 *  Recursive filtering, ie. filtering on associated objects or collection of objects, are supported as
 *  well.
 *
 * Operators will be applied as logical and query, if you need a or query, use `in` operator.
 * The filtering mechanism allows for recursion.
 * 
 * You can do filtering within collections, e.g. 
 * to get data elements which are members of the "ANC" data element group you can use the following
 *  query using the id property of the associated data element groups:
/api/26/dataElements.json?filter=dataElementGroups.id:eq:qfxEYY9xAl6
 * 
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
 * 1.10.5. Validating payloads
System wide validation of metadata payloads are enabled from 2.19 release, this means that create/update operations on the web-api endpoints will be checked for valid payload before allowed changes to be made, to find out what validations are in place for a endpoint, please have a look at the /api/schemas endpoint, i.e. to figure out which constraints a data element have, you would go to /api/schemas/dataElement.

You can also validate your payload manually by sending it to the proper schema endpoint. If you wanted to validate the constant from the create section before, you would send it like this:

POST /api/schemas/constant
{ payload }
A simple (non-validating) example would be:

curl -X POST -d "{\"name\": \"some name\"}" -H "Content-Type: application/json" 
-u admin:district https://play.dhis2.org/dev/api/schemas/dataElement
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
