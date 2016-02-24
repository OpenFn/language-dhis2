Language DHIS2
==============

Language Pack for building expressions and operations for working with
the [DHIS2 API](http://dhis2.github.io/dhis2-docs/master/en/developer/html/dhis2_developer_manual.html).

Documentation
-------------
## Events API

#### Desired `Events API` expression:
```js
events("program", "orgUnit", fields(
  field(...),
  field(...),
  field(...),
  dataValues(
    field("dataElement", "value"),
    field("dataElement", "value"),
    field("dataElement", "value")
  )
))
```

#### Current `Events API` expression—too bulky
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
        { "dataElement": "qrur9Dvnyt5", "value": dataValue("prop_a")(state) },
        { "dataElement": "oZg33kd9taw", "value": dataValue("prop_b")(state) },
        { "dataElement": "msodh3rEMJa", "value": dataValue("prop_c")(state) }
      ]
    })
  )
)
```

## Data Values / Data Value Sets API

#### Desired `DataValueSets API` expression:
```js
dataValueSet("dataSet", "orgUnit", fields(
  field(...),
  field(...),
  field(...),
  dataValues(
    field("dataElement", "value"),
    field("dataElement", "value"),
    field("dataElement", "value")
  )
))
```

#### Current `DataValueSets API` expression—too bulky
```js
dataValueSet(
  fields(
    field("dataSet", "pBOMPrpg1QX"),
    field("orgUnit", "DiszpKrYNg8"),
    field("period", "201401"),
    field("completeData", dataValue("date")),
    field("dataValues", function(state) {
      return [
        { "dataElement": "f7n9E0hX8qk", "value": dataValue("prop_a")(state) },
        { "dataElement": "Ix2HsbDMLea", "value": dataValue("prop_b")(state) },
        { "dataElement": "eY5ehpbEsB7", "value": dataValue("prop_c")(state) }
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
