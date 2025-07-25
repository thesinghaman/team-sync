import mongoose from "mongoose";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import MemberModel from "../models/member.model";
import { generateUUID } from "../utils/uuid";
import { hashValue } from "../utils/bcrypt";
import {
  generateVerificationToken,
  generateVerificationTokenExpiresAt,
} from "../utils/verification";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "./email.service";

export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
}) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      // If user exists but email is not verified, we can resend verification
      if (!existingUser.isEmailVerified) {
        await session.abortTransaction();
        session.endSession();

        // Generate new verification token for existing unverified user
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiresAt = generateVerificationTokenExpiresAt();

        existingUser.emailVerificationToken = verificationToken;
        existingUser.emailVerificationTokenExpiresAt =
          verificationTokenExpiresAt;
        await existingUser.save();

        // Send verification email
        try {
          await sendVerificationEmail(
            email,
            verificationToken,
            existingUser.name,
            true // This is from signup flow
          );
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
        }

        return {
          userId: existingUser._id,
          email: existingUser.email,
          requiresVerification: true,
        };
      } else {
        throw new BadRequestException(
          "An account with this email already exists and is verified. Please sign in instead."
        );
      }
    }

    // User doesn't exist, create new user
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = generateVerificationTokenExpiresAt();

    const user = new UserModel({
      email,
      name,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: verificationTokenExpiresAt,
      isEmailVerified: false,
    });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    // Send verification email (outside of transaction)
    try {
      await sendVerificationEmail(email, verificationToken, name, true); // This is from signup flow
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't throw here - user is created successfully, just email failed
    }

    return {
      userId: user._id,
      email: user.email,
      requiresVerification: true,
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    // Handle MongoDB duplicate key errors specifically
    if (error.code === 11000) {
      if (error.keyPattern?.providerId) {
        throw new BadRequestException(
          "An account with this email already exists. Please sign in or use a different email address."
        );
      }
      if (error.keyPattern?.email) {
        throw new BadRequestException(
          "An account with this email already exists. Please sign in or use a different email address."
        );
      }
    }

    throw error;
  }
};

export const verifyUserService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new UnauthorizedException("Invalid email or password");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new UnauthorizedException(
      "Please verify your email address before signing in"
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user.omitPassword();
};

export const verifyEmailService = async (token: string) => {
  const user = await UserModel.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new BadRequestException("Invalid or expired verification token");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;
    await user.save({ session });

    // Create workspace and member for the user
    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER,
    }).session(session);

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return {
      user: user.omitPassword(),
      workspaceId: workspace._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const resendVerificationEmailService = async (email: string) => {
  const user = await UserModel.findOne({ email, isEmailVerified: false });

  if (!user) {
    throw new BadRequestException("User not found or email already verified");
  }

  // Generate new verification token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpiresAt = generateVerificationTokenExpiresAt();

  user.emailVerificationToken = verificationToken;
  user.emailVerificationTokenExpiresAt = verificationTokenExpiresAt;
  await user.save();

  // Send verification email
  await sendVerificationEmail(email, verificationToken, user.name);

  return { message: "Verification email sent successfully" };
};

export const forgotPasswordService = async (email: string) => {
  // Find user by email
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Return error if email doesn't exist
    throw new NotFoundException("No account found with this email address");
  }

  if (!user.isEmailVerified) {
    throw new BadRequestException(
      "Please verify your email address first before resetting password"
    );
  }

  // Generate reset token (expires in 1 hour)
  const resetToken = generateUUID();
  const resetTokenExpiresAt = new Date();
  resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpiresAt = resetTokenExpiresAt;
  await user.save();

  // Send password reset email
  await sendPasswordResetEmail(email, resetToken, user.name);

  return { message: "Password reset email sent successfully" };
};

export const resetPasswordService = async (
  token: string,
  newPassword: string
) => {
  // Find user by reset token
  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new UnauthorizedException("Invalid or expired reset token");
  }

  // Hash new password
  const hashedPassword = await hashValue(newPassword);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenExpiresAt = null;
  await user.save();

  return { message: "Password reset successfully" };
};

export const verifyResetTokenService = async (token: string) => {
  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  });

  return !!user;
};
