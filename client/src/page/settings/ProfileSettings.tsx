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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { updateUserProfileMutationFn } from "@/lib/api";
import { Upload, Camera } from "lucide-react";
import { Loading, InlineLoading } from "@/components/ui/loading";
import API from "@/lib/axios-client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

export function ProfileSettings() {
  const { user, refetchAuth } = useAuthContext();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
    mode: "onChange",
  });

  // Watch form values to detect changes
  const watchedName = form.watch("name");
  const hasNameChanges = watchedName !== user?.name;
  const hasImageChanges = selectedImage !== null;
  const hasChanges = hasNameChanges || hasImageChanges;

  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      // Update name if changed
      if (hasNameChanges) {
        await updateUserProfileMutationFn(values);
      }
      
      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("profilePicture", selectedImage);
        
        await API.post("/user/profile-picture", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      // Reset states
      setSelectedImage(null);
      setImagePreview(null);
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
          : "Failed to update profile.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Set the selected image and create preview
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!user) {
    return <InlineLoading text="Loading profile..." />;
  }

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full space-y-6 sm:space-y-8">
        {/* Profile Picture Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5">
            Profile Picture
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
          <div className="relative flex-shrink-0 self-center sm:self-start">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={imagePreview || user.profilePicture || ""} />
              <AvatarFallback className="text-xl sm:text-2xl">
                {user.name?.split(" ")?.[0]?.charAt(0)}
                {user.name?.split(" ")?.[1]?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              type="button"
              onClick={() =>
                document.getElementById("profile-picture-input")?.click()
              }
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  document.getElementById("profile-picture-input")?.click()
                }
                className="h-[40px] w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedImage ? "Change Picture" : "Upload New Picture"}
              </Button>
              {selectedImage && (
                <p className="text-xs text-blue-600">
                  New image selected: {selectedImage.name}
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size: 5MB. Recommended: 400x400px
              </p>
            </div>
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelection}
            />
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="mb-5 border-b pb-4">
          <h1 className="text-[17px] sm:text-lg tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5">
            Personal Information
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="!h-[48px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                className="h-[40px] text-white font-semibold w-full sm:w-auto"
                disabled={updateProfileMutation.isPending || !hasChanges}
                type="submit"
              >
                {updateProfileMutation.isPending && (
                  <Loading size="sm" variant="spin" className="mr-2" />
                )}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
