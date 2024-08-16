import type { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../helpers/exceptions.helper";
import jwt from "jsonwebtoken";

export default async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader)
      throw new UnauthorizedException("Please provide authorization token");

    const token = authorizationHeader.split(" ")[1];
    if (!token)
      throw new UnauthorizedException("Please provide authorization token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "");
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) return next(error);
    next(new UnauthorizedException());
  }
}
