import { Request, Response, NextFunction } from "express";
import { getFriendModel } from "../model/FriendModel.js";
import { getNotificationModel } from "../model/NotificationModel.js";
import getUserLastName from "../service/getUserLastName.js";
import { findOne } from "../service/query.js";
import { handleAcceptFriendRequest } from "../service/transaction.js";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Logger from "../utils/Logger.js";

async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, friendId, updateInfo, notification } = req.body;
    const userLastName = await getUserLastName(userId, next);
    const friendLastName = await getUserLastName(friendId, next);
    if (!userLastName || !friendLastName) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const userFriendCollectionName = `${userLastName}_friends`;
    const friendCollectionName = `${friendLastName}_friends`;
    const friendNotificationCollectionName = `${friendLastName}_notifications`;
    const userNotificationCollectionName = `${userLastName}_notifications`;
    const UserFriendModel = getFriendModel(userFriendCollectionName);
    const FriendFriendModel = getFriendModel(friendCollectionName);
    const FriendNotificationModel = getNotificationModel(friendNotificationCollectionName);
    const UserNotificationModel = getNotificationModel(userNotificationCollectionName);
    const friendExistInUser = await findOne(UserFriendModel, { friendId: friendId, status: "pending" });
    const userExistInFriend = await findOne(FriendFriendModel, { userId: userId, status: "sent" });
    if (!friendExistInUser || !userExistInFriend) return next(new ErrorHandler("Unable to find potential friend", response_code.NOT_FOUND, error_codes.EBR));
    const transactionResult = await handleAcceptFriendRequest(userId, friendId, updateInfo, notification, FriendFriendModel, UserFriendModel, FriendNotificationModel, UserNotificationModel, userLastName, friendLastName);
    if (!transactionResult) return next(new ErrorHandler("Unable to accept friend request", response_code.BAD_REQUEST, error_codes.EBR));
    sendResponse(res, "success", response_code.CREATED, transactionResult, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default logoutController;
