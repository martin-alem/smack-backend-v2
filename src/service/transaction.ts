import Logger from "./../utils/Logger.js";
import UserModel from "./../model/UserModel.js";
import SettingModel from "./../model/SettingModel.js";
import { createNotificationCollection } from "./../model/NotificationModel.js";
import { createFriendCollection } from "./../model/FriendsCollectionModal.js";
import connectToDatabase from "../database/connection.js";
import { SmackUser } from "./../types/interfaces";

export async function newUserTransaction(gUser: {
  [key: string]: any;
}): Promise<SmackUser[] | undefined> {
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

      const lastName = user[0]["lastName"];
      const notificationCollectionName = `${lastName}_notification`;
      const friendsCollectionName = `${lastName}_friend`;

      createNotificationCollection(notificationCollectionName);
      createFriendCollection(friendsCollectionName);
    });

    session.endSession();
    return user;
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    return undefined;
  }
}
