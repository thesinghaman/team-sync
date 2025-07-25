import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", ""),

  SESSION_SECRET: getEnv("SESSION_SECRET", "default-session-secret"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN", "1d"),

  JWT_SECRET: getEnv("JWT_SECRET", "default-jwt-secret"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:5173"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY", ""),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),
});

export const config = appConfig();
