/** @module Adaptor */
import axios from 'axios';
import { execute as commonExecute, expandReferences } from 'language-common';
import { get, post, put } from './Client';
import { resolve as resolveUrl } from 'url';
import { mapValues } from 'lodash/fp';

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
 * Migrates "apiUrl" to "hostUrl" if "hostUrl" is blank.
 * For OpenFn.org users with the old-style configuration.
 * @example
 * configMigrationHelper(state)
 * @constructor
 * @param {object} state - the runtime state
 * @returns {object}
 */
function configMigrationHelper(state) {
  const { hostUrl, apiUrl } = state.configuration;
  if (!hostUrl) {
    console.log(
      'DEPRECATION WARNING: Please migrate instance address from `apiUrl` to `hostUrl`.'
    );
    state.configuration.hostUrl = apiUrl;
    return state;
  }
  return state;
}

/**
 * Fetch a dataValueSet
 * @public
 * @example
 * fetchData({
 *   fields: {
 *     dataSet: 'pBOMPrpg1QX',
 *     orgUnit: 'DiszpKrYNg8',
 *     period: '201401'
 *   }},
 *   postUrl: "yourposturl"
 * )
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */
export function fetchData(params, postUrl) {
  return state => {
    const data = expandReferences(params)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/dataValueSets.json?');
    const query = data.fields || expandDataValues(params)(state);

    console.log('Getting Data Value Sets:');

    return get({ username, password, query, url })
      .then(result => {
        console.log('Get Result:', result.body);
        return result;
      })
      .then(result => {
        if (postUrl) {
          const body = result.body;
          const url = postUrl;

          return post({ username, password, body, url }).then(result => {
            console.log('Post Result:', result.statusCode);
            return {
              ...state,
              references: [result, ...state.references],
            };
          });
        } else {
          return {
            ...state,
            references: [result, ...state.references],
          };
        }
      });
  };
}

/**
 * Fetch an event
 * @public
 * @example
 * fetchEvents({
 *   fields: {
 *     orgUnit: 'DiszpKrYNg8',
 *     period: '201401'
 *   }},
 *   postUrl: "yourposturl"
 * )
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */
export function fetchEvents(params, postUrl) {
  return state => {
    const data = expandReferences(params)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/events.json?');
    const query = data.fields || expandDataValues(params)(state);

    console.log('Getting Events Data:');

    return get({ username, password, query, url })
      .then(result => {
        console.log('Get Result:', result.body);
        return result;
      })
      .then(result => {
        if (postUrl) {
          const body = result.body;
          const url = postUrl;

          return post({ username, password, body, url }).then(result => {
            console.log('Post Result:', result.statusCode);
            return {
              ...state,
              references: [result, ...state.references],
            };
          });
        } else {
          return {
            ...state,
            references: [result, ...state.references],
          };
        }
      });
  };
}

/**
 * Create an event
 * @public
 * @example
 * event(eventData)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */
export function event(eventData) {
  return state => {
    const body = expandReferences(eventData)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/events');

    console.log(`Posting event to org unit '${body.orgUnit}'.`);

    return post({
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return { ...state, references: [result, ...state.references] };
    });
  };
}

function expandDataValues(obj) {
  return state => {
    return mapValues(function (value) {
      if (typeof value == 'object') {
        return value.map(item => {
          return expandDataValues(item)(state);
        });
      } else {
        return typeof value == 'function' ? value(state) : value;
      }
    })(obj);
  };
}

/**
 * Send data values using the dataValueSets resource
 * @public
 * @example
 *  dataValueSet({
 *    dataSet: dataValue("set"),
 *    orgUnit: "DiszpKrYNg8",
 *    period: "201402",
 *    completeData: "2014-03-03",
 *    dataValues: [
 *      dataElement("f7n9E0hX8qk", dataValue("name")),
 *      dataElement("Ix2HsbDMLea", dataValue("age")),
 *      dataElement("eY5ehpbEsB7", 30)
 *    ]
 * });
 * @constructor
 * @param {object} data - Payload data for the data value set
 * @returns {Operation}
 */
