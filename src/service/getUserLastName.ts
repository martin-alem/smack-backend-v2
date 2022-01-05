import { NextFunction } from "express";
import UserModel from "../model/UserModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { error_codes, response_code } from "../utils/magic.js";
import { findOne } from "./query.js";

async function getUserLastName(userId: string, next: NextFunction): Promise<string | void> {
  try {
    const userResult = await findOne(UserModel, { _id: userId });
    if (!userResult) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const lastName = userResult.get("lastName", String) as string;
    return lastName;
  } catch (error) {
    throw new Error("Internal server error");
  }
}

export default getUserLastName;
