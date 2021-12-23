# Language DHIS2 [![Build Status](https://travis-ci.org/OpenFn/language-dhis2.svg?branch=main)](https://travis-ci.org/OpenFn/language-dhis2)

Language Pack for building expressions and operations for working with the
[DHIS2 API](http://dhis2.github.io/dhis2-docs/master/en/developer/html/dhis2_developer_manual.html).

## Documentation

View the [docs site](https://openfn.github.io/language-dhis2/) for full
technical documentation and **lots of examples** for how to use the various
helper functions.

## Sample State

```json
{
  "configuration": {
    "username": "admin",
    "password": "district",
    "hostUrl": "https://play.dhis2.org/2.36.6"
  },
  "data": { "a": 1, "b": 2 }
}
```

## Development

Clone the repo and run `npm install`.

Run tests using `npm run test` or `npm run test:watch`. (NB: that this repo also
contain integration tests which can be run with `npm run integration-test`.)

**_Make your changes to the files in `src/` and then use `npm run build` to
generate output files in `lib/`._**

### Unit Tests

Unit tests allows to test the functionalities of the adaptor helper functions
such as:

> Does `create('events', payload)` perform a post request to the correct DHIS2
> API?

To run unit tests execute `npm run test` (they're the default tests).

Anytime a new functionality is added to the helper functions, more unit tests
needs to be added.

### End-to-end integration tests

Integration tests allow us to test the end-to-end behavior of the helper
functions and also to test the examples we provide via inline documentation.

For example with integration tests we answer the following question:

> Does `create('events', eventPayload)` actually create a new event in a live
> DHIS2 system?

To run integration tests, execute `npm run integration-test`. These tests use
network I/O and a public connection to a DHIS2 "play" server so their timing and
performance is unpredictable. Consider adding an increased timeout, and
modifying the orgUnit, program, etc., IDs set in `globalState`.

#### Troubleshooting the tests

- Depending on your internet strength please consider changing the **global
  timeout** in the `test/mocha.opts` file to avoid faillures related to network
  timeouts.

- The behavior of the tests in `test/integration.js` is very unpredictable; they
  depend on the **configuration of a target DHIS2 instance**. Currently you need
  to have at least one organisation unit with one program, one
  trackedEntityInstance and one programStage in it. These components need to be
  well configured for the integration tests to work. For example: the
  trackedEntityInstance need to be enrolled to the program, which should be
  created in that organisation unit and contains at least that programStage. If
  the tests fail, you must adjust these attributes in the
  [before hook](test/integration.js):

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

- Make sure the `update` and `upsert` integration tests don't affect those
  initial organisation units, programs, programStage and trackedEntityInstance
  required. Otherwise the create integration tests would be broken again; and
  that's an endless faillure loop :(

Anytime a new example is added in the documentation of a helper function, a new
integration test should be built.
