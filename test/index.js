import { expect } from 'chai';
import { dataValue } from 'language-common';
import {
  execute,
  getData,
  upsert,
  upsertTEI,
  create,
  attribute,
  update,
  patch,
  del,
} from '../lib/Adaptor';
import nock from 'nock';
import {
  upsertNewState,
  upsertExistingState,
  upsertExistingTEIState,
  upsertNewTEIState,
  createState,
  updateState,
  patchState,
  delState,
} from './ClientFixtures';

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

describe('buildUrl for getData', () => {
  before(() => {
    nock('https://play.dhis2.org/2.35.0/')
      .get(uri => uri.includes('api/34'))
      .reply(200, {
        trackedEntityInstances: ['from v34'],
      });

    nock('https://play.dhis2.org/2.35.0/')
      .get(uri => uri.includes('api/999'))
      .reply(200, {
        trackedEntityInstances: ['from v999'],
      });
  });

  it('should respect api version when passed through configuration', () => {
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.35.0',
        apiVersion: 34,
      },
    };

    return execute(getData('trackedEntityInstances', {}))(state).then(state => {
      expect(state.data.trackedEntityInstances[0]).to.eq('from v34');
    });
  }).timeout(10 * 1000);

  it('should respect the api version when passed through the options argument', () => {
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.35.0',
      },
    };

    return execute(getData('trackedEntityInstances', {}, { apiVersion: 999 }))(
      state
    ).then(state => {
      expect(state.data.trackedEntityInstances[0]).to.eq('from v999');
    });
  }).timeout(10 * 1000);
});

describe('getData', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should return one trackedEntityInstance with trackedInstanceInstance Id 'dNpxRu1mWG5' for a given orgUnit(CMqUILyVnBL)", () => {
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.35.0',
      },
    };

    return execute(
      getData('trackedEntityInstances', {
        fields: '*',
        ou: 'DiszpKrYNg8',
        entityType: 'nEenWmSyUEp',
        trackedEntityInstance: 'dNpxRu1mWG5',
      })
    )(state).then(state => {
      const instances = state.data.trackedEntityInstances;
      expect(instances.length).to.eq(1);
      expect(instances[0].trackedEntityInstance).to.eq('dNpxRu1mWG5');
    });
  }).timeout(10 * 1000);
});

describe('upsert', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should update an existing TEI when a matching TEI is found by attribute ID', () => {
    let state = upsertExistingState;

    return execute(
      upsert(
        'trackedEntityInstances',
        {
          attributeId: 'lZGmxYbs97q',
          attributeValue: state =>
            state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
              .value,
        },
        state.data,
        { ou: 'TSyzvBiovKh' }
      )
    )(state).then(state => {
      expect(state.data.response.importCount.imported).to.eq(0);
      expect(state.data.response.importCount.updated).to.eq(1);
      expect(state.data.response.importCount.deleted).to.eq(0);
      expect(state.data.response.importCount.ignored).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should create a new TEI when a matching TEI is not found by attribute ID', () => {
    let state = upsertNewState;

    return execute(
      upsert(
        'trackedEntityInstances',
        {
          attributeId: 'lZGmxYbs97q',
          attributeValue: state =>
            state.data.attributes.find(obj => obj.attribute === 'lZGmxYbs97q')
              .value,
        },
        state.data,
        { ou: 'TSyzvBiovKh' }
      )
    )(state).then(state => {
      expect(state.data.response.imported).to.eq(1);
      expect(state.data.response.updated).to.eq(0);
      expect(state.data.response.deleted).to.eq(0);
      expect(state.data.response.ignored).to.eq(0);
    });
  }).timeout(10 * 1000);
});

