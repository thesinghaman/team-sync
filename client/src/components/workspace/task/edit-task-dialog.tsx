import EditTaskForm from "./edit-task-form";
import { TaskType } from "@/types/api.type";
import useAuth from "@/hooks/api/use-auth";

const EditTaskDialog = ({
  task,
  isOpen,
  onClose,
  canEdit,
  canChangeStatus,
}: {
  task: TaskType;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  canChangeStatus?: boolean;
}) => {
  const { data: authData } = useAuth();
  const currentUser = authData?.user;

  // Default permission logic if not provided
  const isTaskCreator = task.createdBy?._id === currentUser?._id;
  const isTaskAssignee = task.assignedTo?._id === currentUser?._id;
  const defaultCanEdit = canEdit !== undefined ? canEdit : isTaskCreator;
  const defaultCanChangeStatus =
    canChangeStatus !== undefined
      ? canChangeStatus
      : isTaskCreator || isTaskAssignee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg sm:max-w-lg w-full max-h-[90vh] overflow-y-auto m-4 border-0">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Edit Task</h2>
          </div>
          <EditTaskForm
            task={task}
            onClose={onClose}
            canEdit={defaultCanEdit}
            canChangeStatus={defaultCanChangeStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default EditTaskDialog;
