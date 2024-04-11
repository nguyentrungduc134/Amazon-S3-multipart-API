# Amazon-S3-multipart-API
## New features

1, Enable API logging for API Gateway stage
2, increase timeout of presigned fuction to 1m
3, increase url timeout to 1 hours
    cdk deploy --context env="randnumber4"  --context urlExpiry="3600" --context functionTimeout="60"
4, enable authorization
5, custom response for 403 (setup by hand)
6, read json formant and save json to dynamdb (alreaddy tested)
7, include cloudfront in cdk
8, return image path in finalize:
{
"imagePath" : "image/path.jpg"
}
