import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";

function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("_access_token", { domain: "localhost" });
    sendResponse(res, "success", response_code.NO_CONTENT, null, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default logoutController;
