import express, { Request, Response, Router, NextFunction } from "express";
import ErrorHandler from "./../utils/ErrorHandler.js";
import friendsController from "./../controller/friendsController.js";
import authMiddleware from "./../middleware/authMiddleware";

const friendsRouter: Router = express.Router();

friendsRouter.get("/:userId", [friendsController]);

friendsRouter.use((error: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode).json({
    status: "fail",
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
  });
});

export default friendsRouter;
