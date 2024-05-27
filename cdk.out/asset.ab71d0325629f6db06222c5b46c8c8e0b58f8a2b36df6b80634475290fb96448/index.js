"use strict";

// asset-input/lambda/plugin.js
var import_client_s3 = require("@aws-sdk/client-s3");
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_doc_dynamodb = require("@aws-sdk/lib-dynamodb");
var BUCKET_NAME = process.env["BUCKET_NAME"];
var tableName = process.env.TABLE_NAME;
var s3 = new import_client_s3.S3Client();
var dynamoDBClient = new import_client_dynamodb.DynamoDBClient({});
var docClient = import_doc_dynamodb.DynamoDBDocumentClient.from(dynamoDBClient);
exports.handler = async (event) => {
  console.log(event);
  if (!event.body) {
    throw new Error("event.body is not defined");
  }
  const body = JSON.parse(event.body);
  if (!body.pluginPayload.imageKey) {
    throw new Error("name of the file is required");
  }
  const command = new import_doc_dynamodb.UpdateCommand({
    TableName: tableName,
    Key: {
      pk: "filecounter"
    },
    UpdateExpression: "ADD #cnt :val",
    ExpressionAttributeNames: {
      "#cnt": "count"
    },
    ExpressionAttributeValues: {
      ":val": 1
    },
    ReturnValues: "UPDATED_NEW"
  });
  const response = await docClient.send(command);
  console.log(response);
  const nextId = response["Attributes"]["count"];
  await dynamoDBClient.send(
    new import_client_dynamodb.PutItemCommand({
      TableName: tableName,
      Item: {
        pk: { S: nextId.toString() },
        plugin: { S: body.plugin },
        pluginPayload: {
          "M": {
            "organizationId": {
              "S": body.pluginPayload.organizationId
            },
            "objectRecordId": {
              "S": body.pluginPayload.objectRecordId
            },
            "imageKey": {
              "S": body.pluginPayload.imageKey
            }
          }
        }
      }
    })
  );
};
