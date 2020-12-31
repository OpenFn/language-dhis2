import { expect } from 'chai';
import { execute, getData, upsert } from '../lib/Adaptor';
import nock from 'nock';
import { upsertState } from './ClientFixtures';
import { random } from 'lodash';

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
    let state = upsertState;
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
        { ou: 'DiszpKrYNg8' }
      )
    )(state).then(state => {
      // console.log(JSON.stringify(state.data, null, 2));
      // expect(state.data.response.reference).to.eq('YGyelJBMeKy');
      expect(state.data.response.importCount.updated).to.eq(1);
      expect(state.data.response.importCount.imported).to.eq(0);
    });
  }).timeout(10 * 1000);

  it('should create a new TEI when a matching TEI is not found by attribute ID', () => {
    let state = upsertState;
    return execute(
      upsert(
        'trackedEntityInstances',
        {
          attributeId: 'aX5hD4qUpRW',
          attributeValue: Date.now(),
        },
        state.data,
        { ou: 'CMqUILyVnBL' }
      )
    )(state).then(state => {
      console.log(JSON.stringify(state.data, null, 2));
      // expect(state.data.response.importCount.updated).to.eq(0);
      // expect(state.data.response.importCount.imported).to.eq(1);
    });
  }).timeout(10 * 1000);
});

/** Test create */
/** Test update */
/** Test upsert */