export function dataValueSet(data) {
  return state => {
    const body = expandDataValues(data)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/dataValueSets');

    console.log(
      `Posting data value set ${body.dataSet} to org unit '${
        body.orgUnit
      }' with ${body.dataValues && body.dataValues.length} data values.`
    );

    return post({
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return { ...state, references: [result, ...state.references] };
    });
  };
}

/**
 * Create a "dataElement" pairing for DHIS2.
 * @public
 * @example
 * dataElement(key, value)
 * @constructor
 * @param {string} dataElement - Payload data for the Data Element key
 * @param {variable} value - Payload data for the Data Element value
 * @param {string} comment - comment for the Data Element
 * @returns {Operation}
 */
export function dataElement(dataElement, value, comment) {
  return { dataElement, value, comment };
}

/**
 * Create one or many new Tracked Entity Instances
 * @public
 * @example
 * createTEI(data)
 * @constructor
 * @param {object} data - Payload data for new tracked entity instance(s)
 * @returns {Operation}
 */
export function createTEI(data) {
  return state => {
    const body = expandReferences(data)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/trackedEntityInstances');

    console.log(
      `Posting tracked entity instance of type '${
        body.trackedEntityType
      }' to org unit '${body.orgUnit}' with ${
        body.attributes && body.attributes.length
      } attributes and ${
        body.enrollments && body.enrollments.length
      } enrollments.`
    );

    return post({
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return { ...state, references: [result, ...state.references] };
    });
  };
}

/**
 * Update existing Tracked Entity Instances
 * @public
 * @example
 * updateTEI(tei, data)
 * @constructor
 * @param {object} tei - identifier for the TEI to be updated
 * @param {object} data - Payload data for updating a TEI
 * @returns {Operation}
 */
export function updateTEI(tei, data) {
  return state => {
    const body = expandReferences(data)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = hostUrl.concat(`/api/trackedEntityInstances/${tei}`);

    console.log(
      `Updating tracked entity instance of type '${
        body.trackedEntityType
      }' to org unit '${body.orgUnit}' with ${
        body.attributes && body.attributes.length
      } attributes and ${
        body.enrollments && body.enrollments.length
      } enrollments.`
    );

    return put({
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return { ...state, references: [result, ...state.references] };
    });
  };
}

/**
 * Create or update one or many new Tracked Entity Instances
 * @public
 * @example
 * upsertTEI(data)
 * @constructor
 * @param {object} data - Payload data for new/updated tracked entity instance(s)
 * @returns {Operation}
 */
/*export function upsertTEI(uuid, data) {
  return state => {
    const body = expandReferences(data)(state);
    const { username, password, hostUrl } = state.configuration;

    const url = resolveUrl(hostUrl + '/', `api/trackedEntityInstances`);

    console.log(
      `Upserting tracked entity instance of type '${
        body.trackedEntityType
      }' to org unit '${body.orgUnit}' with ${
        body.attributes && body.attributes.length
      } attributes and ${
        body.enrollments && body.enrollments.length
      } enrollments.`
    );

    return post({
      query: {
        strategy: 'CREATE_AND_UPDATE',
        trackedEntityIdScheme: uuid,
      },
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log(JSON.parse(result.text));
      return { ...state, references: [result, ...state.references] };
    });
  };
}
*/
export function upsertTEI(payload) {
  return async state => {
    try {
      const { query, tei, data } = payload;
      const { password, username, hostUrl } = state.configuration;
      const url = resolveUrl(hostUrl + '/', `api/trackedEntityInstances`);

      console.log(
        `Searching for Tracked Entity Instance ${tei}, with query : ${JSON.stringify(
          query,
          null,
          2
        )}...`
      );

      const existingTEI = await get({ username, password, query, url });

      if (existingTEI) {
        console.log(
          `Tracked Entity Instance ${JSON.stringify(
            existingTEI,
            null,
            2
          )} found! Proceeding to PUT...`
        );
        try {
          const putUrl = `${url}/${tei}`;
          const putResponse = await put({
            username,
            password,
            data,
            putUrl,
            query,
          });
          console.log(
            `PUT succeeded with response : ${JSON.stringify(
              putResponse,
              null,
              2
            )}`
          );
          return { ...state, references: [putResponse, ...state.references] };
        } catch (error) {
          console.log(`Updating Tracked Entity Instance ${tei} failed!`);
          throw error;
        }
      } else {
        console.log(
          `Tracked Entity Instance ${tei} not found! Proceeding to POST...`
        );
        try {
          const postUrl = url;
          const postResponse = await post({
            username,
            password,
            data,
            postUrl,
            query: null,
          });
          console.log(
            `POST succeeded with response : ${JSON.stringify(
              postResponse,
              null,
              2
            )}`
          );
          return { ...state, references: [postResponse, ...state.references] };
        } catch (error) {
          console.log(`Posting Tracked Entity Instance ${tei} failed!`);
          throw error;
        }
      }
    } catch (error) {
      console.log(`Fetching existing Tracked Entity Instance failed!`);
      throw error;
    }
  };
}

