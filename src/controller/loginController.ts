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
import { setCookie, computeDateDiffInHours, getCode } from "./../utils/util.js";

import sendSMS from "./../service/sendSMS.js";

async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const bearerToken = req.headers["authorization"];

    if (bearerToken) {
      const tokenId = bearerToken.split(" ")[1];
      const googleUser: GoogleUser | undefined = await verify(tokenId);
      if (googleUser) {
        const findUserResult = await findOne(UserModel, { email: googleUser.email });
        if (findUserResult) {
          //already exist
          const smackUser = {
            _id: findUserResult.get("_id", String) as string,
            firstName: findUserResult.get("firstName", String) as string,
            lastName: findUserResult.get("lastName", String) as string,
            email: findUserResult.get("email", String) as string,
            phoneNumber: findUserResult.get("phoneNumber", String) as string,
            story: findUserResult.get("story", String) as string,
            picture: findUserResult.get("picture", String) as string,
            twoFA: findUserResult.get("twoFA") as { lastLoggedIn: Date; devices: string[] },
            dateJoined: findUserResult.get("dateJoined", Date) as Date,
          };
          await handleExistingUser(smackUser, req, res);
        } else {
          //create new user
          await handleNewUser(googleUser, res);
        }
      } else {
        next(new ErrorHandler("Unauthorized user", 403));
      }
    } else {
      next(new ErrorHandler("No authorization token found", 403));
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", 500));
  }
}

async function handleExistingUser(smackUser: SmackUser, req: Request, res: Response): Promise<void> {
  //check the user settings
  const userId = smackUser._id;
  const findSettingResult = await findOne(SettingModel, { userId: userId });
  if (findSettingResult) {
    const is2FA = findSettingResult.get("settings")["twoFA"] as boolean;
    if (!is2FA) {
      res.status(200).json({ status: "success", statusCode: 200, smackUser });
    } else {
      const device = req.cookies["device"];
      if (device) {
        await handleTrustedDevice(smackUser, device, res);
      } else {
        const lastLoggedIn = smackUser.twoFA.lastLoggedIn.toString();
        const diff = computeDateDiffInHours(lastLoggedIn);
        if (diff <= 2) {
          res.status(200).json({ status: "success", statusCode: 200, smackUser });
        } else {
          await handleTrustedDevice(smackUser, "", res);
        }
      }
    }
  } else {
    Logger.log("error", new Error("Could not find user setting"), import.meta.url);
    res.status(400).json({ status: "fail", statusCode: 400, message: "Unable to find settings" });
  }
  return;
}

async function handleNewUser(googleUser: GoogleUser, res: Response): Promise<void> {
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
    const accessToken = jwt.sign({ user_id: newUser[0]["_id"] }, JWT_SECRET, { expiresIn: "1h" });
    setCookie(res, "_access_token", accessToken);
    res.status(201).json({ status: "success", statusCode: 201, smackUser: newUser[0] });
  } else {
    Logger.log("Internal server error", new Error("Could not create new user"), import.meta.url);
    res.status(400).json({ status: "fail", statusCode: 400, message: "Unable to create new user" });
  }
  return;
}

async function handleTrustedDevice(smackUser: SmackUser, device: string, res: Response): Promise<void> {
  const userDevices = smackUser.twoFA.devices;
  if (userDevices.includes(device)) {
    res.status(200).json({ status: "success", statusCode: 200, smackUser });
  } else {
    //send a text message with verification code
    //create a record in verification collection
    const verificationCode = getCode(6);
    const userPhone = smackUser.phoneNumber;
    const smsResult = await sendSMS(userPhone, verificationCode);
    if (!smsResult.error && smsResult.status === "success") {
      await createVerificationRecord(smackUser, verificationCode, res);
    } else {
      Logger.log("error", new Error("Could not send verification code"), import.meta.url);
      res.status(400).json({ status: "fail", statusCode: 400, message: "Unable to send verification code" });
    }
  }
}

async function createVerificationRecord(smackUser: SmackUser, verificationCode: string, res: Response): Promise<void> {
  try {
    const result = await findOne(VerificationModel, { userId: smackUser._id });
    if (result) {
      //already exists so just update code, number of verifications and lastUpdated
      let newNumberOfVerifications = result.get("numberOfVerification", Number) as number;
      newNumberOfVerifications += 1;
      const updateResult = await findAndUpdate(VerificationModel, { userId: smackUser._id }, { verificationCode, numberOfVerification: newNumberOfVerifications, lastUpdated: Date.now() });
      if (updateResult) {
        res.status(204).json({ status: "success", statusCode: 204, message: "Unauthorized device" });
      } else {
        Logger.log("error", new Error("Could not create verification record"), import.meta.url);
        res.status(400).json({ status: "fail", statusCode: 400, message: "Unable to create verification record" });
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
        res.status(204).json({ status: "success", statusCode: 204, message: "Unauthorized device" });
      } else {
        Logger.log("error", new Error("Could not create verification record"), import.meta.url);
        res.status(400).json({ status: "fail", statusCode: 400, message: "Unable to create verification record" });
      }
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    res.status(500).json({ status: "fail", statusCode: 500, message: "Internal server error" });
  }
}

export default loginController;
