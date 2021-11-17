/**
 * define mock servers in place they are used
 */

import { expect } from 'chai';
import crypto from 'crypto';
import { execute, create, update, nestArray } from '../lib/Adaptor';
import { buildUrl } from '../lib/Utils';
import nock from 'nock';

function clientReq(method, resourceType, state, body) {
  return execute(method(resourceType, body))(state).then(nextState => {
    const { data, references } = nextState;
    expect(data).to.eql({ httpStatus: 'OK', message: 'the response' });
    expect(references).to.eql([{ a: 1 }]);
  });
}

const testServer = nock('https://play.dhis2.org/2.36.4');

describe('execute', () => {
  it('executes each operation in sequence', done => {
    let state = {
      configuration: {
        hostUrl: 'https://play.dhis2.org/demo',
      },
    };
    let operations = [
      state => {
        return { counter: 1 };
      },
      state => {
        return { counter: 2 };
      },
      state => {
        return { counter: 3 };
      },
    ];

    execute(...operations)(state)
      .then(finalState => {
        expect(finalState).to.eql({ counter: 3 });
      })
      .then(done)
      .catch(done);
  });

  it('assigns references, data to the initialState', () => {
    let state = {
      configuration: {
        hostUrl: 'https://play.dhis2.org/demo',
      },
    };

    let finalState = execute()(state);

    execute()(state).then(finalState => {
      expect(finalState).to.eql({
        configuration: {
          hostUrl: 'https://play.dhis2.org/demo',
        },
        references: [],
        data: null,
      });
    });
  });
});

describe('CREATE', () => {
  before(done => {
    testServer
      .post('/api/events', {
        events: [
          {
            program: 'program',
            orgUnit: 'orgunit',
            status: 'COMPLETED',
            date: '02-02-20',
          },
          {
            program: 'program2',
            orgUnit: 'orgunit2',
            status: 'COMPLETED',
            date: '03-02-20',
          },
        ],
      })
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });
    done();
  });

  it('should make a POST to the right url', async () => {
    testServer.post('/api/events').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: {
        event: {
          program: 'program1',
          orgUnit: 'orgunit',
          status: 'COMPLETED',
          date: '02-02-20',
        },
      },
    };

    const response = await execute(
      create('events', state => {
        console.log('state in execute tests', state);
        return state.data.event;
      })
    )(state);
    expect(response.data).to.eql({ httpStatus: 'OK', message: 'the response' });
  });

  it('when an array is passed it gets nested inside that "entity" key', async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: {
        events: [
          {
            program: 'program',
            orgUnit: 'orgunit',
            status: 'COMPLETED',
            date: '02-02-20',
          },
          {
            program: 'program2',
            orgUnit: 'orgunit2',
            status: 'COMPLETED',
            date: '03-02-20',
          },
        ],
      },
    };

    const response = await execute(create('events', state.data.events))(state);
    expect(Object.keys(response.references[0])[0]).to.eql('events');
  });

  it("when an object is passed it doesn't get nested", async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: {
        event: {
          program: 'program',
          orgUnit: 'orgunit',
          status: 'COMPLETED',
          date: '02-02-20',
        },
      },
    };

    const response = await execute(create('events', state.data.event))(state);
    console.log('RESPONSE', response);
    expect(Array.isArray(response.references[0])).to.eq(false);
  });
});

describe.only('UPDATE', () => {
  it.only('should make a PUT to the right url', async () => {
    testServer
      .put('/api/events/qAZJCrNJK8H', {
        program: 'program',
        orgUnit: 'orgunit',
        status: 'COMPLETED',
        date: '02-02-20',
      })
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });

    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: {
        event: {
          program: 'program1',
          orgUnit: 'orgunit',
          status: 'COMPLETED',
          date: '02-02-20',
        },
      },
    };

    const response = await execute(
      update('events', 'qAZJCrNJK8H', state => {
        console.log('state in execute tests', state);
        return state.data.event;
      })
    )(state);
    expect(response.data).to.eql({ httpStatus: 'OK', message: 'the response' });
  });
});

describe('buildUrl', () => {
  it('the proper URL gets built from the "entity" string and the config', async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
        apiVersion: '2.36.4',
      },
    };

    const url = buildUrl(
      '/' + 'events',
      state.configuration.hostUrl,
      state.configuration.apiVersion
    );

    expect(url).to.eql('https://play.dhis2.org/2.36.4/api/2.36.4/events');

    // const url = buildUrl(
    //   '/' + 'events' + 'qAZJCrNJK8H',
    //   state.configuration.hostUrl,
    //   state.configuration.apiVersion
    // );

    // expect(url).to.eql('https://play.dhis2.org/2.36.4/api/2.36.4/events/qAZJCrNJK8H');
  });
});

describe('nestArray', () => {
  it('when an array is passed it gets nested inside that "entity" key', async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
        apiVersion: '2.36.4',
      },
      data: {
        events: [{}],
      },
    };

    const body = nestArray(state.data.events, 'events');

    expect(body).to.eql({ events: [{}] });
  });

  it("when an object is passed it doesn't get nested", async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: {
        event: {},
      },
    };

    const body = nestArray(state.data.event, 'events');

    expect(body).to.eql({});
  });
});
