/** @module Adaptor */
//#region IMPORTS
import axios from 'axios';
import { execute as commonExecute, composeNextState } from 'language-common';
import { indexOf } from 'lodash';

import {
  Log,
  warnExpectLargeResult,
  logWaitingForServer,
  buildUrl,
  logApiVersion,
  CONTENT_TYPES,
  applyFilter,
  parseFilter,
  logOperation,
  COLORS,
  prettyJson,
  ESCAPE,
  composeSuccessMessage,
  recursivelyExpandReferences,
} from './Utils';
//#endregion

//#region CONFIG HELPERS, INTERCEPTORS and TYPE DEFINITIONS

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
  const { hostUrl, apiUrl } = state.configuration;
  if (!hostUrl) {
    Log.warn(
      'DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.'
    );
    state.configuration.hostUrl = apiUrl;
    return state;
  }
  return state;
}

/* `Axios` Interceptors */
axios.interceptors.response.use(
  function (response) {
    const contentType = response.headers['content-type']?.split(';')[0];

    const acceptHeaders = response.config.headers['Accept']
      .split(';')[0]
      .split(',');

    if (response.config.method === 'get') {
      if (indexOf(acceptHeaders, contentType) === -1) {
        const newError = {
          status: 404,
          message: 'Unexpected content,returned',
          responseData: response.data,
        };

        Log.error(newError.message);

        return Promise.reject(newError);
      }
    }

    if (
      typeof response?.data === 'string' &&
      contentType === CONTENT_TYPES?.json
    ) {
      try {
        response = { ...response, data: JSON.parse(response.data) };
      } catch (error) {
        /** Keep quiet */
      }
    }
    return response;
  },
  function (error) {
    Log.error(`${error?.message}`);
    try {
      console.log(JSON.stringify(error.response?.data?.response, null, 2));
    } catch (err) {
      /* Keep quiet! Just log the above error again */
      console.log(error.response?.data?.response);
    }
    console.log(error.response?.data?.response);
    return Promise.reject(error);
  }
);

/**
 * Type definition for the `result returned` by `OpenFn operations`
 * @public
 * @typedef {{configuration: object, references: object[], data: object}} state
 */

/**
 * Type definition for the `callback` supplied to `OpenFn operations`
 * @public
 * @callback requestCallback
 * @param {state} state
 * @returns {state}
 */

/**
 * Type definition for `options` `parameter` object used in `DHIS2 adaptor's operations`.
 * @public
 * @typedef {{ replace: boolean, apiVersion: number, supportApiVersion: boolean,requireUniqueAttributeConfig: boolean}} options
 *
 */

//#endregion

//#region COMMONLY USED HELPER OPERATIONS

/**
 * Get DHIS2 Tracked Entity Instance(s)
 * @param {array} params - `import` parameters for `getTEIs`. E.g. `[{fields: '*'},{ ou: 'DiszpKrYNg8' },{ skipPaging: true },])`
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `getTEIs` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `getTEIs` `expression.js` for fetching a `single` `Tracked Entity Instance`</caption>
 * getTEIs([
 * {
 *   fields: '*',
 * },
 * { ou: 'CMqUILyVnBL' },
 * { trackedEntityInstance: 'HNTA9qD6EEG' },
 * { skipPaging: true },
 * ]);
 */
export function getTEIs(params, options, callback) {
  return state => {
    let responseType = options?.responseType ?? 'json';
    return getData(
      'trackedEntityInstances',
      params,
      responseType,
      options,
      callback
    )(state);
  };
}

/**
 * Upsert(Create or update) one or many Tracked Entity Instances. Update if the record exists otherwise insert a new record.
 * This is useful for idempotency and duplicate management
 * @public
 * @constructor
 * @param {string} uniqueAttributeId - Tracked Entity Instance unique identifier used during matching
 * @param {Object<symbol,any>} data - Payload data for new/updated tracked entity instance(s)
 * @param {options} [options] - Optional `options` for `upserTEI` operation. Defaults to `{responseType: 'json',replace: false, apiVersion: null,requireUniqueAttributeConfig: true}`
 * @param {requestCallback} [callback] - Optional `callback` to handle the response.
 * @throws {RangeError} - Throws `RangeError` when `uniqueAttributeId` is `invalid` or `not unique`.
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of upsertTEI</caption>
 * upsertTEI('lZGmxYbs97q', state.data);
 * @todo Implement updateCondition
 * @todo Upsert many TEIs in a single call
 */
export function upsertTEI(uniqueAttributeId, data, options, callback) {
  return state => {
    if (options) options[operationName] = 'upsertTEI';
    else {
      options = { operationName: 'upsertTEI' };
    }

    const { password, username, hostUrl } = state.configuration;

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const requireUniqueAttributeConfig =
      options?.requireUniqueAttributeConfig ?? true;

    const params = {
      ou: body.orgUnit,
    };

    const uniqueAttributeValue = body.attributes?.find(
      obj => obj?.attribute === uniqueAttributeId
    )?.value;

    const trackedEntityType = body.trackedEntityType;

    const uniqueAttributeUrl = buildUrl(
      `/trackedEntityAttributes/${uniqueAttributeId}`,
      hostUrl,
      apiVersion
    );

    const trackedEntityTypeUrl = buildUrl(
      `/trackedEntityTypes/${trackedEntityType}?fields=*`,
      hostUrl,
      apiVersion
    );

    const findTrackedEntityType = () => {
      return axios
        .get(trackedEntityTypeUrl, { auth: { username, password } })
        .then(result => {
          const attribute = result.data?.trackedEntityTypeAttributes?.find(
            obj => obj?.trackedEntityAttribute?.id === uniqueAttributeId
          );
          return {
            ...result.data,
            upsertAttributeAssigned: attribute ? true : false,
          };
        });
    };

    const isAttributeUnique = () => {
      return axios
        .get(uniqueAttributeUrl, { auth: { username, password } })
        .then(result => {
          const foundAttribute = result.data;
          return { unique: foundAttribute.unique, name: foundAttribute.name };
        });
    };
    return Promise.all([
      findTrackedEntityType(),
      requireUniqueAttributeConfig === true
        ? isAttributeUnique()
        : Promise.resolve({ unique: true }),
    ]).then(([entityType, attribute]) => {
      if (!entityType.upsertAttributeAssigned) {
        Log.error('');
        throw new RangeError(
          `Tracked Entity Attribute ${uniqueAttributeId} is not assigned to ${entityType.name} Entity Type. Ensure, in DHIS2, this tracked entity attribute is assigned to ${entityType.name} and that it is marked as unique.`
        );
      }
      if (!attribute.unique) {
        Log.error('');
        throw new RangeError(
          `Attribute ${
            attribute.name ?? ''
          }(${uniqueAttributeId}) is not unique. Ensure, in DHIS2, this tracked entity attribute is marked as unique.`
        );
      }
      return upsert(
        'trackedEntityInstances',
        {
          attributeId: uniqueAttributeId,
          attributeValue: uniqueAttributeValue,
        },
        body,
        params,
        options,
        callback
      )(state);
    });
  };
}

