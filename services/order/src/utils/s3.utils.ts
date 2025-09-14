import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../lib/s3";

/**
 * Deletes a file from S3.
 * @param bucket - S3 bucket name
 * @param key - File key inside the bucket
 */
export async function deleteFileFromS3(bucket: string, key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    console.log(`File deleted from S3: ${key}`);
  } catch (error) {
    console.error(`Failed to delete file from S3: ${key}`, error);
  }
}
