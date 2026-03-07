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

  // 🛠️ ACTUALIZADO: Cambiamos 'category: string' por 'areaId: number'
  async upload(file: File, title: string, areaId: number, description?: string): Promise<void> {
    const { token } = useAuthStore.getState();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('title', title);
    // 🛠️ IMPORTANTE: El backend de NestJS espera 'areaId' como número (enviado como string en FormData)
    formData.append('areaId', areaId.toString());

    if (description && description.trim() !== '') {
      formData.append('description', description.trim());
    }

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
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

  getRecent: async (): Promise<FileActivity[]> => {
    const { token } = useAuthStore.getState();
    
    try {
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