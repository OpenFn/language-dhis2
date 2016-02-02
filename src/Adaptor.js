import { execute as commonExecute } from 'language-common';
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
  const body = eventData;

  return state => {
    const { username, password, api } = state.configuration.credentials;

    const url = resolveUrl(api + '/', 'api/events')

    return post({ username, password, body, url })
    .then((result) => {
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

