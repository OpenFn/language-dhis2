import { expect } from 'chai';

import Adaptor from '../lib';
const { execute, fetchEvents } = Adaptor;
const superagent = require('superagent');

function setupImposter() {
  const data = {
    port: 3000,
    protocol: 'http',
    stubs: [
      {
        predicates: [
          {
            equals: {
              method: 'GET',
              path: '/api/events.json',
              query: {
                orgUnit: 'DiszpKrYNg8',
                program: 'eBAyeGv0exc',
                endDate: '2016-01-01'
              }
            }
          }
        ],
        responses: [
          {
            is: {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                pager: { page: 1, pageCount: 1, total: 0, pageSize: 50 },
                events: []
              })
            }
          }
        ]
      }
    ]
  };

  return superagent
    .post('http://localhost:2525/imposters')
    .set('Content-Type', 'application/json')
    .send(data);
}

function teardownImposters() {
  return superagent
    .delete('http://localhost:2525/imposters')
}

describe('fetchEventsWithMountebank', function() {

  it('fetches events', function(done) {
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'localhost:3000',
      },
    };

    let params = {
      fields: {
        orgUnit: 'DiszpKrYNg8',
        program: 'eBAyeGv0exc',
        endDate: '2016-01-01',
      },
    };

    setupImposter().then(() => {
      execute(fetchEvents(params))(state).then((state) => {
        let lastReference = state.references[0];
        expect(lastReference.statusCode).to.eql(200);
        teardownImposters().then(() => done());
      });
    });
  });
  
});
