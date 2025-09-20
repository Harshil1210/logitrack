import { DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { client } from '../lib/sqs';
import { config } from '@logitrack/config';
import { OrderUpdateEvent } from '../types/orderEvent';
import { sendOrderNotification } from './emailService';

export const processOrderNotification = async (messageBody: string, receiptHandle: string): Promise<void> => {
  try {
    const event: OrderUpdateEvent = JSON.parse(messageBody);
    
    if (!event.orderId || !event.userEmail || !event.status) {
      throw new Error('Invalid order event format');
    }

    await sendOrderNotification(event);

    await client.send(new DeleteMessageCommand({
      QueueUrl: config.sqs.queueUrl,
      ReceiptHandle: receiptHandle
    }));

    console.log(JSON.stringify({
      level: 'INFO',
      message: 'Order notification processed successfully',
      orderId: event.orderId
    }));

  } catch (error) {
    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Failed to process order notification',
      error: error instanceof Error ? error.message : error,
      messageBody
    }));
    throw error;
  }
};