import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import enableTFAController from "./../controller/enableTFAController.js";

const enableTFARouter: Router = express.Router();

enableTFARouter.post("/", [enableTFAController]);

enableTFARouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default enableTFARouter;
