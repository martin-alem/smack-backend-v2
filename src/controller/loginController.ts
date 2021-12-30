import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { GoogleUser, SmackUser } from "./../types/interfaces";
import verify from "../utils/verifyToken.js";
import UserModel from "../model/UserModel.js";
import SettingModel from "../model/SettingModel.js";
import VerificationModel from "../model/VerificationModel.js";
import { findOne, findAndUpdate, insert } from "./../service/query.js";
import { newUserTransaction } from "./../service/transaction.js";
import jwt from "jsonwebtoken";
import { setCookie, computeDateDiffInHours, getCode, sendResponse } from "./../utils/util.js";
import sendSMS from "./../service/sendSMS.js";
import { config, error_codes, response_code, success_codes } from "../utils/magic.js";

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
      sendResponse(res, "success", response_code.SUCCESS, smackUser, success_codes.SLP);
    } else {
      const device = req.cookies["device"];
      if (!device) {
        const lastLoggedIn = smackUser.twoFA.lastLoggedIn.toString();
        const diff = computeDateDiffInHours(lastLoggedIn);
        if (diff <= config.LOGIN_DURATION) {
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
    const JWT_SECRET: string = process.env.JWT_SECRET!;
    const accessToken = jwt.sign({ user_id: newUser[0]["_id"] }, JWT_SECRET, {
      expiresIn: config.JWT_EXP,
    });
    setCookie(res, "_access_token", accessToken);
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
    sendResponse(res, "success", response_code.SUCCESS, smackUser, success_codes.SLP);
  } else {
    const verificationCode = getCode(config.CODE_LENGTH);
    const userPhone = smackUser.phoneNumber;
    const message = `${verificationCode} ${config.V_MSG}. expires in ${config.V_CODE_EXP} minutes.`;
    const smsResult = await sendSMS(userPhone, message);
    if (!smsResult.error && smsResult.status === "success") {
      await createVerificationRecord(smackUser, verificationCode, res, next);
    } else {
      Logger.log("error", new Error("Could not send verification code"), import.meta.url);
      next(new ErrorHandler("Unable to send verification code", response_code.FORBIDDEN, error_codes.EUA));
    }
  }
}

async function createVerificationRecord(smackUser: SmackUser, verificationCode: string, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await findOne(VerificationModel, {
      userId: smackUser._id,
    });
    if (result) {
      //already exists so just update code, number of verifications and lastUpdated
      let newNumberOfVerifications = result.get("numberOfVerifications", Number) as number;
      newNumberOfVerifications += 1;
      const updateResult = await findAndUpdate(VerificationModel, { userId: smackUser._id }, { verificationCode, numberOfVerifications: newNumberOfVerifications, lastUpdated: Date.now() });
      if (updateResult) {
        sendResponse(res, "success", response_code.SUCCESS, null, success_codes.SUD);
      } else {
        Logger.log("error", new Error("Could not create verification record"), import.meta.url);
        next(new ErrorHandler("Unable to create verification record", response_code.FORBIDDEN, error_codes.EUA));
      }
    } else {
      const verificationRecord = {
        userId: smackUser._id,
        phoneNumber: smackUser.phoneNumber,
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

export default loginController;
