import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    // No token, but continue without setting req.user
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as Express.User;
  } catch (error) {
    // Invalid token, but continue without setting req.user
    console.log("Invalid token in optional auth:", error);
  }

  next();
};

export default optionalAuth;
