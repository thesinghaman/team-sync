import { Router } from "express";
import {
  getCurrentUserController,
  updateProfileController,
  changeEmailController,
  changePasswordController,
  deleteAccountController,
  uploadProfilePictureController,
  verifyEmailChangeController,
} from "../controllers/user.controller";
import optionalAuth from "../middlewares/optionalAuth.middleware";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { upload } from "../config/multer.config";

const userRoutes = Router();

userRoutes.get("/current", optionalAuth, getCurrentUserController);

// Protected user settings routes
userRoutes.put("/profile", isAuthenticated, updateProfileController);
userRoutes.post("/change-email", isAuthenticated, changeEmailController);
userRoutes.post("/verify-email", isAuthenticated, verifyEmailChangeController);
userRoutes.post("/change-password", isAuthenticated, changePasswordController);
userRoutes.delete("/account", isAuthenticated, deleteAccountController);
userRoutes.post(
  "/profile-picture",
  isAuthenticated,
  upload.single("profilePicture"),
  uploadProfilePictureController
);

export default userRoutes;
