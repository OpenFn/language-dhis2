import { execute as commonExecute } from 'language-common';

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
 * @returns {Promise}
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
