import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import sendFriendRequestController from "./../controller/sendFriendRequestController.js";
import acceptFriendRequestController from "./../controller/acceptFriendRequestController.js";
import rejectFriendRequestController from "./../controller/rejectFriendRequestController.js";
import authMiddleware from "./../middleware/authMiddleware";

const friendRequestRouter: Router = express.Router();

friendRequestRouter.post("/send", [sendFriendRequestController]);
friendRequestRouter.post("/accept", [acceptFriendRequestController]);
friendRequestRouter.post("/reject", [rejectFriendRequestController]);

friendRequestRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default friendRequestRouter;
