"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const ts_custom_error_1 = require("ts-custom-error");
const jwt = require("jsonwebtoken");
const qs = require("qs");
class JWTError extends ts_custom_error_1.CustomError {
    constructor(isJWTError, message) {
        super(message);
        this.isJWTError = isJWTError;
    }
}
exports.JWTError = JWTError;
exports.getJWTToken = (clientId, privateKey, userName, opts) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const audience = ((_a = opts) === null || _a === void 0 ? void 0 : _a.audience) || 'https://login.salesforce.com';
    const instanceUrl = ((_b = opts) === null || _b === void 0 ? void 0 : _b.instanceUrl) || audience;
    const token = jwt.sign({ prn: userName }, privateKey, {
        issuer: clientId,
        audience: ((_c = opts) === null || _c === void 0 ? void 0 : _c.instanceUrl) || audience,
        expiresIn: ((_d = opts) === null || _d === void 0 ? void 0 : _d.expiresIn) || 3,
        algorithm: ((_e = opts) === null || _e === void 0 ? void 0 : _e.algorithm) || 'RS256'
    });
    try {
        return (yield axios_1.default.post(`${instanceUrl}/services/oauth2/token`, qs.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
        }))).data;
    }
    catch (e) {
        //because axios fails at anything over a 2xx request
        //its safe to assume that if we got here, we got something we were not expecting form SF
        if (e.isAxiosError) {
            throw new JWTError(true, `Request to salesforce failed with ${e.response.status} ${JSON.stringify(e.response.data)}`);
        }
        else {
            throw new JWTError(true, e.message);
        }
    }
});
