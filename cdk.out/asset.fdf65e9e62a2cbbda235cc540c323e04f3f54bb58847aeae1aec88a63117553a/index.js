"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// asset-input/lambda/makePreSignedUrls.js
var require_makePreSignedUrls = __commonJS({
  "asset-input/lambda/makePreSignedUrls.js"(exports2, module2) {
    "use strict";
    var import_client_s32 = require("@aws-sdk/client-s3");
    var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
    async function makePreSignedUrls(s32, bucket_name, url_expiration, payload) {
      const { fileKey, fileId, parts } = JSON.parse(payload);
      const multipartParams = {
        Bucket: bucket_name,
        Key: fileKey,
        UploadId: fileId
      };
      const promises = [];
      for (let index = 0; index < parts; index++) {
        const command = new import_client_s32.UploadPartCommand({
          ...multipartParams,
          PartNumber: index + 1
        });
        promises.push(
          (0, import_s3_request_presigner.getSignedUrl)(s32, command, { expiresIn: parseInt(url_expiration) })
        );
      }
      const signedUrls = await Promise.all(promises);
      return signedUrls.map((signedUrl, index) => {
        return {
          signedUrl,
          PartNumber: index + 1
        };
      });
    }
    module2.exports.makePreSignedUrls = makePreSignedUrls;
  }
});

// asset-input/lambda/getPreSignedTAUrls.js
var import_client_s3 = require("@aws-sdk/client-s3");
var s3UrlLib = require_makePreSignedUrls();
var BUCKET_NAME = process.env["BUCKET_NAME"];
var URL_EXPIRES = process.env["URL_EXPIRES"];
var s3 = new import_client_s3.S3Client({ useAccelerateEndpoint: true });
exports.handler = async (event) => {
  console.log(event);
  if (event.body !== null && event.body !== void 0) {
    const partSignedUrlList = await s3UrlLib.makePreSignedUrls(s3, BUCKET_NAME, URL_EXPIRES, event.body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        parts: partSignedUrlList
      }),
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    };
  } else {
    throw new Error("event.body is not defined");
  }
};
