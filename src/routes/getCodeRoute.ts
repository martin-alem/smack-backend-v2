import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import getCodeController from "./../controller/getCodeController.js";
import authMiddleware from "./../middleware/authMiddleware.js";

const getCodeRouter: Router = express.Router();

getCodeRouter.get("/:userId/:phone", [authMiddleware, getCodeController]);

getCodeRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default getCodeRouter;
