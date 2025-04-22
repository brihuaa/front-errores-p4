import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { CreateUserRequest, UpdateUserRequest, User } from "../types.ts";
import { createUser, updateUser, validateUserForm } from "../utils.ts";

interface UserFormProps {
  editingUserId?: string | null;
  userToEdit?: User | null;
  onUserSaved: () => void;
  onCancel: () => void;
}

export default function UserForm({
  editingUserId = null,
  userToEdit = null,
  onUserSaved,
  onCancel,
}: UserFormProps) {
  const formName = useSignal<string>(userToEdit?.name || "");
  const formEmail = useSignal<string>(userToEdit?.email || "");

  const isLoading = useSignal<boolean>(false);
  const error = useSignal<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      formName.value = userToEdit.name;
      formEmail.value = userToEdit.email;
    }
  }, [userToEdit]);

  const handleSaveUser = async (e: Event) => {
    e.preventDefault();

    const userData: CreateUserRequest = {
      name: formName.value.trim(),
      email: formEmail.value.trim(),
    };

    const validationError = validateUserForm(userData);
    if (validationError) {
      error.value = validationError;
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      if (editingUserId) {
        await updateUser(editingUserId, userData as UpdateUserRequest);
      } else {
        await createUser(userData);
      }

      onUserSaved();
    } catch (err) {
      console.error("Failed to save user:", err);
      error.value = err instanceof Error ? err.message : "Failed to save user";
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <div class="form-container">
      <h2 class="form-title">
        {editingUserId ? "Edit User" : "Create New User"}
      </h2>

      {/* Error message */}
      {error.value && (
        <div class="alert alert-error">
          <p>{error.value}</p>
        </div>
      )}

      <form onSubmit={handleSaveUser}>
        <div class="form-group">
          <label class="form-label" for="name">
            Name*
          </label>
          <input
            id="name"
            type="text"
            value={formName.value}
            onInput={(e) => {
              try {
                formName.value = (e.target as HTMLInputElement).value;
              } catch (err) {
                console.error("Error updating name field:", err);
              }
            }}
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">
            Email*
          </label>
          <input
            id="email"
            type="email"
            value={formEmail.value}
            onInput={(e) => {
              try {
                formEmail.value = (e.target as HTMLInputElement).value;
              } catch (err) {
                console.error("Error updating email field:", err);
              }
            }}
            class="form-input"
            required
          />
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
            class="btn btn-success"
            disabled={isLoading.value}
          >
            {isLoading.value
              ? "Saving..."
              : (editingUserId ? "Update User" : "Create User")}
          </button>
        </div>
      </form>
    </div>
  );
}
