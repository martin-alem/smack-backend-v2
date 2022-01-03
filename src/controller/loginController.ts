import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { GoogleUser, SmackUser } from "./../types/interfaces";
import verify from "../utils/verifyToken.js";
import UserModel from "../model/UserModel.js";
import { findOne } from "./../service/query.js";
import { newUserTransaction } from "./../service/transaction.js";
import jwt from "jsonwebtoken";
import { setCookie,sendResponse } from "./../utils/util.js";
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
  const userId = smackUser._id;
  const accessToken = generateAccessToken(userId);
  setCookie(res, "_access_token", accessToken, config.COOKIE_EXP);
  sendResponse( res, "success", response_code.SUCCESS, smackUser, success_codes.SLP );
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

function generateAccessToken(userId: string): string {
  const JWT_SECRET: string = process.env.JWT_SECRET!;
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: config.JWT_EXP,
  });
  return accessToken;
}

export default loginController;
