import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import Logger from "./../utils/Logger.js";
import jwt from "jsonwebtoken";
import { error_codes, response_code } from "../utils/magic.js";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { _access_token } = req.cookies;
    const JWT_SECRET = process.env.JWT_SECRET!;
    try {
      jwt.verify(_access_token, JWT_SECRET);
      next();
    } catch (error) {
      next(new ErrorHandler("Invalid access token", response_code.BAD_REQUEST, error_codes.EUA));
    }
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default authMiddleware;
