import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  recipientId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  read: {
    type: Boolean,
    required: true,
  },

  body: {
    type: String,
    required: true,
  },

  notificationType: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
});

export function createNotificationCollection(customCollection: string) {
  const Notification = mongoose.model(customCollection, NotificationSchema);
  Notification.createCollection();
}

export function getNotificationModel(collection: string) {
  return mongoose.model(collection, NotificationSchema);
}
