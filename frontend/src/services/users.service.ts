import api from './api.service';
import { CreateUserDto, User } from '@/interfaces/user.interface';

export const usersService = {
  getCount: async (): Promise<number> => {
    const { data } = await api.get<{ count: number }>('/users/count');
    return data.count;
  },
  
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  register: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post<User>('/users/register', userData);
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/users/${id}`);
    return data;
  },

  update: async (id: number, userData: Partial<CreateUserDto>): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },
};