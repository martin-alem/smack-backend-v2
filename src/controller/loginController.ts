import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import { GoogleUser } from "./../types/interfaces";
import verify from "../utils/verifyToken.js";

async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const bearerToken = req.headers["authorization"];

    if (bearerToken) {
      const tokenId = bearerToken.split(" ")[1];
      const googleUser: GoogleUser | undefined = await verify(tokenId);
      if (googleUser) {
        res.status(200).json({
          status: "success",
          statusCode: 200,
          message: googleUser,
        });
      } else {
        next(new ErrorHandler("Unauthorized user", 403));
      }
    } else {
      next(new ErrorHandler("No authorization token found", 403));
    }
  } catch (error) {
    next(new ErrorHandler("Internal server error", 500));
  }
}

export default loginController;
