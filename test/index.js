import { expect } from 'chai';
import { execute, event } from '../src';

import request from 'superagent';
import superagentMock from 'superagent-mock';
import ClientFixtures, { fixtures } from './ClientFixtures'

describe("execute", () => {

  it("executes each operation in sequence", (done) => {
    let state = {}
    let operations = [
      (state) => { return {counter: 1} },
      (state) => { return {counter: 2} },
      (state) => { return {counter: 3} }
    ]

    execute(...operations)(state)
    .then((finalState) => {
      expect(finalState).to.eql({ counter: 3 })
    })
    .then(done).catch(done)


  })

  it("assigns references, data to the initialState", () => {
    let state = {}

    let finalState = execute()(state)

    execute()(state)
    .then((finalState) => {
      expect(finalState).to.eql({
        references: [],
        data: null
      })
    })
  
  })
})

describe("event", () => {
  let mockRequest

  before(() => {
    mockRequest = superagentMock(request, ClientFixtures)
  })

  it("posts to API and returns state", () => {
    let state = {
      configuration: {
        credentials: {
          username: "hello",
          password: "there",
          api: 'https://play.dhis2.org/demo'
        }
      }
    };

    return execute(
      event(fixtures.event.requestBody)
    )(state)
    .then((state) => {
      let lastReference = state.references[0]

      // Check that the eventData made it's way to the request as a string.
      expect(lastReference.params).
        to.eql(JSON.stringify(fixtures.event.requestBody))

      // Check that basic auth is being used.
      expect(lastReference.headers).
        to.eql({
          "Accept": "application/json",
          "Authorization": "Basic aGVsbG86dGhlcmU=",
          "Content-Type": "application/json",
        })
    })

  })

  after(() => {
    mockRequest.unset()
  })
  
})
