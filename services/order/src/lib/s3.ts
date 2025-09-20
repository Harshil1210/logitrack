import {
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "@logitrack/config";

const { region, accessKey, secretKey, bucketName } = config.s3;

export const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

export async function createPublicBucket() {
  try {
    // Step 1: Create the bucket
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
      })
    );
    console.log("✅ Bucket created:", bucketName);

    // Step 2: Disable block public access settings
    await s3Client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    );
    console.log("✅ Disabled Block Public Access settings");

    // Step 3: Set public-read bucket policy
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
    console.log("✅ Public-read policy applied");

    return bucketName;
  } catch (error) {
    console.error("❌ Error creating bucket or setting policy:", error);
  }
}
