import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import {
  CreateTaskRequest,
  Task,
  TaskStatus,
  UpdateTaskRequest,
  User,
} from "../types.ts";
import {
  createTask,
  fetchUsers,
  updateTask,
  validateTaskForm,
} from "../utils.ts";

interface TaskFormProps {
  editingTaskId?: string | null;
  taskToEdit?: Task | null;
  onTaskSaved: () => void;
  onCancel: () => void;
}

export default function TaskForm({
  editingTaskId = null,
  taskToEdit = null,
  onTaskSaved,
  onCancel,
}: TaskFormProps) {
  const formTitle = useSignal<string>(taskToEdit?.title || "");
  const formDescription = useSignal<string>(taskToEdit?.description || "");
  const formStatus = useSignal<TaskStatus>(
    taskToEdit?.status || TaskStatus.COMPLETED,
  );
  const formUserId = useSignal<string>(taskToEdit?.user?._id || "");

  const isLoading = useSignal<boolean>(false);
  const error = useSignal<string | null>(null);
  const users = useSignal<User[]>([]);

  useEffect(() => {
    loadUsers();

    if (taskToEdit) {
      formTitle.value = taskToEdit.title;
      formDescription.value = taskToEdit.description;
      formStatus.value = taskToEdit.status;
      formUserId.value = taskToEdit.user._id;
    }
  }, [taskToEdit]);

  const loadUsers = async () => {
    try {
      const usersData = await fetchUsers();
      users.value = usersData;
    } catch (err) {
      console.error("Failed to load users:", err);
      error.value = err instanceof Error ? err.message : "Failed to load users";
    }
  };

  const handleSaveTask = async (e: Event) => {
    e.preventDefault();

    const taskData: CreateTaskRequest = {
      title: formTitle.value.trim(),
      description: formDescription.value.trim() || undefined,
      status: formStatus.value,
      user: formUserId.value.trim(),
    };

    const validationError = validateTaskForm(taskData);
    if (validationError) {
      error.value = validationError;
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      if (editingTaskId) {
        await updateTask(editingTaskId, taskData as UpdateTaskRequest);
      } else {
        await createTask(taskData);
      }

      onTaskSaved();
    } catch (err) {
      console.error("Failed to save task:", err);
      error.value = err instanceof Error ? err.message : "Failed to save task";
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <div class="form-container">
      <h2 class="form-title">
        {editingTaskId ? "Edit Task" : "Create New Task"}
      </h2>

      {/* Error message */}
      {error.value && (
        <div class="alert alert-error">
          <p>{error.value}</p>
        </div>
      )}

      <form onSubmit={handleSaveTask}>
        <div class="form-group">
          <label class="form-label" for="title">
            Title*
          </label>
          <input
            id="title"
            type="text"
            value={formTitle.value}
            onInput={(e) =>
              formTitle.value = (e.target as HTMLInputElement).value}
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="description">
            Description
          </label>
          <textarea
            id="description"
            value={formDescription.value}
            onInput={(e) =>
              formDescription.value = (e.target as HTMLTextAreaElement).value}
            class="form-textarea"
            rows={3}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="status">
            Status
          </label>
          <select
            id="status"
            value={formStatus.value}
            onChange={(e) =>
              formStatus.value = (e.target as HTMLSelectElement)
                .value as TaskStatus}
            class="form-select"
          >
            <option value={TaskStatus.PENDING}>Prending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="user">
            Assigned User*
          </label>
          <select
            id="user"
            value={formUserId.value}
            onChange={(e) =>
              formUserId.value = (e.target as HTMLSelectElement).value}
            class="form-select"
            required
          >
            <option value="">Select a user</option>
            {users.value.map((user) => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isLoading.value}
          >
            {isLoading.value
              ? "Saving..."
              : (editingTaskId ? "Update Task" : "Create Task")}
          </button>
        </div>
      </form>
    </div>
  );
}
