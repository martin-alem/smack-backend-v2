import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import notificationController from "./../controller/notificationController.js";
import authMiddleware from "./../middleware/authMiddleware";

const notificationRouter: Router = express.Router();

notificationRouter.get("/:userId", [notificationController]);

notificationRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default notificationRouter;
