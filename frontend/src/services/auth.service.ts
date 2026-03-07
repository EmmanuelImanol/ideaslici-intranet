import api from './api.service';
import { LoginDto } from '../interfaces/auth.dto';

export const authService = {
  login: async (credentials: LoginDto) => {
    const { data } = await api.post('/auth/login', credentials);
    return data; // Retorna { access_token, user }
  },
};