import { expect } from 'chai';
import crypto from 'crypto';
import { execute, create } from '../lib/Adaptor';

describe('create', () => {
  const initialState = {
    data: {},
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.4',
    },
  };

  it('should create a new single program', () => {
    const state = { ...initialState };

    const name = crypto.randomBytes(16).toString('hex');
    const shortName = name.substring(0, 5);
    const programType = 'WITHOUT_REGISTRATION';

    return execute(create('programs', { name, shortName, programType }))(
      state
    ).then(state => {
      expect(state.data.httpStatusCode).to.eq(201);
      expect(state.data.status).to.eq('OK');
    });
  });

  it('should create a single event', () => {
    const state = {
      ...initialState,
      data: {
        orgUnit: 'DiszpKrYNg8',
      },
    };

    return execute(
      create('events', {
        program: 'eBAyeGv0exc',
        orgUnit: state.data.orgUnit,
        status: 'COMPLETED',
      })
    )(state).then(state => {
      expect(state.data.httpStatusCode).to.eq(200);
      expect(state.data.status).to.eq('OK');
      expect(state.data.response.imported).to.eq(1);
    });
  });

  it('should create multiple events', () => {
    const state = {
      ...initialState,
      data: {
        events: [
          {
            program: 'eBAyeGv0exc',
            orgUnit: 'DiszpKrYNg8',
            status: 'COMPLETED',
          },
          {
            program: 'eBAyeGv0exc',
            orgUnit: 'DiszpKrYNg8',
            status: 'COMPLETED',
          },
        ],
      },
    };

    const lenEvents = state.data.events.length;

    return execute(create('events', state => state.data.events))(state).then(
      state => {
        expect(state.data.httpStatusCode).to.eq(200);
        expect(state.data.status).to.eq('OK');
        expect(state.data.response.imported).to.eq(lenEvents);
      }
    );
  });

  it('should create a single trackedEntityInstance', () => {
    const state = {
      ...initialState,
      data: {
        trackedEntityInstance: {
          orgUnit: 'TSyzvBiovKh',
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            {
              attribute: 'w75KJ2mc4zz',
              value: 'Gigiwe',
            },
          ],
        },
      },
    };

    return execute(
      create(
        'trackedEntityInstances',
        state => state.data.trackedEntityInstance
      )
    )(state).then(state => {
      expect(state.data.httpStatusCode).to.eq(200);
      expect(state.data.status).to.eq('OK');
      expect(state.data.response.imported).to.eq(1);
    });
  });

  it('should create multiple trackedEntityInstances', () => {
    const state = {
      ...initialState,
      data: {
        trackedEntityInstances: [
          {
            orgUnit: 'TSyzvBiovKh',
            trackedEntityType: 'nEenWmSyUEp',
            attributes: [
              {
                attribute: 'w75KJ2mc4zz',
                value: 'Gigiwe',
              },
            ],
          },
          {
            orgUnit: 'TSyzvBiovKh',
            trackedEntityType: 'nEenWmSyUEp',
            attributes: [
              {
                attribute: 'w75KJ2mc4zz',
                value: 'Salla',
              },
            ],
          },
        ],
      },
    };

    const lenTrackedEntityInstances = state.data.trackedEntityInstances.length;

    return execute(
      create(
        'trackedEntityInstances',
        state => state.data.trackedEntityInstances
      )
    )(state).then(state => {
      expect(state.data.httpStatusCode).to.eq(200);
      expect(state.data.status).to.eq('OK');
      expect(state.data.response.imported).to.eq(lenTrackedEntityInstances);
    });
  });

  it('should create a single dataValueSet', () => {
    const state = {
      ...initialState,
      data: {
        dataValueSet: {
          dataElement: 'f7n9E0hX8qk',
          period: '201401',
          orgUnit: 'DiszpKrYNg8',
          value: '12',
        },
      },
    };

    return execute(create('dataValueSets', state => state.data.dataValueSet))(
      state
    ).then(state => {
      expect(state.data.status).to.eq('SUCCESS');
    });
  });

  it('should create multiple dataValueSets', () => {
    const state = {
      ...initialState,
      data: {
        dataValueSets: [
          {
            dataElement: 'f7n9E0hX8qk',
            period: '201401',
            orgUnit: 'DiszpKrYNg8',
            value: '12',
          },
          {
            dataElement: 'f7n9E0hX8qk',
            period: '201401',
            orgUnit: 'DiszpKrYNg8',
            value: '13',
          },
        ],
      },
    };

    return execute(create('dataValueSets', state => state.data.dataValueSets))(
      state
    ).then(state => {
      expect(state.data.status).to.eq('SUCCESS');
    });
  });

  it('should create multiple dataValueSets sharing the same period and organisation unit', () => {
    const state = {
      ...initialState,
      data: {
        dataValueSet: {
          dataSet: 'pBOMPrpg1QX',
          completeDate: '2014-02-03',
          period: '201401',
          orgUnit: 'DiszpKrYNg8',
          dataValues: [
            {
              dataElement: 'f7n9E0hX8qk',
              value: '1',
            },
            {
              dataElement: 'Ix2HsbDMLea',
              value: '2',
            },
            {
              dataElement: 'eY5ehpbEsB7',
              value: '3',
            },
          ],
        },
      },
    };

    return execute(create('dataValueSets', state => state.data.dataValueSet))(
      state
    ).then(state => {
      expect(state.data.status).to.eq('SUCCESS');
    });
  });
}).timeout(10000);
