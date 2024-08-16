import type { NextFunction, Request, Response } from "express";
import { HttpException } from "../helpers/exceptions.helper";

export default function errorMiddleware(
  err: HttpException,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
}
