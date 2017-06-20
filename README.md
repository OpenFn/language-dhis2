Language DHIS2 [![Build Status](https://travis-ci.org/OpenFn/language-dhis2.svg?branch=master)](https://travis-ci.org/OpenFn/language-dhis2)
==============

Language Pack for building expressions and operations for working with
the [DHIS2 API](http://dhis2.github.io/dhis2-docs/master/en/developer/html/dhis2_developer_manual.html).

Documentation
-------------

## Tracked Entity API

#### Create a new tracked entity instance from a CommCare form submission.
```js
createTEI(
  fields(
    field("trackedEntity", "nEenWmSyUEp"),
    field("orgUnit", "DiszpKrYNg8"),
    field("attributes", function(state) {
      return [{
        "attribute": "w75KJ2mc4zz",
        "value": dataValue("form.first_name")(state)
      }, {
        "attribute": "zDhUuAYrxNC",
        "value": dataValue("form.last_name")(state)
      }]
    })
  )
)
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

## Data Values / Data Value Sets API

#### Current `DataValueSets API` expression
```js
dataValueSet(
  fields(
    field("dataSet", "pBOMPrpg1QX"),
    field("orgUnit", "DiszpKrYNg8"),
    field("period", "201401"),
    field("completeData", dataValue("form.date")),
    field("dataValues", function(state) {
      return [
        dataElement("qrur9Dvnyt5", dataValue("form.prop_a")(state)),
        dataElement("oZg33kd9taw", dataValue("form.prop_b")(state)),
        dataElement("msodh3rEMJa", dataValue("form.prop_c")(state))
      ]
    })
  )
)
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
