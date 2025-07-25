import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { handleErrorForToast, requiresUserAction } from "@/utils/error-handler";
import { Eye, EyeOff } from "lucide-react";
import { Loading } from "@/components/ui/loading";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });
  const formSchema = z
    .object({
      name: z.string().trim().min(1, {
        message: "Name is required",
      }),
      email: z.string().trim().email("Invalid email address").min(1, {
        message: "Email is required",
      }),
      password: z.string().trim().min(6, {
        message: "Password must be at least 6 characters",
      }),
      confirmPassword: z.string().trim().min(1, {
        message: "Please confirm your password",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    // Remove confirmPassword from the payload since the API doesn't expect it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...submitData } = values;
    mutate(submitData, {
      onSuccess: async (response) => {
        const data = response.data;
        if (data.requiresVerification) {
          navigate("/verification-pending", {
            state: { email: data.email },
          });
        } else {
          // Invalidate auth queries to update cache immediately
          await queryClient.invalidateQueries({ queryKey: ["authUser"] });

          // If user is automatically logged in, navigate to workspace
          if (data.user && data.user.currentWorkspace) {
            navigate(`/workspace/${data.user.currentWorkspace}`);
          } else {
            navigate("/");
          }
        }
      },
      onError: (error) => {
        const userFriendlyError = handleErrorForToast(error);

        // Check if the error is about existing account or requires special handling
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("USER_ALREADY_EXISTS") ||
          requiresUserAction(error)
        ) {
          toast({
            title: userFriendlyError.title,
            description: (
              <div className="space-y-2">
                <p>{userFriendlyError.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/sign-in")}
                  className="mt-2"
                >
                  Go to Sign In
                </Button>
              </div>
            ),
            variant: "destructive",
            duration: 8000,
          });
        } else {
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
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription>Signup with your Email</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Joh Doe"
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
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    className="!h-[48px] pr-10"
                                    placeholder="Enter your password"
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
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    className="!h-[48px] pr-10"
                                    placeholder="Confirm your password"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                  >
                                    {showConfirmPassword ? (
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
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                      >
                        {isPending && <Loading size="sm" variant="spin" />}
                        Sign up
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/sign-in"
                        className="underline underline-offset-4"
                      >
                        Sign in
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

export default SignUp;
