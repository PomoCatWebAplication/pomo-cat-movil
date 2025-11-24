// lib/services/daily-plans.service.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export interface DailyPlan {
  _id: string; // MongoDB usa _id
  id?: string; // Alias opcional
  day: number; // 0-6 (Monday-Sunday)
  startTime: string; // ISO string
  endTime: string; // ISO string
  note?: string;
  userId: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyPlanDto {
  day: number; // 0-6
  startTime: string; // ISO string
  endTime: string; // ISO string
  note?: string;
  taskId: string;
}

export interface UpdateDailyPlanDto {
  day?: number;
  startTime?: string;
  endTime?: string;
  note?: string;
}

class DailyPlansService {
  private userId: string | null = null;

  // Método para setear el userId (llámalo después del login)
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Método para obtener el userId desde el endpoint 
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

  async getAll(): Promise<DailyPlan[]> {
    const userId = await this.getUserId();
    return this.request<DailyPlan[]>(`/daily-plans/user/${userId}`);
  }

  // Alias para mantener compatibilidad
  async getAllByUser(): Promise<DailyPlan[]> {
    return this.getAll();
  }

  async getOne(id: string): Promise<DailyPlan> {
    return this.request<DailyPlan>(`/daily-plans/${id}`);
  }

  async create(dto: CreateDailyPlanDto): Promise<DailyPlan> {
    const userId = await this.getUserId();
    return this.request<DailyPlan>(`/daily-plans/${userId}/${dto.taskId}`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async update(id: string, dto: UpdateDailyPlanDto): Promise<DailyPlan> {
    return this.request<DailyPlan>(`/daily-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async delete(id: string): Promise<void> {
    console.log('Intentando eliminar plan con ID:', id);
    try {
      await this.request<void>(`/daily-plans/${id}`, {
        method: 'DELETE',
      });
      console.log('Plan eliminado exitosamente');
    } catch (error) {
      console.error('Error detallado al eliminar:', error);
      throw error;
    }
  }

  async getReminder(): Promise<{ status: string }> {
    const userId = await this.getUserId();
    return this.request<{ status: string }>(`/daily-plans/reminder/${userId}`);
  }
}

export const dailyPlansService = new DailyPlansService();