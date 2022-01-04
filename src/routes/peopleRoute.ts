import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import peopleController from "./../controller/peopleController.js";
import authMiddleware from "./../middleware/authMiddleware";

const peopleRouter: Router = express.Router();

peopleRouter.get("/", [peopleController]);

peopleRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default peopleRouter;
