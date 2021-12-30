import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import SettingModel from "./../model/SettingModel.js";
import { findOne } from "../service/query.js";

async function settingController(req: Request, res: Response, next: NextFunction) {
  try {
    const settingResult = await findOne(SettingModel, { userId: req.params.userId });
    if (!settingResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    sendResponse(res, "success", response_code.SUCCESS, settingResult, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default settingController;
