import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { findAndUpdate } from "../service/query.js";
import { getNotificationModel } from "../model/NotificationModel.js";
import getUserLastName from "../service/getUserLastName.js";

async function updateNotificationController(req: Request, res: Response, next: NextFunction) {
  try {
    const { read, id } = req.body;
    const userLastName = await getUserLastName(req.params.userId, next);
    if (!userLastName) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const collectionName = `${userLastName}_notifications`;
    console.log(collectionName);
    const NotificationModel = getNotificationModel(collectionName);
    const updateResult = await findAndUpdate(NotificationModel, { _id: id }, { read: read });
    if (!updateResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    sendResponse(res, "success", response_code.SUCCESS, updateResult, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default updateNotificationController;
