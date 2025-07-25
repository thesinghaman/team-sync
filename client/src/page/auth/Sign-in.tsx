import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { handleErrorForToast, requiresUserAction } from "@/utils/error-handler";
import { Eye, EyeOff } from "lucide-react";
import { Loading } from "@/components/ui/loading";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const returnUrl = searchParams.get("returnUrl");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: async () => {
        try {
          // Refetch both queries and wait for completion
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["authUser"] }),
            queryClient.refetchQueries({ queryKey: ["userWorkspaces"] }),
          ]);
        } catch {
          // Continue with navigation even if refetch fails
        }

        const decodedUrl = returnUrl ? decodeURIComponent(returnUrl) : null;

        // If there's a return URL, navigate there
        if (decodedUrl) {
          navigate(decodedUrl);
          return;
        }

        // Always navigate to root and let AuthRoute handle the workspace logic
        navigate("/");
      },
      onError: (error) => {
        const userFriendlyError = handleErrorForToast(error);

        // Check if error specifically requires email verification
        if (
          requiresUserAction(error) &&
          (error.message?.includes("verify your email") ||
            error.message?.includes("email not verified") ||
            userFriendlyError.description
              .toLowerCase()
              .includes("verify your email"))
        ) {
          toast({
            title: userFriendlyError.title,
            description: (
              <div className="space-y-2">
                <p>{userFriendlyError.description}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/resend-verification")}
                  className="mt-2 bg-white text-red-600 hover:bg-red-50 border border-red-200"
                >
                  Resend Verification Email
                </Button>
              </div>
            ),
            variant: "destructive",
            duration: 10000,
          });
        } else {
          // Regular login error (wrong password, etc.)
          toast({
            title: userFriendlyError.title,
            description: userFriendlyError.description,
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          Team Sync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Login with your Email</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="m@example.com"
                                  className="!h-[48px]"
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center">
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                  Password
                                </FormLabel>
                                <a
                                  href="/forgot-password"
                                  className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                  Forgot your password?
                                </a>
                              </div>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    className="!h-[48px] pr-10"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                      >
                        {isPending && <Loading size="sm" variant="spin" />}
                        Login
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/sign-up"
                        className="underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