describe('upsertTEI', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should update an existing TEI when a matching TEI is found by attribute ID', () => {
    let state = upsertExistingTEIState;

    return execute(upsertTEI('lZGmxYbs97q', state.data))(state).then(state => {
      expect(state.data.response.importCount.imported).to.eq(0);
      expect(state.data.response.importCount.updated).to.eq(1);
      expect(state.data.response.importCount.deleted).to.eq(0);
      expect(state.data.response.importCount.ignored).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should create a new TEI when a matching TEI is not found by attribute ID', () => {
    let state = upsertNewTEIState;

    return execute(upsertTEI('lZGmxYbs97q', state.data))(state).then(state => {
      expect(state.data.response.imported).to.eq(1);
      expect(state.data.response.updated).to.eq(0);
      expect(state.data.response.deleted).to.eq(0);
      expect(state.data.response.ignored).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should allow the user to build a TEI object from a generic state', () => {
    let state = {
      ...upsertNewTEIState,
      data: {
        form: {
          name: 'Taylor',
          uniqueId: '1135353',
          organization: 'TSyzvBiovKh',
          programsJoined: ['fDd25txQckK'],
        },
      },
    };

    return execute(
      upsertTEI('lZGmxYbs97q', {
        orgUnit: state.data.form.organization,
        trackedEntityType: 'nEenWmSyUEp',
        attributes: [
          {
            attribute: 'w75KJ2mc4zz',
            value: state.data.form.name,
          },
          {
            attribute: 'lZGmxYbs97q',
            value: state.data.form.uniqueId,
          },
        ],
        enrollments: state =>
          state.data.form.programsJoined.map(item => ({
            orgUnit: state.data.form.organization,
            program: item,
            programState: 'lST1OZ5BDJ2',
            enrollmentDate: '2021-01-05',
            incidentDate: '2021-01-05',
          })),
      })
    )(state).then(state => {
      expect(state.data.response.status).to.eq('SUCCESS');
      expect(state.data.httpStatusCode).to.eq(200);
      expect(
        state.data.response.deleted ?? state.data.response.importCount.deleted
      ).to.eq(0);
      expect(
        state.data.response.ignored ?? state.data.response.importCount.ignored
      ).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should allow the user to use `attribute` and `dataValue` helper functions', () => {
    let state = {
      ...upsertNewTEIState,
      data: {
        form: {
          name: 'Taylor',
          uniqueId: '1135354',
          organization: 'TSyzvBiovKh',
          programsJoined: ['fDd25txQckK'],
        },
      },
    };

    return execute(
      upsertTEI('lZGmxYbs97q', {
        orgUnit: dataValue('form.organization'),
        trackedEntityType: 'nEenWmSyUEp',
        attributes: [
          attribute('w75KJ2mc4zz', dataValue('form.name')),
          attribute('lZGmxYbs97q', dataValue('form.uniqueId')),
        ],
        enrollments: state =>
          state.data.form.programsJoined.map(item => ({
            orgUnit: dataValue('form.organization'),
            program: item,
            programState: 'lST1OZ5BDJ2',
            enrollmentDate: '2021-01-05',
            incidentDate: '2021-01-05',
          })),
      })
    )(state).then(state => {
      expect(state.data.response.status).to.eq('SUCCESS');
      expect(state.data.httpStatusCode).to.eq(200);
      expect(
        state.data.response.deleted ?? state.data.response.importCount.deleted
      ).to.eq(0);
      expect(
        state.data.response.ignored ?? state.data.response.importCount.ignored
      ).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should allow the user to use `arrow function` to access data', () => {
    let state = {
      ...upsertNewTEIState,
      data: {
        form: {
          name: 'Taylor',
          uniqueId: '1135354',
          organization: 'TSyzvBiovKh',
          programsJoined: ['fDd25txQckK'],
        },
      },
    };

    return execute(
      upsertTEI('lZGmxYbs97q', {
        orgUnit: state => state.data.form.organization,
        trackedEntityType: 'nEenWmSyUEp',
        attributes: [
          attribute('w75KJ2mc4zz', state => state.data.form.name),
          attribute('lZGmxYbs97q', state => state.data.form.uniqueId),
        ],
        enrollments: state =>
          state.data.form.programsJoined.map(item => ({
            orgUnit: state.data.form.organization,
            program: item,
            programState: 'lST1OZ5BDJ2',
            enrollmentDate: '2021-01-05',
            incidentDate: '2021-01-05',
          })),
      })
    )(state).then(state => {
      expect(state.data.response.status).to.eq('SUCCESS');
      expect(state.data.httpStatusCode).to.eq(200);
      expect(
        state.data.response.deleted ?? state.data.response.importCount.deleted
      ).to.eq(0);
      expect(
        state.data.response.ignored ?? state.data.response.importCount.ignored
      ).to.eq(0);
    });
  }).timeout(10 * 1000);
});

describe('create', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a new single event and link it to a given program', () => {
    let state = createState;
    return execute(create('events', state.data))(state).then(state => {
      expect(state.data.response.imported).to.eq(1);
      expect(state.data.response.updated).to.eq(0);
      expect(state.data.response.deleted).to.eq(0);
      expect(state.data.response.ignored).to.eq(0);
    });
  }).timeout(10 * 1000);
});

describe('update', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should update a data element', () => {
    let state = updateState;
    return execute(update('dataElements', 'FTRrcoaog83', state.data))(
      state
    ).then(state => {
      expect(state.data.httpStatusCode).to.eq(200);
      expect(state.data.response.uid).to.eq('FTRrcoaog83');
    });
  }).timeout(10 * 1000);
});

describe('patch', () => {
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should do a partial update(patch) of a data element', () => {
    let state = patchState;
    return execute(patch('dataElements', 'FTRrcoaog83', state.data))(
      state
    ).then(state => {
      // @todo further assertions as we learn more about PATCH
      // expect(state.data.response.uid).to.eq('FTRrcoaog83');
    });
  }).timeout(10 * 1000);
});

describe('delete', () => {
  let id = '';
  before(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a new tracked entity instance', () => {
    let state = delState;
    return execute(create('trackedEntityInstances', state.data))(state).then(
      state => {
        id = state.data.response.importSummaries[0].reference;
        expect(state.data.response.imported).to.eq(1);
        expect(state.data.response.updated).to.eq(0);
        expect(state.data.response.deleted).to.eq(0);
        expect(state.data.response.ignored).to.eq(0);
      }
    );
  }).timeout(10 * 1000);

  it('should delete the newly created tracked entity instance', () => {
    let state = delState;
    return execute(del('trackedEntityInstances', id))(state).then(state => {
      expect(state.data.response.importCount.imported).to.eq(0);
      expect(state.data.response.importCount.updated).to.eq(0);
      expect(state.data.response.importCount.ignored).to.eq(0);
      expect(state.data.response.importCount.deleted).to.eq(1);
    });
  }).timeout(10 * 1000);
});
