import { SQSClient } from "@aws-sdk/client-sqs";
import { config } from "@logitrack/config";

const { region, accessKey, secretKey } = config.sqs;

export const client = new SQSClient({
  region: region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});
