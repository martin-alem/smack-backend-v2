import { Request, Response, NextFunction } from "express";
import SettingModel from "../model/SettingModel.js";
import UserModel from "../model/UserModel.js";
import VerificationModel from "../model/VerificationModel.js";
import { findAndUpdate, findOne } from "../service/query.js";
import { config, error_codes, response_code, success_codes } from "../utils/magic.js";
import { computeDateDiff, sendResponse, setCookie } from "../utils/util.js";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { v4 as uuid } from "uuid";

async function enableTFAController(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, device, userId, phoneNumber } = req.body;
    await verifyCode(userId, phoneNumber, code, next);
    if (device === true) {
      await addTrustedDevice(userId, res, next);
      await updateSettings(userId, next);
    } else {
      await updateLastLogin(userId, next);
    }
    sendResponse(res, "success", response_code.SUCCESS, null, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function addTrustedDevice(userId: string, res: Response, next: NextFunction): Promise<void> {
  try {
    const trustedDevice = `device-${uuid()}`;
    setCookie(res, "_trusted_device", trustedDevice, config.DEVICE_EXP);
    const result = await findOne(UserModel, { userId: userId });
    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const twoFA = result.get("twoFA") as { lastLoggedIn: Date; devices: string[] };
    twoFA["devices"].push(trustedDevice);
    const updateResult = await findAndUpdate(UserModel, { userId: userId }, { twoFA: twoFA });
    if (!updateResult) return next(new ErrorHandler("Unable to update trusted devices", response_code.UNAUTHORIZED, error_codes.EUA));
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function updateLastLogin(userId: string, next: NextFunction) {
  try {
    const result = await findOne(UserModel, { userId: userId });
    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const twoFA = result.get("twoFA") as { lastLoggedIn: Date; devices: string[] };
    twoFA["lastLoggedIn"] = new Date();
    const updateResult = await findAndUpdate(UserModel, { userId: userId }, { twoFA: twoFA });
    if (!updateResult) return next(new ErrorHandler("Unable to update last login", response_code.UNAUTHORIZED, error_codes.EUA));
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function updateSettings(userId: string, next: NextFunction): Promise<void> {
  try {
    const settingsResult = await findOne(SettingModel, { userId: userId });
    if (!settingsResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const settings = settingsResult.get("settings") as { twoFA: boolean; hideStatus: boolean; hidePicture: boolean; hideReadReceipt: boolean };
    settings["twoFA"] = true;
    const updateResult = await findAndUpdate(SettingModel, { userId: userId }, { settings: settings });
    if (!updateResult) return next(new ErrorHandler("Unable to update Settings", response_code.UNAUTHORIZED, error_codes.EUA));
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function verifyCode(userId: string, phoneNumber: string, code: string, next: NextFunction): Promise<void> {
  try {
    const result = await findOne(VerificationModel, { userId: userId });
    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const lastUpdated = result.get("lastUpdated", Date) as Date;
    const verificationCode = result.get("verificationCode", String) as string;
    const phone = result.get("phoneNumber", String) as string;
    const diff = computeDateDiff(lastUpdated.toString());
    const diffInMinutes = Math.floor(diff / 60000);
    if (code !== verificationCode) return next(new ErrorHandler("Invalid verification code", response_code.FORBIDDEN, error_codes.EUA));
    if (phone !== phoneNumber) return next(new ErrorHandler("Invalid phoneNumber", response_code.FORBIDDEN, error_codes.EUA));
    if (diffInMinutes > config.V_CODE_EXP) return next(new ErrorHandler(`Code expired: ${diffInMinutes} minutes`, response_code.FORBIDDEN, error_codes.EUA));
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default enableTFAController;
