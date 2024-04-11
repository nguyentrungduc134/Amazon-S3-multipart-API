# Amazon-S3-multipart-API  
## New Improvements  
  
1, Enable API logging for API Gateway stage  
2, Increase timeout of presigned fuction to 1m by setting --context functionTimeout="60"
3, Increase url timeout to 1 hours by setting --context urlExpiry="3600"
##
    cdk deploy --context env="randnumber4"  --context urlExpiry="3600" --context functionTimeout="60"  
4, Enable authorization for API Gateway using lambda authorizer.js
5, Custom response for 403, 401 authorizer fail setting in API Gateway response setting
6, read json formant and save json to dynamdb (alreaddy tested)  
7, include cloudfront in cdk  
8, return image path in finalize:  
{  
"imagePath" : "image/path.jpg"  
}  
  
