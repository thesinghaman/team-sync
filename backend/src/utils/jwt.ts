import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/app.config";

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, config.JWT_SECRET);
};
