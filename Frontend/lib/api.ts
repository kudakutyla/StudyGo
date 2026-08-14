const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AssignmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH";

export type Assignment = {
  id: string;
  userId: string;
  title: string;
  description: string;
  course: string;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const rawText = await response.text();
  let payload: any = {};

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { message: rawText || response.statusText || "Something went wrong." };
    }
  }

  if (!response.ok) {
    const message =
      typeof payload?.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : response.statusText || "Something went wrong.";

    throw new Error(message);
  }

  return payload.data ?? payload;
}

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => apiRequest<{ success: boolean; message: string; data: User }>("/api/auth/register", {
  method: "POST",
  body: JSON.stringify(data),
});

export const login = async (data: { email: string; password: string }) =>
  apiRequest<{ success: boolean; message: string; data: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const logout = async () => apiRequest<{ success: boolean; message: string }>("/api/auth/logout", {
  method: "POST",
});

export const getCurrentUser = async () => apiRequest<User>("/api/auth/me");

export const getDashboardStats = async () => apiRequest<DashboardStats>("/api/dashboard/stats");

export const getAssignments = async (params?: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return apiRequest<{
    assignments: Assignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/api/assignments${query ? `?${query}` : ""}`);
};

export const getAssignment = async (id: string) => apiRequest<Assignment>(`/api/assignments/${id}`);

export const createAssignment = async (data: {
  title: string;
  description: string;
  course: string;
  dueDate: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
}) => apiRequest<Assignment>("/api/assignments", {
  method: "POST",
  body: JSON.stringify(data),
});

export const updateAssignment = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    course: string;
    dueDate: string;
    priority: AssignmentPriority;
    status: AssignmentStatus;
  }>
) => apiRequest<Assignment>(`/api/assignments/${id}`, {
  method: "PUT",
  body: JSON.stringify(data),
});

export const deleteAssignment = async (id: string) =>
  apiRequest<{ success: boolean; message: string }>(`/api/assignments/${id}`, {
    method: "DELETE",
  });

export const updateAssignmentStatus = async (id: string, status: AssignmentStatus) =>
  apiRequest<Assignment>(`/api/assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
