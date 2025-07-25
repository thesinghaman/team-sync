import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ProjectType } from "@/types/api.type";

interface ProjectDetailsDialogProps {
  project: ProjectType | undefined;
}

const ProjectDetailsDialog = ({ project }: ProjectDetailsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          More Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto mx-4 my-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className="text-2xl">{project.emoji}</span>
            <span className="truncate">{project.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <div className="text-sm text-muted-foreground">
              {project.description && project.description.trim() ? (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
              ) : (
                <p className="italic text-gray-400">No description provided</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Project Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Created By</h4>
              <p className="text-sm text-muted-foreground">
                {project.createdBy?.name || "Unknown"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Status</h4>
              <Badge variant="default" className="w-fit">
                Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Created</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(project.createdAt), "PPP")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Last Updated</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(project.updatedAt), "PPP")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
