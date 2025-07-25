import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { verifyToken } from "../utils/jwt";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Get token from cookies
  const token = req.cookies.jwt;
  
  if (!token) {
    throw new UnauthorizedException("Unauthorized. Please log in.");
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as Express.User;
    next();
  } catch (error) {
    throw new UnauthorizedException("Invalid token.");
  }
};

export default isAuthenticated;
