const { expect } = require('chai');
const { create, execute, get, update } = require('../src/Adaptor');
const crypto = require('crypto');
const { upsert } = require('../lib/Adaptor');

const getRandomOrganisationUnitPayload = user => {
  const name = crypto.randomBytes(16).toString('hex');
  const shortName = name.substring(0, 5);
  const displayName = name;
  const openingDate = new Date().toISOString();
  return { name, shortName, displayName, openingDate, users: [user] };
};

const getRandomProgramPayload = () => {
  const name = crypto.randomBytes(16).toString('hex');
  const shortName = name.substring(0, 5);
  const programType = 'WITHOUT_REGISTRATION';
  return { name, shortName, programType };
};

const getRandomProgramStagePayload = program => {
  const name = crypto.randomBytes(16).toString('hex');
  const displayName = name;
  return { name, displayName, program };
};

const globalState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.36.4',
  },
  program: 'IpHINAT79UW',
  organisationUnit: 'DiszpKrYNg8',
  dataSet: 'pBOMPrpg1QX',
  trackedEntityInstance: 'bmshzEacgxa',
  programStage: 'A03MvHHogjR',
  dataElement: 'Ix2HsbDMLea',
  enrollment: 'CmsHzercTBa',
};

describe('create', () => {
  it('should create an event program', async () => {
    const state = {
      ...globalState,
      data: { program: getRandomProgramPayload() },
    };

    const response = await execute(
      create('programs', state => state.data.program)
    )(state);
    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'Created',
      httpStatusCode: 201,
      status: 'OK',
    });
  });

  it('should create a single event', async () => {
    const state = {
      ...globalState,
      data: {
        program: 'eBAyeGv0exc',
        orgUnit: 'DiszpKrYNg8',
        status: 'COMPLETED',
      },
    };
    const response = await execute(create('events', state => state.data))(
      state
    );
    globalState.event = response.data.response.uid;
    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
    });
  });

  it('should create a single tracked entity instance', async () => {
    const state = {
      ...globalState,
      data: {
        orgUnit: globalState.organisationUnit,
        trackedEntityType: 'nEenWmSyUEp',
        attributes: [
          {
            attribute: 'w75KJ2mc4zz',
            value: 'Gigiwe',
          },
        ],
      },
    };
    const response = await execute(
      create('trackedEntityInstances', state => state.data)
    )(state);
    globalState.trackedEntityInstance =
      response.data.response.importSummaries[0].reference;
    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
    });
  });

  it('should create a single dataValueSet', async () => {
    const state = {
      ...globalState,
      data: {
        dataElement: 'f7n9E0hX8qk',
        period: '201401',
        orgUnit: globalState.organisationUnit,
        value: '12',
      },
    };

    const response = await execute(
      create('dataValueSets', state => state.data)
    )(state);
    expect({ status: response.data.status }).to.eql({ status: 'SUCCESS' });
  });

  it('should create a set of related data values sharing the same period and organisation unit', async () => {
    const state = {
      ...globalState,
      data: {
        dataSet: globalState.dataSet,
        completeDate: '2014-02-03',
        period: '201401',
        orgUnit: globalState.organisationUnit,
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
    };

    const response = await execute(
      create('dataValueSets', state => state.data)
    )(state);
    expect({ status: response.data.status }).to.eql({ status: 'SUCCESS' });
  });

  // it('should create a single enrollment of a trackedEntityInstance into a given program', async () => {
  //   const state = {
  //     ...globalState,
  //     data: {
  //       trackedEntityInstance: globalState.trackedEntityInstance,
  //       orgUnit: globalState.organisationUnit,
  //       program: globalState.program,
  //       enrollmentDate: new Date().toISOString().split('T')[0],
  //       incidentDate: new Date().toISOString().split('T')[0],
  //     },
  //   };

  //   const response = await execute(create('enrollments', state => state.data))(
  //     state
  //   );
  //   expect({ status: response.data.status }).to.eql({ status: 'SUCCESS' });
  // });
});

describe('update', () => {
  it('should update an event program', async () => {
    const state = {
      ...globalState,
      data: { program: getRandomProgramPayload() },
    };

    const response = await execute(
      update(
        'programs',
        state => state.program,
        state => state.data.program
      )
    )(state);
    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
    });
  });

  it('should update a single event', async () => {
    const state = {
      ...globalState,
      event: 'OZ3mVgaIAqw',
      data: {
        program: 'eBAyeGv0exc',
        orgUnit: 'DiszpKrYNg8',
        status: 'COMPLETED',
      },
    };
    const response = await execute(
      update(
        'events',
        state => state.event,
        state => state.data
      )
    )(state);
    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
    });
  });

  it('should update a single tracked entity instance', async () => {
    const state = {
      ...globalState,
      data: {
        orgUnit: globalState.organisationUnit,
        trackedEntityType: 'nEenWmSyUEp',
        attributes: [
          {
            attribute: 'w75KJ2mc4zz',
            value: 'Gigiwe',
          },
        ],
      },
    };

    const response = await execute(
      update(
        'trackedEntityInstances',
        state => state.trackedEntityInstance,
        state => state.data
      )
    )(state);

    expect({
      httpStatus: response.data.httpStatus,
      httpStatusCode: response.data.httpStatusCode,
      status: response.data.status,
    }).to.eql({
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
    });
  });

  it('should update a single dataValueSet', async () => {
    const state = {
      ...globalState,
      data: {
        dataElement: 'f7n9E0hX8qk',
        period: '201401',
        orgUnit: globalState.organisationUnit,
        value: '12',
      },
    };
    const response = await execute(
      update(
        'dataValueSets',
        state => state.dataSet,
        state => state.data
      )
    )(state);
    expect({ status: response.data.status }).to.eql({ status: 'SUCCESS' });
  });

  it('should update a set of related data values sharing the same period and organisation unit', async () => {
    const state = {
      ...globalState,
      data: {
        dataSet: globalState.dataSet,
        completeDate: '2014-02-03',
        period: '201401',
        orgUnit: globalState.organisationUnit,
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
    };

    const response = await execute(
      update(
        'dataValueSets',
        state => state.dataSet,
        state => state.data
      )
    )(state);
    expect({ status: response.data.status }).to.eql({ status: 'SUCCESS' });
  });
});

