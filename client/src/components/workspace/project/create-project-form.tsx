import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import EmojiPickerComponent from "@/components/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ButtonSpinner } from "@/components/ui/loading-variants";

export default function CreateProjectForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const [emoji, setEmoji] = useState("📊");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Project title is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleEmojiSelection = (emoji: string) => {
    console.log("Emoji selected:", emoji);
    setEmoji(emoji);
    console.log("Closing emoji picker after selection");
    setIsEmojiPickerOpen(false); // Close the popover after selection
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      data: {
        emoji,
        ...values,
      },
    };
    mutate(payload, {
      onSuccess: (data) => {
        const project = data.project;
        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        });

        toast({
          title: "Success",
          description: "Project created successfully",
          variant: "success",
        });

        navigate(`/workspace/${workspaceId}/project/${project._id}`);
        setTimeout(() => onClose(), 500);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1
            className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1
           text-center sm:text-left"
          >
            Create Project
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Organize and manage tasks, resources, and team collaboration
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Emoji
              </label>
              <Popover
                open={isEmojiPickerOpen}
                onOpenChange={(open) => {
                  console.log("Emoji Popover onOpenChange:", open);
                  setIsEmojiPickerOpen(open);
                }}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-normal size-[60px] !p-2 !shadow-none mt-2 items-center rounded-full"
                    type="button"
                    id="emoji-picker-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(
                        "Emoji button clicked, current state:",
                        isEmojiPickerOpen
                      );
                      setIsEmojiPickerOpen(!isEmojiPickerOpen);
                    }}
                  >
                    <span className="text-4xl">{emoji}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="!p-0 !z-[70] relative resize-none w-auto max-w-none"
                  style={{
                    zIndex: 9999,
                    resize: "none",
                    userSelect: "none",
                    pointerEvents: "auto",
                    width: "auto",
                    maxWidth: "none",
                  }}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => {
                    e.preventDefault();
                    console.log("Escape pressed, closing emoji picker");
                    setIsEmojiPickerOpen(false);
                  }}
                  onInteractOutside={(e) => {
                    console.log("Emoji picker interact outside detected");
                    const target = e.target as Element;

                    // Check if the interaction is within emoji picker elements
                    if (
                      target.closest("#emoji-picker-button") ||
                      target.closest(".emoji-mart") ||
                      target.closest(".emoji-mart-category") ||
                      target.closest(".emoji-mart-emoji") ||
                      target.closest(".emoji-mart-scroll") ||
                      target.closest(".emoji-mart-nav") ||
                      target.closest(".emoji-mart-bar") ||
                      target.closest(".emoji-mart-anchors") ||
                      target.closest(".emoji-mart-anchor") ||
                      target.closest(".emoji-mart-category-list") ||
                      target.closest("[data-id]") ||
                      target.closest("[role='tab']") ||
                      target.closest("[role='tabpanel']") ||
                      target.id === "emoji-picker-button" ||
                      target.classList.contains("emoji-mart-emoji") ||
                      target.classList.contains("emoji-mart-category") ||
                      target.classList.contains("emoji-mart-scroll") ||
                      target.classList.contains("emoji-mart-nav") ||
                      target.classList.contains("emoji-mart-bar") ||
                      target.classList.contains("emoji-mart-anchors") ||
                      target.classList.contains("emoji-mart-anchor")
                    ) {
                      console.log(
                        "Preventing emoji picker close - internal interaction"
                      );
                      e.preventDefault();
                      return;
                    }

                    console.log("Closing emoji picker due to outside click");
                    setIsEmojiPickerOpen(false);
                  }}
                  sideOffset={5}
                >
                  <div
                    className="relative z-10 pointer-events-auto select-none w-auto"
                    style={{
                      resize: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      width: "auto",
                      maxWidth: "none",
                    }}
                  >
                    <div
                      className="emoji-picker-container w-auto"
                      style={{
                        resize: "none",
                        overflow: "hidden",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        width: "auto",
                        maxWidth: "none",
                        maxHeight: "350px",
                      }}
                      onWheel={(e) => {
                        // Allow scrolling within the emoji picker
                        e.stopPropagation();
                      }}
                      onScroll={(e) => {
                        // Prevent scroll events from bubbling up
                        e.stopPropagation();
                      }}
                    >
                      <EmojiPickerComponent
                        onSelectEmoji={handleEmojiSelection}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Project title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Website Redesign"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Project description
                      <span className="text-xs font-extralight ml-2">
                        Optional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Projects description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className="flex place-self-end  h-[40px] text-white font-semibold"
              type="submit"
            >
              {isPending && <ButtonSpinner />}
              Create
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
