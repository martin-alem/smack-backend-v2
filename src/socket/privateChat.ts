import { Server, Socket } from "socket.io";
import { getMessageModel } from "../model/MessageModel.js";
import { Document } from "mongoose";
import { uniqueCombination } from "../utils/util.js";
import { MessageStatus } from "../types/interfaces.js";

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
      socket.broadcast.to(recipient.userId).emit("incoming_message", { sender, message });
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

    const result: Document[] = await MessageModel.insertMany([message], { ordered: true, rawResult: false });
    if (!result) return false;
    return result[0];
  } catch (error) {
    return false;
  }
}

export default privateChat;
