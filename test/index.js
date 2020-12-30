import { expect } from 'chai';
import { getData } from '../src/Adaptor';
import { state } from './ClientFixtures';

describe('DHIS2 API', () => {
  /**
   * Test getData
   */
  describe('Get data using getData operation', function () {
    this.timeout(0);
    console.log('Logs...');
    it("should return one trackedEntityInstance with trackedInstanceInstance Id 'dNpxRu1mWG5' for a given orgUnit(CMqUILyVnBL)", done => {
      console.log('Logs...');
      let state = {
        configuration: {
          username: 'admin',
          password: 'district',
          hostUrl: 'https://play.dhis2.org/2.35.0',
          apiVersion: 35,
        },
      };
      return getData('trackedEntityInstances', [
        { fields: '*' },
        { ou: 'DiszpKrYNg8' },
        { entityType: 'nEenWmSyUEp' },
        { trackedEntityInstance: 'dNpxRu1mWG5' },
      ])(state).then(state => {
        console.log('state', state);
        expect(state.data.trackedEntityInstances.length).to.eq(1);
        expect(
          state.data.trackedEntityInstances[0].trackedInstanceInstance
        ).to.eq('dNpxRu1mWG5');
        done();
      });
    });
  });
  /** Test create */
  /** Test update */
  /** Test upsert */
});
