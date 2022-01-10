import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import getMessagesController from "./../controller/getMessagesController.js";

const messagesRouter: Router = express.Router();

messagesRouter.get("/:userId/:friendId", [getMessagesController]);

messagesRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default messagesRouter;
