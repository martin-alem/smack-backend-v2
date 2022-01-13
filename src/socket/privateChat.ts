import { Server, Socket } from "socket.io";
import { getMessageModel } from "../model/MessageModel.js";
import { Document } from "mongoose";
import { uniqueCombination } from "../utils/util.js";
import { MessageStatus } from "../types/interfaces.js";
import UserModel from "../model/UserModel.js";
import ChatSummary from "../model/ChatSummary.js";

function privateChat(io: Server, socket: Socket) {
  socket.on("message", async payload => {
    const { recipient, sender, message } = payload;
    const messagePayload = {
      senderId: sender.userId,
      recipientId: recipient.userId,
      messageType: message.type,
      text: message.text,
      media: message.media,
      read: false,
      status: MessageStatus.TBD,
      date: new Date(),
    };
    const messageSaved = await saveMessage(sender.lastName, recipient.lastName, messagePayload);
    if (messageSaved) {
      socket.broadcast.to(recipient.userId).emit("incoming_message", messageSaved);
      io.to(sender.userId).emit("send_response", messageSaved);
    } else {
      io.to(sender.userId).emit("send_error", { status: fail, error: "could not send message" });
    }
  });
}

async function saveMessage(senderLastName: string, recipientLastName: string, payload: { [key: string]: any }): Promise<boolean | Document> {
  try {
    const messageCollectionName = `${uniqueCombination(senderLastName, recipientLastName)}_messages`;
    const MessageModel = getMessageModel(messageCollectionName);
    const message = {
      senderId: payload.senderId,
      recipientId: payload.recipientId,
      messageType: payload.messageType,
      text: payload.text,
      media: payload.media,
      read: payload.read,
      status: payload.status,
      date: payload.date,
    };

    /**
     * Wrapping this queries into a transaction will be a good idea.
     */
    const result: Document[] = await MessageModel.insertMany([message], { ordered: true, rawResult: false });
    if (!result.length) return false;
    const messageId = result[0]._id;
    const result2 = await MessageModel.find({ _id: messageId }).populate("senderId", null, UserModel).populate("recipientId", null, UserModel);
    if (!result2.length) return false;
    const lastMessage = {
      senderId: result2[0].senderId._id,
      recipientId: result2[0].recipientId._id,
      messageType: result2[0].messageType,
      text: result2[0].text,
      date: result2[0].date,
    };
    const result3 = await updateLastMessage(lastMessage, payload.senderId, payload.recipientId);
    if (!result3) return false;
    return result2[0];
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function updateLastMessage(payload: { [key: string]: any }, senderId: string, recipientId: string): Promise<boolean> {
  try {
    const findResult = await ChatSummary.find({ $and: [{ $or: [{ senderId: senderId }, { senderId: recipientId }] }, { $or: [{ recipientId: recipientId }, { recipientId: senderId }] }] }, null);
    if (!findResult.length) {
      const insertResult: Document[] = await ChatSummary.insertMany([payload], { ordered: true, rawResult: false });
      if (!insertResult) return false;
    } else {
      const updateResult = await ChatSummary.findOneAndUpdate(
        { $and: [{ $or: [{ senderId: senderId }, { senderId: recipientId }] }, { $or: [{ recipientId: recipientId }, { recipientId: senderId }] }] },
        payload
      );
      if (!updateResult) return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export default privateChat;
