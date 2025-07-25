import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import Logo from "@/components/logo";
import useAuth from "@/hooks/api/use-auth";

const VerificationPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [isChecking, setIsChecking] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { data: authData, refetch: refetchAuth } = useAuth();
  const user = authData?.user;

  // Check if user becomes verified
  useEffect(() => {
    if (user?.isEmailVerified && !hasRedirected) {
      // User is now verified, redirect to root and let AuthRoute handle the logic
      setHasRedirected(true);
      navigate("/", { replace: true });
      return;
    }

    // Only set up polling and listeners if user is not verified
    if (!user?.isEmailVerified && !hasRedirected) {
      // Set up polling to check verification status
      const pollVerificationStatus = () => {
        if (!hasRedirected) {
          setIsChecking(true);
          refetchAuth().finally(() => {
            setIsChecking(false);
          });
        }
      };

      // Poll every 10 seconds (reduced frequency)
      const interval = setInterval(pollVerificationStatus, 10000);

      // Also listen for storage events (when verification happens in another tab)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "email-verified" && e.newValue === "true" && !hasRedirected) {
          // Clear the flag immediately
          localStorage.removeItem("email-verified");
          // Refetch to get updated user data
          pollVerificationStatus();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Clean up
      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [user?.isEmailVerified, refetchAuth, navigate, hasRedirected]);

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
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {email && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Verification email sent to:
                </p>
                <p className="font-medium text-primary">{email}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Next Steps:
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the verification link in the email</li>
                    <li>• Complete your account setup</li>
                  </ul>
                </div>
              </div>
            </div>

            {isChecking && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loading
                    size="sm"
                    variant="spin"
                    className="text-green-600"
                  />
                  <span className="text-sm font-medium text-green-800">
                    Checking verification status...
                  </span>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email?</p>
            </div>

            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/resend-verification">Resend Verification Email</Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link to="/sign-in">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            The verification link will expire in 24 hours for security reasons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
