import { Request, Response, NextFunction } from "express";
import { getFriendModel } from "../model/FriendModel.js";
import { getNotificationModel } from "../model/NotificationModel.js";
import getUserLastName from "../service/getUserLastName.js";
import { findOne } from "../service/query.js";
import { handleSentFriendRequest } from "../service/transaction.js";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";

async function sendFriendRequestController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, friendId, userInfo, friendInfo, notification } = req.body;

    const userLastName = await getUserLastName(userId, next);
    const friendLastName = await getUserLastName(friendId, next);
    if (!userLastName || !friendLastName) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const userFriendCollectionName = `${userLastName}_friends`;
    const friendCollectionName = `${friendLastName}_friends`;
    const friendNotificationCollectionName = `${friendLastName}_notifications`;
    const UserFriendModel = getFriendModel(userFriendCollectionName);
    const FriendFriendModel = getFriendModel(friendCollectionName);
    const FriendNotificationModel = getNotificationModel(friendNotificationCollectionName);
    const friendExist = await findOne(UserFriendModel, { friendId: friendId });
    if (friendExist) return next(new ErrorHandler("Friend already exists", response_code.BAD_REQUEST, error_codes.EBR));
    const transactionResult = await handleSentFriendRequest(friendInfo, userInfo, notification, FriendFriendModel, UserFriendModel, FriendNotificationModel, userLastName, friendLastName);
    if (!transactionResult) return next(new ErrorHandler("Unable to send friend request", response_code.BAD_REQUEST, error_codes.EBR));
    sendResponse(res, "success", response_code.CREATED, transactionResult, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default sendFriendRequestController;
