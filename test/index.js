import { expect } from 'chai';
import { execute, create, update } from '../lib/Adaptor';
import { dataValue } from '@openfn/language-common';
import { buildUrl, buildUrlParams, nestArray } from '../lib/Utils';
import nock from 'nock';

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
  const state = {
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.4',
    },
    data: {
      program: 'program1',
      orgUnit: 'org50',
      status: 'COMPLETED',
      date: '02-02-20',
    },
  };

  it('should make an authenticated POST to the right url', async () => {
    testServer
      .post('/api/events', {
        program: 'program1',
        orgUnit: 'org50',
        status: 'COMPLETED',
        date: '02-02-20',
      })
      .times(2)
      .matchHeader('authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=')
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });

    const response = await execute(create('events', state.data))(state);

    expect(response.data).to.eql({ httpStatus: 'OK', message: 'the response' });
  });

  it('should recursively expand references', async () => {
    testServer
      .post('/api/events', {
        program: 'abc',
        orgUnit: 'org50',
      })
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });

    const response = await execute(
      create('events', { program: 'abc', orgUnit: state => state.data.orgUnit })
    )(state);
    expect(response.data).to.eql({ httpStatus: 'OK', message: 'the response' });
  });
});

describe('UPDATE', () => {
  const state = {
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.4',
    },
    data: {
      program: 'program',
      orgUnit: 'orgunit',
      status: 'COMPLETED',
      currentDate: '02-02-20',
    },
  };

  it('should make an authenticated PUT to the right url', async () => {
    testServer
      .put('/api/events/qAZJCrNJK8H')
      .matchHeader('authorization', 'Basic YWRtaW46ZGlzdHJpY3Q=')
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });

    const response = await execute(
      update('events', 'qAZJCrNJK8H', state => ({
        ...state.data,
        date: state.data.currentDate,
      }))
    )(state);
    expect(response.data).to.eql({ httpStatus: 'OK', message: 'the response' });
  });

  it('should recursively expand refs', async () => {
    testServer
      .put('/api/events/qAZJCrNJK8H', {
        program: 'program',
        orgUnit: 'hardcoded',
        date: '02-02-20',
      })
      .reply(200, {
        httpStatus: 'OK',
        message: 'the response',
      });

    const response = await execute(
      update('events', 'qAZJCrNJK8H', {
        program: dataValue('program'),
        orgUnit: 'hardcoded',
        date: state => state.data.currentDate,
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
        hostUrl: 'https://dhis2.moh.gov',
        apiVersion: '2.36.4',
      },
    };

    const url = buildUrl(
      '/' + 'events',
      state.configuration.hostUrl,
      state.configuration.apiVersion
    );

    expect(url).to.eql('https://dhis2.moh.gov/api/2.36.4/events');
  });
});

describe('generateURL', () => {
  it('should generate a URL properly given ________________'),
    () => {
      expect(1).to.eql(2);
    };
});

describe.only('buildURLParams', () => {
  it.only('should handle special filter and dimensions params and build the rest per usual', () => {
    const params = {
      dryRun: true,
      filters: ['sex:eq:male', 'origin:eq:senegal'],
      someNonesense: 'other',
      dimensions: ['dx:fbfJHSPpUQD', 'ou:O6uvpzGd5pu;lc3eMKXaEfw'],
    };

    const finalParams = buildUrlParams(params).toString();

    const expected =
      'dryRun=true&someNonesense=other&filter=sex%3Aeq%3Amale&filter=origin%3Aeq%3Asenegal&dimension=dx%3AfbfJHSPpUQD&dimension=ou%3AO6uvpzGd5pu%3Blc3eMKXaEfw';

    expect(finalParams).to.eql(expected);
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
      data: [{ a: 1 }],
    };

    const body = nestArray(state.data, 'events');

    expect(body).to.eql({ events: [{ a: 1 }] });
  });

  it("when an object is passed it doesn't get nested", async () => {
    const state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.4',
      },
      data: { b: 2 },
    };

    const body = nestArray(state.data, 'events');

    expect(body).to.eql({ b: 2 });
  });
});
