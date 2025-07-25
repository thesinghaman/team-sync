import { Router } from "express";
import {
  loginController,
  logOutController,
  registerUserController,
  verifyEmailController,
  resendVerificationEmailController,
  forgotPasswordController,
  resetPasswordController,
  verifyResetTokenController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logOutController);
authRoutes.get("/verify-email/:token", verifyEmailController);
authRoutes.post("/resend-verification", resendVerificationEmailController);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);
authRoutes.get("/verify-reset-token/:token", verifyResetTokenController);

export default authRoutes;
