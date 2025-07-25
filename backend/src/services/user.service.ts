import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import {
  BadRequestException,
  UnauthorizedException,
  AppError,
} from "../utils/appError";
import { hashValue } from "../utils/bcrypt";
import { generateUniqueToken, generateVerificationCode } from "../utils/uuid";
import { sendEmail } from "../utils/email";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "../utils/cloudinary";
import { Resend } from "resend";
import { config } from "../config/app.config";
import path from "path";
import fs from "fs";

const resend = new Resend(config.RESEND_API_KEY);

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};

export const updateUserProfileService = async (
  userId: string,
  data: { name: string }
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { name: data.name },
    { new: true, runValidators: true }
  )
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};

export const changeEmailService = async (
  userId: string,
  newEmail: string,
  currentPassword: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (!user.password) {
    throw new BadRequestException("User has no password set");
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Current password is incorrect");
  }

  // Check if new email already exists
  const existingUser = await UserModel.findOne({ email: newEmail });
  if (existingUser && existingUser._id?.toString() !== userId) {
    throw new BadRequestException("Email is already in use by another account");
  }

  // Generate verification token for new email
  const emailVerificationToken = generateVerificationCode();
  const emailVerificationTokenExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ); // 24 hours

  // Store pending email change
  await UserModel.findByIdAndUpdate(userId, {
    pendingEmail: newEmail,
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
  });

  // Send verification email to new address using Resend
  try {
    const { data, error } = await resend.emails.send({
      from: "Team Sync <teamsync@singhaman.me>",
      to: [newEmail],
      subject: "Verify Your New Email Address - Team Sync",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your New Email</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              background-color: #f8fafc;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 8px;
            }
            .code-container {
              background-color: #f8f9fa;
              padding: 24px;
              text-align: center;
              margin: 24px 0;
              border-radius: 8px;
              border: 2px solid #e9ecef;
            }
            .verification-code {
              color: #007bff;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 0;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 Team Sync</div>
              <h1>Verify Your New Email Address</h1>
            </div>

            <div class="content">
              <p>You requested to change your email address. Please use the verification code below to complete the process:</p>

              <div class="code-container">
                <h3 class="verification-code">${emailVerificationToken}</h3>
              </div>

              <p><strong>Instructions:</strong></p>
              <ol>
                <li>Copy the verification code above</li>
                <li>Return to the Team Sync application</li>
                <li>Paste the code in the verification form</li>
                <li>Your email address will be updated once verified</li>
              </ol>

              <p><strong>Important:</strong> This verification code will expire in 24 hours.</p>
              <p>If you didn't request this email change, please ignore this email or contact support.</p>
            </div>

            <div class="footer">
              <p>© 2025 Team Sync. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      // Handle email send error gracefully
      // In production, you might want to log this to a monitoring service
      throw new AppError("Failed to send verification email", 500);
    }
  } catch (error) {
    // Handle any other errors gracefully
    throw new AppError("Error sending email verification", 500);
  }
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (!user.password) {
    throw new BadRequestException("User has no password set");
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Current password is incorrect");
  }

  const hashedNewPassword = await hashValue(newPassword);
  await UserModel.findByIdAndUpdate(userId, { password: hashedNewPassword });
};

export const verifyEmailChangeService = async (
  userId: string,
  verificationCode: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (!user.emailVerificationToken || !user.emailVerificationTokenExpiresAt) {
    throw new BadRequestException("No pending email verification found");
  }

  if (user.emailVerificationToken !== verificationCode) {
    throw new UnauthorizedException("Invalid verification code");
  }

  if (user.emailVerificationTokenExpiresAt < new Date()) {
    throw new BadRequestException("Verification code has expired");
  }

  if (!user.pendingEmail) {
    throw new BadRequestException("No pending email change found");
  }

  // Update the user's email to the pending email
  await UserModel.findByIdAndUpdate(userId, {
    email: user.pendingEmail,
    pendingEmail: null,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
    isEmailVerified: true,
  });
};

export const deleteAccountService = async (
  userId: string,
  password: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (!user.password) {
    throw new BadRequestException("User has no password set");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Password is incorrect");
  }

  // Delete all user-related data
  // 1. Delete all workspaces owned by the user
  const ownedWorkspaces = await WorkspaceModel.find({ owner: userId });
  for (const workspace of ownedWorkspaces) {
    // Delete all projects in the workspace
    await ProjectModel.deleteMany({ workspace: workspace._id });
    // Delete all tasks in the workspace
    await TaskModel.deleteMany({ workspace: workspace._id });
    // Delete all members in the workspace
    await MemberModel.deleteMany({ workspace: workspace._id });
    // Delete the workspace
    await WorkspaceModel.findByIdAndDelete(workspace._id);
  }

  // 2. Remove user from all other workspaces
  await MemberModel.deleteMany({ user: userId });

  // 3. Delete profile picture if exists
  if (user.profilePicture) {
    // Check if it's a Cloudinary URL
    if (user.profilePicture.includes("cloudinary.com")) {
      const publicId = extractPublicIdFromUrl(user.profilePicture);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          // Continue with user deletion even if image deletion fails
        }
      }
    } else {
      // Handle old local files (for migration)
      const profilePicturePath = path.join(
        __dirname,
        "../../uploads/profile-pictures",
        user.profilePicture.replace("/uploads/profile-pictures/", "")
      );
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
      }
    }
  }

  // 4. Finally delete the user
  await UserModel.findByIdAndDelete(userId);
};

export const uploadProfilePictureService = async (
  userId: string,
  file: any
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new BadRequestException("User not found");
  }

  try {
    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture) {
      // Check if it's a Cloudinary URL
      if (user.profilePicture.includes("cloudinary.com")) {
        const publicId = extractPublicIdFromUrl(user.profilePicture);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (error) {
            // Continue with upload even if old image deletion fails
          }
        }
      } else {
        // Handle old local files (for migration)
        const oldProfilePicturePath = path.join(
          __dirname,
          "../../uploads/profile-pictures",
          user.profilePicture.replace("/uploads/profile-pictures/", "")
        );
        if (fs.existsSync(oldProfilePicturePath)) {
          fs.unlinkSync(oldProfilePicturePath);
        }
      }
    }

    // Validate file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed."
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        "File size too large. Maximum size is 5MB."
      );
    }

    // Generate unique public ID for Cloudinary
    const publicId = `user_${userId}_${Date.now()}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      "teamsync/profile-pictures", // Folder in Cloudinary
      publicId
    );

    console.log("Cloudinary upload successful:", {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    });

    // Update user profile picture with Cloudinary URL
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResult.secure_url },
      { new: true, runValidators: true }
    ).select("-password");

    return {
      user: updatedUser,
      profilePicture: uploadResult.secure_url,
      uploadInfo: {
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },
    };
  } catch (error: any) {
    console.error("Profile picture upload error:", error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    // Handle Cloudinary-specific errors
    if (error?.error?.message) {
      throw new BadRequestException(`Upload failed: ${error.error.message}`);
    }

    throw new BadRequestException(
      "Failed to upload profile picture. Please try again."
    );
  }
};