/**
 * Create a DHIS2 Tracked Entity Instance
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createTEI` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createTEI`</caption>
 * createTEI(state.data);
 */
export function createTEI(data, params, options, callback) {
  return state => {
    return create(
      'trackedEntityInstances',
      data,
      params,
      options,
      callback
    )(state);
  };
}

/**
 * Update a DHIS2 Tracked Entity Instance
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `create`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updateTEI` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `updateTEI`</caption>
 * update('PVqUD2hvU4E', state.data);
 */
export function updateTEI(path, data, params, options, callback) {
  return state => {
    return update(
      'trackedEntityInstances',
      path,
      data,
      params,
      options,
      callback
    )(state);
  };
}

/**
 * Get DHIS2 Events, single events with no registration(annonymous events) or single event with registration and multiple events with registration(tracker events)
 * @param {array} params - `import` parameters for `getEvents`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getEvents` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Query for `all events` with `children` of a certain `organisation unit`</caption>
 * getEvents([{ orgUnit: 'YuQRtpLP10I' }, { ouMode: 'CHILDREN' }]);
 * @example <caption>- Query for `all events` with all `descendants` of a certain `organisation unit`, implying all organisation units in the `sub-hierarchy`</caption>
 * getEvents([{ orgUnit: 'O6uvpzGd5pu' }, { ouMode: 'DESCENDANTS' }]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit`</caption>
 * getEvents([{ orgUnit: 'DiszpKrYNg8' }, { program: 'eBAyeGv0exc' }]);
 * @example <caption>- Query for all `events` with a `certain program` and `organisation unit`, `sorting` by `due date ascending`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { order: 'dueDate' },
 * ]);
 * @example <caption>- Query for the `10 events` with the `newest event date` in a `certain program` and `organisation unit` - by `paging` and `ordering` by `due date descending`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { order: 'eventDate:desc' },
 * { pageSize: 10 },
 * { page: 1 },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit` for a specific `tracked entity instance`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { trackedEntityInstance: 'gfVxE3ALA9m' },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program` and `organisation unit` `older` or `equal to 2014-02-03`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { endDate: '2014-02-03' },
 * ]);
 * @example <caption>- Query for `all events` with a `certain program stage`, `organisation unit` and `tracked entity instance` in the `year 2014`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'eBAyeGv0exc' },
 * { trackedEntityInstance: 'gfVxE3ALA9m' },
 * { startDate: '2014-01-01' },
 * { endDate: '2014-12-31' },
 * ]);
 * @example <caption>- Retrieve `events` with specified `Organisation unit` and `Program`, and use `Attribute:Gq0oWTf2DtN` as `identifier scheme`</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'lxAQ7Zs9VYR' },
 * { idScheme: 'Attribute:Gq0oWTf2DtN' },
 * ]);
 * @example <caption>- Retrieve `events` with specified `Organisation unit` and `Program`, and use `UID` as `identifier scheme` for `orgUnits`, `Code` as `identifier scheme` for `Program stages`, and `Attribute:Gq0oWTf2DtN` as `identifier scheme` for the rest of the `metadata` with `assigned attribute`.</caption>
 * getEvents([
 * { orgUnit: 'DiszpKrYNg8' },
 * { program: 'lxAQ7Zs9VYR' },
 * { idScheme: 'Attribute:Gq0oWTf2DtN' },
 * { orgUnitIdScheme: 'UID' },
 * { programStageIdScheme: 'Code' },
 * ]);
 */
export function getEvents(params, responseType, options, callback) {
  return state => {
    return getData('events', params, responseType, options, callback)(state);
  };
}

/**
 * Create a DHIS2 Events
 * - You will need a `program` which can be looked up using the `getPrograms` operation, an `orgUnit` which can be looked up using the `getMetadata` operation and passing `{organisationUnits: true}` as `resources` param, and a list of `valid data element identifiers` which can be looked up using the `getMetadata` passing `{dataElements: true}` as `resources` param.
 * - For events with registration, a `tracked entity instance identifier is required`
 * - For sending `events` to `programs with multiple stages`, you will need to also include the `programStage` identifier, the identifiers for `programStages` can be found in the `programStages` resource via a call to `getMetadata` operation.
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `createEvents`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createEvents` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createEvents` for a `single event` can look like this:</caption>
 * createEvents(state.data);
 * @see {singleEventSampleState}
 * @example <caption>- Example `expression.js` of `createEvents` for sending `multiple events` at the same time</caption>
 * createEvents(state.data);
 * @see {multipleEventsSampleState}
 */
export function createEvents(data, params, options, callback) {
  return state => {
    return create('events', data, params, options, callback)(state);
  };
}

/**
 * Update a DHIS2 Events
 * - To update an existing event, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `updateEvents`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updateEvents` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `updateEvents`</caption>
 * updateEvents('PVqUD2hvU4E', state.data);
 * @todo Support `merge` via custom `partial updates` mechanism since `PATCH` is not `natively` supported on this endpoint
 */
