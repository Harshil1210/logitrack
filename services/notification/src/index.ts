import express from "express";
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { config } from "@logitrack/config";
import { client } from "./lib/sqs";
import { processOrderNotification } from "./services/orderNotificationHandler";
import { createLogger, requestLogger } from "@logitrack/shared";

const logger = createLogger('notification-service');
const app = express();

const port = config.ports.notification;

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
    logger.error('Failed to pull SQS message', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Notification Service",
    version: "1.0.0",
    description: "Handles email notifications via SQS queue processing",
    endpoints: ["/"],
    status: "running",
    queueStatus: "polling"
  });
});

app.use(requestLogger('notification-service'));

async function startService() {
  // Start Express server
  app.listen(port, () => {
    logger.info('Notification Service ready', {
      port,
      url: `http://localhost:${port}`,
      queueUrl: config.sqs.queueUrl
    });
  });

  // Start SQS polling
  logger.info('Starting SQS message polling', { interval: '5s' });
  setInterval(() => {
    pullMessage()
  }, 5000);
}

startService();
