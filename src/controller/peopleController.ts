import { Request, Response, NextFunction } from "express";
import { error_codes, response_code, success_codes } from "../utils/magic.js";
import { sendResponse } from "../utils/util.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Logger from "../utils/Logger.js";
import UserModel from "./../model/UserModel.js";

async function peopleController(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, limit, offset } = req.query;
    const rowLimit = parseInt(limit as string, 10);
    const rowOffset = parseInt(offset as string, 10);
    const query = q as string;
    const regex = new RegExp(query, "i");
    /**
     * Finds all documents where firstName or lastName matches the regex pattern.
     * Selects firstName, lastName, picture and dateJoined field.
     * Performs a skip and limit for pagination
     */
    const result = await UserModel.find(
      { $or: [{ firstName: regex }, { lastName: regex }] },
      { firstName: 1, lastName: 1, picture: 1, dateJoined: 1},
      { skip: rowOffset, limit: rowLimit }
    );
    if (!result) return next(new ErrorHandler("Unauthorized user", response_code.UNAUTHORIZED, error_codes.EUA));
    const totalPeople = await UserModel.count({});
    const length = result.length;
    const remaining = totalPeople - (rowOffset + length);
    const payload = { length: length, remaining: remaining, limit: rowLimit, offset: rowOffset, result: result };
    sendResponse(res, "success", response_code.SUCCESS, payload, success_codes.SSR);
  } catch (error) {
    Logger.log("error", error as Error, import.meta.url);
    next(new ErrorHandler("Internal server error", response_code.INTERNAL_SERVER_ERROR, error_codes.ESE));
  }
}

export default peopleController;
