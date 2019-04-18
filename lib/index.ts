import * as request from 'request'
import * as jwt from 'jsonwebtoken';

export interface JWTResponse {
    access_token: string;
    scope: string;
    instance_url: string;
    id: string;
    token_type: string;
}

export interface JWTError {
    error: string;
    error_description: string;
}

export interface JWTOptions {
    clientId: string,
    privateKey: string;
    userName: string;
    audience?: string; //defaults to login.salesforce.com
    instanceUrl?: string; //defaults to audience
}

export const getJWTToken = (opts: JWTOptions): Promise<JWTResponse> => {
    let audience = opts.audience || 'https://login.salesforce.com';
    let instanceUrl = opts.instanceUrl || audience;
    var options: jwt.SignOptions = {
        issuer: opts.clientId,
        audience,
        expiresIn: 3,
        algorithm: 'RS256'
    }

    var token = jwt.sign({ prn: opts.userName }, opts.privateKey, options);

    return new Promise((resolve, reject) => {
        request(
            {
                uri: `${instanceUrl}/services/oauth2/token`,
                form: {
                    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    'assertion': token
                },
                method: 'post'
            }, function (err, res, body) {
                if (err) {
                    reject(err);
                };


                if (!body) {
                    reject(new Error('No response from oauth endpoint.'));
                    return;
                };

                var respBody;
                try {
                    respBody = JSON.parse(body);
                } catch (e) {
                    reject(new Error('Could Not Parse Response'));
                    return;
                }

                if (res.statusCode != 200) {
                    let respError = respBody as JWTError;
                    var message = 'Failed to Authenticate: ' + respError.error + ' (' + respError.error_description + ')';
                    reject(new Error(message))
                    return;
                };

                resolve(respBody as JWTResponse);
            });
    })
}