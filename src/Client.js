import request from 'superagent'
// curl -d @datavalueset.json "https://play.dhis2.org/demo/api/dataValueSets" -H "Content-Type:application/json" -u admin:district -v

export function post({ username, password, body, url }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .type('json')
    .accept('json')
    .auth(username, password)
    .send(JSON.stringify(body))
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject( error )
      }

      resolve( res )
    })

  })
}
