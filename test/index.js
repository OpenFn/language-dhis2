import { expect } from 'chai';
import { execute, getData } from '../lib/Adaptor';
import { state } from './ClientFixtures';

describe('Get data using getData operation', function () {
  it("should return one trackedEntityInstance with trackedInstanceInstance Id 'dNpxRu1mWG5' for a given orgUnit(CMqUILyVnBL)", function () {
    let state = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.35.0',
        apiVersion: 35,
      },
    };

    return execute(
      getData('trackedEntityInstances', [
        { fields: '*' },
        { ou: 'DiszpKrYNg8' },
        { entityType: 'nEenWmSyUEp' },
        { trackedEntityInstance: 'dNpxRu1mWG5' },
      ])
    )(state).then(state => {
      const instances = state.data.trackedEntityInstances;
      expect(instances.length).to.eq(1);
      expect(instances[0].trackedEntityInstance).to.eq('dNpxRu1mWG5');
    });
  }).timeout(10 * 1000);
});

/** Test create */
/** Test update */
/** Test upsert */
