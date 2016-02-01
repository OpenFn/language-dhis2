import { expect } from 'chai';
import request from 'superagent';
import superagentMock from 'superagent-mock';

import { post } from '../src/Client'
import ClientFixtures, { fixtures } from './ClientFixtures'


describe("Client", () => {

  let mockRequest;

  before(() => {
    mockRequest = superagentMock(request, ClientFixtures)
  })

  describe("post", () => {

    it("sends a payload to DHIS2", () => {
      let body = fixtures.event.requestBody;
      let username = 'admin';
      let password = 'district';
      let url = 'https://play.dhis2.org/demo/api/events';

      return post({ body, username, password, url }).then((result) => {
        expect(result.body).to.eql(fixtures.event.responseBody)
      })
    })

  })

  after(() => {
    mockRequest.unset()
  })

})


