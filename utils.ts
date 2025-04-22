import {
  CreateTaskRequest,
  CreateUserRequest,
  MoveTaskRequest,
  Task,
  TaskStatus,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  UpdateUserRequest,
  User,
} from "./types.ts";
import { API_URL } from "./config.ts";

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }
  return await response.json() as T;
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/api/users/`);
    const rawData = await response.json(); // Parse JSON response
    console.log("Raw response from /api/users/:", rawData);

    if (!rawData.success || !Array.isArray(rawData.data)) {
      throw new Error("Invalid response format: Expected a success flag and a data array");
    }

    return rawData.data; // Return the users array from the `data` field
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`);
  return handleResponse<User>(response);
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  // arreglado: trim input data
  const cleanedData = {
    name: userData.name.trim(),
    email: userData.email.trim(),
  };

  const response = await fetch(`${API_URL}/api/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanedData), // arreglado: send cleaned data
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create user: ${errorText}`); // arreglado: better error handling
  }

  return handleResponse<User>(response);
}

export async function updateUser(
  id: string,
  userData: UpdateUserRequest,
): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT", // arreglado
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE", // arreglado
  });
  await handleResponse<void>(response);
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_URL}/api/tasks/`);
    const rawData = await response.json(); // Parse JSON response
    console.log("Raw response from /api/tasks/:", rawData);

    if (!rawData.success || !Array.isArray(rawData.data)) {
      throw new Error("Invalid response format: Expected a success flag and a data array");
    }

    return rawData.data; // Return the tasks array from the `data` field
  } catch (err) {
    console.error("Error fetching tasks:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
}

export async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`);
  return handleResponse<Task>(response);
}

export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  const cleanedData = {
    title: taskData.title.trim(),
    description: taskData.description?.trim(),
    status: taskData.status,
    user: taskData.user,
  };

  const response = await fetch(`${API_URL}/api/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanedData), // arreglado: send cleaned data
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create task: ${errorText}`); // arreglado: better error handling
  }

  return handleResponse<Task>(response);
}

export async function updateTask(
  id: string,
  taskData: UpdateTaskRequest,
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PUT", // arreglado
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task> {
  try {
    const endpoint = `${API_URL}/api/tasks/${id}/move`;
    const payload = { newStatus: status }; // Ensure the key matches the API's expected format

    console.log("Sending request to:", endpoint);
    console.log("Request payload:", JSON.stringify(payload));

    const response = await fetch(endpoint, {
      method: "PATCH", // Correct HTTP method
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawData = await response.text(); // Log raw response for debugging
    console.log("Raw response from /api/tasks/:id/move:", rawData);

    if (!response.ok) {
      console.error("API error details:", rawData);
      throw new Error(`API error (${response.status}): ${rawData}`);
    }

    return JSON.parse(rawData); // Parse and return the updated task
  } catch (err) {
    console.error("Error updating task status:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
}

export async function moveTask(
  taskId: string,  // arreglado: renamed for clarity
  newUserId: string, // arreglado: renamed for clarity
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: newUserId }), // arreglado: match API expectation
  });
  return handleResponse<Task>(response);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    [TaskStatus.PENDING]: [],    // arreglado: use correct enum values
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.COMPLETED]: [],  // arreglado: use correct enum values
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  return grouped;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUserForm(data: CreateUserRequest): string | null {
  // arreglado: improved validation
  const name = data.name?.trim();
  const email = data.email?.trim();

  if (!name) {
    return "Name is required";
  }

  if (!email) {
    return "Email is required";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }

  return null;
}

export function validateTaskForm(data: CreateTaskRequest): string | null {
  // arreglado: improved validation
  const title = data.title?.trim();
  const user = data.user?.trim();

  if (!title) {
    return "Title is required";
  }

  if (!user) {
    return "User assignment is required";
  }

  return null;
}
