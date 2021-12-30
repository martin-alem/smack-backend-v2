import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import settingController from "./../controller/settingController.js";
import authMiddleware from "./../middleware/authMiddleware.js";

const settingRouter: Router = express.Router();

settingRouter.get("/:userId", [authMiddleware, settingController]);

settingRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default settingRouter;
