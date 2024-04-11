import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam"
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';

export class MultipartS3UploadStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = cdk.Stack.of(this).node.tryGetContext('env');
    const expires = cdk.Stack.of(this).node.tryGetContext('urlExpiry') ?? '300';
    const timeout = Number(cdk.Stack.of(this).node.tryGetContext('functionTimeout') ?? '3');

    const filesTable = new cdk.aws_dynamodb.Table(this, 'Files', {
      partitionKey: { name: 'pk', type: cdk.aws_dynamodb.AttributeType.STRING },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    const s3Bucket = new s3.Bucket(this, "document-upload-bucket", {
      bucketName: `document-client-upload-${env}`,
      lifecycleRules: [{
        expiration: cdk.Duration.days(10),
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
      }],
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      transferAcceleration: true,
      cors: [{
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
        ],
        exposedHeaders: ['ETag'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    s3Bucket.grantRead(oai);

    const backendCloudfront = new cloudfront.CloudFrontWebDistribution(this, 'BackendCF', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: s3Bucket,
            originAccessIdentity: oai,
          },
          behaviors: [{isDefaultBehavior: true}, { pathPattern: '/*', allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD }]
        },
      ],
    });
    const whitelistedIps = [cdk.Stack.of(this).node.tryGetContext('whitelistip')]

    const apiResourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['execute-api:Invoke'],
          principals: [new iam.AnyPrincipal()],
          resources: ['execute-api:/*/*/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          principals: [new iam.AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['execute-api:/*/*/*'],
          conditions: {
            'NotIpAddress': {
              "aws:SourceIp": whitelistedIps
            }
          }
        })
      ]
    })

    const apiGateway = new apigw.RestApi(this, 'multi-part-upload-api', {
      description: 'API for multipart s3 upload',
      restApiName: 'multi-part-upload-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,                
      },
      policy: apiResourcePolicy,
      cloudWatchRole: true,
      deployOptions: {
           loggingLevel: apigw.MethodLoggingLevel.INFO,
           metricsEnabled: true,
      }      
    });
    apiGateway.addGatewayResponse('authorized_fail', {
      type: apigw.ResponseType.AUTHORIZER_FAILURE,
      statusCode: '403',
      templates: {
        'application/json': '{ "message": $context.error.messageString, "statusCode": "403", "type": "$context.error.responseType" }'
      }
    });
    apiGateway.addGatewayResponse('unauthorized', {
      type: apigw.ResponseType.UNAUTHORIZED,
      statusCode: '401',
      templates: {
        'application/json': '{ "message": $context.error.messageString, "statusCode": "401", "type": "$context.error.responseType" }'
      }
    });


    const commonNodeJsProps = {
      bundling: {
        externalModules: [
          '@aws-sdk/client-s3',
          '@aws-sdk/s3-request-presigner',
	  '@aws-sdk/client-dynamodb',
	  '@aws-sdk/lib-dynamodb',
        ],
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const authLambda = new NodejsFunction(this, 'auth-lambda', {
      entry: join(__dirname, '../lambda/authorizer.js'),
      runtime: Runtime.NODEJS_18_X,
    });
    const initializeLambda = new NodejsFunction(this, 'initializeHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/initialize.js'),
      environment: {
        TABLE_NAME: filesTable.tableName,      
        BUCKET_NAME: s3Bucket.bucketName
      },
      functionName: `multipart-upload-initialize-${env}`
    });
    filesTable.grantReadWriteData(initializeLambda);
    const getPreSignedUrlsLambda = new NodejsFunction(this, 'getPreSignedUrlsHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/getPreSignedUrls.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
        URL_EXPIRES: expires
      },
      functionName: `multipart-upload-getPreSignedUrls-${env}`,
      timeout: cdk.Duration.seconds(timeout)
    });
    const getPreSignedTAUrlsLambda = new NodejsFunction(this, 'getPreSignedTAUrlsHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/getPreSignedTAUrls.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
        URL_EXPIRES: expires
      },
      functionName: `multipart-upload-getPreSignedTAUrls-${env}`,
      timeout: cdk.Duration.seconds(timeout)
    });
    const finalizeLambda = new NodejsFunction(this, 'finalizeHandler', {
      ...commonNodeJsProps,
      entry: join(__dirname, '../lambda/finalize.js'),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName
      },
      functionName: `multipart-upload-finalize-${env}`
    });

    s3Bucket.grantReadWrite(initializeLambda);
    s3Bucket.grantReadWrite(getPreSignedUrlsLambda);
    s3Bucket.grantReadWrite(getPreSignedTAUrlsLambda);
    s3Bucket.grantReadWrite(finalizeLambda);
    const authorizer = new apigw.TokenAuthorizer(this, 'initialize-token-authorizer', {
      handler: authLambda,
      identitySource: apigw.IdentitySource.header('Authorization'),
      resultsCacheTtl: cdk.Duration.seconds(300),
    });
    apiGateway.root.addResource('initialize').addMethod('POST', new apigw.LambdaIntegration(initializeLambda), { authorizer: authorizer, authorizationType: apigw.AuthorizationType.CUSTOM, });
    apiGateway.root.addResource('getPreSignedUrls').addMethod('POST', new apigw.LambdaIntegration(getPreSignedUrlsLambda));
    apiGateway.root.addResource('getPreSignedTAUrls').addMethod('POST', new apigw.LambdaIntegration(getPreSignedTAUrlsLambda));
    apiGateway.root.addResource('finalize').addMethod('POST', new apigw.LambdaIntegration(finalizeLambda));

    apiGateway.addUsagePlan('usage-plan', {
      name: 'consumerA-multi-part-upload-plan',
      description: 'usage plan for consumerA',
      apiStages: [{
        api: apiGateway,
        stage: apiGateway.deploymentStage,
      }],
      throttle: {
        rateLimit: 100,
        burstLimit: 200
      },
    });
/*   const template = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: 'cloudfront.yaml',
        parameters: {
        'S3BucketName': s3Bucket.bucketName,
         },
    }); */    
  }
}
