import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  registerUserService,
  verifyEmailService,
  resendVerificationEmailService,
  forgotPasswordService,
  resetPasswordService,
  verifyResetTokenService,
} from "../services/auth.service";
import passport from "passport";
import { generateToken } from "../utils/jwt";
import { config } from "../config/app.config";
import { z } from "zod";

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    const result = await registerUserService(body as any);

    return res.status(HTTPSTATUS.CREATED).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      requiresVerification: result.requiresVerification,
      email: result.email,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        const token = generateToken({ userId: user._id });

        // Standard cookie configuration
        const cookieOptions = {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite: config.NODE_ENV === "production" ? "none" as const : "lax" as const,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          domain: config.NODE_ENV === "production" ? undefined : undefined,
          path: "/",
        };

        res.cookie("jwt", token, cookieOptions);

        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          user,
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    // Standard cookie options for clearing
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" as const : "lax" as const,
      path: "/",
      domain: config.NODE_ENV === "production" ? undefined : undefined,
    };

    res.clearCookie("jwt", cookieOptions);
    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Logged out successfully" });
  }
);export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const tokenSchema = z.string().min(1, "Token is required");
    const token = tokenSchema.parse(req.params.token);

    const { user, workspaceId } = await verifyEmailService(token);

    // Generate JWT token for the verified user
    const jwtToken = generateToken({ userId: user._id });

    // Standard cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" as const : "lax" as const,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      domain: config.NODE_ENV === "production" ? undefined : undefined,
      path: "/",
    };

    res.cookie("jwt", jwtToken, cookieOptions);

    return res.status(HTTPSTATUS.OK).json({
      message: "Email verified successfully",
      user,
      workspaceId,
    });
  }
);

export const resendVerificationEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const emailSchema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const { email } = emailSchema.parse(req.body);

    await resendVerificationEmailService(email);

    return res.status(HTTPSTATUS.OK).json({
      message: "Verification email sent successfully",
    });
  }
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const emailSchema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const { email } = emailSchema.parse(req.body);

    await forgotPasswordService(email);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password reset email sent successfully",
    });
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const resetSchema = z.object({
      token: z.string(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const { token, password } = resetSchema.parse(req.body);

    await resetPasswordService(token, password);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password reset successfully",
    });
  }
);

export const verifyResetTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    const isValid = await verifyResetTokenService(token);

    if (!isValid) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Invalid or expired reset token",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Reset token is valid",
    });
  }
);
