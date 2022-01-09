import { Request, Response, NextFunction } from "express";
import { config, error_codes, response_code} from "../utils/magic.js";
import { getCode} from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import sendSMS from "./../service/sendSMS.js";
import createVerificationRecord from "../service/createVerificationRecord.js";

async function getCodeController(req: Request, res: Response, next: NextFunction) {
  try {
    const phoneNumber = req.params.phone;
    const userId = req.params.userId;
    const code = getCode(6);
    const message = `${code} ${config.V_MSG}. expires in ${config.V_CODE_EXP} minutes.`;
    const smsResult = await sendSMS(phoneNumber, message);
    if (!smsResult.error && smsResult.status === "success") {
      await createVerificationRecord(userId, phoneNumber, code, res, next);
    } else {
      next(new ErrorHandler("Unable to send verification code", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default getCodeController;