export function updateEvents(path, data, params, options, callback) {
  return state => {
    return update('events', path, data, params, options, callback)(state);
  };
}

/**
 * Get DHIS2 Programs
 * @param {array} params - `import` parameters for `getPrograms`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getPrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Query for `all programs` with a certain `organisation unit`</caption>
 * getPrograms([{ orgUnit: 'DiszpKrYNg8' }, { fields: '*' }]);
 */
export function getPrograms(params, responseType, options, callback) {
  return state => {
    return getData('programs', params, responseType, options, callback)(state);
  };
}

/**
 * Create a DHIS2 Programs
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `createPrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createPrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createPrograms` for a `single program` can look like this:</caption>
 * createPrograms(state.data);
 * @see {singleProgramSampleState}
 * @example <caption>- Example `expression.js` of `createPrograms` for sending `multiple programs` at the same time</caption>
 * createPrograms(state.data);
 * @see {multipleProgramsSampleState}
 */
export function createPrograms(data, params, options, callback) {
  return state => {
    return create('programs', data, params, options, callback)(state);
  };
}

/**
 * Update a DHIS2 Programs
 * - To update an existing program, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `updatePrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updatePrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `updatePrograms`</caption>
 * updatePrograms('PVqUD2hvU4E', state.data);
 * @todo Support `merge` via custom `partial updates` mechanism since `PATCH` is not `natively` supported on this endpoint
 */
export function updatePrograms(path, data, params, options, callback) {
  return state => {
    return update('programs', path, data, params, options, callback)(state);
  };
}

/**
 * Get DHIS2 Enrollments
 * @param {array} params - `import` parameters for `getEnrollments`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getEnrollments` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- A query for `all enrollments` associated with a `specific organisation unit` can look like this:</caption>
 * getEnrollments([{ ou: 'DiszpKrYNg8' }, { fields: '*' }]);
 * @example <caption>- To constrain the response to `enrollments` which are part of a `specific program` you can include a `program query parameter`</caption>
 * getEnrollments([
 * { ou: 'O6uvpzGd5pu' },
 * { ouMode: 'DESCENDANTS' },
 * { program: 'ur1Edk5Oe2n' },
 * { fields: '*' },
 * ]);
 * @example <caption>- To specify `program enrollment dates` as `part of the query`</caption>
 * getEnrollments([
 * { ou: 'O6uvpzGd5pu' },
 * { ouMode: 'DESCENDANTS' },
 * { program: 'ur1Edk5Oe2n' },
 * { programStartDate: '2013-01-01' },
 * { programEndDate: '2013-09-01' },
 * { fields: '*' },
 * ]);
 * @example <caption>- To constrain the response to `enrollments` of a `specific tracked entity` you can include a `tracked entity query parameter`</caption>
 * getEnrollments([
 * { ou: 'O6uvpzGd5pu' },
 * { ouMode: 'DESCENDANTS' },
 * { program: 'ur1Edk5Oe2n' },
 * { trackedEntity: 'cyl5vuJ5ETQ' },
 * { fields: '*' },
 * ]);
 * @example <caption>- To constrain the response to `enrollments` of a `specific tracked entity instance` you can include a `tracked entity instance query parameter`, in this case we have `restricted` it to available `enrollments viewable for current user`</caption>
 * getEnrollments([
 * { ouMode: 'ACCESSIBLE' },
 * { trackedEntityInstance: 'tphfdyIiVL6' },
 * { fields: '*' },
 * ]);
 * @example <caption>- By default the `enrollments` are returned in `pages of size 50`, to change this you can use the `page` and `pageSize query parameters`</caption>
 * getEnrollments([
 * { ou: 'O6uvpzGd5pu' },
 * { ouMode: 'DESCENDANTS' },
 * { page: 2 },
 * { pageSize: 3 },
 * { fields: '*' },
 * ]);
 */
export function getEnrollments(params, responseType, options, callback) {
  return state => {
    return getData(
      'enrollments',
      params,
      responseType,
      options,
      callback
    )(state);
  };
}

/**
 * Create a DHIS2 Enrollment
 * - Enrolling a tracked entity instance into a program
 * - For enrolling `persons` into a `program`, you will need to first get the `identifier of the person` from the `trackedEntityInstances resource` via the `getTEIs` operation.
 * - Then, you will need to get the `program identifier` from the `programs` resource via the `getPrograms` operation.
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `createEnrollment`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createEnrollment` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createEnrollment` of a `person` into a `program` can look like this:</caption>
 * createEnrollment(state.data);
 * @see {enrollmentSampleState}
 */
export function createEnrollment(data, params, options, callback) {
  return state => {
    return create('enrollments', data, params, options, callback)(state);
  };
}

/**
 * Update a DHIS2 Enrollemts
 * - To update an existing enrollment, the format of the payload is the same as that of `creating an event` via `createEvents` operations
 * - But  you should supply the `identifier` of the object you are updating
 * - The payload has to contain `all`, even `non-modified`, `attributes`.
 * - Attributes that were present before and are not present in the current payload any more will be removed by DHIS2.
 * - If you do not want this behavior, please use `upsert` operation to upsert your events.
 * @param {string} path - Path to the object being updated. This can be an `id` or path to an `object` in a `nested collection` on the object(E.g. `/api/{collection-object}/{collection-object-id}/{collection-name}/{object-id}`)
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `updatePrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updatePrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `updateEnromments`</caption>
 * updatePrograms('PVqUD2hvU4E', state.data);
 * @todo Support `merge` via custom `partial updates` mechanism since `PATCH` is not `natively` supported on this endpoint
 */
export function updateEnrollments(path, data, params, options, callback) {
  return state => {
    return update('enrollments', path, data, params, options, callback)(state);
  };
}

/**
 * Cancel a DHIS2 Enrollment
 * - To cancel an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {array} [params] - Optional `import` parameters for `updatePrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updatePrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `cancelEnrollment`</caption>
 * cancelEnrollments('PVqUD2hvU4E');
 */
