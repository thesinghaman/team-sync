import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const API = axios.create(options);

// Request interceptor to ensure credentials are always sent
API.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true for all requests
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { data, status, config } = error.response || {};

    // Don't redirect to landing page for auth-related API calls or user settings
    // Users should stay on auth/settings pages to see error messages
    const isAuthEndpoint =
      config?.url?.includes("/auth/") ||
      config?.url?.includes("login") ||
      config?.url?.includes("register");
    
    const isUserSettingsEndpoint =
      config?.url?.includes("/user/change-password") ||
      config?.url?.includes("/user/change-email") ||
      config?.url?.includes("/user/verify-email") ||
      config?.url?.includes("/user/account") ||
      config?.url?.includes("/user/profile");

    // Only redirect on 401 for non-auth and non-user-settings endpoints
    if (status === 401 && !isAuthEndpoint && !isUserSettingsEndpoint) {
      window.location.href = "/";
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
