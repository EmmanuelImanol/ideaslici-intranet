import axios, { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const storage = localStorage.getItem('auth-storage');
    
    if (storage) {
      try {
        const parsedStorage = JSON.parse(storage);
        const token = parsedStorage.state?.token;
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;