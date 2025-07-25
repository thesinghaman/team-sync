import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateProjectForm from "@/components/workspace/project/create-project-form";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const CreateProjectDialog = () => {
  const { open, onClose } = useCreateProjectDialog();
  return (
    <div>
      <Dialog modal={true} open={open} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-lg border-0"
          onInteractOutside={(e) => {
            // Prevent dialog from closing when clicking on popover or emoji picker
            const target = e.target as Element;
            if (
              target.closest("[data-radix-popover-content]") ||
              target.closest("[data-radix-popper-content-wrapper]") ||
              target.closest("[data-radix-select-content]") ||
              target.closest("[data-radix-select-viewport]") ||
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
              target.closest("[aria-label]") ||
              target.classList.contains("emoji-mart-emoji") ||
              target.classList.contains("emoji-mart-category") ||
              target.classList.contains("emoji-mart-scroll") ||
              target.classList.contains("emoji-mart-nav") ||
              target.classList.contains("emoji-mart-bar") ||
              target.classList.contains("emoji-mart-anchors") ||
              target.classList.contains("emoji-mart-anchor")
            ) {
              console.log("Preventing dialog close - emoji picker interaction");
              e.preventDefault();
              return;
            }
          }}
        >
          <VisuallyHidden>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project for your workspace
            </DialogDescription>
          </VisuallyHidden>
          <CreateProjectForm {...{ onClose }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjectDialog;
