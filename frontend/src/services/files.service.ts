import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { FileActivity, FileMetadata } from '@/interfaces/file.interface';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const filesService = {
  async getAll(): Promise<FileMetadata[]> {
    const { token } = useAuthStore.getState();
    const response = await axios.get<FileMetadata[]>(`${API_URL}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Ajustado para recibir los campos que el backend de NestJS pide en el DTO
  async upload(file: File, title: string, category: string, description?: string): Promise<void> {
    const { token } = useAuthStore.getState();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    if (description && description.trim() !== '') {
    formData.append('description', description.trim());
  }
  console.log('Tipo de archivo detectado por el navegador:', file.type);
  try {
    await axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: unknown) {
    throw error;
  }
  },

  async delete(id: number): Promise<void> {
    const { token } = useAuthStore.getState();
    await axios.delete(`${API_URL}/files/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async getCount(): Promise<number> {
    const { token } = useAuthStore.getState();
    const { data } = await axios.get<{ count: number }>(`${API_URL}/files/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.count;
  },

  // Dentro de filesService
  getRecent: async (): Promise<FileActivity[]> => {
    const { token } = useAuthStore.getState(); // Necesitamos el token para el Guard
    
    try {
      // 🛠️ SOLUCIÓN: Agregamos ${API_URL} y los headers de autorización
      const { data } = await axios.get<FileActivity[]>(`${API_URL}/files/recent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Error en el servidor: ${message}`);
      }
      throw new Error('Error de red o desconocido');
    }
  },
};