import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import UserModel from "./../model/UserModel.js";
import SettingModel from "../model/SettingModel.js";
import { findAndUpdate } from "../service/query.js";

async function updateSettingController(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, settings } = req.body;
    if (user) {
      const updateResult = await findAndUpdate(UserModel, { _id: req.params.userId }, user);
      if (!updateResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    }
    if (settings) {
      const updateResult = await findAndUpdate(SettingModel, { userId: req.params.userId }, { settings: settings });
      if (!updateResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    }
    sendResponse(res, "success", response_code.SUCCESS, { user, settings }, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default updateSettingController;
