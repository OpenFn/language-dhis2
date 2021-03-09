"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.getTEIs = getTEIs;
exports.upsertTEI = upsertTEI;
exports.createTEI = createTEI;
exports.updateTEI = updateTEI;
exports.getEvents = getEvents;
exports.createEvents = createEvents;
exports.updateEvents = updateEvents;
exports.getPrograms = getPrograms;
exports.createPrograms = createPrograms;
exports.updatePrograms = updatePrograms;
exports.getEnrollments = getEnrollments;
exports.enrollTEI = enrollTEI;
exports.updateEnrollments = updateEnrollments;
exports.cancelEnrollment = cancelEnrollment;
exports.completeEnrollment = completeEnrollment;
exports.getRelationships = getRelationships;
exports.getDataValues = getDataValues;
exports.createDataValues = createDataValues;
exports.generateDhis2UID = generateDhis2UID;
exports.discover = discover;
exports.getAnalytics = getAnalytics;
exports.getResources = getResources;
exports.getSchema = getSchema;
exports.getData = getData;
exports.getMetadata = getMetadata;
exports.create = create;
exports.update = update;
exports.patch = patch;
exports.del = del;
exports.upsert = upsert;
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function get() {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "attribute", {
  enumerable: true,
  get: function get() {
    return _Utils.attribute;
  }
});

var _axios = _interopRequireDefault(require("axios"));

var _languageCommon = require("@openfn/language-common");

var _lodash = require("lodash");

var _Utils = require("./Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for DHIS2.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = new Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };
  return function (state) {
    return _languageCommon.execute.apply(void 0, [configMigrationHelper].concat(operations))(_objectSpread({}, initialState, {}, state));
  };
}
/**
 * Migrates `apiUrl` to `hostUrl` if `hostUrl` is `blank`.
 * For `OpenFn.org` users with the `old-style configuration`.
 * @example
 * configMigrationHelper(state)
 * @constructor
 * @param {object} state - the runtime state
 * @returns {object}
 */


function configMigrationHelper(state) {
  var _state$configuration = state.configuration,
      hostUrl = _state$configuration.hostUrl,
      apiUrl = _state$configuration.apiUrl;

  if (!hostUrl) {
    _Utils.Log.warn('DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.');

    state.configuration.hostUrl = apiUrl;
    return state;
  }

  return state;
}

_axios["default"].interceptors.response.use(function (response) {
  var _response$headers$con, _response;

  var contentType = (_response$headers$con = response.headers['content-type']) === null || _response$headers$con === void 0 ? void 0 : _response$headers$con.split(';')[0];
  var acceptHeaders = response.config.headers['Accept'].split(';')[0].split(',');

  if (response.config.method === 'get') {
    if ((0, _lodash.indexOf)(acceptHeaders, contentType) === -1) {
      var newError = {
        status: 404,
        message: 'Unexpected content,returned',
        responseData: response.data
      };

      _Utils.Log.error(newError.message);

      return Promise.reject(newError);
    }
  }

  if (typeof ((_response = response) === null || _response === void 0 ? void 0 : _response.data) === 'string' && contentType === (_Utils.CONTENT_TYPES === null || _Utils.CONTENT_TYPES === void 0 ? void 0 : _Utils.CONTENT_TYPES.json)) {
    try {
      response = _objectSpread({}, response, {
        data: JSON.parse(response.data)
      });
    } catch (error) {
      /* Keep quiet */
    }
  }

  return response;
}, function (error) {
  var _error$response3, _error$response3$data;

  _Utils.Log.error("".concat(error === null || error === void 0 ? void 0 : error.message));

  try {
    var _error$response, _error$response$data;

    console.log(JSON.stringify((_error$response = error.response) === null || _error$response === void 0 ? void 0 : (_error$response$data = _error$response.data) === null || _error$response$data === void 0 ? void 0 : _error$response$data.response, null, 2));
  } catch (err) {
    var _error$response2, _error$response2$data;

    /* Keep quiet! Just log the above error again */
    console.log((_error$response2 = error.response) === null || _error$response2 === void 0 ? void 0 : (_error$response2$data = _error$response2.data) === null || _error$response2$data === void 0 ? void 0 : _error$response2$data.response);
  }

  console.log((_error$response3 = error.response) === null || _error$response3 === void 0 ? void 0 : (_error$response3$data = _error$response3.data) === null || _error$response3$data === void 0 ? void 0 : _error$response3$data.response);
  return Promise.reject(error);
});
/**
 * Get Tracked Entity Instance(s).
 * @public
 * @function
 * @param {Object} [params] - Optional `query parameters` e.g. `{ou: 'DiszpKrYNg8', filters: ['lZGmxYbs97q':GT:5']}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 docs} for more details on which params to use when querying tracked entities instances.
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `getTEIs` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>- Example `getTEIs` `expression.js` for fetching a `single` `Tracked Entity Instance` with all the fields included.</caption>
 * getTEIs({
 *   fields: '*',
 *   ou: 'CMqUILyVnBL',
 *   trackedEntityInstance: 'HNTA9qD6EEG',
 *   skipPaging: true,
 * });
 */


function getTEIs(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getTEIs';else {
      options = {
        operationName: 'getTEIs'
      };
    }
    return getData('trackedEntityInstances', params, options, callback)(state);
  };
}
/**
 * Update TEI if exists otherwise create.
 * - Update if the record exists otherwise insert a new record.
 * - This is useful for idempotency and duplicate record management.
 * @public
 * @function
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier attribute used during matching.
 * @param {Object} data - Payload data for new tracked entity instance or updated data for an existing tracked entity instance.
 * @param {{apiVersion: number,strict: boolean,responseType: string}} [options] - `Optional` options for `upsertTEI` operation. Defaults to `{apiVersion: state.configuration.apiVersion,strict: true,responseType: 'json'}`.
 * @param {function} [callback] - Optional `callback` to handle the response.
 * @throws {RangeError} - Throws `RangeError` when `uniqueAttributeId` is `invalid` or `not unique`.
 * @returns {Operation}
 * @example <caption>- Example `expression.js` for upserting a tracked entity instance on attribute with Id `lZGmxYbs97q`.</caption>
 * upsertTEI('lZGmxYbs97q', {
 *   orgUnit: 'TSyzvBiovKh',
 *   trackedEntityType: 'nEenWmSyUEp',
 *   attributes: [
 *     {
 *       attribute: 'lZGmxYbs97q',
 *       value: '77790012',
 *     },
 *     {
 *       attribute: 'w75KJ2mc4zz',
 *       value: 'Gigiwe',
 *     },
 *     {
 *       attribute: 'zDhUuAYrxNC',
 *       value: 'Mwanza',
 *     },
 *   ],
 * });
 */


