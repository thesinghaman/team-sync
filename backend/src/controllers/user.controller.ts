import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getCurrentUserService,
  updateUserProfileService,
  changeEmailService,
  changePasswordService,
  deleteAccountService,
  uploadProfilePictureService,
  verifyEmailChangeService,
} from "../services/user.service";
import { JWTPayload } from "../@types/index";

interface RequestWithFile extends Request {
  file?: any;
}

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId || (req.user as any)?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.OK).json({
        message: "No user authenticated",
        user: null,
      });
    }

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);

export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const { name } = req.body;

    const { user } = await updateUserProfileService(userId, { name });

    return res.status(HTTPSTATUS.OK).json({
      message: "Profile updated successfully",
      user,
    });
  }
);

export const changeEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const { email, currentPassword } = req.body;

    await changeEmailService(userId, email, currentPassword);

    return res.status(HTTPSTATUS.OK).json({
      message:
        "Email change verification sent. Please check your new email address.",
    });
  }
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const { currentPassword, newPassword } = req.body;

    await changePasswordService(userId, currentPassword, newPassword);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password changed successfully",
    });
  }
);

export const deleteAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const { password } = req.body;

    await deleteAccountService(userId, password);

    return res.status(HTTPSTATUS.OK).json({
      message: "Account deleted successfully",
    });
  }
);

export const uploadProfilePictureController = asyncHandler(
  async (req: RequestWithFile, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const file = req.file;

    if (!file) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No file uploaded",
      });
    }

    const result = await uploadProfilePictureService(userId, file);

    return res.status(HTTPSTATUS.OK).json({
      message: "Profile picture updated successfully",
      user: result.user,
      profilePicture: result.profilePicture,
      uploadInfo: result.uploadInfo,
    });
  }
);

export const verifyEmailChangeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user as JWTPayload;
    const userId = userPayload?.userId;
    const { verificationCode } = req.body;

    await verifyEmailChangeService(userId, verificationCode);

    return res.status(HTTPSTATUS.OK).json({
      message: "Email address updated successfully",
    });
  }
);
