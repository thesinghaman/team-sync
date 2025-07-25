import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  }),
});

export const changeEmailSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
  }),
});
