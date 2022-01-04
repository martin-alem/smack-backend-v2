import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Logger from "../utils/Logger.js";
import { findAll, findOne } from "../service/query.js";
import UserModel from "../model/UserModel.js";
import { getNotificationModel } from "../model/NotificationModel.js";

async function notificationController(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, offset } = req.query;
    const { userId } = req.params;
    const rowLimit = parseInt(limit as string, 10);
    const rowOffset = parseInt(offset as string, 10);
    const userLastName = await getUserLastName(userId, next);
    if (typeof userLastName !== "string") return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const collectionName = `${userLastName.toLowerCase()}_notifications`;
    const NotificationModel = getNotificationModel(collectionName);
    const result = await findAll(NotificationModel, [{}], null, { skip: rowOffset, limit: rowLimit });
    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const totalNotification = await NotificationModel.count({});
    const length = result.length;
    const remaining = totalNotification - (rowOffset + length);
    const payload = { length: length, remaining: remaining, limit: rowLimit, offset: rowOffset, result: result };
    sendResponse(res, "success", response_code.SUCCESS, payload, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function getUserLastName(userId: string, next: NextFunction): Promise<string | void> {
  try {
    const userResult = await findOne(UserModel, { _id: userId });
    if (!userResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const lastName = userResult.get("lastName", String) as string;
    return lastName;
  } catch (error) {
    throw new Error("Internal server error");
  }
}

export default notificationController;
