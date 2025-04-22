import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { UserCard } from "../components/UserCard.tsx";
import { User } from "../types.ts";
import { deleteUser, fetchUsers } from "../utils.ts";
import UserForm from "./UserForm.tsx";

export default function UserManagement() {
  const users = useSignal<User[]>([]);
  const isLoading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  const showUserForm = useSignal<boolean>(false);
  const editingUserId = useSignal<string | null>(null);
  const userToEdit = useSignal<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const usersData = await fetchUsers();
      if (!Array.isArray(usersData)) {
        throw new Error("Invalid response format: Expected an array of users");
      }
      users.value = usersData;
    } catch (err) {
      console.error("Failed to load users:", err);
      error.value = err instanceof Error ? err.message : "Failed to load users";
    } finally {
      isLoading.value = false;
    }
  };

  const handleUserSaved = () => {
    loadUsers();

    resetForm();
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This will affect any tasks assigned to them.",
      )
    ) {
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      await deleteUser(userId);
      users.value = users.value.filter((user) => user._id !== userId);
    } catch (err) {
      console.error("Failed to delete user:", err);
      error.value = err instanceof Error
        ? err.message
        : "Failed to delete user";
    } finally {
      isLoading.value = false;
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.value.find((user) => user._id === userId);
    if (!user) return;

    editingUserId.value = userId;
    userToEdit.value = user;
    showUserForm.value = true;
  };

  const resetForm = () => {
    editingUserId.value = null;
    userToEdit.value = null;
    showUserForm.value = false;
  };

  return (
    <div class="container">
      <h1 class="text-2xl font-bold mb-6">User Management</h1>

      {/* Error message */}
      {error.value && (
        <div class="alert alert-error">
          <p>{error.value}</p>
        </div>
      )}

      {/* User form toggle button */}
      <div class="mb-6">
        <button
          onClick={() => {
            showUserForm.value = !showUserForm.value;
            if (!showUserForm.value) resetForm();
          }}
          class="btn btn-success"
        >
          {showUserForm.value
            ? "Cancel"
            : (editingUserId.value ? "Edit User" : "Create New User")}
        </button>
      </div>

      {/* User form */}
      {showUserForm.value && (
        <UserForm
          editingUserId={editingUserId.value}
          userToEdit={userToEdit.value}
          onUserSaved={handleUserSaved}
          onCancel={resetForm}
        />
      )}

      {/* User list */}
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">User List</h2>

        {isLoading.value && !users.value.length
          ? (
            <div class="text-center py-8">
              <p class="text-gray-500">Loading users...</p>
            </div>
          )
          : users.value.length === 0
          ? (
            <div class="bg-gray-100 p-4 rounded text-center">
              <p class="text-gray-500">
                No users found. Create your first user!
              </p>
            </div>
          )
          : (
            <div class="user-list">
              {users.value.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onEdit={() => handleEditUser(user._id)}
                  onDelete={() => handleDeleteUser(user._id)}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