export function cancelEnrollment(enrollmentId, params, options, callback) {
  return state => {
    const path = `${enrollmentId}/cancelled`;
    return update('enrollments', path, null, params, options, callback)(state);
  };
}

/**
 * Complete a DHIS2 Enrollment
 * - To complete an existing enrollment, you should supply the `enrollment identifier`(`enrollemt-id`)
 * @param {string} enrollmentId - The `enrollment-id` of the enrollment you wish to cancel
 * @param {array} [params] - Optional `import` parameters for `updatePrograms`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `updatePrograms` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `completeEnrollment`</caption>
 * completeEnrollment('PVqUD2hvU4E');
 */
export function completeEnrollment(enrollmentId, params, options, callback) {
  return state => {
    const path = `${enrollmentId}/completed`;
    return update('enrollments', path, null, params, options, callback)(state);
  };
}

/**
 * Get DHIS2 Relationships(links) between two entities in tracker. These entities can be tracked entity instances, enrollments and events.
 * - All the tracker operations, `getTEIs`, `getEnrollments` and `getEvents` also list their relationships if requested in the `field` filter.
 * - To list all relationships, this requires you to provide the UID of the trackedEntityInstance, Enrollment or event that you want to list all the relationships for.
 * @param {array} params - `import` parameters for `getRelationships`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {eventOptions} [options] - Optional `flags` for the behavior of the `getRelationships` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- A query for `all relationships` associated with a `specific tracked entity instance` can look like this:</caption>
 * getRelationships([{ tei: 'F8yKM85NbxW' }, { fields: '*' }]);
 * @example <caption>- A query for `all relationships` associated with a `enrollment` can look like this:</caption>
 * getRelationships([{ enrollment: 'LXmiAMnJLrS' }, { fields: '*' }]);
 * @example <caption>- A query for `all relationships` associated with a `event` can look like this:</caption>
 * getRelationships([{ event: 'TgJUhG6P6TJ' }, { fields: '*' }]);
 */
export function getRelationships(params, responseType, options, callback) {
  return state => {
    return getData(
      'relationships',
      params,
      responseType,
      options,
      callback
    )(state);
  };
}

/**
 * Get DHIS2 Data Values.
 * - This operation retrives data values from DHIS2 Web API by interacting with the `dataValueSets` resource
 * - Data values can be retrieved in XML, JSON and CSV format.
 * @param {array} params - `Query` parameters for `getDataValues`.
 * @param {string} [responseType] - Optional response type. Defaults to `json`
 * @param {dhis2Options} [options] - Optional `flags` for the behavior of the `getDataValues` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- A query for retrieving `data values` associated with a specific `orgUnit`, `dataSet`, and `period `, can look like this:</caption>
 *  getDataValues([
 * { orgUnit: 'DiszpKrYNg8' },
 * { period: '202010' },
 * { dataSet: 'pBOMPrpg1QX' },
 * ]);
 * @example <caption>- To retrieve `data values` which have been `created or updated` within the `last 10 days` you can make a request like this:</caption>
 * getDataValues([
 * { orgUnit: 'DiszpKrYNg8' },
 * { lastUpdatedDuration: '10d' },
 * { dataSet: 'pBOMPrpg1QX' },
 * ]);
 */
export function getDataValues(params, responseType, options, callback) {
  return state => {
    return getData(
      'dataValueSets',
      params,
      responseType,
      options,
      callback
    )(state);
  };
}

/**
 * Create DHIS2 Data Values
 * - This is used to send aggregated data to DHIS2
 * - A data value set represents a set of data values which have a relationship, usually from being captured off the same data entry form.
 * - To send a set of related data values sharing the same period and organisation unit, we need to identify the period, the data set, the org unit (facility) and the data elements for which to report.
 * - You can also use this operation to send large bulks of data values which don't necessarily are logically related.
 * - To send data values that are not linked to a `dataSet`, you do not need to specify the dataSet and completeDate attributes. Instead, you will specify the period and orgUnit attributes on the individual data value elements instead of on the outer data value set element. This will enable us to send data values for various periods and organisation units
 * @param {object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters for `createDataValues`. E.g. `{dryRun: true, IdScheme: 'CODE'}. Defaults to DHIS2 `default params`
 * @param {createOptions} [options] - Optional `flags` for the behavior of the `createDataVaues` operation.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `createDataValues`  for sending a set of related data values sharing the same period and organisation unit</caption>
 * createDataValues(state.data);
 * @see {relatedDataValuesSampleState}
 * @example <caption>- Example `expression.js` of `createDataValues`  for sending large bulks of data values which don't necessarily are logically related</caption>
 * createDataValues(state.data);
 * @see {bulkDataValuesSampleState}
 */
export function createDataValues(data, params, options, callback) {
  return state => {
    return create('enrollments', data, params, options, callback)(state);
  };
}
//#endregion

//#region GENERIC HELPER OPERATIONS

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => {
    return commonExecute(
      configMigrationHelper,
      ...operations
    )({ ...initialState, ...state });
  };
}

/**
 * Generate valid, random DHIS2 identifiers *
 * - Useful for client generated Ids compatible with DHIS2
 * @param {array} [params] - The limit query parameter is optional and indicates how many identifiers you want to be returned with the response. The default is to return one identifier.
 * @param {string} [responseType] - Defaults to `json`
 * @param {options} [options] - Options
 * @param {requestCallback} [callback] - Callback to handle response
 * @example <caption>Example generating `one UID` from the DHIS2 server</caption>
 * generateDhis2UID();
 * @example <caption>Example generating `three UIDs` from the DHIS2 server</caption>
 * generateDhis2UID([{limit: 3}]);
 */
export function generateDhis2UID(params, responseType, options, callback) {
  return state =>
    getData('system/id', params, responseType, options, callback)(state);
}
/**
 * Discover available parameters and allowed operators for a given resource's endpoint
 * @todo Implementation
 * @example
 * discover('getData, /api/trackedEntityInstances')
 * @constructor
 * @param {*} operation
 * @param {*} path
 */
