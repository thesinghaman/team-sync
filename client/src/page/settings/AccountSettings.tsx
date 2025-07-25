import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { updateEmailMutationFn, verifyEmailMutationFn } from "@/lib/api";
import { Mail, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Loading, InlineLoading } from "@/components/ui/loading";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

const verificationSchema = z.object({
  verificationCode: z.string().min(6, "Verification code must be 6 digits"),
});

export function AccountSettings() {
  const { user, refetchAuth } = useAuthContext();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
      currentPassword: "",
    },
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: updateEmailMutationFn,
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your new email address for the verification code.",
      });
      // Clear the password field for security
      emailForm.setValue("currentPassword", "");
      refetchAuth();
    },
    onError: (error: unknown) => {
      const errorMessage = 
        error && typeof error === "object" && "response" in error && 
        error.response && typeof error.response === "object" && 
        "data" in error.response && error.response.data &&
        typeof error.response.data === "object" && "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : error && typeof error === "object" && "message" in error && 
            typeof error.message === "string"
          ? error.message
          : "Failed to update email.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Clear the password field for security
      emailForm.setValue("currentPassword", "");
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmailMutationFn,
    onSuccess: () => {
      toast({
        title: "Email Verified",
        description: "Your email address has been updated successfully.",
      });
      verificationForm.reset();
      emailForm.reset({
        email: "",
        currentPassword: "",
      });
      refetchAuth();
    },
    onError: (error: unknown) => {
      const errorMessage = 
        error && typeof error === "object" && "response" in error && 
        error.response && typeof error.response === "object" && 
        "data" in error.response && error.response.data &&
        typeof error.response.data === "object" && "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : error && typeof error === "object" && "message" in error && 
            typeof error.message === "string"
          ? error.message
          : "Invalid verification code.";
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onEmailSubmit = (values: z.infer<typeof emailSchema>) => {
    if (values.email === user?.email) {
      toast({
        title: "No Changes",
        description: "Please enter a different email address.",
        variant: "destructive",
      });
      return;
    }
    updateEmailMutation.mutate(values);
  };

  const onVerificationSubmit = (values: z.infer<typeof verificationSchema>) => {
    verifyEmailMutation.mutate(values);
  };

  const cancelEmailChange = () => {
    verificationForm.reset();
    emailForm.reset({
      email: user?.email || "",
      currentPassword: "",
    });
    refetchAuth();
  };

  if (!user) {
    return <InlineLoading text="Loading account..." />;
  }

  const hasEmailVerificationPending =
    user.pendingEmail && user.pendingEmail !== user.email;

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full space-y-6 sm:space-y-8">
        {/* Account Information Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5">
            Account Information
          </h1>
        </div>

        <div className="grid gap-4 sm:gap-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-start sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium dark:text-[#f1f7feb5]">
              User ID
            </label>
            <div className="sm:col-span-2">
              <code className="px-2 py-1 bg-muted rounded text-xs sm:text-sm break-all">
                {user._id}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 items-start sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium dark:text-[#f1f7feb5]">
              Account Status
            </label>
            <div className="sm:col-span-2">
              <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                {user.isEmailVerified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 items-start sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium dark:text-[#f1f7feb5]">
              Join Date
            </label>
            <div className="sm:col-span-2">
              <span className="text-sm">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Email Address Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </h1>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {hasEmailVerificationPending ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-300 text-sm sm:text-base">
                    Email Verification Pending
                  </span>
                </div>
                <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="break-all">
                    Current email: <strong>{user.email}</strong>
                  </p>
                  <p className="break-all">
                    Pending email: <strong>{user.pendingEmail}</strong>
                  </p>
                  <p className="mt-2">
                    Check your new email for the verification code.
                  </p>
                </div>
              </div>

              <Form {...verificationForm}>
                <form
                  onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={verificationForm.control}
                    name="verificationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                          Verification Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 6-digit verification code"
                            maxLength={6}
                            className="!h-[48px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="submit"
                      disabled={verifyEmailMutation.isPending}
                      className="h-[40px] text-white font-semibold"
                    >
                      {verifyEmailMutation.isPending && (
                        <Loading size="sm" variant="spin" className="mr-2" />
                      )}
                      {verifyEmailMutation.isPending
                        ? "Verifying..."
                        : "Verify Email"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEmailChange}
                      className="h-[40px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          className="!h-[48px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            className="!h-[48px] text-base pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateEmailMutation.isPending}
                    className="h-[40px] text-white font-semibold w-full sm:w-auto"
                  >
                    {updateEmailMutation.isPending && (
                      <Loading size="sm" variant="spin" className="mr-2" />
                    )}
                    {updateEmailMutation.isPending
                      ? "Sending Verification..."
                      : "Update Email"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
