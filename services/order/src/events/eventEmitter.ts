import { EventEmitter } from "events";
import { sendOrderNotification } from "../services/notification.service";

export const appEventEmitter = new EventEmitter();

appEventEmitter.on("orderCreated", async (data) => {
  await sendOrderNotification(data);
});
