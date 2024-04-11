"use strict";

// asset-input/lambda/finalize.js
var import_client_s3 = require("@aws-sdk/client-s3");
var BUCKET_NAME = process.env["BUCKET_NAME"];
var s3 = new import_client_s3.S3Client();
exports.handler = async (event) => {
  console.log(event);
  if (event.body !== null && event.body !== void 0) {
    const { fileKey, fileId, parts } = JSON.parse(event.body);
    let sortedProducts = parts.sort((p1, p2) => p1.PartNumber < p2.PartNumber ? -1 : p1.price > p2.price ? 1 : 0);
    const multipartParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      UploadId: fileId,
      MultipartUpload: {
        // ordering the parts to make sure they are in the right order
        Parts: sortedProducts
      }
    };
    const command = new import_client_s3.CompleteMultipartUploadCommand(multipartParams);
    await s3.send(command);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    };
  } else {
    throw new Error("event.body is not defined");
  }
};
