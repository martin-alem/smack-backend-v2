import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import UserModel from "./../model/UserModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Logger from "../utils/Logger.js";
import { findOne } from "../service/query.js";

async function authController(req: Request, res: Response, next: NextFunction) {
  try {
    const userResult = await findOne(UserModel, { _id: req.params.userId });
    if (!userResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    sendResponse(res, "success", response_code.NO_CONTENT, null, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default authController;
