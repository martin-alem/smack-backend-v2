import { Request, Response, NextFunction } from "express";
import { getMessageModel } from "../model/MessageModel.js";
import UserModel from "../model/UserModel.js";
import getUserLastName from "../service/getUserLastName.js";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse, uniqueCombination } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";

async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, friendId } = req.params;
    const { limit, offset } = req.query;
    const rowLimit = parseInt(limit as string, 10);
    const rowOffset = parseInt(offset as string, 10);
    const userLastName = await getUserLastName(userId, next);
    const friendLastName = await getUserLastName(friendId, next);
    if (!userLastName || !friendLastName) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const messageCollectionName = `${uniqueCombination(userLastName, friendLastName)}_messages`;
    const MessageModel = getMessageModel(messageCollectionName);
    /**
     * Finds all documents
     * The query populates the senderId and recipientId fields with data from the userModel
     * skip and limit parameters are used for pagination
     */
    const result = await MessageModel.find({}, null, { skip: rowOffset, limit: rowLimit, sort: { date: 1 } })
      .populate("senderId", null, UserModel)
      .populate("recipientId", null, UserModel);

    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const totalMessages = await MessageModel.count({});
    const length = result.length;
    const remaining = totalMessages - (rowOffset + length);
    const payload = { length: length, remaining: remaining, limit: rowLimit, offset: rowOffset, result: result };
    sendResponse(res, "success", response_code.SUCCESS, payload, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default logoutController;