// /**
//  * Create and enroll TrackedEntityInstances
//  * @example
//  * execute(
//  *   createEnrollTEI(te, orgUnit, attributes, enrollments)
//  * )(state)
//  * @constructor
//  * @param {object} enrollmentData - Payload data for new enrollment
//  * @returns {Operation}
//  */
// export function upsertEnroll(upsertData) {
//
//   return state => {
//     const body = expandReferences(trackedEntityInstanceData)(state);
//     const { username, password, hostUrl } = state.configuration;
//     const url = resolveUrl(hostUrl + '/', 'api/trackedEntityInstances')
//
//     return post({ username, password, body, url })
//     .then((result) => {
//       console.log("Result:", JSON.stringify(result.body, null, 2));
//       return { ...state, references: [ result, ...state.references ] }
//     })
//
//   }
// }

/**
 * Enroll a tracked entity instance in a program
 * @public
 * @example
 * enroll(tei, enrollmentData)
 * @constructor
 * @param {object} tei
 * @param {object} enrollmentData - Payload data for new enrollment
 * @returns {Operation}
 */
export function enroll(tei, enrollmentData) {
  return state => {
    const body = expandReferences(enrollmentData)(state);
    body['trackedEntityInstance'] = tei;
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/enrollments');

    console.log('Enrolling tracked entity instance.');

    return post({
      username,
      password,
      body,
      url,
    }).then(result => {
      console.log('Result:', JSON.stringify(result.body, null, 2));
      return { ...state, references: [result, ...state.references] };
    });
  };
}

/**
 * Fetch analytics
 * @public
 * @example
 * fetchAnalytics({
 *   query: {
 *     dimension: ["dx:CYI5LEmm3cG", "pe:LAST_6_MONTHS"],
 *     filter: "ou:t7vi7vJqWvi",
 *     displayProperty: "NAME",
 *     outputIdScheme: "UID"
 *   }},
 *   postUrl: "yourposturl"
 * )
 * @constructor
 * @param {object} params - data to query for events
 * @param {String} postUrl - (optional) URL to post the result
 * @returns {Operation}
 */
export function fetchAnalytics(params, postUrl) {
  return state => {
    const data = expandReferences(params)(state);
    const { username, password, hostUrl } = state.configuration;
    const url = resolveUrl(hostUrl + '/', 'api/26/analytics.json?');
    const query = data.query || expandDataValues(params)(state);

    console.log(`Getting analytics data for query: ${query}`);

    return get({ username, password, query, url })
      .then(result => {
        console.log('Get Result:', result.body);
        return result;
      })
      .then(result => {
        if (postUrl) {
          const body = result.body;
          const url = postUrl;

          return post({ username, password, body, url }).then(result => {
            console.log('Post Result:', result.statusCode);
            return {
              ...state,
              references: [result, ...state.references],
            };
          });
        } else {
          return {
            ...state,
            references: [result, ...state.references],
          };
        }
      });
  };
}

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
