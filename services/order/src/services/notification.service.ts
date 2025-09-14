import { config } from "@logitrack/config";

const NOTIFICATION_URL = config.services.notification;

export const sendOrderNotification = async (data: any): Promise<void> => {
  try {
    if (!NOTIFICATION_URL) {
      throw new Error("Notification service URL is not defined in env");
    }

    const response = await fetch(`${NOTIFICATION_URL}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: data.userEmail,
        subject: `Order ${data.status}`,
        body: `Hello, your order has been ${data.status} successfully.`,
        status: data.status,
        orderId: data.orderId,
      }),
    }).then((res) => res.json());

    console.log(
      `✅ Order ${data.status} notification sent to ${data.userEmail}`,
      response
    );
  } catch (error) {
    console.error(
      `❌ Failed to send order ${data.status} notification:`,
      error
    );
  }
};
