import { expect } from 'chai';
import { execute, getData } from '../lib/Adaptor';
import { state } from './ClientFixtures';

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

// describe('Get data using getData operation', function () {
//   it("should return one trackedEntityInstance with trackedInstanceInstance Id 'dNpxRu1mWG5' for a given orgUnit(CMqUILyVnBL)", function () {
//     let state = {
//       configuration: {
//         username: 'admin',
//         password: 'district',
//         hostUrl: 'https://play.dhis2.org/2.35.0',
//         apiVersion: 35,
//       },
//     };

//     return execute(
//       getData('trackedEntityInstances', [
//         { fields: '*' },
//         { ou: 'DiszpKrYNg8' },
//         { entityType: 'nEenWmSyUEp' },
//         { trackedEntityInstance: 'dNpxRu1mWG5' },
//       ])
//     )(state).then(state => {
//       const instances = state.data.trackedEntityInstances;
//       expect(instances.length).to.eq(1);
//       expect(instances[0].trackedEntityInstance).to.eq('dNpxRu1mWG5');
//     });
//   }).timeout(10 * 1000);
// });

/** Test create */
/** Test update */
/** Test upsert */