function upsertTEI(uniqueAttributeId, data, options, callback) {
  return function (state) {
    var _options$apiVersion, _options, _options$strict, _options2, _body$attributes, _body$attributes$find;

    uniqueAttributeId = (0, _languageCommon.expandReferences)(uniqueAttributeId)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'upsertTEI';else {
      options = {
        operationName: 'upsertTEI'
      };
    }
    var _state$configuration2 = state.configuration,
        password = _state$configuration2.password,
        username = _state$configuration2.username,
        hostUrl = _state$configuration2.hostUrl;
    var apiVersion = (_options$apiVersion = (_options = options) === null || _options === void 0 ? void 0 : _options.apiVersion) !== null && _options$apiVersion !== void 0 ? _options$apiVersion : state.configuration.apiVersion;
    var strict = (_options$strict = (_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.strict) !== null && _options$strict !== void 0 ? _options$strict : true;
    var params = {
      ou: body.orgUnit
    };
    var uniqueAttributeValue = (_body$attributes = body.attributes) === null || _body$attributes === void 0 ? void 0 : (_body$attributes$find = _body$attributes.find(function (obj) {
      return (obj === null || obj === void 0 ? void 0 : obj.attribute) === uniqueAttributeId;
    })) === null || _body$attributes$find === void 0 ? void 0 : _body$attributes$find.value;
    var trackedEntityType = body.trackedEntityType;
    var uniqueAttributeUrl = (0, _Utils.buildUrl)("/trackedEntityAttributes/".concat(uniqueAttributeId), hostUrl, apiVersion);
    var trackedEntityTypeUrl = (0, _Utils.buildUrl)("/trackedEntityTypes/".concat(trackedEntityType, "?fields=*"), hostUrl, apiVersion);

    var findTrackedEntityType = function findTrackedEntityType() {
      return _axios["default"].get(trackedEntityTypeUrl, {
        auth: {
          username: username,
          password: password
        }
      }).then(function (result) {
        var _result$data, _result$data$trackedE;

        var attribute = (_result$data = result.data) === null || _result$data === void 0 ? void 0 : (_result$data$trackedE = _result$data.trackedEntityTypeAttributes) === null || _result$data$trackedE === void 0 ? void 0 : _result$data$trackedE.find(function (obj) {
          var _obj$trackedEntityAtt;

          return (obj === null || obj === void 0 ? void 0 : (_obj$trackedEntityAtt = obj.trackedEntityAttribute) === null || _obj$trackedEntityAtt === void 0 ? void 0 : _obj$trackedEntityAtt.id) === uniqueAttributeId;
        });
        return _objectSpread({}, result.data, {
          upsertAttributeAssigned: attribute ? true : false
        });
      });
    };

    var isAttributeUnique = function isAttributeUnique() {
      return _axios["default"].get(uniqueAttributeUrl, {
        auth: {
          username: username,
          password: password
        }
      }).then(function (result) {
        var foundAttribute = result.data;
        return {
          unique: foundAttribute.unique,
          name: foundAttribute.name
        };
      });
    };

    return Promise.all([findTrackedEntityType(), strict === true ? isAttributeUnique() : Promise.resolve({
      unique: true
    })]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          entityType = _ref2[0],
          attribute = _ref2[1];

      if (!entityType.upsertAttributeAssigned) {
        _Utils.Log.error('');

        throw new RangeError("Tracked Entity Attribute ".concat(uniqueAttributeId, " is not assigned to the ").concat(entityType.name, " Entity Type."));
      }

      if (!attribute.unique) {
        var _attribute$name;

        _Utils.Log.error('');

        throw new RangeError("Attribute ".concat((_attribute$name = attribute.name) !== null && _attribute$name !== void 0 ? _attribute$name : '', "(").concat(uniqueAttributeId, ") is not marked as unique."));
      }

      return upsert('trackedEntityInstances', {
        attributeId: uniqueAttributeId,
        attributeValue: uniqueAttributeValue
      }, body, params, options, callback)(state);
    });
  };
}
/**
 * Create Tracked Entity Instance.
 * @public
 * @function
 * @param {Object} data - The update data containing new values.
 * @param {Object} [params] - Optional `import parameters` for a given a resource. E.g. `{dryRun: true, importStrategy: CREATE}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#import-parameters_1 DHIS2 Import parameters documentation} or run `discover`. Defauls to `DHIS2 default import parameters`.
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `createTEI` operation. Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `createTEI`.</caption>
 * createTEI({
 *    orgUnit: 'TSyzvBiovKh',
 *    trackedEntityType: 'nEenWmSyUEp',
 *    attributes: [
 *       {
 *          attribute: 'lZGmxYbs97q',
 *          value: valUpsertTEI,
 *       },
 *       {
 *          attribute: 'w75KJ2mc4zz',
 *          value: 'Gigiwe',
 *       },
 *    ],
 *    enrollments: [
 *       {
 *          orgUnit: 'TSyzvBiovKh',
 *          program: 'fDd25txQckK',
 *          programState: 'lST1OZ5BDJ2',
 *          enrollmentDate: '2021-01-04',
 *          incidentDate: '2021-01-04',
 *       },
 *    ],
 * });
 */


function createTEI(data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'createTEI';else {
      options = {
        operationName: 'createTEI'
      };
    }
    return create('trackedEntityInstances', data, params, options, callback)(state);
  };
}
/**
 * Update a Tracked Entity Instance.
 * @public
 * @function
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`).
 * @param {Object} data - The update data containing new values.
 * @param {Object} [params] - Optional `import parameters` for a given a resource. E.g. `{dryRun: true, importStrategy: CREATE, filters:[]}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#import-parameters_1 DHIS2 Import parameters documentation} or run `discover`. Defauls to `DHIS2 default import parameters`.
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `updateTEI` operation. Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `updateTEI`.</caption>
 * updateTEI('PVqUD2hvU4E', {
 *    orgUnit: 'TSyzvBiovKh',
 *    trackedEntityType: 'nEenWmSyUEp',
 *    attributes: [
 *       {
 *          attribute: 'lZGmxYbs97q',
 *          value: valUpsertTEI,
 *       },
 *       {
 *          attribute: 'w75KJ2mc4zz',
 *          value: 'Gigiwe',
 *       },
 *    ],
 *    enrollments: [
 *       {
 *          orgUnit: 'TSyzvBiovKh',
 *          program: 'fDd25txQckK',
 *          programState: 'lST1OZ5BDJ2',
 *          enrollmentDate: '2021-01-04',
 *          incidentDate: '2021-01-04',
 *       },
 *    ],
 * });
 */


function updateTEI(path, data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'updateTEI';else {
      options = {
        operationName: 'updateTEI'
      };
    }
    return update('trackedEntityInstances', path, data, params, options, callback)(state);
  };
}
/**
 * Get annonymous events or tracker events.
 * @public
 * @function
 * @param {Object} params - `import` parameters for `getEvents`. See examples here
 * @param {{apiVersion: number,responseType: string}} [options] - `Optional` options for `getEvents` operation. Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response.
 * @returns {Operation}
 * @example <caption>- Query for `all events` with `children` of a certain `organisation unit`</caption>
 * getEvents({ orgUnit: 'YuQRtpLP10I', ouMode: 'CHILDREN' });
 */


function getEvents(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getEvents';else {
      options = {
        operationName: 'getEvents'
      };
    }
    return getData('events', params, responseType, options, callback)(state);
  };
}
/**
 * Create DHIS2 Events
 * - You will need a `program` which can be looked up using the `getPrograms` operation, an `orgUnit` which can be looked up using the `getMetadata` operation and passing `{organisationUnits: true}` as `resources` param, and a list of `valid data element identifiers` which can be looked up using the `getMetadata` passing `{dataElements: true}` as `resources` param.
 * - For events with registration, a `tracked entity instance identifier is required`
 * - For sending `events` to `programs with multiple stages`, you will need to also include the `programStage` identifier, the identifiers for `programStages` can be found in the `programStages` resource via a call to `getMetadata` operation.
 * @public
 * @function
 * @param {Object} data - The payload containing new values
 * @param {Object} [params] - Optional `import parameters` for events. E.g. `{dryRun: true, importStrategy: CREATE, filters:[]}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#events DHIS2 Event Import parameters documentation} or run `discover`. Defauls to `DHIS2 default import parameters`.
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `createEvents` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation} state
 * @example <caption>- Example `expression.js` of `createEvents` for a `single event` can look like this:</caption>
 * createEvents({
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'DiszpKrYNg8',
 *   eventDate: date,
 *   status: 'COMPLETED',
 *   completedDate: date,
 *   storedBy: 'admin',
 *   coordinate: {
 *     latitude: 59.8,
 *     longitude: 10.9,
 *   },
 *   dataValues: [
 *     {
 *       dataElement: 'qrur9Dvnyt5',
 *       value: '33',
 *     },
 *     {
 *       dataElement: 'oZg33kd9taw',
 *       value: 'Male',
 *     },
 *     {
 *       dataElement: 'msodh3rEMJa',
 *       value: date,
 *     },
 *   ],
 * });
 */


