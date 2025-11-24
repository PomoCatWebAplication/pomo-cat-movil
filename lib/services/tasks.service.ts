// lib/services/tasks.service.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export interface Task {
  _id: string; // MongoDB usa _id
  id?: string; // Alias opcional
  title: string;
  description?: string;
  state: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  notifyLocalTime?: string;
  dailyMinutes?: number;
  timezone?: string;
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  state?: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  notifyLocalTime?: string;
  dailyMinutes?: number;
  timezone?: string;
  dueDate: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  state?: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
}

class TasksService {
  private userId: string | null = null;

  // Método para setear el userId
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Método para obtener el userId desde el endpoint /api/me
  private async getUserId(): Promise<string> {
    if (this.userId !== null) {
      return this.userId;
    }

    try {
      const response = await fetch(`${API_URL}/api/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("User not authenticated. Please login again.");
      }

      const user = await response.json();

      if (!user || !user._id) {
        throw new Error("Invalid user data received");
      }

      this.userId = user._id;
      return this.userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw new Error("User not authenticated. Please login again.");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getAll(): Promise<Task[]> {
    const userId = await this.getUserId();
    // GET /tasks/user/:userId
    return this.request<Task[]>(`/tasks/user/${userId}`);
  }

  async getOne(id: string): Promise<Task> {
    // GET /tasks/task/:id
    return this.request<Task>(`/tasks/task/${id}`);
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const userId = await this.getUserId();
    // POST /tasks/:userId
    return this.request<Task>(`/tasks/${userId}`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async delete(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const tasksService = new TasksService();