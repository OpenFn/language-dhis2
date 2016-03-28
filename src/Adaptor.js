import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';

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
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

/**
 * Create an event
 * @example
 * execute(
 *   event(data)
 * )(state)
 * @constructor
 * @param {object} eventData - Payload data for the event
 * @returns {Operation}
 */
export function event(eventData) {

  return state => {
    const body = expandReferences(eventData)(state);

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/events')

    console.log("Posting event:");
    console.log(body)

    return post({ username, password, body, url })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

// Send data values using the dataValueSets resource
export function dataValueSet(dataValueSetData) {

  return state => {
    const body = expandReferences(dataValueSetData)(state);

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/dataValueSets')

    console.log("Posting data value set:");
    console.log(body)

    return post({ username, password, body, url })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export function dataElement(key, value) {
  return { "dataElement": key, "value": value }
}

export {
  field, fields, sourceValue,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