function createEvents(data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'createEvents';else {
      options = {
        operationName: 'createEvents'
      };
    }
    return create('events', data, params, options, callback)(state);
  };
}
/**
 * Update DHIS2 Event.
 * - To update an existing event, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @public
 * @function
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `updateEvents`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `updateEvents` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `updateEvents`</caption>
 * updateEvents('PVqUD2hvU4E', { events: [
 *  {
 *    program: 'eBAyeGv0exc',
 *    orgUnit: 'DiszpKrYNg8',
 *    eventDate: date,
 *    status: 'COMPLETED',
 *    storedBy: 'admin',
 *    coordinate: {
 *      latitude: '59.8',
 *      longitude: '10.9',
 *    },
 *    dataValues: [
 *      {
 *        dataElement: 'qrur9Dvnyt5',
 *        value: '22',
 *      },
 *      {
 *        dataElement: 'oZg33kd9taw',
 *        value: 'Male',
 *      },
 *    ],
 *  }]
 * });
 */


function updateEvents(path, data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'updateEvents';else {
      options = {
        operationName: 'updateEvents'
      };
    }
    return update('events', path, data, params, options, callback)(state);
  };
}
/**
 * Get DHIS2 Tracker Programs.
 * @public
 * @function
 * @param {Object} params - `import` parameters for `getPrograms`. See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#tracker-web-api DHIS2 api documentation for allowed query parameters }
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getPrograms` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Query for `all programs` with a certain `organisation unit`</caption>
 * getPrograms({ orgUnit: 'DiszpKrYNg8' , fields: '*' });
 */


function getPrograms(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getPrograms';else {
      options = {
        operationName: 'getPrograms'
      };
    }
    return getData('programs', params, options, callback)(state);
  };
}
/**
 * Create a DHIS2 Tracker Program
 * @public
 * @function
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `createPrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getPrograms` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `createPrograms` for a `single program` can look like this:</caption>
 * createPrograms(state.data);
 */


function createPrograms(data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'createPrograms';else {
      options = {
        operationName: 'createPrograms'
      };
    }
    return create('programs', data, options, params, callback)(state);
  };
}
/**
 * Update DHIS2 Tracker Programs
 * - To update an existing program, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @public
 * @function
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `updatePrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getPrograms` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `updatePrograms`</caption>
 * updatePrograms('PVqUD2hvU4E', state.data);
 */


function updatePrograms(path, data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'updatePrograms';else {
      options = {
        operationName: 'updatePrograms'
      };
    }
    return update('programs', path, data, params, options, callback)(state);
  };
}
/**
 * Get DHIS2 Enrollments
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getEnrollments`. See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#enrollment-management  here}
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getEnrollments` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- To constrain the response to `enrollments` which are part of a `specific program` you can include a `program query parameter`</caption>
 * getEnrollments({
 *   ou: 'O6uvpzGd5pu',
 *   ouMode: 'DESCENDANTS',
 *   program: 'ur1Edk5Oe2n',
 *   fields: '*',
 * });
 */


function getEnrollments(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getEnrollments';else {
      options = {
        operationName: 'getEnrollments'
      };
    }
    return getData('enrollments', params, options, callback)(state);
  };
}
/**
 * Enroll a TEI into a program
 * - Enrolling a tracked entity instance into a program
 * - For enrolling `persons` into a `program`, you will need to first get the `identifier of the person` from the `trackedEntityInstances resource` via the `getTEIs` operation.
 * - Then, you will need to get the `program identifier` from the `programs` resource via the `getPrograms` operation.
 * @public
 * @function
 * @param {Object} data - The enrollment data. See example {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#enrollment-management here }
 * @param {Object} [params] - Optional `import` parameters for `createEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `enrollTEI` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `createEnrollment` of a `person` into a `program` can look like this:</caption>
 * enrollTEI({
 *    trackedEntity: 'tracked-entity-id',
 *    orgUnit: 'org-unit-id',
 *    attributes: [
 *    {
 *       attribute: 'attribute-id',
 *       value: 'attribute-value',
 *    },
 *    ],
 *    enrollments: [
 *    {
 *       orgUnit: 'org-unit-id',
 *       program: 'program-id',
 *       enrollmentDate: '2013-09-17',
 *       incidentDate: '2013-09-17',
 *    },
 *    ],
 *});
 */


function enrollTEI(data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'enrollTEI';else {
      options = {
        operationName: 'enrollTEI'
      };
    }
    return create('enrollments', data, options, params, callback)(state);
  };
}
/**
 * Update a DHIS2 Enrollemts
 * - To update an existing enrollment, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @public
 * @function
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters for `updateEnrollments`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `updateEnrollments` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `updateEnromments`</caption>
 * updateEnrollments('PVqUD2hvU4E', state.data);
 */


function updateEnrollments(path, data, params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'updateEnrollments';else {
      options = {
        operationName: 'updateEnrollments'
      };
    }
    return update('enrollments', path, data, params, options, callback)(state);
  };
}
/**
 * Cancel a DHIS2 Enrollment
 * - To cancel an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @public
 * @function
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {Object} [params] - Optional `import` parameters for `cancelEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `cancelEnrollment` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `cancelEnrollment`</caption>
 * cancelEnrollments('PVqUD2hvU4E');
 */


function cancelEnrollment(enrollmentId, params, options, callback) {
  return function (state) {
    enrollmentId = (0, _languageCommon.expandReferences)(enrollmentId)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'cancelEnrollment';else {
      options = {
        operationName: 'cancelEnrollment'
      };
    }
    var path = "".concat(enrollmentId, "/cancelled");
    return update('enrollments', path, null, params, options, callback)(state);
  };
}
/**
 * Complete a DHIS2 Enrollment
 * - To complete an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @public
 * @function
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {Object} [params] - Optional `import` parameters for `completeEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `completeEnrollment` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `completeEnrollment`</caption>
 * completeEnrollment('PVqUD2hvU4E');
 */


function completeEnrollment(enrollmentId, params, options, callback) {
  return function (state) {
    enrollmentId = (0, _languageCommon.expandReferences)(enrollmentId)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'completeEnrollment';else {
      options = {
        operationName: 'completeEnrollment'
      };
    }
    var path = "".concat(enrollmentId, "/completed");
    return update('enrollments', path, null, params, options, callback)(state);
  };
}
/**
 * Get DHIS2 Relationships(links) between two entities in tracker. These entities can be tracked entity instances, enrollments and events.
 * - All the tracker operations, `getTEIs`, `getEnrollments` and `getEvents` also list their relationships if requested in the `field` filter.
 * - To list all relationships, this requires you to provide the UID of the trackedEntityInstance, Enrollment or event that you want to list all the relationships for.
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getRelationships`. See examples {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#relationships here}
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `getRelationships` operation.Defaults to `{apiVersion: state.configuration.apiVersion,responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- A query for `all relationships` associated with a `specific tracked entity instance` can look like this:</caption>
 * getRelationships({ tei: 'F8yKM85NbxW', fields: '*' });
 */


function getRelationships(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getRelationships';else {
      options = {
        operationName: 'getRelationships'
      };
    }
    return getData('relationships', params, options, callback)(state);
  };
}
/**
 * Get DHIS2 Data Values.
 * - This operation retrives data values from DHIS2 Web API by interacting with the `dataValueSets` resource
 * - Data values can be retrieved in XML, JSON and CSV format.
 * @public
 * @function
 * @param {Object} params - `Query` parameters for `getDataValues`. E.g. `{dataset: 'pBOMPrpg1QX', limit: 3, period: 2021, orgUnit: 'DiszpKrYNg8'} Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#data-values DHIS2 API docs} for available `Data Value Set Query Parameters`.
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `options` for `getDataValues` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>- Example getting **two** `data values` associated with a specific `orgUnit`, `dataSet`, and `period `</caption>
 * getDataValues({
 *   orgUnit: 'DiszpKrYNg8',
 *   period: '202010',
 *   dataSet: 'pBOMPrpg1QX',
 *   limit: 2,
 * });
 */


