import { Response, NextFunction } from "express";
import VerificationModel from "../model/VerificationModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Logger from "../utils/Logger.js";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import { findAndUpdate, findOne, insert } from "./query.js";

async function createVerificationRecord(userId: string, phoneNumber: string, verificationCode: string, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await findOne(VerificationModel, {
      userId: userId,
    });
    if (result) {
      //already exists so just update code, number of verifications and lastUpdated
      let newNumberOfVerifications = result.get("numberOfVerifications", Number) as number;
      newNumberOfVerifications += 1;
      const updateResult = await findAndUpdate(VerificationModel, { userId: userId }, { verificationCode, numberOfVerifications: newNumberOfVerifications, lastUpdated: Date.now() });
      if (updateResult) {
        sendResponse(res, "success", response_code.SUCCESS, null, success_codes.SUD);
      } else {
        Logger.log("error", new Error("Could not create verification record"), import.meta.url);
        next(new ErrorHandler("Unable to create verification record", response_code.FORBIDDEN, error_codes.EUA));
      }
    } else {
      const verificationRecord = {
        userId: userId,
        phoneNumber: phoneNumber,
        verificationCode: verificationCode,
        numberOfVerifications: 1,
        lastUpdated: Date.now(),
      };
      const creatResult = await insert(VerificationModel, verificationRecord);
      if (creatResult) {
        sendResponse(res, "success", response_code.SUCCESS, null, success_codes.SUD);
      } else {
        Logger.log("error", new Error("Could not create verification record"), import.meta.url);
        next(new ErrorHandler("Unable to create verification record", response_code.FORBIDDEN, error_codes.EUA));
      }
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default createVerificationRecord;
