import Axios from 'axios';
import {CustomError} from 'ts-custom-error';
import * as jwt from 'jsonwebtoken';
import * as qs from 'qs';

export interface JWTResponse {
  access_token: string;
  scope: string;
  instance_url: string;
  id: string;
  token_type: string;
}

export class JWTError extends CustomError {
  public constructor(public isJWTError: boolean, message?: string) {
    super(message);
  }
}

export interface JWTOptions {
  audience?: string; //defaults to login.salesforce.com
  instanceUrl?: string; //defaults to audience
  expiresIn?: number; //defaults to 3
  algorithm?: string; //default to RS256
}

export const getJWTToken = async (
  clientId: string,
  privateKey: string,
  userName: string,
  opts?: JWTOptions
): Promise<JWTResponse> => {
  const audience = opts?.audience || 'https://login.salesforce.com';
  const instanceUrl = opts?.instanceUrl || audience;
  const token = jwt.sign({prn: userName}, privateKey, {
    issuer: clientId,
    audience: opts?.instanceUrl || audience,
    expiresIn: opts?.expiresIn || 3,
    algorithm: opts?.algorithm || 'RS256',
  });

  try {
    return (
      await Axios.post<JWTResponse>(
        `${instanceUrl}/services/oauth2/token`,
        qs.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: token,
        })
      )
    ).data;
  } catch (e: any) {
    //because axios fails at anything over a 2xx request
    //its safe to assume that if we got here, we got something we were not expecting form SF
    if (e.isAxiosError) {
      throw new JWTError(
        true,
        `Request to salesforce failed with ${e.response.status} ${JSON.stringify(e.response.data)}`
      );
    } else {
      throw new JWTError(true, e.message);
    }
  }
};