function getDataValues(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getDataValues';else {
      options = {
        operationName: 'getDataValues'
      };
    }
    return getData('dataValueSets', params, options, callback)(state);
  };
}
/**
 * Create DHIS2 Data Values
 * - This is used to send aggregated data to DHIS2
 * - A data value set represents a set of data values which have a relationship, usually from being captured off the same data entry form.
 * - To send a set of related data values sharing the same period and organisation unit, we need to identify the period, the data set, the org unit (facility) and the data elements for which to report.
 * - You can also use this operation to send large bulks of data values which don't necessarily are logically related.
 * - To send data values that are not linked to a `dataSet`, you do not need to specify the dataSet and completeDate attributes. Instead, you will specify the period and orgUnit attributes on the individual data value elements instead of on the outer data value set element. This will enable us to send data values for various periods and organisation units
 * @public
 * @function
 * @param {object} data - The `data values` to upload or create. See example shape.
 * @param {{apiVersion: number,responseType: string}} [options] - Optional `flags` for the behavior of the `createDataVaues` operation.
 * @param {object} [params] - Optional `import` parameters for `createDataValues`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`. Run `discover` or visit {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#data-values DHIS2 Docs API} to learn about available data values import parameters.
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `createDataValues`  for sending a set of related data values sharing the same period and organisation unit</caption>
 * createDataValues({
 *   dataSet: 'pBOMPrpg1QX',
 *   completeDate: '2014-02-03',
 *   period: '201401',
 *   orgUnit: 'DiszpKrYNg8',
 *   dataValues: [
 *     {
 *       dataElement: 'f7n9E0hX8qk',
 *       value: '1',
 *     },
 *     {
 *       dataElement: 'Ix2HsbDMLea',
 *       value: '2',
 *     },
 *     {
 *       dataElement: 'eY5ehpbEsB7',
 *       value: '3',
 *     },
 *   ],
 * });
 */


function createDataValues(data, options, params, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'createDataValues';else {
      options = {
        operationName: 'createDataValues'
      };
    }
    return create('dataValueSets', data, options, params, callback)(state);
  };
}
/**
 * Generate valid, random DHIS2 identifiers
 * - Useful for client generated Ids compatible with DHIS2
 * @public
 * @function
 * @param {{apiVersion: number,limit: number,responseType: string}} [options] - Optional `options` for `generateDhis2UID` operation. Defaults to `{apiVersion: state.configuration.apiVersion,limit: 1,responseType: 'json'}`
 * @param {function} [callback] - Callback to handle response
 * @returns {Operation}
 * @example <caption>Example generating `three UIDs` from the DHIS2 server</caption>
 * generateDhis2UID({limit: 3});
 */


function generateDhis2UID(options, callback) {
  return function (state) {
    var _options$limit, _options3, _options4;

    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'generateDhis2UID';else {
      options = {
        operationName: 'generateDhis2UID'
      };
    }
    var limit = {
      limit: (_options$limit = (_options3 = options) === null || _options3 === void 0 ? void 0 : _options3.limit) !== null && _options$limit !== void 0 ? _options$limit : 1
    };
    (_options4 = options) === null || _options4 === void 0 ? true : delete _options4.limit;
    return getData('system/id', limit, options, callback)(state);
  };
}
/**
 * Discover `DHIS2` `api` `endpoint` `query parameters` and allowed `operators` for a given resource's endpoint.
 * @public
 * @function
 * @param {string} httpMethod - The HTTP to inspect parameter usage for a given endpoint, e.g., `get`, `post`,`put`,`patch`,`delete`
 * @param {string} endpoint - The path for a given endpoint. E.g. `/trackedEntityInstances` or `/dataValueSets`
 * @returns {Operation}
 * @example <caption>Example getting a list of `parameters allowed` on a given `endpoint` for specific `http method`</caption>
 * discover('post', '/trackedEntityInstances')
 */


function discover(httpMethod, endpoint) {
  return function (state) {
    _Utils.Log.info("Discovering query/import parameters for ".concat(_Utils.COLORS.FgGreen).concat(httpMethod).concat(_Utils.ESCAPE, " on ").concat(_Utils.COLORS.FgGreen).concat(endpoint).concat(_Utils.ESCAPE));

    return _axios["default"].get('https://dhis2.github.io/dhis2-api-specification/spec/metadata_openapi.json', {
      transformResponse: [function (data) {
        var tempData = JSON.parse(data);
        var filteredData = tempData.paths[endpoint][httpMethod];
        return _objectSpread({}, filteredData, {
          parameters: filteredData.parameters.reduce(function (acc, currentValue) {
            var index = currentValue['$ref'].lastIndexOf('/') + 1;
            var paramRef = currentValue['$ref'].slice(index);
            var param = tempData.components.parameters[paramRef];

            if (param.schema['$ref']) {
              var schemaRefIndex = param.schema['$ref'].lastIndexOf('/') + 1;
              var schemaRef = param.schema['$ref'].slice(schemaRefIndex);
              param.schema = tempData.components.schemas[schemaRef];
            }

            param.schema = JSON.stringify(param.schema);
            var descIndex;
            if ((0, _lodash.indexOf)(param.description, ',') === -1 && (0, _lodash.indexOf)(param.description, '.') > -1) descIndex = (0, _lodash.indexOf)(param.description, '.');else if ((0, _lodash.indexOf)(param.description, ',') > -1 && (0, _lodash.indexOf)(param.description, '.') > -1) {
              descIndex = (0, _lodash.indexOf)(param.description, '.') < (0, _lodash.indexOf)(param.description, ',') ? (0, _lodash.indexOf)(param.description, '.') : (0, _lodash.indexOf)(param.description, ',');
            } else {
              descIndex = param.description.length;
            }
            param.description = param.description.slice(0, descIndex);
            acc[paramRef] = param;
            return acc;
          }, {})
        });
      }]
    }).then(function (result) {
      var _result$data$descript;

      _Utils.Log.info("\t=======================================================================================\n\tQuery Parameters for ".concat(_Utils.COLORS.FgGreen).concat(httpMethod).concat(_Utils.ESCAPE, " on ").concat(_Utils.COLORS.FgGreen).concat(endpoint).concat(_Utils.ESCAPE, " [").concat((_result$data$descript = result.data.description) !== null && _result$data$descript !== void 0 ? _result$data$descript : '<description_missing>', "]\n\t======================================================================================="));

      console.table(result.data.parameters, ['in', 'required', 'description']);
      console.table(result.data.parameters, ['schema']);
      console.log("=========================================Responses===============================\n".concat((0, _Utils.prettyJson)(result.data.responses), "\n======================================================================================="));
      return _objectSpread({}, state, {
        data: result.data
      });
    });
  };
}
/**
 * Get analytical, aggregated data
 * - The analytics resource is powerful as it lets you query and retrieve data aggregated along all available data dimensions.
 * - For instance, you can ask the analytics resource to provide the aggregated data values for a set of data elements, periods and organisation units.
 * - Also, you can retrieve the aggregated data for a combination of any number of dimensions based on data elements and organisation unit group sets.
 * @public
 * @function
 * @param {Object} params - Analytics `query parameters`, e.g. `{dx: 'fbfJHSPpUQD;cYeuwXTCPkU',filters: ['pe:2014Q1;2014Q2','ou:O6uvpzGd5pu;lc3eMKXaEfw']}`. Run `discover` or visit {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#analytics DHIS2 API docs} to get the params available.
 * @param {{apiVersion: number,responseType: string}}[options] - `Optional` options for `getAnalytics` operation. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback] - Callback to handle response
 * @returns {Operation}
 * @example <caption>Example getting only records where the data value is greater or equal to 6500 and less than 33000</caption>
 * getAnalytics({
 *   dimensions: [
 *    'dx:fbfJHSPpUQD;cYeuwXTCPkU',
 *    'pe:2014',
 *    'ou:O6uvpzGd5pu;lc3eMKXaEfw',
 *   ],
 *   measureCriteria: 'GE:6500;LT:33000',
 * });
 */


