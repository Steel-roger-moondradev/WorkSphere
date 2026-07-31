import { Request, Response, NextFunction, RequestHandler } from "express";
import ErrorHandler from "./ErrorHandler.js";

const TryCatch = (
  controller: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error: any) {
      console.log("ERROR OBJECT:", error);
      if (error instanceof ErrorHandler) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }
      res.status(500).json({
        message: error.message,
      });
    }
  };
};
export default TryCatch;
