import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { GoogleUser, SmackUser } from "./../types/interfaces";
import verify from "../utils/verifyToken.js";
import UserModel from "../model/UserModel.js";
import SettingModel from "../model/SettingModel.js";
import { findOne } from "./../service/query.js";
import { newUserTransaction } from "./../service/transaction.js";
import jwt from "jsonwebtoken";
import { setCookie, computeDateDiff, getCode, sendResponse } from "./../utils/util.js";
import sendSMS from "./../service/sendSMS.js";
import { config, error_codes, response_code, success_codes } from "../utils/magic.js";
import createVerificationRecord from "../service/createVerificationRecord.js";

async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const bearerToken = req.headers["authorization"];

    if (!bearerToken) return next(new ErrorHandler("No authorization token found", response_code.BAD_REQUEST, error_codes.EBR));

    const tokenId = bearerToken.split(" ")[1];
    const googleUser: GoogleUser | undefined = await verify(tokenId);
    if (!googleUser) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));

    const findUserResult = await findOne(UserModel, {
      email: googleUser.email,
    });

    if (findUserResult) {
      const smackUser = {
        _id: findUserResult.get("_id", String) as string,
        firstName: findUserResult.get("firstName", String) as string,
        lastName: findUserResult.get("lastName", String) as string,
        email: findUserResult.get("email", String) as string,
        phoneNumber: findUserResult.get("phoneNumber", String) as string,
        story: findUserResult.get("story", String) as string,
        picture: findUserResult.get("picture", String) as string,
        twoFA: findUserResult.get("twoFA") as {
          lastLoggedIn: Date;
          devices: string[];
        },
        dateJoined: findUserResult.get("dateJoined", Date) as Date,
      };
      await handleExistingUser(smackUser, req, res, next);
    } else {
      await handleNewUser(googleUser, res, next);
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

async function handleExistingUser(smackUser: SmackUser, req: Request, res: Response, next: NextFunction): Promise<void> {
  //check the user settings
  const userId = smackUser._id;
  const findSettingResult = await findOne(SettingModel, {
    userId: userId,
  });
  if (findSettingResult) {
    const is2FA = findSettingResult.get("settings")["twoFA"] as boolean;
    if (!is2FA) {
      const accessToken = generateAccessToken(userId);
      setCookie(res, "_access_token", accessToken, config.COOKIE_EXP);
      sendResponse(res, "success", response_code.SUCCESS, smackUser, success_codes.SLP);
    } else {
      const device = req.cookies["_trusted_device"];
      if (!device) {
        const lastLoggedIn = smackUser.twoFA.lastLoggedIn.toString();
        const diff = computeDateDiff(lastLoggedIn);
        const diffInHours = Math.floor(diff / 3.6e6);
        if (diffInHours <= config.LOGIN_DURATION) {
          const accessToken = generateAccessToken(userId);
          setCookie(res, "_access_token", accessToken, config.COOKIE_EXP);
          sendResponse(res, "success", response_code.SUCCESS, smackUser, success_codes.SLP);
          return;
        }
      }
      await handleTrustedDevice(smackUser, device, res, next);
    }
  } else {
    Logger.log("error", new Error("Could not find user setting"), import.meta.url);
    next(new ErrorHandler("Unable to find settings", response_code.FORBIDDEN, error_codes.EUA));
  }
  return;
}

async function handleNewUser(googleUser: GoogleUser, res: Response, next: NextFunction): Promise<void> {
  const user = {
    firstName: googleUser.firstName,
    lastName: googleUser.lastName,
    email: googleUser.email,
    phoneNumber: "",
    picture: googleUser.picture,
    dateJoined: Date.now(),
  };
  const newUser = await newUserTransaction(user);

  if (newUser) {
    const accessToken = generateAccessToken(newUser[0]["_id"]);
    setCookie(res, "_access_token", accessToken, config.COOKIE_EXP);
    sendResponse(res, "success", response_code.CREATED, newUser[0], success_codes.SLP);
  } else {
    Logger.log("Internal server error", new Error("Could not create new user"), import.meta.url);
    next(new ErrorHandler("Unable to create new user", response_code.FORBIDDEN, error_codes.EUA));
  }
  return;
}

async function handleTrustedDevice(smackUser: SmackUser, device: string, res: Response, next: NextFunction): Promise<void> {
  const userDevices = smackUser.twoFA.devices;
  if (userDevices.includes(device)) {
    const accessToken = generateAccessToken(smackUser._id);
    setCookie(res, "_access_token", accessToken, config.COOKIE_EXP);
    sendResponse(res, "success", response_code.SUCCESS, smackUser, success_codes.SLP);
  } else {
    const verificationCode = getCode(config.CODE_LENGTH);
    const userPhone = smackUser.phoneNumber;
    const message = `${verificationCode} ${config.V_MSG}. expires in ${config.V_CODE_EXP} minutes.`;
    const smsResult = await sendSMS(userPhone, message);
    if (!smsResult.error && smsResult.status === "success") {
      await createVerificationRecord(smackUser._id, userPhone, verificationCode, res, next);
    } else {
      Logger.log("error", new Error("Could not send verification code"), import.meta.url);
      next(new ErrorHandler("Unable to send verification code", response_code.FORBIDDEN, error_codes.EUA));
    }
  }
}

function generateAccessToken(userId: string): string {
  const JWT_SECRET: string = process.env.JWT_SECRET!;
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: config.JWT_EXP,
  });
  return accessToken;
}

export default loginController;
