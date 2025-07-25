import { Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditProjectForm from "./edit-project-form";
import { ProjectType } from "@/types/api.type";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const EditProjectDialog = (props: { project?: ProjectType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="mt-1.5" asChild>
          <button>
            <Edit3 className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-lg border-0"
          onInteractOutside={(e) => {
            // Prevent dialog from closing when clicking on popover
            const target = e.target as Element;
            if (
              target.closest("[data-radix-popover-content]") ||
              target.closest("[data-radix-popper-content-wrapper]") ||
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
              e.preventDefault();
              return;
            }
          }}
        >
          <VisuallyHidden>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Edit your project details</DialogDescription>
          </VisuallyHidden>
          <EditProjectForm project={props.project} onClose={onClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProjectDialog;
