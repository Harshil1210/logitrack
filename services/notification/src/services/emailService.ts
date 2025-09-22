import nodemailer from 'nodemailer';
import { config } from '@logitrack/config';
import { OrderUpdateEvent } from '../types/orderEvent';
import { createLogger } from '@logitrack/shared';

const logger = createLogger('notification-service');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const getEmailTemplate = (event: OrderUpdateEvent): { subject: string; html: string } => {
  const { status, orderId, orderDetails } = event;
  
  const templates = {
    confirmed: {
      subject: `Order Confirmed - #${orderId}`,
      html: `<h2>Order Confirmed!</h2><p>Your order #${orderId} has been confirmed.</p><p>Total: $${orderDetails?.totalAmount}</p>`
    },
    shipped: {
      subject: `Order Shipped - #${orderId}`,
      html: `<h2>Order Shipped!</h2><p>Your order #${orderId} is on its way.</p>`
    },
    delivered: {
      subject: `Order Delivered - #${orderId}`,
      html: `<h2>Order Delivered!</h2><p>Your order #${orderId} has been delivered.</p>`
    },
    cancelled: {
      subject: `Order Cancelled - #${orderId}`,
      html: `<h2>Order Cancelled</h2><p>Your order #${orderId} has been cancelled.</p>`
    },
    pending: {
      subject: `Order Received - #${orderId}`,
      html: `<h2>Order Received</h2><p>We've received your order #${orderId}.</p>`
    }
  };

  return templates[status];
};

export const sendOrderNotification = async (event: OrderUpdateEvent): Promise<void> => {
  try {
    const template = getEmailTemplate(event);
    
    await transporter.sendMail({
      from: config.smtp.user,
      to: event.userEmail,
      subject: template.subject,
      html: template.html,
    });

    logger.info('Order notification sent', {
      orderId: event.orderId,
      status: event.status,
      userEmail: event.userEmail,
      subject: template.subject
    });
  } catch (error) {
    logger.error('Failed to send order notification', {
      orderId: event.orderId,
      userEmail: event.userEmail,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};