export function discover(operation, path) {
  return state => {
    return axios
      .get(
        'https://dhis2.github.io/dhis2-api-specification/spec/metadata_openapi.json',
        {
          transformResponse: [
            data => {
              let tempData = JSON.parse(data);
              let filteredData = tempData.paths[path][operation];
              return {
                ...filteredData,
                parameters: filteredData.parameters.reduce(
                  (acc, currentValue) => {
                    let index = currentValue['$ref'].lastIndexOf('/') + 1;
                    let paramRef = currentValue['$ref'].slice(index);
                    let param = tempData.components.parameters[paramRef];

                    if (param.schema['$ref']) {
                      let schemaRefIndex =
                        param.schema['$ref'].lastIndexOf('/') + 1;
                      let schemaRef = param.schema['$ref'].slice(
                        schemaRefIndex
                      );
                      param.schema = tempData.components.schemas[schemaRef];
                    }

                    param.schema = JSON.stringify(param.schema);

                    let descIndex;
                    if (
                      indexOf(param.description, ',') === -1 &&
                      indexOf(param.description, '.') > -1
                    )
                      descIndex = indexOf(param.description, '.');
                    else if (
                      indexOf(param.description, ',') > -1 &&
                      indexOf(param.description, '.') > -1
                    ) {
                      descIndex =
                        indexOf(param.description, '.') <
                        indexOf(param.description, ',')
                          ? indexOf(param.description, '.')
                          : indexOf(param.description, ',');
                    } else {
                      descIndex = param.description.length;
                    }

                    param.description = param.description.slice(0, descIndex);

                    acc[paramRef] = param;
                    return acc;
                  },
                  {}
                ),
              };
            },
          ],
        }
      )
      .then(result => {
        Log.info(
          `\t=======================================================================================\n\tQuery Parameters for ${
            COLORS.FgGreen
          }${operation}${ESCAPE} on ${COLORS.FgGreen}${path}${ESCAPE} [${
            result.data.description ?? '<description_missing>'
          }]\n\t=======================================================================================`
        );
        console.table(result.data.parameters, [
          'in',
          'required',
          'description',
        ]);
        console.table(result.data.parameters, ['schema']);
        console.log(
          `=========================================Responses===============================\n${prettyJson(
            result.data.responses
          )}\n=======================================================================================`
        );
        return { ...state, data: result.data };
      });
  };
}

/**
 * Access analytical, aggregated data in DHIS2 you can work with the analytics resource
 * - The analytics resource is powerful as it lets you query and retrieve data aggregated along all available data dimensions.
 * - For instance, you can ask the analytics resource to provide the aggregated data values for a set of data elements, periods and organisation units.
 * - Also, you can retrieve the aggregated data for a combination of any number of dimensions based on data elements and organisation unit group sets.
 * @param {string} resourceType - The resource you want analytics for.
 * @param {array} [params] - Analytics query params. Run `discover('getAnalytics',${resourceType})` to get the params available
 * @param {string} [responseType] - Defaults to `json`
 * @param {options} [options] - Options
 * @param {requestCallback} [callback] - Callback to handle response
 * @example <caption>Example generating `one UID` from the DHIS2 server</caption>
 * getAnalytics('events');
 * @todo examples
 */
export function getAnalytics(
  resourceType,
  params,
  responseType,
  options,
  callback
) {
  return state =>
    getData(
      `analytics/${resourceType}`,
      params,
      responseType,
      options,
      callback
    )(state);
}

/**
 * Get a list of DHIS2 api resources
 * @param {Object} params - The optional query parameters for this endpoint. E.g `{filter: 'singular:like:attribute'}`
 * @param {string} params.filter - The optional filter parameter, specifiying the filter expression. E.g. `singular:eq:attribute`
 * @param {string} responseType - The optional response type. Defaults to `json`
 * @param {Function} callback - The optional function that will be called to handle data returned by this function. Defaults to `state.data`
 * @example
 // 1. Get all api resources
  getResources()

 // 2. Get an attribute resource in json
  getResources({filter: 'singular:eq:attribute'})

 // 3. Get organisation unit resource in XML format, with a callback
  getResources({ filter: 'singular:eq:organisationUnit' }, 'xml', state => {
    console.log('Response', state.data);
    return state;
  });

 // 4. Get all api resources in csv format
  getResources('','csv') 

 // 4. Get all api resources in csv format
  getResources('','pdf')  

 */
