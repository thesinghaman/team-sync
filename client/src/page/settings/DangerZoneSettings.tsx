import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { deleteAccountMutationFn } from "@/lib/api";
import { Trash2, AlertTriangle } from "lucide-react";
import { Loading, InlineLoading } from "@/components/ui/loading";
import { AUTH_ROUTES } from "@/routes/common/routePaths";

type DeleteAccountForm = {
  password: string;
  confirmationText: string;
};

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmationText: z.string().refine((val) => val === "DELETE", {
    message: 'Please type "DELETE" to confirm',
  }),
});

export function DangerZoneSettings() {
  const { user, logout } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmationText: "",
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccountMutationFn,
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
      navigate(AUTH_ROUTES.SIGN_IN);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description:
          error.message ||
          "Failed to delete account. Please check your password.",
        variant: "destructive",
      });
      // Don't close the dialog on error - let user try again
      form.setError("password", {
        type: "manual",
        message: "Incorrect password. Please try again.",
      });
    },
  });

  const onSubmit = (values: DeleteAccountForm) => {
    deleteAccountMutation.mutate({
      password: values.password,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    form.reset();
  };

  if (!user) {
    return <InlineLoading text="Loading danger zone settings..." />;
  }

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full space-y-6 sm:space-y-8">
        {/* Danger Zone Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            Danger Zone
          </h1>
        </div>

        <div className="mb-8">
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 dark:bg-destructive/10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• All your workspaces will be deleted</li>
                  <li>• All your projects and tasks will be removed</li>
                  <li>• Your profile data will be permanently erased</li>
                  <li>• This action cannot be reversed</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={deleteAccountMutation.isPending}
                  className="h-[40px] w-full lg:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Before You Delete Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5">
            Before You Delete
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Backup your data</p>
              <p className="text-sm text-muted-foreground">
                Make sure to export any important data before deletion.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Transfer workspace ownership
              </p>
              <p className="text-sm text-muted-foreground">
                Transfer ownership of your workspaces to other members if
                needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-lg">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Confirm your password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="!h-[48px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Type "DELETE" to confirm
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DELETE"
                        className="!h-[48px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel
                  onClick={handleDeleteCancel}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending && (
                    <Loading size="sm" variant="spin" className="mr-2" />
                  )}
                  {deleteAccountMutation.isPending
                    ? "Deleting..."
                    : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