function getAnalytics(params, options, callback) {
  return function (state) {
    options = (0, _languageCommon.expandReferences)(options)(state);
    if (options) options.operationName = 'getAnalytics';else {
      options = {
        operationName: 'getAnalytics'
      };
    }
    return getData("analytics", params, options, callback)(state);
  };
}
/**
 * Get DHIS2 api resources
 * @public
 * @function
 * @param {Object} [params] - The `optional` query parameters for this endpoint. E.g `{filter: 'singular:like:attribute'}`.
 * @param {{filter: string, fields: string, responseType: string}} [options] - The `optional` options, specifiying the filter expression. E.g. `singular:eq:attribute`.
 * @param {function} [callback] - The `optional callback function that will be called to handle data returned by this function.
 * @returns {Operation}
 * @example <caption>Example getting a resource named `attribute`, in `xml` format, returning all the fields</caption>
 * getResources('dataElement', {
 *      filter: 'singular:eq:attribute',
 *      fields: '*',
 *      responseType: 'xml',
 * });
 */


function getResources(params, options, callback) {
  return function (state) {
    var _options$responseType, _options5, _params, _CONTENT_TYPES$respon;

    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = 'getResources';
    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        hostUrl = _state$configuration3.hostUrl;
    var responseType = (_options$responseType = (_options5 = options) === null || _options5 === void 0 ? void 0 : _options5.responseType) !== null && _options$responseType !== void 0 ? _options$responseType : 'json';
    var filter = (_params = params) === null || _params === void 0 ? void 0 : _params.filter;
    var queryParams = params;
    var headers = {
      Accept: (_CONTENT_TYPES$respon = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon !== void 0 ? _CONTENT_TYPES$respon : 'application/json'
    };
    var path = '/resources';
    var url = (0, _Utils.buildUrl)(path, hostUrl, null, false);

    var transformResponse = function transformResponse(data, headers) {
      if (filter) {
        var _headers$contentType, _headers$contentType2;

        if (((_headers$contentType = (_headers$contentType2 = headers['content-type']) === null || _headers$contentType2 === void 0 ? void 0 : _headers$contentType2.split(';')[0]) !== null && _headers$contentType !== void 0 ? _headers$contentType : null) === _Utils.CONTENT_TYPES.json) {
          var tempData = JSON.parse(data);
          return _objectSpread({}, tempData, {
            resources: _Utils.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _Utils.parseFilter)(filter))))
          });
        } else {
          _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
        }
      }

      return data;
    };

    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(queryParams, url);
    return _axios["default"].request({
      url: url,
      method: 'GET',
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      headers: headers,
      params: queryParams,
      transformResponse: transformResponse
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". The result of this operation will be in ").concat(operationName, "state.data").concat(_Utils.ESCAPE, " or in your ").concat(operationName, "callback").concat(_Utils.ESCAPE, "."));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get schema of a given resource type, in any data format supported by DHIS2
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated(`singular` version of the `resource name`). E.g. `dataElement`, `organisationUnit`, etc. Run `getResources` to see available resources and their corresponding `singular` names.
 * @param {Object} params - Optional `query parameters` for the `getSchema` operation. e.g. `{ fields: 'properties' ,skipPaging: true}`. Run`discover` or See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#metadata-export-examples DHIS2 API Docs}
 * @param {{apiVersion: number,resourceType: string}} [options] - Optional options for `getSchema` method. Defaults to `{apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>Example getting the `schema` for `dataElement` in XML</caption>
 * getSchema('dataElement', '{ fields: '*' }, { responseType: 'xml' });
 */


function getSchema(resourceType, params, options, callback) {
  return function (state) {
    var _options$responseType2, _options6, _params2, _params3, _options$apiVersion2, _options7, _CONTENT_TYPES$respon2, _resourceType;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = 'getSchema';
    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        hostUrl = _state$configuration4.hostUrl;
    var responseType = (_options$responseType2 = (_options6 = options) === null || _options6 === void 0 ? void 0 : _options6.responseType) !== null && _options$responseType2 !== void 0 ? _options$responseType2 : 'json';
    var filters = (_params2 = params) === null || _params2 === void 0 ? void 0 : _params2.filters;
    (_params3 = params) === null || _params3 === void 0 ? true : delete _params3.filters;
    var queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var apiVersion = (_options$apiVersion2 = (_options7 = options) === null || _options7 === void 0 ? void 0 : _options7.apiVersion) !== null && _options$apiVersion2 !== void 0 ? _options$apiVersion2 : state.configuration.apiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon2 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon2 !== void 0 ? _CONTENT_TYPES$respon2 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/schemas/".concat((_resourceType = resourceType) !== null && _resourceType !== void 0 ? _resourceType : ''), hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". The result of this operation will be in ").concat(operationName, "state.data").concat(_Utils.ESCAPE, " or in your ").concat(operationName, "callback").concat(_Utils.ESCAPE, "."));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get data. Generic helper method for getting data of any kind from DHIS2.
 * - This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to get(use its `plural` name). E.g. `dataElements`, `trackedEntityInstances`,`organisationUnits`, etc.
 * @param {Object} [params] - Optional `query parameters` e.g. `{ou: 'DiszpKrYNg8'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 docs} for more details on which params to use for a given type of resource.
 * @param {{apiVersion: number,operationName: string,responseType: string}}[options] - `Optional` options for `getData` operation. Defaults to `{operationName: 'getData', apiVersion: state.configuration.apiVersion, responseType: 'json'}`.
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation} state
 * @example <caption>Example getting one `trackedEntityInstance` with `Id` 'dNpxRu1mWG5' for a given `orgUnit(DiszpKrYNg8)`</caption>
 * getData('trackedEntityInstances', {
 *    fields: '*',
 *    ou: 'DiszpKrYNg8',
 *    entityType: 'nEenWmSyUEp',
 *    trackedEntityInstance: 'dNpxRu1mWG5',
 * });
 */


