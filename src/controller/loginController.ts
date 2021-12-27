import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import { GoogleUser } from "./../types/interfaces";
import verify from "../utils/verifyToken.js";
import UserModel from "../model/UserModel.js";
import { findOne } from "./../service/query.js";
import { newUserTransaction } from "./../service/transaction.js";
import jwt from "jsonwebtoken";

async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const bearerToken = req.headers["authorization"];

    if (bearerToken) {
      const tokenId = bearerToken.split(" ")[1];
      const googleUser: GoogleUser | undefined = await verify(tokenId);
      if (googleUser) {
        const result = await findOne(UserModel, { email: googleUser.email });
        if (result) {
          //already exist
          res.status(200).json({ status: "success", statusCode: 200, message: result });
        } else {
          //create new user
          const insertResult = await handleNewUser(googleUser, res);
          if (insertResult) {
            res.status(201).json({ status: "success", statusCode: 201, message: insertResult[0] });
          } else {
            next(new ErrorHandler("Unable to create user", 403));
          }
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

async function handleExistingUser(
  googleUser: GoogleUser,
  req: Request,
  res: Response,
  next: NextFunction
) {}

async function handleNewUser(googleUser: GoogleUser, res: Response) {
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
    res.cookie("_access_token", `${accessToken}`, {
      expires: new Date(Date.now() + 1 * 3600000),
      httpOnly: true,
      // domain: "localhost",
      sameSite: "lax",
    });

    return newUser;
  }

  return undefined;
}

export default loginController;
