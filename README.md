# Amazon-S3-multipart-API  
## Overview    
Amazon Simple Storage Service (Amazon S3) Multipart Upload is a feature that allows you to upload large objects in parts, which can improve reliability, performance, and resumability of uploads. This is particularly useful for objects larger than 100 MB or in cases where network instability might cause issues with uploading the entire object in one go.    
    
## Workflows  
- **1.** **User**: Send the request to the API Gateway.
- **2.** **Plugin identifier**: Send the request to the initilizer and store it in DynamoDB.
- **3.** **Upload Parts**: Upload individual parts of the object, specifying the part number and data for each part. Parts must be between 5 MB and 5 GB, except for the last part which can be smaller.
- **4. User Access** User request image via Cloudfront
- **5.** **Cloudfront access**: CloudFront serves as the exclusive access point to S3.



  ![api-Page-1 (1)](https://github.com/INFRALESS-IO/cloudconsultantsch-sf-plugins/assets/86754554/4853fc55-179e-49fc-8688-b495fbb2f89f)

  

## Deploy the application    
### Prerequisites    
- Install and configure [AWS CLI ](https://aws.amazon.com/cli/)     
- Install and bootstrap [AWS CDK](https://aws.amazon.com/cdk/)
### Deploy    
- Clone this repository to your local computer.
- Boot strap cdk
##
        npm install -g aws-cdk
        cdk bootstrap
- Run "npm install" to install all dependencies. Use "npm audit" to check for known vulnerabilites on the dependent packages.
##
        npm install
- Use CDK to deploy the backend to AWS. Use a number to avoid bucket name existed env="randnumber4"     
##
        cdk deploy --context env="randnumber4"  --context urlExpiry="3600" --context functionTimeout="60"      
An additional context variable called "urlExpiry" can be used to set specific expiration time on the S3 presigned URL. The default value is set at 300 seconds (5 min). A new S3 bucket with the name "document-upload-bucket-randnumber" is created for storing the uploaded files.    
    
An additional context variable called "functionTimeout" can be used to set specific timeout for the AWS Lambda function responsible for generating presigned URLs. With a higher number of parts, timeouts may occur, but it can be extended as needed.    
    
Make note of the API Gateway endpoint URL.    
    
## New Features  
  
-  Enable API logging for API Gateway stage  
-  Enable authorization for API Gateway using lambda authorizer.js  
-  Custom response for 403, 401 authorizer fail setting in API Gateway response setting  
-  Read json format and save json to Dynamodb (initialize.js)  
- Cloudfront to access S3  
- return image path in finalize.js:  
{  
"imagePath" : "image/path.jpg"  
}  
  
