import mongoose from "mongoose";

const ChatSummarySchema = new mongoose.Schema({
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

  date: {
    type: Date,
    required: true,
  },
});

const ChatSummary = mongoose.model("ChatSummary", ChatSummarySchema);

export default ChatSummary;
