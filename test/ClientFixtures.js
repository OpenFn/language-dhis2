const fixtures = {
  event: {
    requestBody: {
      program: 'eBAyeGv0exc',
      orgUnit: 'DiszpKrYNg8',
      eventDate: '2013-05-17',
      status: 'COMPLETED',
      storedBy: 'admin',
      coordinate: {
        latitude: '59.8',
        longitude: '10.9',
      },
      dataValues: [
        { dataElement: 'qrur9Dvnyt5', value: '99' },
        { dataElement: 'oZg33kd9taw', value: 'Female' },
        { dataElement: 'msodh3rEMJa', value: '2013-05-18' },
      ],
    },
    responseBody: {
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
      message: 'Import was successful.',
      response: {
        responseType: 'ImportSummaries',
        imported: 3,
        updated: 0,
        deleted: 0,
        ignored: 0,
        importSummaries: [
          {
            responseType: 'ImportSummary',
            status: 'SUCCESS',
            importCount: { imported: 3, updated: 0, ignored: 0, deleted: 0 },
            reference: 'rrPOYH80oqG',
            href: 'https://play.dhis2.org/demo/api/events/rrPOYH80oqG',
          },
        ],
      },
    },
  },
};

function rand(n) {
  if (n === 0) return '';
  let r = Math.floor(Math.random() * Math.floor(n));
  return '' + r + rand(n - 1);
}

let valUpsert = rand(7);
let valUpsertTEI = rand(7);
let valDelTEI = rand(7);

export const upsertNewState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    orgUnit: 'TSyzvBiovKh',
    trackedEntityType: 'nEenWmSyUEp',
    attributes: [
      {
        attribute: 'lZGmxYbs97q',
        value: valUpsert,
      },
      {
        attribute: 'w75KJ2mc4zz',
        value: 'Gigiwe',
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: 'Mwanza',
      },
    ],
    enrollments: [
      {
        orgUnit: 'TSyzvBiovKh',
        program: 'fDd25txQckK',
        programState: 'lST1OZ5BDJ2',
        enrollmentDate: '2021-01-04',
        incidentDate: '2021-01-04',
      },
    ],
  },
};
export const upsertExistingState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    orgUnit: 'TSyzvBiovKh',
    trackedEntityType: 'nEenWmSyUEp',
    attributes: [
      {
        attribute: 'lZGmxYbs97q',
        value: '4088389',
      },
      {
        attribute: 'w75KJ2mc4zz',
        value: 'Gigiwe',
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: 'Mwanza',
      },
    ],
    enrollments: [
      {
        orgUnit: 'TSyzvBiovKh',
        program: 'fDd25txQckK',
        programState: 'lST1OZ5BDJ2',
        enrollmentDate: '2021-01-04',
        incidentDate: '2021-01-04',
      },
    ],
  },
};
export const upsertNewTEIState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    orgUnit: 'TSyzvBiovKh',
    trackedEntityType: 'nEenWmSyUEp',
    attributes: [
      {
        attribute: 'lZGmxYbs97q',
        value: valUpsertTEI,
      },
      {
        attribute: 'w75KJ2mc4zz',
        value: 'Gigiwe',
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: 'Mwanza',
      },
    ],
    enrollments: [
      {
        orgUnit: 'TSyzvBiovKh',
        program: 'fDd25txQckK',
        programState: 'lST1OZ5BDJ2',
        enrollmentDate: '2021-01-04',
        incidentDate: '2021-01-04',
      },
    ],
  },
};
export const upsertExistingTEIState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    orgUnit: 'TSyzvBiovKh',
    trackedEntityType: 'nEenWmSyUEp',
    attributes: [
      {
        attribute: 'lZGmxYbs97q',
        value: '4088389',
      },
      {
        attribute: 'w75KJ2mc4zz',
        value: 'Gigiwe',
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: 'Mwanza',
      },
    ],
    enrollments: [
      {
        orgUnit: 'TSyzvBiovKh',
        program: 'fDd25txQckK',
        programState: 'lST1OZ5BDJ2',
        enrollmentDate: '2021-01-04',
        incidentDate: '2021-01-04',
      },
    ],
  },
};

export const createState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    program: 'eBAyeGv0exc',
    orgUnit: 'DiszpKrYNg8',
    eventDate: '2021-01-05',
    status: 'COMPLETED',
    completedDate: '2021-01-05',
    storedBy: 'admin',
    coordinate: {
      latitude: 59.8,
      longitude: 10.9,
    },
    dataValues: [
      {
        dataElement: 'qrur9Dvnyt5',
        value: '33',
      },
      {
        dataElement: 'oZg33kd9taw',
        value: 'Male',
      },
      {
        dataElement: 'msodh3rEMJa',
        value: '2014-05-18',
      },
    ],
  },
};

export const updateState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    id: 'FTRrcoaog83',
    displayName: 'New display name',
    aggregationType: 'SUM',
    domainType: 'AGGREGATE',
    valueType: 'NUMBER',
    name: 'Accute Flaccid Paralysis (Deaths < 5 yrs)',
    shortName: 'Accute Flaccid Paral (Deaths < 5 yrs)',
  },
};

export const patchState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    displayName: 'Chaiwa',
  },
};

export const delState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.1',
    apiVersion: 35,
  },
  data: {
    orgUnit: 'TSyzvBiovKh',
    trackedEntityType: 'nEenWmSyUEp',
    attributes: [
      {
        attribute: 'lZGmxYbs97q',
        value: valDelTEI,
      },
      {
        attribute: 'w75KJ2mc4zz',
        value: 'Gigiwe',
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: 'Mwanza',
      },
    ],
    enrollments: [
      {
        orgUnit: 'TSyzvBiovKh',
        program: 'fDd25txQckK',
        programState: 'lST1OZ5BDJ2',
        enrollmentDate: '2021-01-04',
        incidentDate: '2021-01-04',
      },
    ],
  },
};

export { fixtures };

export default [
  {
    pattern: 'https://play.dhis2.org/demo(.*)',

    fixtures(match, params, headers) {
      if (match[1] === '/api/events') {
        return {
          body: fixtures.event.responseBody,
          params,
          headers,
        };
      }

      throw new Error(
        `No Fixture Match\ngot: ${JSON.stringify(match, 2, null)}`
      );
    },

    post(match, data) {
      return { ok: true, match, ...data };
    },
  },
];
