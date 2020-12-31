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

export const upsertState = {
  configuration: {
    username: 'admin',
    password: 'district',
    hostUrl: 'https://play.dhis2.org/2.35.0',
  },
  data: {
    orgUnit: 'CMqUILyVnBL',
    trackedEntityType: 'hRqJrTjGWtg',
    enrollments: [
      {
        orgUnit: 'CMqUILyVnBL',
        program: 'wZLN40noez1',
        enrollmentDate: '2020-12-31',
        incidentDate: '2020-12-31',
        events: [
          {
            program: 'wZLN40noez1',
            programStage: 'jIjk9MfFbzb',
            orgUnit: 'CMqUILyVnBL',
            status: 'COMPLETED',
            eventDate: '2020-12-31',
            dataValues: [
              {
                dataElement: 'jKD9gqa68Hr',
                value: 'No',
              },
              {
                dataElement: 'pXmbLUbZIes',
                value: 'Negative',
              },
              {
                dataElement: 'SDvESW82Ecj',
                value: 'true',
              },
            ],
          },
          {
            program: 'wZLN40noez1',
            programStage: 'YalzZDUzMyF',
            orgUnit: 'CMqUILyVnBL',
            status: 'COMPLETED',
            eventDate: '2020-12-31',
            dataValues: [
              {
                dataElement: 'prYZ7QJT0u5',
                value: 'true',
              },
              {
                dataElement: 'I4I5tQFJBBP',
                value: 'Stable status',
              },
            ],
            notes: [],
            relationships: [],
          },
          {
            program: 'wZLN40noez1',
            programStage: 'YalzZDUzMyF',
            orgUnit: 'CMqUILyVnBL',
            status: 'COMPLETED',
            eventDate: '2020-12-31',
            dataValues: [
              {
                dataElement: 'I4I5tQFJBBP',
                value: 'Deteriorating status',
              },
              {
                dataElement: 'Nj5z8CuyhPj',
                value: 'true',
              },
            ],
          },
          {
            program: 'wZLN40noez1',
            programStage: 'YalzZDUzMyF',
            orgUnit: 'CMqUILyVnBL',
            status: 'COMPLETED',
            eventDate: '2020-12-31',
            dataValues: [
              {
                dataElement: 'qaB6ugd28O5',
                value: 'true',
              },
              {
                dataElement: 'xBKQS8pkiaN',
                value: 'true',
              },
              {
                dataElement: 'I4I5tQFJBBP',
                value: 'Stable status',
              },
            ],
            notes: [],
            relationships: [],
          },
        ],
      },
    ],
    attributes: [
      {
        attribute: 'RxNsHWsucU6',
        value: '04-12-1984',
      },
      {
        attribute: 'ZL4K1hwBdTF',
        value: 'Chaiwa',
      },
      {
        attribute: 'aX5hD4qUpRW',
        value: '11535322',
      },
      {
        attribute: 'lkk7ve7dr6b',
        value: 'Mary',
      },
      {
        attribute: 'nMsjzduOW4Z',
        value: 'Female',
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
