import { SQSClient } from '@aws-sdk/client-sqs';
import { config } from '@logitrack/config';

export const client = new SQSClient({
  region: config.sqs.region,
  credentials: {
    accessKeyId: config.sqs.accessKey,
    secretAccessKey: config.sqs.secretKey,
  },
});