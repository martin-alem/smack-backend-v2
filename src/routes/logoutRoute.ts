import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import logoutController from "./../controller/logoutController.js";

const logoutRouter: Router = express.Router();

logoutRouter.get("/", [logoutController]);

logoutRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default logoutRouter;
