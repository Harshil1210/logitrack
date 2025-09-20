import { SQSClient } from '@aws-sdk/client-sqs';
import { config } from '@logitrack/config';

export const client = new SQSClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretKey,
  },
});