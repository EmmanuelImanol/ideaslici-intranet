import api from './api.service';
import { Area, CreateAreaInput, UpdateAreaInput } from '@/interfaces/area.interface';
import { useAuthStore } from '@/store/auth.store';

class AreasService {
  constructor() {
    // Interceptor para incluir el Token JWT en cada petición
    api.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Obtiene todas las áreas disponibles
   */
  async getAll(): Promise<Area[]> {
    const { data } = await api.get<Area[]>('/areas');
    return data;
  }

  /**
   * Crea una nueva área (Solo Admin)
   */
  async create(createAreaDto: CreateAreaInput): Promise<Area> {
    const { data } = await api.post<Area>('/areas', createAreaDto);
    return data;
  }

  /**
   * Actualiza un área existente
   */
  async update(id: number, updateAreaDto: UpdateAreaInput): Promise<Area> {
    const { data } = await api.patch<Area>(`/areas/${id}`, updateAreaDto);
    return data;
  }

  /**
   * Elimina un área y reubica archivos (Solo Admin)
   */
  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>(`/areas/${id}`);
    return data;
  }
}

export const areasService = new AreasService();