import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse} from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import getUserLastName from "../service/getUserLastName.js";
import { getFriendModel } from "../model/FriendModel.js";
import { findOne } from "../service/query.js";

async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const { friendId, userId } = req.params;
    const userLastName = await getUserLastName(userId, next);
    if (!userLastName) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const collectionName = `${userLastName}_friends`;
    const FriendModel = getFriendModel(collectionName);
    const result = await findOne(FriendModel, { friendId: friendId });
    if (!result) return next(new ErrorHandler("No friend found", response_code.NOT_FOUND, error_codes.ENF));
    const status = result.get("status", String) as string;
    sendResponse(res, "success", response_code.SUCCESS, status, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default logoutController;
