import Logger from "./../utils/Logger.js";
import UserModel from "./../model/UserModel.js";
import mongoose from "mongoose";
import SettingModel from "./../model/SettingModel.js";
import { createNotificationCollection } from "./../model/NotificationModel.js";
import { createFriendCollection } from "../model/FriendModel.js";
import connectToDatabase from "../database/connection.js";
import { SmackUser } from "./../types/interfaces";
import { createMessageCollection } from "../model/MessageModel.js";
import { uniqueCombination } from "../utils/util.js";

export async function newUserTransaction(gUser: { [key: string]: any }): Promise<SmackUser[] | undefined> {
  try {
    const conn = await connectToDatabase();
    const session = await conn.startSession();
    let user: SmackUser[] | undefined;

    await session.withTransaction(async () => {
      user = await UserModel.create([gUser], { session });

      await SettingModel.create(
        [
          {
            userId: user[0]["_id"],
            settings: {
              twoFA: false,
              hideStatus: false,
              hidePicture: false,
              hideReadReceipt: false,
            },
            lastUpdated: Date.now(),
          },
        ],
        { session }
      );

      //making sure the transaction is completed and we have a user
      if (user) {
        const lastName = user[0]["lastName"];
        const notificationCollectionName = `${lastName}_notification`;
        const friendsCollectionName = `${lastName}_friend`;

        createNotificationCollection(notificationCollectionName);
        createFriendCollection(friendsCollectionName);
      }
    });

    session.endSession();
    return user;
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return undefined;
  }
}

export async function handleSentFriendRequest(
  friendInfo: { [key: string]: any },
  userInfo: { [key: string]: any },
  notification: { [key: string]: any },
  friendFriendModel: mongoose.Model<any, {}, {}>,
  userFriendModel: mongoose.Model<any, {}, {}>,
  friendNotificationModel: mongoose.Model<any, {}, {}>
): Promise<boolean | undefined> {
  try {
    const conn = await connectToDatabase();
    const session = await conn.startSession();
    let result = false;

    await session.withTransaction(async () => {
      const result1 = await userFriendModel.create([friendInfo], { session });
      const result2 = await friendFriendModel.create([userInfo], { session });
      const result3 = await friendNotificationModel.create([notification], { session });

      if (result1 && result2 && result3) {
        result = true;
      }
    });
    session.endSession();
    return result;
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return undefined;
  }
}

export async function handleAcceptFriendRequest(
  userId: string,
  friendId: string,
  updateInfo: { [key: string]: any },
  notification: { [key: string]: any },
  friendFriendModel: mongoose.Model<any, {}, {}>,
  userFriendModel: mongoose.Model<any, {}, {}>,
  friendNotificationModel: mongoose.Model<any, {}, {}>,
  userNotificationModel: mongoose.Model<any, {}, {}>,
  userLastName: string,
  friendLastName: string
): Promise<any> {
  try {
    const conn = await connectToDatabase();
    const session = await conn.startSession();
    let result = false;

    await session.withTransaction(async () => {
      const result1 = await userFriendModel.findOneAndUpdate({ friendId: friendId }, updateInfo, { session });
      const result2 = await friendFriendModel.findOneAndUpdate({ friendId: userId }, updateInfo, { session });
      const result3 = await friendNotificationModel.create([notification], { session });
      const result4 = await userNotificationModel.findOneAndDelete({ recipientId: userId, notificationType: "friend_request" }, { session });

      if (result1 && result2 && result3 && result4) {
        const messageCollectionName = `${uniqueCombination(userLastName, friendLastName)}_messages`;
        createMessageCollection(messageCollectionName);
        result = true;
      }
    });
    session.endSession();
    return result;
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return undefined;
  }
}

export async function handleRejectFriendRequest(
  userId: string,
  friendId: string,
  notification: { [key: string]: any },
  friendFriendModel: mongoose.Model<any, {}, {}>,
  userFriendModel: mongoose.Model<any, {}, {}>,
  friendNotificationModel: mongoose.Model<any, {}, {}>,
  userNotificationModel: mongoose.Model<any, {}, {}>
): Promise<any> {
  try {
    const conn = await connectToDatabase();
    const session = await conn.startSession();
    let result = false;

    await session.withTransaction(async () => {
      const result1 = await userFriendModel.findOneAndDelete({ friendId: friendId }, { session });
      const result2 = await friendFriendModel.findOneAndDelete({ friendId: userId }, { session });
      const result3 = await friendNotificationModel.create([notification], { session });
      const result4 = await userNotificationModel.findOneAndDelete({ recipientId: userId, notificationType: "friend_request" }, { session });

      if (result1 && result2 && result3 && result4) {
        result = true;
      }
    });
    session.endSession();
    return result;
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return undefined;
  }
}
