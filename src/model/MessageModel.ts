import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  recipientId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  messageType: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  media: {
    type: [{ mediaType: { type: String, required: true }, mediaURL: { type: String, required: true } }],
    required: false,
  },

  deletedBy: {
    type: mongoose.Types.ObjectId,
    required: false,
  },

  read: {
    type: Boolean,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
});

export function createMessageCollection(customCollection: string) {
  const Chat = mongoose.model(customCollection, MessageSchema);
  Chat.createCollection();
}

export function getMessageModel(collection: string) {
  return mongoose.model(collection, MessageSchema);
}
