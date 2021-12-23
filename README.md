# Language DHIS2 [![Build Status](https://travis-ci.org/OpenFn/language-dhis2.svg?branch=main)](https://travis-ci.org/OpenFn/language-dhis2)

Language Pack for building expressions and operations for working with the
[DHIS2 API](http://dhis2.github.io/dhis2-docs/master/en/developer/html/dhis2_developer_manual.html).

## Documentation

View the [docs site](https://openfn.github.io/language-dhis2/) for full
technical documentation. Below, find a samples of the most commonly used helper
functions.

## Sample State

```json
{
  "configuration": {
    "username": "admin",
    "password": "district",
    "hostUrl": "https://play.dhis2.org/2.35.1"
  },
  "data": {
    "a": 1,
    "b": 2
  }
}
```

## Analytics API

#### Fetch analytics data for PMTCT data over last 6 months.

```js
fetchAnalytics({
  query: {
    dimension: ['dx:CYI5LEmm3cG;GDVU1o5rTNF', 'pe:LAST_6_MONTHS'],
    filter: 'ou:GHlyx9Pg9mn',
    displayProperty: 'NAME',
    outputIdScheme: 'UID',
  },
});
```

## Tracked Entity API

#### Create a new tracked entity instance and enroll them from a CommCare form submission.

```js
createTEI({
  trackedEntityType: 'nEenWmSyUEp',
  orgUnit: 'g8upMTyEZGZ',
  attributes: [
    {
      attribute: 'w75KJ2mc4zz',
      value: dataValue('form.first_name')(state),
    },
    {
      attribute: 'zDhUuAYrxNC',
      value: dataValue('form.last_name')(state),
    },
  ],
  enrollments: [
    {
      orgUnit: 'g8upMTyEZGZ',
      program: 'IpHINAT79UW',
      enrollmentDate: '2019-04-08',
      incidentDate: '2019-04-08',
    },
  ],
});
```

#### Upsert a tracked entity instance from a CommCare form submission.

```js
upsertTEI(
  'w75KJ2mc4zz', // match on 'patientID', a custom external ID in dhis2
  {
    trackedEntityType: 'nEenWmSyUEp',
    orgUnit: 'g8upMTyEZGZ',
    attributes: [
      {
        attribute: 'w75KJ2mc4zz',
        value: dataValue('form.first_name')(state),
      },
      {
        attribute: 'zDhUuAYrxNC',
        value: dataValue('form.last_name')(state),
      },
    ],
  }
);
```

## Events API

#### `Events API` expression

```js
event(
  fields(
    field("program", "eBAyeGv0exc"),
    field("orgUnit", "DiszpKrYNg8"),
    field("eventDate", dataValue("date")),
    field("status", "COMPLETED"),
    field("storedBy", "admin"),
    field("coordinate", {
      "latitude": "59.8",
      "longitude": "10.9"
    }),
    field("dataValues", function(state) {
      return [
        dataElement("qrur9Dvnyt5", dataValue("prop_a"))(state)
        dataElement("oZg33kd9taw", dataValue("prop_b"))(state)
        dataElement("msodh3rEMJa", dataValue("prop_c"))(state)
      ]
    })
  )
)
```

#### Current `fetchEvents API` expression (Optional `postUrl` for a complete fetch)

```js
fetchEvents({
  fields: {
    orgUnit: 'DiszpKrYNg8',
    program: 'eBAyeGv0exc',
    endDate: '2016-01-01',
  },
  postUrl: 'https://www.openfn.org/inbox/123',
});
```

#### Reference on how to query and read events https://docs.dhis2.org/2.22/en/developer/html/ch01s15.html#d5e1994

## Data Values / Data Value Sets API

#### Current `DataValueSets API` expression

```js
dataValueSet({
  dataSet: dataValue('set'),
  orgUnit: 'DiszpKrYNg8',
  period: '201402',
  completeData: '2014-03-03',
  dataValues: [
    dataElement('f7n9E0hX8qk', dataValue('data[0].site_school_number')),
    dataElement('Ix2HsbDMLea', dataValue('age')),
    dataElement('eY5ehpbEsB7', 30),
  ],
});
```

#### Current `fetchData API` expression (Optional `postUrl` for a complete fetch)

```js
fetchData({
  fields: {
    dataSet: 'pBOMPrpg1QX',
    orgUnit: 'DiszpKrYNg8',
    period: '201711',
  },
  postUrl: 'https://www.openfn.org/inbox/123',
});
```

#### Reference on how to read data values https://docs.dhis2.org/2.22/en/developer/html/ch01s13.html#d5e1642

[Docs](docs/index)

## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

NB: There are two types of tests: unit tests and integration tests.

### Unit Tests

Unit tests allows to test the functionalities of the adaptor helper functions
such as:

> Does `create('events', payload)` perform a post request to the correct DHIS2
> API?

To run unit tests execute `npm run test` (they're the default tests).

Anytime a new functionality is added to the helper functions, more unit tests
needs to be added.

### End-to-end integration tests

Integration tests allow us to test the end-to-end behavior of the helper functions
and also to test the examples we provide via inline documentation.

For example with integration tests we answer the following question:

> Does `create('events', eventPayload)` actually create a new event in a live
> DHIS2 system?

To run integration tests, execute `npm run integration-test`. These
tests use network I/O and a public connection to a DHIS2 "play" server so their
timing and performance is unpredictable. Consider adding an increased timeout,
and modifying the orgUnit, program, etc., IDs set in `globalState`.

#### Important

- Depending on your internet strength please consider changing the global timeout in the `test/mocha.opts` file to avoid faillures related to network timeouts.

- In `test/integration.js` you have all the code of the integration tests. These tests behavior are very unpredictable cause they depend on the configuration of the DHIS 2 instance they're being ran on. Currently you need to have at least one organisation unit with one program, one trackedEntityInstance and one programStage in it. These components need to be well configured for the integration tests to work. For example: the trackedEntityInstance need to be enrolled to the program, which should be created in that organisation unit and contains at least that programStage. Consider adjusting these in the before hook. See example below:

```javascript
before(done => {
  fixture.initialState = {
    configuration: {
      username: 'admin',
      password: 'district',
      hostUrl: 'https://play.dhis2.org/2.36.6',
    },
    program: 'IpHINAT79UW',
    orgUnit: 'DiszpKrYNg8',
    trackedEntityInstance: 'uhubxsfLanV',
    programStage: 'eaDHS084uMp',
  };
  done();
});
```

- Make sure the update and upsert integration tests doesn't affect those initial organisation units, programs, programStage and trackedEntityInstance required. Otherwise the create integration tests would be broken again; and that's an endless faillure loop :(

Anytime a new example is added in the documentation of a helper function, a new
integration test should be done.

### Build

Build the project using `npm run build`.
