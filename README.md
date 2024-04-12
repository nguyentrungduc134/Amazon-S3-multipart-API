# Amazon-S3-multipart-API  
## Overview    
Amazon Simple Storage Service (Amazon S3) Multipart Upload is a feature that allows you to upload large objects in parts, which can improve reliability, performance, and resumability of uploads. This is particularly useful for objects larger than 100 MB or in cases where network instability might cause issues with uploading the entire object in one go.    
    
## How Multipart Upload Works    
- **Initiate**: You initiate a multipart upload by providing the necessary details such as the bucket name and object key.    
- **Upload Parts**: Upload individual parts of the object, specifying the part number and data for each part. Parts must be between 5 MB and 5 GB, except for the last part which can be smaller.    
- **Complete**: After uploading all parts, you complete the multipart upload. Amazon S3 concatenates the parts into a single object and makes it available in the bucket.    

## Deploy the application    
Prerequisites    
Install and configure [AWS CLI ](https://aws.amazon.com/cli/)     
Install and bootstrap [AWS CDK](https://aws.amazon.com/cdk/)      
Deploy    
Clone this repository to your local computer.    
Ruun "npm install" to install all dependencies. Use "npm audit" to check for known vulnerabilites on the dependent packages.    
Use CDK to deploy the backend to AWS.     
cdk deploy --context env="randnumber4"  --context urlExpiry="3600" --context functionTimeout="60"      
An additional context variable called "urlExpiry" can be used to set specific expiration time on the S3 presigned URL. The default value is set at 300 seconds (5 min). A new S3 bucket with the name "document-upload-bucket-randnumber" is created for storing the uploaded files, and the whitelistip value is used to allow API Gateway access from this IP address only.    
    
An additional context variable called "functionTimeout" can be used to set specific timeout for the AWS Lambda function responsible for generating presigned URLs. With a higher number of parts, timeouts may occur, but it can be extended as needed.    
    
Make note of the API Gateway endpoint URL.    
    
## New Improvements  
  
1, Enable API logging for API Gateway stage  
2, Increase timeout of presigned fuction to 1m by setting --context functionTimeout="60"  
3, Increase url timeout to 1 hour by setting --context urlExpiry="3600"  
##
    cdk deploy --context env="randnumber4"  --context urlExpiry="3600" --context functionTimeout="60"  
4, Enable authorization for API Gateway using lambda authorizer.js  
5, Custom response for 403, 401 authorizer fail setting in API Gateway response setting  
6, Read json format and save json to Dynamodb (initialize.js)  
7, Cloudfront to access S3  
8, return image path in finalize.js:  
{  
"imagePath" : "image/path.jpg"  
}  
  
