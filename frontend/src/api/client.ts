import axios from 'axios';
import type {
  User,
  Task,
  TaskStatus,
  TaskPriority,
  DashboardStats,
  TaskFilterParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateProfilePayload,
} from '../types';

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if a token exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to extract clean error message from Axios errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      // If validation field errors exist
      const fieldErrors = error.response.data.errors;
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey && Array.isArray(fieldErrors[firstKey])) {
        return fieldErrors[firstKey][0];
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

// Authentication API
export const authApi = {
  async register(data: any): Promise<{ user: User; token?: string }> {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: any): Promise<{ user: User; token?: string }> {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { token: string; password: string; confirmPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get('/dashboard/stats');
    return res.data.data;
  },
};

// Tasks API
export const tasksApi = {
  async getTasks(params?: TaskFilterParams): Promise<Task[]> {
    const res = await apiClient.get('/tasks', { params });
    return res.data.data.tasks;
  },

  async getTaskById(id: number): Promise<Task> {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data.data.task;
  },

  async createTask(data: CreateTaskPayload): Promise<Task> {
    const res = await apiClient.post('/tasks', data);
    return res.data.data.task;
  },

  async updateTask(id: number, data: UpdateTaskPayload): Promise<Task> {
    const res = await apiClient.put(`/tasks/${id}`, data);
    return res.data.data.task;
  },

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async getMetadata(): Promise<{ statuses: TaskStatus[]; priorities: TaskPriority[] }> {
    const res = await apiClient.get('/tasks/meta');
    return res.data.data;
  },
};

// User Profile API
export const profileApi = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get('/profile');
    return res.data.data.user;
  },

  async updateProfile(data: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.put('/profile', data);
    return res.data.data.user;
  },
};

export default apiClient;
