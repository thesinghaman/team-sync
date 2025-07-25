import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import Logo from "@/components/logo";
import { verifyEmailWithTokenMutationFn } from "@/lib/api";

interface VerificationResponse {
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  workspaceId?: string;
}

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const data: VerificationResponse = await verifyEmailWithTokenMutationFn(
        token
      );

      setStatus("success");
      setMessage(data.message);

      // Set localStorage flag to notify other tabs (like VerificationPending page)
      localStorage.setItem("email-verified", "true");

      return;
    } catch (error: unknown) {
      setStatus("error");
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Verification failed";
      setMessage(errorMessage);
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    // Add a small delay to prevent the flash effect
    const timer = setTimeout(() => {
      verifyEmail(token);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams, verifyEmail]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Logo />
          Team Sync
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && (
                <Loading size="xl" variant="spin" className="text-primary" />
              )}
              {status === "success" && (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>

            <CardTitle className="text-xl">
              {status === "loading" && "Verifying Your Email"}
              {status === "success" && "Email Verified Successfully!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>

            <CardDescription>
              {status === "loading" &&
                "Please wait while we verify your email address..."}
              {status === "success" &&
                "Your account is now active and ready to use."}
              {status === "error" &&
                "There was a problem verifying your email address."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {status === "success" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Email Verified Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Your account is now active. You can close this page and continue where you left off.
                  </p>
                  <div className="mt-3">
                    <Button
                      onClick={() => {
                        // Try to close the window/tab, fallback to going back in history
                        if (window.history.length > 1) {
                          window.history.back();
                        } else {
                          window.close();
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Close This Page
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Verification Failed
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    The verification link may have expired or is invalid.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/resend-verification")}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Request New Verification Email
                  </Button>

                  <Button
                    onClick={() => navigate("/sign-in")}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
