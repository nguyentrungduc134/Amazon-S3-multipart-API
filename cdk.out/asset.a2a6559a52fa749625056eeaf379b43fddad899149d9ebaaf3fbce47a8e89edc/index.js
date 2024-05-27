"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// asset-input/lambda/authorizer.js
var authorizer_exports = {};
__export(authorizer_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(authorizer_exports);
var handler = (event, context, callback) => {
  const token = event.authorizationToken;
  switch (token) {
    case "12345":
      callback(null, generatePolicy("user", "Allow", event.methodArn));
      break;
    case "deny":
      callback(null, generatePolicy("user", "Deny", event.methodArn));
      break;
    case "unauthorized":
      callback("Unauthorized");
      break;
    default:
      callback("Error: Invalid token");
  }
};
var generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId
  };
  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource
        }
      ]
    };
    authResponse.policyDocument = policyDocument;
  }
  authResponse.context = {
    stringKey: "stringval",
    numberKey: 123,
    booleanKey: true
  };
  return authResponse;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
