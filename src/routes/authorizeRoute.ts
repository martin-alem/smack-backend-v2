import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import authorizeController from "../controller/authorizeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authorizeRouter: Router = express.Router();

authorizeRouter.get("/:userId", [authMiddleware, authorizeController]);

authorizeRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default authorizeRouter;
