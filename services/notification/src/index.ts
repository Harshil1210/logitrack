import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { config } from "@logitrack/config";
import { client } from "./lib/sqs";
import { processOrderNotification } from "./services/orderNotificationHandler";

const queueUrl = config.sqs.queueUrl;

async function pullMessage() {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    });
    const response = await client.send(command);

    if (response.Messages && response.Messages.length > 0) {
      for (const message of response.Messages) {
        if (message.Body && message.ReceiptHandle) {
          await processOrderNotification(message.Body, message.ReceiptHandle);
        }
      }
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message: "Failed to pull SQS message",
        error: error instanceof Error ? error.message : error,
      })
    );
  }
}

async function startService() {
  console.log(
    JSON.stringify({
      level: "INFO",
      message: "Starting notification service",
      port: config.ports.notification,
    })
  );

  setInterval(() => {
    pullMessage()
  }, 5000);
}

startService();
