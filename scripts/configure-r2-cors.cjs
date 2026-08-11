require('dotenv').config()
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')
const client=new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY}})
client.send(new PutBucketCorsCommand({Bucket:process.env.R2_BUCKET_NAME,CORSConfiguration:{CORSRules:[{AllowedOrigins:['https://colombiaresponde.kitotsu.dev','https://colombia-responde-web.pages.dev','http://localhost:5173'],AllowedMethods:['GET','PUT','HEAD'],AllowedHeaders:['*'],ExposeHeaders:['ETag'],MaxAgeSeconds:3600}]}})).then(()=>console.log('CORS de R2 configurado')).catch(error=>{console.error(error.message);process.exit(1)})