function getData(resourceType, params, options, callback) {
  return function (state) {
    var _options$operationNam, _options8, _options$responseType3, _options9, _params4, _params5, _params6, _options$apiVersion3, _options10, _CONTENT_TYPES$respon3;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = (_options$operationNam = (_options8 = options) === null || _options8 === void 0 ? void 0 : _options8.operationName) !== null && _options$operationNam !== void 0 ? _options$operationNam : 'getData';
    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        hostUrl = _state$configuration5.hostUrl;
    var responseType = (_options$responseType3 = (_options9 = options) === null || _options9 === void 0 ? void 0 : _options9.responseType) !== null && _options$responseType3 !== void 0 ? _options$responseType3 : 'json';
    var filters = (_params4 = params) === null || _params4 === void 0 ? void 0 : _params4.filters;
    var dimensions = (_params5 = params) === null || _params5 === void 0 ? void 0 : _params5.dimensions;
    (_params6 = params) === null || _params6 === void 0 ? true : delete _params6.filters;
    var queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    dimensions === null || dimensions === void 0 ? void 0 : dimensions.map(function (d) {
      return queryParams.append('dimension', d);
    });
    var apiVersion = (_options$apiVersion3 = (_options10 = options) === null || _options10 === void 0 ? void 0 : _options10.apiVersion) !== null && _options$apiVersion3 !== void 0 ? _options$apiVersion3 : state.configuration.apiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon3 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon3 !== void 0 ? _CONTENT_TYPES$respon3 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)("/".concat(resourceType), hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". The result of this operation will be in ").concat(operationName, " ").concat(_Utils.COLORS.FgGreen, "state.data").concat(_Utils.ESCAPE, " or in your ").concat(_Utils.COLORS.FgGreen, "callback").concat(_Utils.ESCAPE, "."));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Get metadata. A generic helper function to get metadata records from a given DHIS2 instance
 * @public
 * @function
 * @param {string[]} resources - Required. List of metadata resources to fetch. E.g. `['organisationUnits', 'attributes']` or like `'dataSets'` if you only want a single type of resource. See `getResources` to see the types of resources available.
 * @param {Object} [params] - Optional `query parameters` e.g. `{filters: ['name:like:ANC'],fields:'*'}`. See `discover` or visit {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#metadata-export DHIS2 API docs}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional `options` for `getMetadata` operation. Defaults to `{operationName: 'getMetadata', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional `callback` to handle the response
 * @returns {Operation}
 * @example <caption>Example getting a list of `data elements` and `indicators` where `name` includes the word **ANC**</caption>
 * getMetadata(['dataElements', 'indicators'], {
 *      filters: ['name:like:ANC'],
 * });
 */


function getMetadata(resources, params, options, callback) {
  return function (state) {
    var _options$responseType4, _options11, _queryParams, _queryParams2, _options$apiVersion4, _options12, _CONTENT_TYPES$respon4;

    resources = (0, _languageCommon.expandReferences)(resources)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = 'getMetadata';
    var _state$configuration6 = state.configuration,
        username = _state$configuration6.username,
        password = _state$configuration6.password,
        hostUrl = _state$configuration6.hostUrl;
    var responseType = (_options$responseType4 = (_options11 = options) === null || _options11 === void 0 ? void 0 : _options11.responseType) !== null && _options$responseType4 !== void 0 ? _options$responseType4 : 'json';

    if (typeof resources === 'string') {
      var res = {};
      res[resources] = true;
      resources = res;
    } else {
      resources = resources.reduce(function (acc, currentValue) {
        acc[currentValue] = true;
        return acc;
      }, {});
    }

    var queryParams = _objectSpread({}, resources, {}, params);

    var filters = (_queryParams = queryParams) === null || _queryParams === void 0 ? void 0 : _queryParams.filters;
    (_queryParams2 = queryParams) === null || _queryParams2 === void 0 ? true : delete _queryParams2.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var apiVersion = (_options$apiVersion4 = (_options12 = options) === null || _options12 === void 0 ? void 0 : _options12.apiVersion) !== null && _options$apiVersion4 !== void 0 ? _options$apiVersion4 : state.configuration.apiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon4 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon4 !== void 0 ? _CONTENT_TYPES$respon4 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)('/metadata', hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(queryParams, url);
    return _axios["default"].request({
      method: 'GET',
      url: url,
      auth: {
        username: username,
        password: password
      },
      responseType: responseType,
      params: queryParams,
      headers: headers
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". The result of this operation will be in ").concat(_Utils.COLORS.FgGreen).concat(operationName, " state.data").concat(_Utils.ESCAPE, " or in your ").concat(_Utils.COLORS.FgGreen, "callback").concat(_Utils.ESCAPE, "."));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * create data. A generic helper method to create a record of any kind in DHIS2
 * @public
 * @function
 * @param {string} resourceType - Type of resource to create. E.g. `trackedEntityInstances`
 * @param {Object} data - Data that will be used to create a given instance of resource
 * @param {Object} [options] - Optional `options` to control the behavior of the `create` operation.` Defaults to `{operationName: 'create', apiVersion: null, responseType: 'json'}`
 * @param {Object} [params] - Optional `import parameters` for a given a resource. E.g. `{dryRun: true, importStrategy: CREATE}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 API documentation} or {@link discover}. Defauls to `DHIS2 default params` for a given resource type.
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of `create`</caption>
 * create('events', {
 *   program: 'eBAyeGv0exc',
 *   orgUnit: 'DiszpKrYNg8',
 *   eventDate: date,
 *   status: 'COMPLETED',
 *   completedDate: date,
 *   storedBy: 'admin',
 *   coordinate: {
 *     latitude: 59.8,
 *     longitude: 10.9,
 *   },
 *   dataValues: [
 *     {
 *       dataElement: 'qrur9Dvnyt5',
 *       value: '33',
 *     },
 *     {
 *       dataElement: 'oZg33kd9taw',
 *       value: 'Male',
 *     },
 *     {
 *       dataElement: 'msodh3rEMJa',
 *       value: date,
 *     },
 *   ],
 * });
 */


function create(resourceType, data, options, params, callback) {
  return function (state) {
    var _options$operationNam2, _options13, _options$responseType5, _options14, _params7, _params8, _options$apiVersion5, _options15, _CONTENT_TYPES$respon5;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    var operationName = (_options$operationNam2 = (_options13 = options) === null || _options13 === void 0 ? void 0 : _options13.operationName) !== null && _options$operationNam2 !== void 0 ? _options$operationNam2 : 'create';
    var _state$configuration7 = state.configuration,
        username = _state$configuration7.username,
        password = _state$configuration7.password,
        hostUrl = _state$configuration7.hostUrl;
    var responseType = (_options$responseType5 = (_options14 = options) === null || _options14 === void 0 ? void 0 : _options14.responseType) !== null && _options$responseType5 !== void 0 ? _options$responseType5 : 'json';
    var filters = (_params7 = params) === null || _params7 === void 0 ? void 0 : _params7.filters;
    (_params8 = params) === null || _params8 === void 0 ? true : delete _params8.filters;
    var queryParams = new URLSearchParams(params);
    var apiVersion = (_options$apiVersion5 = (_options15 = options) === null || _options15 === void 0 ? void 0 : _options15.apiVersion) !== null && _options$apiVersion5 !== void 0 ? _options$apiVersion5 : state.configuration.apiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion);
    var headers = {
      Accept: (_CONTENT_TYPES$respon5 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon5 !== void 0 ? _CONTENT_TYPES$respon5 : 'application/json',
      'Content-Type': 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'POST',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: body,
      headers: headers
    }).then(function (result) {
      var _result$data$response, _result$data$response2;

      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". Created ").concat(resourceType, ": ").concat(_Utils.COLORS.FgGreen).concat(((_result$data$response = result.data.response) === null || _result$data$response === void 0 ? void 0 : _result$data$response.importSummaries) ? result.data.response.importSummaries[0].href : (_result$data$response2 = result.data.response) === null || _result$data$response2 === void 0 ? void 0 : _result$data$response2.reference).concat(_Utils.ESCAPE, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Update data. A generic helper function to update a resource object of any type.
 * - It requires to send `all required fields` or the `full body`
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {Object} data - Data to update. It requires to send `all required fields` or the `full body`. If you want `partial updates`, use `patch` operation.
 * @param {Object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'update', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback]  - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `updating` a `data element`</caption>
 * update('dataElements', 'FTRrcoaog83',
 * {
 *   displayName: 'New display name',
 *   aggregationType: 'SUM',
 *   domainType: 'AGGREGATE',
 *   valueType: 'NUMBER',
 *   name: 'Accute Flaccid Paralysis (Deaths < 5 yrs)',
 *   shortName: 'Accute Flaccid Paral (Deaths < 5 yrs)',
 * });
 *
 */


function update(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$operationNam3, _options16, _options$responseType6, _options17, _params9, _params10, _options$apiVersion6, _options18, _CONTENT_TYPES$respon6;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var _state$configuration8 = state.configuration,
        username = _state$configuration8.username,
        password = _state$configuration8.password,
        hostUrl = _state$configuration8.hostUrl;
    var operationName = (_options$operationNam3 = (_options16 = options) === null || _options16 === void 0 ? void 0 : _options16.operationName) !== null && _options$operationNam3 !== void 0 ? _options$operationNam3 : 'update';
    var responseType = (_options$responseType6 = (_options17 = options) === null || _options17 === void 0 ? void 0 : _options17.responseType) !== null && _options$responseType6 !== void 0 ? _options$responseType6 : 'json';
    var filters = (_params9 = params) === null || _params9 === void 0 ? void 0 : _params9.filters;
    (_params10 = params) === null || _params10 === void 0 ? true : delete _params10.filters;
    var queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var apiVersion = (_options$apiVersion6 = (_options18 = options) === null || _options18 === void 0 ? void 0 : _options18.apiVersion) !== null && _options$apiVersion6 !== void 0 ? _options$apiVersion6 : state.configuration.apiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    var headers = {
      Accept: (_CONTENT_TYPES$respon6 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon6 !== void 0 ? _CONTENT_TYPES$respon6 : 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'PUT',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: body,
      headers: headers
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". Updated ").concat(resourceType, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Patch a record. A generic helper function to send partial updates on one or more object properties.
 * - You are not required to send the full body of object properties.
 * - This is useful for cases where you don't want or need to update all properties on a object.
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {Object} data - Data to update. Include only the fields you want to update. E.g. `{name: "New Name"}`
 * @param {Object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,responseType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'patch', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example `patching` a `data element`</caption>
 * patch('dataElements', 'FTRrcoaog83',
 * {
 *   name: 'New Name',
 * });
 */


function patch(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$operationNam4, _options19, _options$responseType7, _options20, _queryParams3, _queryParams4, _options$apiVersion7, _options21, _CONTENT_TYPES$respon7;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = (_options$operationNam4 = (_options19 = options) === null || _options19 === void 0 ? void 0 : _options19.operationName) !== null && _options$operationNam4 !== void 0 ? _options$operationNam4 : 'patch';
    var _state$configuration9 = state.configuration,
        username = _state$configuration9.username,
        password = _state$configuration9.password,
        hostUrl = _state$configuration9.hostUrl;
    var responseType = (_options$responseType7 = (_options20 = options) === null || _options20 === void 0 ? void 0 : _options20.responseType) !== null && _options$responseType7 !== void 0 ? _options$responseType7 : 'json';
    var queryParams = params;
    var filters = (_queryParams3 = queryParams) === null || _queryParams3 === void 0 ? void 0 : _queryParams3.filters;
    (_queryParams4 = queryParams) === null || _queryParams4 === void 0 ? true : delete _queryParams4.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var apiVersion = (_options$apiVersion7 = (_options21 = options) === null || _options21 === void 0 ? void 0 : _options21.apiVersion) !== null && _options$apiVersion7 !== void 0 ? _options$apiVersion7 : state.configuration.apiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    var headers = {
      Accept: (_CONTENT_TYPES$respon7 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon7 !== void 0 ? _CONTENT_TYPES$respon7 : 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'PATCH',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: body,
      headers: headers
    }).then(function (result) {
      var resultObject = {
        status: result.status,
        statusText: result.statusText
      };

      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". Updated ").concat(resourceType, ".\nSummary:\n").concat((0, _Utils.prettyJson)(resultObject)));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, resultObject));
      return (0, _languageCommon.composeNextState)(state, resultObject);
    });
  };
}
/**
 * Delete a record. A generic helper function to delete an object
 * @public
 * @function
 * @param {string} resourceType - The type of resource to be deleted. E.g. `trackedEntityInstances`, `organisationUnits`, etc.
 * @param {string} path - Can be an `id` of an `object` or `path` to the `nested object` to `delete`.
 * @param {Object} [data] - Optional. This is useful when you want to remove multiple objects from a collection in one request. You can send `data` as, for example, `{"identifiableObjects": [{"id": "IDA"}, {"id": "IDB"}, {"id": "IDC"}]}`. See more {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#deleting-objects on DHIS2 API docs}
 * @param {Object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional `options` for `del` operation. Defaults to `{operationName: 'delete', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {function} [callback] - Optional callback to handle the response
 * @returns {Operation}
 * @example <caption>Example`deleting` a `tracked entity instance`</caption>
 * del('trackedEntityInstances', 'LcRd6Nyaq7T');
 */


function del(resourceType, path, data, params, options, callback) {
  return function (state) {
    var _options$operationNam5, _options22, _options$responseType8, _options23, _queryParams5, _queryParams6, _options$apiVersion8, _options24, _CONTENT_TYPES$respon8;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    path = (0, _languageCommon.expandReferences)(path)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = (_options$operationNam5 = (_options22 = options) === null || _options22 === void 0 ? void 0 : _options22.operationName) !== null && _options$operationNam5 !== void 0 ? _options$operationNam5 : 'delete';
    var _state$configuration10 = state.configuration,
        username = _state$configuration10.username,
        password = _state$configuration10.password,
        hostUrl = _state$configuration10.hostUrl;
    var responseType = (_options$responseType8 = (_options23 = options) === null || _options23 === void 0 ? void 0 : _options23.responseType) !== null && _options$responseType8 !== void 0 ? _options$responseType8 : 'json';
    var queryParams = params;
    var filters = (_queryParams5 = queryParams) === null || _queryParams5 === void 0 ? void 0 : _queryParams5.filters;
    (_queryParams6 = queryParams) === null || _queryParams6 === void 0 ? true : delete _queryParams6.filters;
    queryParams = new URLSearchParams(queryParams);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var apiVersion = (_options$apiVersion8 = (_options24 = options) === null || _options24 === void 0 ? void 0 : _options24.apiVersion) !== null && _options$apiVersion8 !== void 0 ? _options$apiVersion8 : state.configuration.apiVersion;
    var headers = {
      Accept: (_CONTENT_TYPES$respon8 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon8 !== void 0 ? _CONTENT_TYPES$respon8 : 'application/json'
    };
    var url = (0, _Utils.buildUrl)('/' + resourceType + '/' + path, hostUrl, apiVersion);
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);
    return _axios["default"].request({
      method: 'DELETE',
      url: url,
      auth: {
        username: username,
        password: password
      },
      params: queryParams,
      data: body,
      headers: headers
    }).then(function (result) {
      _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". DELETED ").concat(resourceType, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

      if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
      return (0, _languageCommon.composeNextState)(state, result.data);
    });
  };
}
/**
 * Upsert a record. A generic helper function used to atomically either insert a row, or on the basis of the row already existing, UPDATE that existing row instead.
 * @public
 * @function
 * @param {string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {{attributeId: string,attributeValue:any}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {Object} data - The update data containing new values
 * @param {Object} [params] - Optional `import` parameters e.g. `{ou: 'lZGmxYbs97q', filters: ['w75KJ2mc4zz:EQ:Jane']}`
 * @param {{replace:boolean, apiVersion: number,strict: boolean,responseType: string}} [options] - `Optional` options for `upsertTEI` operation. Defaults to `{replace: false, apiVersion: state.configuration.apiVersion,strict: true,responseType: 'json'}`.
 * @param {function} [callback] - Optional callback to handle the response
 * @throws {RangeError} - Throws range error
 * @returns {Operation}
 * @example <caption>- Example `expression.js` of upsert</caption>
 * upsert(
 *    'trackedEntityInstances',
 *    {
 *       attributeId: 'lZGmxYbs97q',
 *          attributeValue: state =>
 *             state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
 *             .value,
 *    },
 *    state.data,
 *    { ou: 'TSyzvBiovKh' }
 * );
 * @todo Tweak/refine to mimic implementation based on the following inspiration: {@link https://sqlite.org/lang_upsert.html sqlite upsert} and {@link https://wiki.postgresql.org/wiki/UPSERT postgresql upsert}
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
 */


function upsert(resourceType, uniqueAttribute, data, params, options, callback) {
  return function (state) {
    var _options$operationNam6, _options25, _options$replace, _options26, _options$responseType9, _options27, _params11, _options$apiVersion9, _options28, _CONTENT_TYPES$respon9;

    resourceType = (0, _languageCommon.expandReferences)(resourceType)(state);
    uniqueAttribute = (0, _languageCommon.expandReferences)(uniqueAttribute)(state);
    var body = (0, _languageCommon.expandReferences)(data)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    options = (0, _languageCommon.expandReferences)(options)(state);
    var operationName = (_options$operationNam6 = (_options25 = options) === null || _options25 === void 0 ? void 0 : _options25.operationName) !== null && _options$operationNam6 !== void 0 ? _options$operationNam6 : 'upsert';
    var _state$configuration11 = state.configuration,
        username = _state$configuration11.username,
        password = _state$configuration11.password,
        hostUrl = _state$configuration11.hostUrl;
    var replace = (_options$replace = (_options26 = options) === null || _options26 === void 0 ? void 0 : _options26.replace) !== null && _options$replace !== void 0 ? _options$replace : false;
    var responseType = (_options$responseType9 = (_options27 = options) === null || _options27 === void 0 ? void 0 : _options27.responseType) !== null && _options$responseType9 !== void 0 ? _options$responseType9 : 'json';
    var _uniqueAttribute = uniqueAttribute,
        attributeId = _uniqueAttribute.attributeId,
        attributeValue = _uniqueAttribute.attributeValue;
    var filters = (_params11 = params) === null || _params11 === void 0 ? void 0 : _params11.filters;
    delete params.filters;
    var queryParams = new URLSearchParams(params);
    filters === null || filters === void 0 ? void 0 : filters.map(function (f) {
      return queryParams.append('filter', f);
    });
    var op = resourceType === 'trackedEntityInstances' ? 'EQ' : 'eq';
    queryParams.append('filter', "".concat(attributeId, ":").concat(op, ":").concat(attributeValue));
    var apiVersion = (_options$apiVersion9 = (_options28 = options) === null || _options28 === void 0 ? void 0 : _options28.apiVersion) !== null && _options$apiVersion9 !== void 0 ? _options$apiVersion9 : state.configuration.apiVersion;
    var url = (0, _Utils.buildUrl)('/' + resourceType, hostUrl, apiVersion);
    var headers = {
      Accept: (_CONTENT_TYPES$respon9 = _Utils.CONTENT_TYPES[responseType]) !== null && _CONTENT_TYPES$respon9 !== void 0 ? _CONTENT_TYPES$respon9 : 'application/json'
    };
    (0, _Utils.logOperation)(operationName);
    (0, _Utils.logApiVersion)(apiVersion);
    (0, _Utils.logWaitingForServer)(url, queryParams);
    (0, _Utils.warnExpectLargeResult)(resourceType, url);

    var getResouceName = function getResouceName() {
      return _axios["default"].get(hostUrl + '/api/resources', {
        auth: {
          username: username,
          password: password
        },
        transformResponse: [function (data, headers) {
          var filter = "plural:eq:".concat(resourceType);

          if (filter) {
            var _headers$contentType3, _headers$contentType4;

            if (((_headers$contentType3 = (_headers$contentType4 = headers['content-type']) === null || _headers$contentType4 === void 0 ? void 0 : _headers$contentType4.split(';')[0]) !== null && _headers$contentType3 !== void 0 ? _headers$contentType3 : null) === _Utils.CONTENT_TYPES.json) {
              var tempData = JSON.parse(data);
              return _objectSpread({}, tempData, {
                resources: _Utils.applyFilter.apply(void 0, [tempData.resources].concat(_toConsumableArray((0, _Utils.parseFilter)(filter))))
              });
            } else {
              _Utils.Log.warn('Filters on this resource are only supported for json content types. Skipping filtering ...');
            }
          }

          return data;
        }]
      }).then(function (result) {
        return result.data.resources[0].singular;
      });
    };

    var findRecordsWithValueOnAttribute = function findRecordsWithValueOnAttribute() {
      console.log(queryParams);
      return _axios["default"].request({
        method: 'GET',
        url: url,
        auth: {
          username: username,
          password: password
        },
        params: queryParams,
        headers: headers
      });
    };

    _Utils.Log.info("Checking if a record exists that matches this filter: ".concat(_Utils.COLORS.FgGreen, "attribute{ id: ").concat(attributeId, ", value: ").concat(attributeValue, " }\x1B[0m ..."));

    return Promise.all([getResouceName(), findRecordsWithValueOnAttribute()]).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          resourceName = _ref4[0],
          recordsWithValue = _ref4[1];

      var recordsWithValueCount = recordsWithValue.data[resourceType].length;

      if (recordsWithValueCount > 1) {
        _Utils.Log.error('');

        throw new RangeError("Cannot upsert on Non-unique attribute. The operation found more than one records with the same value of ".concat(attributeValue, " for ").concat(attributeId));
      } else if (recordsWithValueCount === 1) {
        var _row1$id;

        // TODO
        // Log.info(
        //   `Unique record found, proceeding to checking if attribute is NULLABLE ...`
        // );
        // if (recordsWithNulls.data[resourceType].length > 0) {
        //   throw new Error(
        //     `Cannot upsert on Nullable attribute. The operation found records with a NULL value on ${attributeId}.`
        //   );
        // }
        _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Attribute has unique values").concat(_Utils.ESCAPE, ". Proceeding to ").concat(_Utils.COLORS.FgGreen).concat(replace ? 'replace' : 'merge').concat(_Utils.ESCAPE, " ..."));

        var row1 = recordsWithValue.data[resourceType][0];
        var useCustomPATCH = ['trackedEntityInstances'].includes(resourceType) ? true : false;
        var method = replace ? 'PUT' : useCustomPATCH === true ? 'PUT' : 'PATCH';
        var id = (_row1$id = row1['id']) !== null && _row1$id !== void 0 ? _row1$id : row1[resourceName];
        var updateUrl = "".concat(url, "/").concat(id);
        var payload = useCustomPATCH ? _objectSpread({}, row1, {}, body, {
          attributes: [].concat(_toConsumableArray(row1.attributes), _toConsumableArray(body.attributes))
        }) : body;
        return _axios["default"].request({
          method: method,
          url: updateUrl,
          auth: {
            username: username,
            password: password
          },
          data: payload,
          params: queryParams,
          headers: headers
        }).then(function (result) {
          _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". Updated ").concat(resourceName, ": ").concat(_Utils.COLORS.FgGreen).concat(updateUrl).concat(_Utils.ESCAPE, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      } else if (recordsWithValueCount === 0) {
        _Utils.Log.info("".concat(_Utils.COLORS.FgGreen, "Existing record not found").concat(_Utils.ESCAPE, ", proceeding to ").concat(_Utils.COLORS.FgGreen, "CREATE(POST)").concat(_Utils.ESCAPE, " ...")); // We must delete the filter and ou params so the POST request is not interpreted as a GET request by the server


        queryParams["delete"]('filter');
        queryParams["delete"]('ou');
        return _axios["default"].request({
          method: 'POST',
          url: url,
          auth: {
            username: username,
            password: password
          },
          data: body,
          params: queryParams,
          headers: headers
        }).then(function (result) {
          var _result$data$response3;

          _Utils.Log.info("".concat(_Utils.COLORS.FgGreen).concat(operationName, " succeeded").concat(_Utils.ESCAPE, ". Created ").concat(resourceName, ": ").concat(_Utils.COLORS.FgGreen).concat(result.data.response.importSummaries ? result.data.response.importSummaries[0].href : (_result$data$response3 = result.data.response) === null || _result$data$response3 === void 0 ? void 0 : _result$data$response3.reference).concat(_Utils.ESCAPE, ".\nSummary:\n").concat((0, _Utils.prettyJson)(result.data)));

          if (callback) return callback((0, _languageCommon.composeNextState)(state, result.data));
          return (0, _languageCommon.composeNextState)(state, result.data);
        });
      }
    });
  };
}