export function getResources(params, responseType, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = recursivelyExpandReferences(params)(state);

    const filter = params?.filter;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const path = '/resources';

    const url = buildUrl(path, hostUrl, null, false);

    const transformResponse = function (data, headers) {
      if (filter) {
        if (
          (headers['content-type']?.split(';')[0] ?? null) ===
          CONTENT_TYPES.json
        ) {
          let tempData = JSON.parse(data);
          return {
            ...tempData,
            resources: applyFilter(tempData.resources, ...parseFilter(filter)),
          };
        } else {
          Log.warn(
            'Filters on this resource are only supported for json content types. Skipping filtering ...'
          );
        }
      }
      return data;
    };
    logOperation('getResources');

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(queryParams, url);

    return axios
      .request({
        url,
        method: 'GET',
        auth: { username, password },
        responseType,
        headers,
        transformResponse,
      })
      .then(result => {
        composeSuccessMessage('getResources');
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 * Get the schema of a given resource type, in any data format supported by DHIS2
 * @typedef {Object<string, any>} VersionParam
 * @property {Boolean} supportApiVersion
 * @property {number} apiVersion
 * @param {string} resourceType
 * @param {Object} params
 * @param {string} responseType - Defaults to `json`
 * @param {VersionParam} options
 * @param {Function} callback
 * @returns
 * @example
 *
 // 1. Get all schemas on the api, in json
  getSchema();

 // 2. Get Schema for Attribute resource in json
  getSchema('attribute');

 // 3. Get Schema for trackedEntityType in XML format
  getSchema('trackedEntityType', '', 'xml');

 // 4. Get all api schemas in csv format
  getSchema('', '', 'csv');

 // 4. Get Schema for trackedEntityType using a given api version(overriding apiVersion supplied in state.configuration), in json
  getSchema('trackedEntityType', '', '', {supportApiVersion: true, apiVersion: 33});

 // 5. Get Schema for organisationUnit in xml, with a callback
  getSchema('organisationUnit', '', 'xml', '', (state)=>{console.log('state.data',state.data);return state;});
 
 */
export function getSchema(
  resourceType,
  params,
  responseType,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = recursivelyExpandReferences(params)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(
      `/schemas/${resourceType ?? ''}`,
      hostUrl,
      apiVersion,
      supportApiVersion
    );

    logOperation('getSchema');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

/**
 * A generic helper method for getting data of any kind from DHIS2. This can be used to get `DataValueSets`,`events`,`trackedEntityInstances`,`etc.`
 * @param {string} resourceType
 * @param {Object} params
 * @param {string} responseType
 * @param {Object} options
 * @param {Function} callback
 * @example
  // 1. Example Getting Tracked Entity Instances: Get a list of trackedEntityInstances of type `Person`, in json, for a given `orgUnit`, leaving out `system info` from the `result body`
    getData(
    'trackedEntityInstances',
    {
      fields: '*',
      ou: 'DiszpKrYNg8',
      entityType: 'nEenWmSyUEp',
      skipPaging: true,
    },
    {
      includeSystem: false,
    }
    );

  // 2. Example Getting Events: Get a list of  events with a certain program and organisation unit,sorting by due date ascending.

  getData('events',
  {
    orgUnit: 'DiszpKrYNg8',
    program: 'eBAyeGv0exc',
    order: 'dueDate'
  }
  );

  // 3. Example Getting DataValueSets: Get a list of `data values` for multiple  `dataSets`, with `startDate` and `endDate`, and multiple `orgUnits`

  getData('dataValueSets', {
    dataSet: 'pBOMPrpg1QX',
    dataSet: 'BfMAe6Itzgt',
    startDate: '2013-01-01',
    endDate: '2020-01-31',
    orgUnit: 'YuQRtpLP10I',
    orgUnit: 'vWbkYPRmKyS',
    children: true,
  });

  // 4. Example Getting Metadata: Get a list of `org units` 

  getData('organisationUnits');

 */
export function getData(resourceType, params, options, callback) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    // NOTE: 'filters' is the only special parameter we control for DHIS2, all
    // others can be passed directly, but as dhis2 expects multiple filters and
    // they cannot occupy the same key for an object, users may opt to pass an
    // array of 'filters' which we handle below.
    const { filters } = params;
    delete params.filters;
    let queryParams = new URLSearchParams(params);
    filters?.map(f => queryParams.append('filter', f));

    let responseType = options?.responseType ?? 'json';

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl(`/${resourceType}`, hostUrl, apiVersion);

    logOperation('getData');

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        Log.info(composeSuccessMessage('GET ' + resourceType));
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 * A generic helper function to get metadata records from a given DHIS2 instance
 * @param {Object} resources - E.g. `{organisationUnits: true, attributes: true}`
 * @param {Object} params 
 * @param {Object} options 
 * @param {Function} callback 
 * @example
  // 1. Get a list of organisation units and attributes, in a single request
  getMetadata(
    {attributes: true, organisationUnits: true},
    {
      fields: '*',
    },
    {
      includeSystem: false,
    }
  );

  // 2. Get a list of `dataSets`
  getMetadata(
    { dataSets: true },
    {
      assumeTrue: false,
      fields: '*',
    }
  );
 */
export function getMetadata(
  resources,
  params,
  responseType,
  options,
  callback
) {
  return state => {
    const { username, password, hostUrl } = state.configuration;

    const queryParams = recursivelyExpandReferences({
      ...resources,
      ...params,
    })(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const supportApiVersion =
      options?.supportApiVersion ?? state.configuration.supportApiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl('/metadata', hostUrl, apiVersion, supportApiVersion);

    logOperation('getMetadata');

    logApiVersion(apiVersion, supportApiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resources, url);

    return axios
      .request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        responseType,
        params: queryParams,
        headers,
      })
      .then(result => {
        if (callback) return callback(composeNextState(state, result.data));

        return composeNextState(state, result.data);
      });
  };
}

/**
 * A generic helper method to create a record of any kind in DHIS2
 * @param {string} resourceType - Type of resource to create. E.g. `trackedEntityInstances`
 * @param {Object<symbol,any>} data - Data that will be used to create a given instance of resource
 * @param {Object} [options] - Optional `options` to control the behavior of the `create` operation.` Defaults to `{operationName: 'create', apiVersion: null, responseType: 'json'}`
 * @param {Object} [params] - Optional `import parameters` for a given a resource. E.g. `{dryRun: true, importStrategy: CREATE}` See {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html DHIS2 API documentation} or {@link discover}. Defauls to `DHIS2 default params` for a given resource type.
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>- Example `expression.js` of `create`</caption>
 * create('events', state.data);
 */
export function create(resourceType, data, options, params, callback) {
  return state => {
    const operationName = options?.operationName ?? 'create';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    params = recursivelyExpandReferences(params)(state);

    const { filters } = params;
    delete params.filters;
    let queryParams = new URLSearchParams(params);

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const url = buildUrl('/' + resourceType, hostUrl, apiVersion);

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation(operationName);

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'POST',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        data: body,
        headers,
      })
      .then(result => {
        Log.info(
          `${
            COLORS.FgGreen
          }${operationName} succeeded${ESCAPE}. Created ${resourceType}: ${
            COLORS.FgGreen
          }${
            result.data.response.importSummaries
              ? result.data.response.importSummaries[0].href
              : result.data.response?.reference
          }${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 *  A generic helper function to update a resource object of any type.
 * - It requires to send `all required fields` or the `full body`
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {object} data - Data to update. It requires to send `all required fields` or the `full body`. If you want `partial updates`, use `patch` operation.
 * @param {object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'update', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {requestCallback} [callback]  - Optional callback to handle the response
 * @returns {Promise<state>} state
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
export function update(resourceType, path, data, params, options, callback) {
  return state => {
    const operationName = options?.operationName ?? 'update';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    const filters = params?.filters;
    delete params?.filters;
    let queryParams = new URLSearchParams(params);
    filters?.map(f => queryParams.append('filter', f));

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const url = buildUrl('/' + resourceType + '/' + path, hostUrl, apiVersion);

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation(operationName);

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'PUT',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        data: body,
        headers,
      })
      .then(result => {
        Log.info(
          `${
            COLORS.FgGreen
          }${operationName} succeeded${ESCAPE}. Updated ${resourceType}.\nSummary:\n${prettyJson(
            result.data
          )}`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 * A generic helper function to send partial updates on one or more object properties.
 * - You are not required to send the full body of object properties.
 * - This is useful for cases where you don't want or need to update all properties on a object.
 * @param {string} resourceType - The type of resource to be updated. E.g. `dataElements`, `organisationUnits`, etc.
 * @param {string} path - The `id` or `path` to the `object` to be updated. E.g. `FTRrcoaog83` or `FTRrcoaog83/{collection-name}/{object-id}`
 * @param {object} data - Data to update. Include only the fields you want to update. E.g. `{name: "New Name"}`
 * @param {object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'patch', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @example <caption>Example `patching` a `data element`</caption>
 * patch('dataElements', 'FTRrcoaog83',
 * {
 *   name: 'New Name',
 * });
 */
export function patch(resourceType, path, data, params, options, callback) {
  return state => {
    const operationName = options?.operationName ?? 'patch';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    let queryParams = recursivelyExpandReferences(params)(state);

    const filters = queryParams?.filters;

    delete queryParams?.filters;

    queryParams = new URLSearchParams(queryParams);

    filters?.map(f => queryParams.append('filter', f));

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const url = buildUrl('/' + resourceType + '/' + path, hostUrl, apiVersion);

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation(operationName);

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'PATCH',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        data: body,
        headers,
      })
      .then(result => {
        Log.info(
          `${
            COLORS.FgGreen
          }${operationName} succeeded${ESCAPE}. Updated ${resourceType}.\nSummary:\n${prettyJson(
            result.data
          )}`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 *  A generic helper function to delete an object
 * @param {string} resourceType - The type of resource to be deleted. E.g. `trackedEntityInstances`, `organisationUnits`, etc.
 * @param {string} path - Can be an `id` of an `object` or `path` to the `nested object` to `delete`.
 * @param {object} [data] - Optional. This is useful when you want to remove multiple objects from a collection in one request. You can send `data` as, for example, `{"identifiableObjects": [{"id": "IDA"}, {"id": "IDB"}, {"id": "IDC"}]}`. See more {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#deleting-objects on DHIS2 API docs}
 * @param {object} [params] - Optional `update` parameters e.g. `{preheatCache: true, strategy: 'UPDATE', mergeMode: 'REPLACE'}`. Run `discover` or see {@link https://docs.dhis2.org/2.34/en/dhis2_developer_manual/web-api.html#create-update-parameters DHIS2 documentation}
 * @param {{apiVersion: number,operationName: string,resourceType: string}} [options] - Optional options for update method. Defaults to `{operationName: 'delete', apiVersion: state.configuration.apiVersion, responseType: 'json'}`
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @example <caption>Example`deleting` a `tracked entity instance`</caption>
 * del('trackedEntityInstances', 'LcRd6Nyaq7T');
 */
export function del(resourceType, path, data, params, options, callback) {
  return state => {
    const operationName = options?.operationName ?? 'delete';

    const { username, password, hostUrl } = state.configuration;

    const responseType = options?.responseType ?? 'json';

    let queryParams = recursivelyExpandReferences(params)(state);

    const filters = queryParams?.filters;

    delete queryParams?.filters;

    queryParams = new URLSearchParams(queryParams);

    filters?.map(f => queryParams.append('filter', f));

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    const url = buildUrl('/' + resourceType + '/' + path, hostUrl, apiVersion);

    logOperation(operationName);

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    return axios
      .request({
        method: 'DELETE',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        data: body,
        headers,
      })
      .then(result => {
        Log.info(
          `${
            COLORS.FgGreen
          }${operationName} succeeded${ESCAPE}. DELETED ${resourceType}.\nSummary:\n${prettyJson(
            result.data
          )}`
        );
        if (callback) return callback(composeNextState(state, result.data));
        return composeNextState(state, result.data);
      });
  };
}

/**
 * A generic helper function used to atomically either insert a row, or on the basis of the row already existing,
 * UPDATE that existing row instead.
 * @param {string} resourceType - The type of a resource to `insert` or `update`. E.g. `trackedEntityInstances`
 * @param {{attributeId: string,attributeValue:string|number}} uniqueAttribute - An object containing a `attributeId` and `attributeValue` which will be used to uniquely identify the record
 * @param {Object<any,any>} data - The update data containing new values
 * @param {array} [params] - Optional `import` parameters e.g. `{ou: 'lZGmxYbs97q', filters: [w75KJ2mc4zz:EQ:Jane]}`
 * @param {options} [options={replace: false, apiVersion: null, responseType: 'json'}] - Optional options for update method {@link options}.`
 * @param {requestCallback} [callback] - Optional callback to handle the response
 * @returns {Promise<state>} state
 * @throws {RangeError}
 * @example <caption>- Example `expression.js` of upsert</caption>
 * ```javascript
 * upsert(
 *      'trackedEntityInstances',
 *       {
 *         attributeId: 'lZGmxYbs97q',
 *         attributeValue: state =>
 *           state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
 *             .value,
 *       },
 *       state.data,
 *       { ou: 'TSyzvBiovKh' }
 *     )
 * ```
 * @todo Tweak/refine to mimic implementation based on the following inspiration: {@link https://sqlite.org/lang_upsert.html sqlite upsert} and {@link https://wiki.postgresql.org/wiki/UPSERT postgresql upsert}
 * @todo Test implementation for upserting metadata
 * @todo Test implementation for upserting data values
 * @todo Implement the updateCondition
 */
export function upsert(
  resourceType,
  uniqueAttribute,
  data,
  params,
  options,
  callback
) {
  return state => {
    const operationName = options?.operationName ?? 'upsert';

    const { username, password, hostUrl } = state.configuration;

    const replace = options?.replace ?? false;

    const responseType = options?.responseType ?? 'json';

    const { attributeId, attributeValue } = recursivelyExpandReferences(
      uniqueAttribute
    )(state);
    params = recursivelyExpandReferences(params)(state);

    const { filters } = params;
    delete params.filters;
    let queryParams = new URLSearchParams(params);
    filters?.map(f => queryParams.append('filter', f));

    const op = resourceType === 'trackedEntityInstances' ? 'EQ' : 'eq';

    queryParams.append('filter', `${attributeId}:${op}:${attributeValue}`);

    const body = recursivelyExpandReferences(data)(state);

    const apiVersion = options?.apiVersion ?? state.configuration.apiVersion;

    const url = buildUrl('/' + resourceType, hostUrl, apiVersion);

    const headers = {
      Accept: CONTENT_TYPES[responseType] ?? 'application/json',
    };

    logOperation(operationName);

    logApiVersion(apiVersion);

    logWaitingForServer(url, queryParams);

    warnExpectLargeResult(resourceType, url);

    const getResouceName = () => {
      return axios
        .get(hostUrl + '/api/resources', {
          auth: { username, password },
          transformResponse: [
            function (data, headers) {
              let filter = `plural:eq:${resourceType}`;
              if (filter) {
                if (
                  (headers['content-type']?.split(';')[0] ?? null) ===
                  CONTENT_TYPES.json
                ) {
                  let tempData = JSON.parse(data);
                  return {
                    ...tempData,
                    resources: applyFilter(
                      tempData.resources,
                      ...parseFilter(filter)
                    ),
                  };
                } else {
                  Log.warn(
                    'Filters on this resource are only supported for json content types. Skipping filtering ...'
                  );
                }
              }
              return data;
            },
          ],
        })
        .then(result => result.data.resources[0].singular);
    };

    const findRecordsWithValueOnAttribute = () => {
      console.log(queryParams);
      return axios.request({
        method: 'GET',
        url,
        auth: {
          username,
          password,
        },
        params: queryParams,
        headers,
      });
    };

    Log.info(
      `Checking if a record exists that matches this filter: ${COLORS.FgGreen}attribute{ id: ${attributeId}, value: ${attributeValue} }\x1b[0m ...`
    );
    return Promise.all([
      getResouceName(),
      findRecordsWithValueOnAttribute(),
    ]).then(([resourceName, recordsWithValue]) => {
      const recordsWithValueCount = recordsWithValue.data[resourceType].length;
      if (recordsWithValueCount > 1) {
        Log.error('');
        throw new RangeError(
          `Cannot upsert on Non-unique attribute. The operation found more than one records with the same value of ${attributeValue} for ${attributeId}`
        );
      } else if (recordsWithValueCount === 1) {
        // TODO
        // Log.info(
        //   `Unique record found, proceeding to checking if attribute is NULLABLE ...`
        // );
        // if (recordsWithNulls.data[resourceType].length > 0) {
        //   throw new Error(
        //     `Cannot upsert on Nullable attribute. The operation found records with a NULL value on ${attributeId}.`
        //   );
        // }
        Log.info(
          `${
            COLORS.FgGreen
          }Attribute has unique values${ESCAPE}. Proceeding to ${
            COLORS.FgGreen
          }${replace ? 'replace' : 'merge'}${ESCAPE} ...`
        );

        const row1 = recordsWithValue.data[resourceType][0];
        const useCustomPATCH = ['trackedEntityInstances'].includes(resourceType)
          ? true
          : false;
        const method = replace
          ? 'PUT'
          : useCustomPATCH === true
          ? 'PUT'
          : 'PATCH';

        const id = row1['id'] ?? row1[resourceName];

        const updateUrl = `${url}/${id}`;

        const payload = useCustomPATCH
          ? {
              ...row1,
              ...body,
              attributes: [...row1.attributes, ...body.attributes],
            }
          : body;

        return axios
          .request({
            method,
            url: updateUrl,
            auth: {
              username,
              password,
            },
            data: payload,
            params: queryParams,
            headers,
          })
          .then(result => {
            Log.info(
              `${
                COLORS.FgGreen
              }${operationName} succeeded${ESCAPE}. Updated ${resourceName}: ${
                COLORS.FgGreen
              }${updateUrl}${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
            );
            if (callback) return callback(composeNextState(state, result.data));
            return composeNextState(state, result.data);
          });
      } else if (recordsWithValueCount === 0) {
        Log.info(
          `${COLORS.FgGreen}Existing record not found${ESCAPE}, proceeding to ${COLORS.FgGreen}CREATE(POST)${ESCAPE} ...`
        );

        // We must delete the filter and ou params so the POST request is not interpreted as a GET request by the server
        queryParams.delete('filter');
        queryParams.delete('ou');

        return axios
          .request({
            method: 'POST',
            url,
            auth: {
              username,
              password,
            },
            data: body,
            params: queryParams,
            headers,
          })
          .then(result => {
            Log.info(
              `${
                COLORS.FgGreen
              }${operationName} succeeded${ESCAPE}. Created ${resourceName}: ${
                COLORS.FgGreen
              }${
                result.data.response.importSummaries
                  ? result.data.response.importSummaries[0].href
                  : result.data.response?.reference
              }${ESCAPE}.\nSummary:\n${prettyJson(result.data)}`
            );
            if (callback) return callback(composeNextState(state, result.data));
            return composeNextState(state, result.data);
          });
      }
    });
  };
}
//#endregion

//#region EXPORTS
export { attribute } from './Utils';

exports.axios = axios;

export {
  field,
  fields,
  sourceValue,
  merge,
  each,
  dataPath,
  dataValue,
  lastReferenceValue,
  alterState,
} from 'language-common';
//#endregion
