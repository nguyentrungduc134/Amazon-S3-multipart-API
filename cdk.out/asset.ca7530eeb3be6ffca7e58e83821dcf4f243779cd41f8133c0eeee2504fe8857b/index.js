"use strict";

// asset-input/lambda/initialize.js
var import_client_s32 = require("@aws-sdk/client-s3");
var BUCKET_NAME = process.env["BUCKET_NAME"];
var s3 = new import_client_s32.S3Client();
exports.handler = async (event) => {
  console.log(event);
  if (!event.body) {
    throw new Error("event.body is not defined");
  }
  const body = JSON.parse(event.body);
  if (!body.pluginPayload.imageKey) {
    throw new Error("name of the file is required");
  }
  const multipartParams = {
    Bucket: BUCKET_NAME,
    Key: body.pluginPayload.imageKey
  };
  const command2 = new import_client_s3.CreateMultipartUploadCommand(multipartParams);
  const multipartUpload = await s3.send(command2);
  return {
    statusCode: 200,
    body: {
      fileId: multipartUpload.UploadId,
      fileKey: multipartUpload.Key
    },
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  };
};
