import { Request, Response, NextFunction } from "express";
import ChatSummary from "../model/ChatSummary.js";
import UserModel from "../model/UserModel.js";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";

async function chatController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query;
    const rowLimit = parseInt(limit as string, 10);
    const rowOffset = parseInt(offset as string, 10);

    /**
     * Finds all documents where userId is either senderId or recipientId
     * The query populates this fields with data from the userModel
     * skip and limit parameters are used for pagination
     */
    const result = await ChatSummary.find({ $or: [{ senderId: userId }, { recipientId: userId }] }, null, { skip: rowOffset, limit: rowLimit })
      .populate("senderId", null, UserModel)
      .populate("recipientId", null, UserModel);

    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const totalChats = await ChatSummary.count({});
    const length = result.length;
    const remaining = totalChats - (rowOffset + length);
    const payload = { length: length, remaining: remaining, limit: rowLimit, offset: rowOffset, result: result };
    sendResponse(res, "success", response_code.SUCCESS, payload, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default chatController;
