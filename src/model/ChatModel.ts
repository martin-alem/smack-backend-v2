import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  picture: {
    type: String,
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

  recipientId: {
    type: mongoose.Types.ObjectId,
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

export function createChatCollection(customCollection: string) {
  const Chat = mongoose.model(customCollection, ChatSchema);
  Chat.createCollection();
}

export function getChatModel(collection: string) {
  return mongoose.model(collection, ChatSchema);
}
