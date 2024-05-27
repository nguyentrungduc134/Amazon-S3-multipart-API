const aws = require("@aws-sdk/client-lambda");
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
const BUCKET_NAME = process.env['BUCKET_NAME'];
const TABLE_NAME = process.env['TABLE_NAME'];
const INIT_LAMBDA = process.env['INIT_LAMBDA'];
const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
exports.handler = async (event) => {
  console.log(event);
  if (!event.body) {
    throw new Error("event.body is not defined");
  }
  const body = JSON.parse(event.body);
  if (!body.pluginPayload.imageKey) {
    throw new Error("name of the file is required");
  }
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
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
    new PutItemCommand({
      TableName: TABLE_NAME,
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
  if (body.plugin === "upload-s3") {
  const lambda = new aws.LambdaClient();
  const params = {
    FunctionName: INIT_LAMBDA,
    // Name of the target Lambda function
    InvocationType: "RequestResponse",
    // Invokes synchronously (waits for the response)
    Payload: JSON.stringify(event)
    // Input data to be passed to the target Lambda function
  };
  try {
    const response2 = await lambda.send(new aws.InvokeCommand(params));
    const responseBody = JSON.parse(Buffer.from(response2.Payload).toString('utf-8'));
    return {
     body: JSON.stringify(responseBody.body),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error invoking Lambda function" })
    };
  }
  }	  
};

