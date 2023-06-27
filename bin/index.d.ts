import { CustomError } from 'ts-custom-error';
export interface JWTResponse {
    access_token: string;
    scope: string;
    instance_url: string;
    id: string;
    token_type: string;
}
export declare class JWTError extends CustomError {
    isJWTError: boolean;
    constructor(isJWTError: boolean, message?: string);
}
export interface JWTOptions {
    audience?: string;
    instanceUrl?: string;
    expiresIn?: number;
    algorithm?: string;
}
export declare const getJWTToken: (clientId: string, privateKey: string, userName: string, opts?: JWTOptions) => Promise<JWTResponse>;
