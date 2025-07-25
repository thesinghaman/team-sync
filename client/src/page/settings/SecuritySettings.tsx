import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { changePasswordMutationFn } from "@/lib/api";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Loading, InlineLoading } from "@/components/ui/loading";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SecuritySettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: changePasswordMutationFn,
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      form.reset();
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
          : "Failed to update password.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Clear password fields for security
      form.reset();
    },
  });

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  if (!user) {
    return <InlineLoading text="Loading security settings..." />;
  }

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full space-y-6 sm:space-y-8">
        {/* Change Password Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </h1>
        </div>

        <div className="mb-8 space-y-4 sm:space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          className="!h-[48px] text-base pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          aria-label={
                            showCurrentPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="!h-[48px] text-base pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="!h-[48px] text-base pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="h-[40px] text-white font-semibold w-full sm:w-auto"
                >
                  {updatePasswordMutation.isPending && (
                    <Loading size="sm" variant="spin" className="mr-2" />
                  )}
                  {updatePasswordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Security Recommendations Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5">
            Security Recommendations
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Use a strong password</p>
              <p className="text-sm text-muted-foreground">
                Include uppercase and lowercase letters, numbers, and special
                characters.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Keep your password private</p>
              <p className="text-sm text-muted-foreground">
                Never share your password with anyone or use it on other
                websites.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Update regularly</p>
              <p className="text-sm text-muted-foreground">
                Change your password periodically, especially if you suspect
                it's been compromised.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
