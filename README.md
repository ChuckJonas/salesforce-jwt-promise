# salesforce-jwt-promise

[![npm version](https://badge.fury.io/js/salesforce-jwt-promise.svg)](https://badge.fury.io/js/salesforce-jwt-promise)

Promise Based implementation of [OAuth 2.0 JWT Bearer Token Flow](https://help.salesforce.com/HTViewHelpDoc?id=remoteaccess_oauth_jwt_flow.htm&language=en_US).

- written in typescript
- returns Promise to support `async/await` syntax.
- Compatible with jsforce and any other clients.

## Installation

```bash
$ npm install salesforce-jwt-promise
```

## Usage

This library contains an single export: `getJWTToken()` which accepts an object with the following options object parameter:

- `clientId`: The salesforce connected app consumerKey
- `privateKey`: The private key used to sign the certificated uploaded to the connected app
- `userName`: The user to impersonate
- `audience`: (Optional) Defaults to https://login.salesforce.com
- `instance_url`: (Optional) Defaults to `audience`

A success response will include the following properties:

- access_token
- scope
- instance_url
- id
- token_type

```javascript

import { getJWTToken } from 'salesforce-jwt-promise';

var clientId = '3MVG9A2kN3Bn17hvVNDOE5FX8c9hS...30dgSSfyGi1FS09Zg';
var privateKey = require('fs').readFileSync('./privateKey.key', 'utf8'); // this should probably be encrypted!

try{
let jwtResp = await getJWTToken(
    {
        clientId: clientId,
        privateKey: privateKey,
        userName: 'user@toImpersonate.com',
        audience: 'https://test.salesforce.com'
    }
);

//use token
var sfConnection = new jsforce.Connection();

sfConnection.initialize({
    instanceUrl: jwtResp.instance_url,
    accessToken: jwtResp.access_token
});

}catch(e){
    console.log(e);
}

```

## License

MIT

Forked from [leandrob/node-salesforce-jwt](https://github.com/leandrob/node-salesforce-jwt)