describe('get', () => {
  const state = {
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.4',
    },
    data: {},
  };

  it('should get trackedEntityInstances matching the URL parameters specified', async () => {
    const response = await execute(
      get('trackedEntityInstances', {
        params: {
          fields: '*',
          ou: 'DiszpKrYNg8',
          entityType: 'nEenWmSyUEp',
          trackedEntityInstance: 'dNpxRu1mWG5',
        },
      })
    )(state);
    expect(response.data.trackedEntityInstances.length).to.gte(1);
  });

  it('should get all programs in the organisation unit TSyzvBiovKh', async () => {
    const response = await execute(
      get('programs', {
        params: { orgUnit: 'TSyzvBiovKh', fields: '*' },
      })
    )(state);
    expect(response.data.programs.length).to.gte(1);
  });
});

describe('upsert', () => {
  const state = {
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.4',
    },
    data: {},
  };

  it('should upsert a trackedEntityInstance matching the URL parameters', async () => {
    const response = await execute(
      upsert(
        'trackedEntityInstances',
        {
          created: '2019-08-21T13:27:51.119',
          orgUnit: 'DiszpKrYNg8',
          createdAtClient: '2019-03-19T01:11:03.924',
          trackedEntityInstance: 'dNpxRu1mWG5',
          lastUpdated: '2019-09-27T00:02:11.604',
          trackedEntityType: 'We9I19a3vO1',
          lastUpdatedAtClient: '2019-03-19T01:11:03.924',
          coordinates:
            '[[[-11.8049,8.3374],[-11.8032,8.3436],[-11.8076,8.3441],[-11.8096,8.3387],[-11.8049,8.3374]]]',
          inactive: false,
          deleted: false,
          featureType: 'POLYGON',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-11.8049, 8.3374],
                [-11.8032, 8.3436],
                [-11.8076, 8.3441],
                [-11.8096, 8.3387],
                [-11.8049, 8.3374],
              ],
            ],
          },
          programOwners: [
            {
              ownerOrgUnit: 'DiszpKrYNg8',
              program: 'M3xtLkYBlKI',
              trackedEntityInstance: 'dNpxRu1mWG5',
            },
          ],
          enrollments: [],
          relationships: [
            {
              lastUpdated: '2019-08-21T00:00:00.000',
              created: '2019-08-21T00:00:00.000',
              relationshipName: 'Focus to Case',
              bidirectional: false,
              relationshipType: 'Mv8R4MPcNcX',
              relationship: 'EDfZpCLcEVN',
              from: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'dNpxRu1mWG5',
                  programOwners: [],
                },
              },
              to: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'Fbru4rg4dYV',
                  programOwners: [],
                },
              },
            },
            {
              lastUpdated: '2019-08-21T00:00:00.000',
              created: '2019-08-21T00:00:00.000',
              relationshipName: 'Focus to Case',
              bidirectional: false,
              relationshipType: 'Mv8R4MPcNcX',
              relationship: 'z4ItJx8ul3Z',
              from: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'dNpxRu1mWG5',
                  programOwners: [],
                },
              },
              to: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'RHA9RWNvAnC',
                  programOwners: [],
                },
              },
            },
            {
              lastUpdated: '2019-08-21T00:00:00.000',
              created: '2019-08-21T00:00:00.000',
              relationshipName: 'Focus to Case',
              bidirectional: false,
              relationshipType: 'Mv8R4MPcNcX',
              relationship: 'XIfv95ZiM4H',
              from: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'dNpxRu1mWG5',
                  programOwners: [],
                },
              },
              to: {
                trackedEntityInstance: {
                  trackedEntityInstance: 'jZRaFaYkAtE',
                  programOwners: [],
                },
              },
            },
          ],
          attributes: [],
        },
        {
          params: {
            fields: '*',
            ou: 'DiszpKrYNg8',
            entityType: 'nEenWmSyUEp',
            trackedEntityInstance: 'dNpxRu1mWG5',
          },
        }
      )
    )(state);
    expect(response.data.httpStatusCode).to.eq(200);
    expect(response.data.httpStatus).to.eq('OK');
  });
});
