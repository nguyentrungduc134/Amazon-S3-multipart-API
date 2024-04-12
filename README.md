# Amazon-S3-multipart-API  
## Overview    
Amazon Simple Storage Service (Amazon S3) Multipart Upload is a feature that allows you to upload large objects in parts, which can improve reliability, performance, and resumability of uploads. This is particularly useful for objects larger than 100 MB or in cases where network instability might cause issues with uploading the entire object in one go.    
    
## How Multipart Upload Works    
- **Initiate**: You initiate a multipart upload by providing the necessary details such as the bucket name and object key.    
**Upload Parts**: Upload individual parts of the object, specifying the part number and data for each part. Parts must be between 5 MB and 5 GB, except for the last part which can be smaller.    
**Complete**: After uploading all parts, you complete the multipart upload. Amazon S3 concatenates the parts into a single object and makes it available in the bucket.    
**Abort**: If needed, you can abort a multipart upload at any time before completing it, freeing up any storage resources associated with the incomplete upload.    
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
  
