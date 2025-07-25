import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus />
        New Task
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />

          {/* Dialog Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg sm:max-w-lg w-full max-h-[90vh] overflow-y-auto m-4 border-0">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Create New Task</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new task for your project
                </p>
              </div>
              <CreateTaskForm projectId={props.projectId} onClose={onClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTaskDialog;
