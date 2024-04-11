"use strict";

// asset-input/lambda/initialize.js
var import_client_s3 = require("@aws-sdk/client-s3");
var BUCKET_NAME = process.env["BUCKET_NAME"];
var tableName = process.env.TABLE_NAME;
var s3 = new import_client_s3.S3Client();
exports.handler = async (event) => {
  console.log(event);
  if (!event.body) {
    throw new Error("event.body is not defined");
  }
  const body = JSON.parse(event.body);
  if (!body.pluginPayload.imageKey) {
    throw new Error("name of the file is required");
  }
  if (userId === void 0 || fileName === void 0) {
    return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ message: "Missing userId or fileName" }),
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  await dynamoDBClient.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        plugin: { S: body.plugin },
        pluginPayload: { S: body.pluginPayload }
      }
    })
  );
  const multipartParams = {
    Bucket: BUCKET_NAME,
    Key: body.pluginPayload.imageKey
  };
  const command = new import_client_s3.CreateMultipartUploadCommand(multipartParams);
  const multipartUpload = await s3.send(command);
  return {
    statusCode: 200,
    body: JSON.stringify({
      fileId: multipartUpload.UploadId,
      fileKey: multipartUpload.Key
    }),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  };
};
