import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '@logitrack/config';
import { client } from '../lib/sqs';
import { OrderUpdateEvent } from '../types/types';

export const publishOrderUpdate = async (event: OrderUpdateEvent): Promise<void> => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: config.sqs.queueUrl,
      MessageBody: JSON.stringify(event),
      MessageGroupId: 'order-updates',
      MessageDeduplicationId: `${event.orderId}-${event.status}-${Date.now()}`
    });

    await client.send(command);
    
    console.log(JSON.stringify({
      level: 'INFO',
      message: 'Order update published to SQS',
      orderId: event.orderId,
      status: event.status
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Failed to publish order update',
      orderId: event.orderId,
      error: error instanceof Error ? error.message : error
    }));
    throw error;
  }
};