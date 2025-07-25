import { randomBytes } from "crypto";

export const generateVerificationToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const generateVerificationTokenExpiresAt = (): Date => {
  // Token expires in 24 hours
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};
