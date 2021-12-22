const { expect } = require('chai');
const { create, execute, get, update } = require('../src/Adaptor');
const crypto = require('crypto');
const { upsert } = require('../lib/Adaptor');

// const getRandomOrganisationUnitPayload = user => {
//   const name = crypto.randomBytes(16).toString('hex');
//   const shortName = name.substring(0, 5);
//   const displayName = name;
//   const openingDate = new Date().toISOString();
//   return { name, shortName, displayName, openingDate, users: [user] };
// };

// const getRandomProgramStagePayload = program => {
//   const name = crypto.randomBytes(16).toString('hex');
//   const displayName = name;
//   return { name, displayName, program };
// };

const getRandomProgramPayload = () => {
  const name = crypto.randomBytes(16).toString('hex');
  const shortName = name.substring(0, 5);
  const programType = 'WITHOUT_REGISTRATION';
  return { name, shortName, programType };
};

describe('Integration tests', () => {
  const fixture = {};

  before(done => {
    fixture.initialState = {
      configuration: {
        username: 'admin',
        password: 'district',
        hostUrl: 'https://play.dhis2.org/2.36.6',
      },
    };
    done();
  });

  describe('create', () => {
    it('should create an event program', async () => {
      const state = {
        ...fixture.initialState,
        data: { program: getRandomProgramPayload() },
      };

      const finalState = await execute(
        create('programs', state => state.data.program)
      )(state);

      expect(finalState.data.status).to.eq('OK');
    });

    it('should create a single event', async () => {
      const state = {
        ...fixture.initialState,
        data: {
          program: 'eBAyeGv0exc',
          orgUnit: 'DiszpKrYNg8',
          status: 'COMPLETED',
        },
      };

      const finalState = await execute(create('events', state => state.data))(
        state
      );

      console.log('FINAL STATE', finalState);

      expect(finalState.data.status).to.eq('OK');
    });

    it('should create a single tracked entity instance', async () => {
      const state = {
        ...fixture.initialState,
        data: {
          orgUnit: 'DiszpKrYNg8',
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            {
              attribute: 'w75KJ2mc4zz',
              value: 'Gigiwe',
            },
          ],
        },
      };

      const finalState = await execute(
        create('trackedEntityInstances', state => state.data)
      )(state);

      expect(finalState.data.status).to.eq('OK');
    });

    it('should create a single dataValueSet', async () => {
      const state = {
        ...fixture.initialState,
        data: {
          dataElement: 'f7n9E0hX8qk',
          period: '201401',
          orgUnit: 'DiszpKrYNg8',
          value: '12',
        },
      };

      const finalState = await execute(
        create('dataValueSets', state => state.data)
      )(state);

      expect(finalState.data.status).to.eq('SUCCESS');
    });

    it('should create a set of related data values sharing the same period and organisation unit', async () => {
      const state = {
        ...fixture.initialState,
        data: {
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
      };

      const finalState = await execute(
        create('dataValueSets', state => state.data)
      )(state);

      expect(finalState.data.status).to.eq('SUCCESS');
    });
  });

  describe('update', () => {
    it('should update an event program', async () => {
      const state = {
        ...fixture.initialState,
        program: 'eBAyeGv0exc',
        data: { program: getRandomProgramPayload() },
      };

      const response = await execute(
        update(
          'programs',
          state => state.program,
          state => state.data.program
        )
      )(state);
      expect(response.data.status).to.eq('OK');
    });

    it('should update a single event', async () => {
      const state = {
        ...fixture.initialState,
        event: 'OZ3mVgaIAqw',
        data: {
          program: 'eBAyeGv0exc',
          orgUnit: 'DiszpKrYNg8',
          status: 'COMPLETED',
        },
      };
      const finalState = await execute(
        update(
          'events',
          state => state.event,
          state => state.data
        )
      )(state);
      expect(finalState.data.status).to.eql('OK');
    });

    it('should update a single tracked entity instance', async () => {
      const state = {
        ...fixture.initialState,
        data: {
          orgUnit: 'DiszpKrYNg8',
          trackedEntityType: 'nEenWmSyUEp',
          attributes: [
            {
              attribute: 'w75KJ2mc4zz',
              value: 'Gigiwe',
            },
          ],
        },
      };

      const finalState = await execute(
        update('trackedEntityInstances', 'bmshzEacgxa', state => state.data)
      )(state);

      expect(finalState.data.status).to.eq('OK');
    });

    it('should update a single dataValueSet', async () => {
      const state = {
        ...fixture.initialState,
        data: {
          dataElement: 'f7n9E0hX8qk',
          period: '201401',
          orgUnit: 'DiszpKrYNg8',
          value: '12',
        },
      };
      const finalState = await execute(
        update('dataValueSets', 'pBOMPrpg1QX', state => state.data)
      )(state);
      expect(finalState.data.status).to.eql('SUCCESS');
    });

    it('should update a set of related data values sharing the same period and organisation unit', async () => {
      const state = {
        ...fixture.initialState,
        data: {
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
      };

      const finalState = await execute(
        update('dataValueSets', 'pBOMPrpg1QX', state => state.data)
      )(state);
      expect(finalState.data.status).to.eq('SUCCESS');
    });
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

  it('should get dataValueSets matching the query specified', async () => {
    const finalState = await execute(
      get('dataValueSets', {
        dataSet: 'pBOMPrpg1QX',
        orgUnit: 'DiszpKrYNg8',
        period: '201401',
        fields: '*',
      })
    )(state);

    expect(finalState.data.dataValues.length).to.gte(1);
  });

  it('should get all programs in the organisation unit TSyzvBiovKh', async () => {
    const response = await execute(
      get('programs', { orgUnit: 'TSyzvBiovKh', fields: '*' })
    )(state);
    expect(response.data.programs.length).to.gte(1);
  });
});

// describe('upsert', () => {
//   const state = {
//     configuration: {
//       username: 'admin',
//       password: 'district',
//       hostUrl: 'https://play.dhis2.org/2.36.4',
//     },
//     data: {},
//   };

//   it('should upsert a trackedEntityInstance matching the URL parameters', async () => {
//     const response = await execute(
//       upsert(
//         'trackedEntityInstances',
//         {
//           created: '2019-08-21T13:27:51.119',
//           orgUnit: 'DiszpKrYNg8',
//           createdAtClient: '2019-03-19T01:11:03.924',
//           trackedEntityInstance: 'dNpxRu1mWG5',
//           lastUpdated: '2019-09-27T00:02:11.604',
//           trackedEntityType: 'We9I19a3vO1',
//           lastUpdatedAtClient: '2019-03-19T01:11:03.924',
//           coordinates:
//             '[[[-11.8049,8.3374],[-11.8032,8.3436],[-11.8076,8.3441],[-11.8096,8.3387],[-11.8049,8.3374]]]',
//           inactive: false,
//           deleted: false,
//           featureType: 'POLYGON',
//           geometry: {
//             type: 'Polygon',
//             coordinates: [
//               [
//                 [-11.8049, 8.3374],
//                 [-11.8032, 8.3436],
//                 [-11.8076, 8.3441],
//                 [-11.8096, 8.3387],
//                 [-11.8049, 8.3374],
//               ],
//             ],
//           },
//           programOwners: [
//             {
//               ownerOrgUnit: 'DiszpKrYNg8',
//               program: 'M3xtLkYBlKI',
//               trackedEntityInstance: 'dNpxRu1mWG5',
//             },
//           ],
//           enrollments: [],
//           relationships: [
//             {
//               lastUpdated: '2019-08-21T00:00:00.000',
//               created: '2019-08-21T00:00:00.000',
//               relationshipName: 'Focus to Case',
//               bidirectional: false,
//               relationshipType: 'Mv8R4MPcNcX',
//               relationship: 'EDfZpCLcEVN',
//               from: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'dNpxRu1mWG5',
//                   programOwners: [],
//                 },
//               },
//               to: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'Fbru4rg4dYV',
//                   programOwners: [],
//                 },
//               },
//             },
//             {
//               lastUpdated: '2019-08-21T00:00:00.000',
//               created: '2019-08-21T00:00:00.000',
//               relationshipName: 'Focus to Case',
//               bidirectional: false,
//               relationshipType: 'Mv8R4MPcNcX',
//               relationship: 'z4ItJx8ul3Z',
//               from: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'dNpxRu1mWG5',
//                   programOwners: [],
//                 },
//               },
//               to: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'RHA9RWNvAnC',
//                   programOwners: [],
//                 },
//               },
//             },
//             {
//               lastUpdated: '2019-08-21T00:00:00.000',
//               created: '2019-08-21T00:00:00.000',
//               relationshipName: 'Focus to Case',
//               bidirectional: false,
//               relationshipType: 'Mv8R4MPcNcX',
//               relationship: 'XIfv95ZiM4H',
//               from: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'dNpxRu1mWG5',
//                   programOwners: [],
//                 },
//               },
//               to: {
//                 trackedEntityInstance: {
//                   trackedEntityInstance: 'jZRaFaYkAtE',
//                   programOwners: [],
//                 },
//               },
//             },
//           ],
//           attributes: [],
//         },
//         {
//           params: {
//             fields: '*',
//             ou: 'DiszpKrYNg8',
//             entityType: 'nEenWmSyUEp',
//             trackedEntityInstance: 'dNpxRu1mWG5',
//           },
//         }
//       )
//     )(state);
//     expect(response.data.httpStatusCode).to.eq(200);
//     expect(response.data.httpStatus).to.eq('OK');
//   });
// });
